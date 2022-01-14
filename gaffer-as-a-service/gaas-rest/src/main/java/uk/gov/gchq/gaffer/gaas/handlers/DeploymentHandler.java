/*
 * Copyright 2020 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package uk.gov.gchq.gaffer.gaas.handlers;

import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1Secret;
import io.kubernetes.client.openapi.models.V1Status;
import io.kubernetes.client.spring.extended.controller.annotation.AddWatchEventFilter;
import io.kubernetes.client.spring.extended.controller.annotation.DeleteWatchEventFilter;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.RestApiStatus;
import uk.gov.gchq.gaffer.gaas.HelmCommand;
import uk.gov.gchq.gaffer.gaas.callback.SimpleApiCallback;
import uk.gov.gchq.gaffer.gaas.factories.IKubernetesObjectFactory;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import static uk.gov.gchq.gaffer.common.util.Constants.GAFFER_NAMESPACE_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.GAFFER_NAME_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_NAMESPACE;
import static uk.gov.gchq.gaffer.gaas.util.Properties.INGRESS_SUFFIX;
import static uk.gov.gchq.gaffer.gaas.util.Properties.NAMESPACE;

public class DeploymentHandler {


    private static final Logger LOGGER = LoggerFactory.getLogger(DeploymentHandler.class);
    // worker pod phases
    private static final String SUCCEEDED = "Succeeded";
    private static final String FAILED = "Failed";

    private final String workerNamespace;

    @Autowired
    private CoreV1Api coreV1Api;

    private final CustomObjectsApi customObjectsApi;
    private final IKubernetesObjectFactory kubernetesObjectFactory;


    public DeploymentHandler(final Environment environment, final IKubernetesObjectFactory kubernetesObjectFactory, final ApiClient apiClient) {
        this.workerNamespace = environment.getProperty(WORKER_NAMESPACE);
        this.kubernetesObjectFactory = kubernetesObjectFactory;
        this.customObjectsApi = new CustomObjectsApi(apiClient);
    }

    // Gaffer events

    /**
     * Deploys a Gaffer Graph
     *
     * @param gaffer the name of the Gaffer graph
     * @return true if the deployment was started, false if not
     * @throws ApiException throws exception
     */
    @AddWatchEventFilter(apiTypeClass = Gaffer.class)
    public boolean onGafferCreate(final Gaffer gaffer) throws ApiException {
        LOGGER.info("Received new add request");
        V1Secret helmValuesSecret = kubernetesObjectFactory.createValuesSecret(gaffer, true);
        try {
            coreV1Api.createNamespacedSecret(workerNamespace, helmValuesSecret, null, null, null);
            LOGGER.info("Successfully created secret for new install. Trying pod deployment now...");
            String secretname = gaffer.getSpec().getNestedObject("graph", "config", "graphId").toString();
            if (secretname == null) {
                // This would be really weird and we'd want to know about it.
                throw new RuntimeException("A secret was generated without a name. Unable to proceed");
            }
            gaffer.metaData(new V1ObjectMeta()
                    .namespace(workerNamespace)
                    .name(secretname)
            );
            V1Pod pod = kubernetesObjectFactory.createHelmPod(gaffer, HelmCommand.INSTALL, secretname);
            try {
                coreV1Api.createNamespacedPod(workerNamespace, pod, null, null, null);
                LOGGER.info("Install Pod deployment successful");
            } catch (final ApiException e) {
                LOGGER.error("Failed to create worker pod" + e.getResponseBody(), e);
                throw e;
            }
        } catch (final ApiException e) {
            LOGGER.error("Failed to create Secret", e);
            throw e;
        } catch (Exception e) {
            throw new ApiException(e.getLocalizedMessage());
        }

        return true;
    }

    /**
     * Starts the Uninstall process for a Gaffer Graph.
     *
     * @param gaffer           The Gaffer Object
     * @param isCacheStale     Whether the cache entry for the Gaffer resource is stale
     * @param kubernetesClient kubernetesClient
     * @return True if the uninstall process started, false if not
     * @throws ApiException exception
     */
    @DeleteWatchEventFilter(apiTypeClass = Gaffer.class)
    public boolean onGafferDelete(final String gaffer, final boolean isCacheStale, final KubernetesClient kubernetesClient) throws ApiException {
        try {
            kubernetesClient.apps().deployments().inNamespace(workerNamespace).withName(gaffer + "-gaffer-api").delete();
            kubernetesClient.apps().deployments().inNamespace(workerNamespace).withName(gaffer + "-gaffer-ui").delete();
            kubernetesClient.configMaps().inNamespace(workerNamespace).withName(gaffer + "-gaffer-application-properties").delete();
            kubernetesClient.configMaps().inNamespace(workerNamespace).withName(gaffer + "-gaffer-graph-config").delete();
            kubernetesClient.configMaps().inNamespace(workerNamespace).withName(gaffer + "-gaffer-schema").delete();
            kubernetesClient.configMaps().inNamespace(workerNamespace).withName(gaffer + "-gaffer-ui-config").delete();
            kubernetesClient.secrets().inNamespace(workerNamespace).withName(gaffer + "-gaffer-store-properties").delete();
            kubernetesClient.secrets().inNamespace(workerNamespace).withName(gaffer).delete();
            kubernetesClient.secrets().inNamespace(workerNamespace).withName("sh.helm.release.v1." + gaffer + ".v1").delete();
            kubernetesClient.pods().inNamespace(workerNamespace).withName(gaffer + "-install-worker");
        } catch (Exception e) {
            LOGGER.error("Failed to delete deployments of " + gaffer, e);
            throw e;
        }
        cleanUpGafferDeploymentAfterTearDown(gaffer, workerNamespace);
        return true;
    }

    public List<GaaSGraph> getDeployments(final KubernetesClient kubernetesClient) {
        try {
            List<Deployment> deploymentList = kubernetesClient.apps().deployments().inNamespace(NAMESPACE).list().getItems();
            List<String> apiDeployments = new ArrayList<>();
            List<GaaSGraph> graphs = new ArrayList<>();
            for (final Deployment deployment : deploymentList) {
                if (deployment.getMetadata().getName().contains("-gaffer-api")) {
                    apiDeployments.add(deployment.getMetadata().getLabels().get("app.kubernetes.io/instance"));
                }
            }
            for (final String gaffer : apiDeployments) {
                GaaSGraph gaaSGraph = new GaaSGraph();
                gaaSGraph.graphId(gaffer);
                Collection<String> graphConfig = kubernetesClient.configMaps().inNamespace(NAMESPACE).withName(gaffer + "-gaffer-graph-config").get().getData().values();
                gaaSGraph.description(getValueOfConfig(graphConfig, "description"));
                if (getValueOfConfig(graphConfig, "configName") != null) {
                    gaaSGraph.configName(getValueOfConfig(graphConfig, "configName"));
                }
                int availableReplicas = kubernetesClient.apps().deployments().inNamespace(NAMESPACE).withName(gaffer + "-gaffer-api").get().getStatus().getAvailableReplicas();
                if (availableReplicas >= 1) {
                    gaaSGraph.status(RestApiStatus.UP);
                } else {
                    gaaSGraph.status(RestApiStatus.DOWN);
                }
                gaaSGraph.url("http://" + gaffer + "-" + NAMESPACE + "." + INGRESS_SUFFIX + "/ui");
                graphs.add(gaaSGraph);

            }
            return graphs;
        } catch (Exception e) {
            LOGGER.debug("Failed to list all Gaffers. Error: ", e);
            throw e;
        }
    }

    private String getValueOfConfig(final Collection<String> value, final String fieldToGet) {
        JSONArray jsonArray = new JSONArray(value.toString());
        for (int i = 0; i < jsonArray.length(); i++) {
            JSONObject object = jsonArray.getJSONObject(i);
            if (object.get(fieldToGet) != null) {
                return (object.get(fieldToGet).toString());
            }
        }
        return null;
    }

    /**
     * Removes any resources left after a successful uninstall including:
     * <ul>
     *     <li>Any orphaned pods - typically post install hooks</li>
     *     <li>Any PVCs associated with the deployment</li>
     * </ul>
     * <p>
     * Also deletes any possible workers which may be upgrading or installing this release.
     *
     * @param gafferName      The name of the Gaffer release
     * @param gafferNamespace The namespace that the Gaffer graph is located
     * @throws ApiException if there is an issue with a Kubernetes API call
     */
    private void cleanUpGafferDeploymentAfterTearDown(final String gafferName, final String gafferNamespace) throws ApiException {
        LOGGER.info("Cleaning up after deployment");
        final String workerLabelSelector = GAFFER_NAME_LABEL + "=" + gafferName + "," + GAFFER_NAMESPACE_LABEL + "=" + gafferNamespace;
        final String gafferLabelSelector = "app.kubernetes.io/instance=" + gafferName;
        final String hdfsLabelSelector = "app.kubernetes.io/name=hdfs," + gafferLabelSelector;
        final String zookeeperLabelSelector = "app=zookeeper,release=" + gafferName;
        LOGGER.debug("Removing any workers working on this gaffer deployment");
        this.coreV1Api.deleteCollectionNamespacedPodAsync(workerNamespace, null, null, null,
                null, 0, workerLabelSelector, null, null,
                null, null, null, null, null, (SimpleApiCallback<V1Status>) (result, err) -> {
                    if (err == null) {
                        try {
                            LOGGER.debug("All worker pods have been removed. Removing any attached secrets");
                            coreV1Api.deleteCollectionNamespacedSecret(workerNamespace, null, null,
                                    null, null, 0, workerLabelSelector, null,
                                    null, null, null, null, null, null);
                        } catch (final ApiException e) {
                            LOGGER.error("Failed to remove worker secrets", e);
                        }
                    } else {
                        LOGGER.error("Failed to remove worker pods", err);
                    }
                });
        LOGGER.debug("Removing HDFS PVCs");
        this.coreV1Api.deleteCollectionNamespacedPersistentVolumeClaimAsync(gafferNamespace, null, null,
                null, null, 0, hdfsLabelSelector, null, null,
                null, null, null, null, null, (SimpleApiCallback<V1Status>) (result, e) -> {
                    if (e != null) {
                        LOGGER.error("Failed to remove HDFS PVCs", e);
                    }
                });
        LOGGER.debug("Removing Zookeeper PVCs");
        this.coreV1Api.deleteCollectionNamespacedPersistentVolumeClaimAsync(gafferNamespace, null, null,
                null, null, 0, zookeeperLabelSelector, null, null,
                null, null, null, null, null, (SimpleApiCallback<V1Status>) (result, e) -> {
                    if (e != null) {
                        LOGGER.error("Failed to remove Zookeeper PVCs", e);
                    }
                });
        LOGGER.debug("Removing any stranded pods");
        this.coreV1Api.deleteCollectionNamespacedPodAsync(gafferNamespace, null, null, null,
                null, 0, gafferLabelSelector, null, null,
                null, null, null, null, null, (SimpleApiCallback<V1Status>) (result, e) -> {
                    if (e != null) {
                        LOGGER.error("Failed to remove stranded pods", e);
                    }
                });

    }


    public void setCoreV1Api(CoreV1Api coreV1Api) {
        this.coreV1Api = coreV1Api;
    }

}
