/*
 * Copyright 2020-2022 Crown Copyright
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

import io.fabric8.kubernetes.api.model.ConfigMap;
import io.fabric8.kubernetes.api.model.Secret;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1Secret;
import io.kubernetes.client.openapi.models.V1Status;
import org.jetbrains.annotations.NotNull;
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


    private final String workerNamespace;

    @Autowired
    private CoreV1Api coreV1Api;

    private final IKubernetesObjectFactory kubernetesObjectFactory;

    private static final String GAFFER_NAME_SUFFIX = "-gaffer-api";


    public DeploymentHandler(final Environment environment, final IKubernetesObjectFactory kubernetesObjectFactory) {
        this.workerNamespace = environment.getProperty(WORKER_NAMESPACE);
        this.kubernetesObjectFactory = kubernetesObjectFactory;
    }

    /**
     * Deploys a Gaffer Graph
     *
     * @param gaffer the name of the Gaffer graph
     * @return true if the deployment was started, false if not
     * @throws ApiException throws exception
     */
    public boolean onGafferCreate(final Gaffer gaffer) throws ApiException {
        LOGGER.info("Received new add request");
        V1Secret helmValuesSecret = kubernetesObjectFactory.createValuesSecret(gaffer, true);
        try {
            String secretName = getSecretName(gaffer, helmValuesSecret);

            V1Pod pod = kubernetesObjectFactory.createHelmPod(gaffer, HelmCommand.INSTALL, secretName);
            try {
                coreV1Api.createNamespacedPod(workerNamespace, pod, null, null, null);
                LOGGER.info("Install Pod deployment successful");
            } catch (final ApiException e) {
                LOGGER.info("Failed to create worker pod");
                throw e;
            }


        } catch (final ApiException e) {
            LOGGER.info("Failed to create Gaffer");
            throw e;
        }

        return true;
    }

    @NotNull
    private String getSecretName(final Gaffer gaffer, final V1Secret helmValuesSecret) throws ApiException {
        coreV1Api.createNamespacedSecret(workerNamespace, helmValuesSecret, null, null, null);
        LOGGER.info("Successfully created secret for new install. Trying pod deployment now...");
        String secretName = gaffer.getSpec().getNestedObject("graph", "config", "graphId").toString();
        if (secretName == null) {
            // This would be really weird, and we'd want to know about it.
            throw new ApiException("A secret was generated without a name. Unable to proceed");
        }
        gaffer.metaData(new V1ObjectMeta()
                .namespace(workerNamespace)
                .name(secretName)
        );
        return secretName;
    }

    /**
     * Starts the Uninstallation process for a Gaffer Graph.
     *
     * @param gaffer           The Gaffer Object
     * @param kubernetesClient kubernetesClient
     * @return True if the uninstallation process started, false if not
     * @throws ApiException exception
     */
    public boolean onGafferDelete(final String gaffer, final KubernetesClient kubernetesClient) throws ApiException {
        try {
            List<Deployment> deploymentList = kubernetesClient.apps().deployments().inNamespace(NAMESPACE).withLabel("app.kubernetes.io/instance", gaffer).list().getItems();
            if (!deploymentList.isEmpty()) {
                kubernetesClient.apps().deployments().inNamespace(workerNamespace).delete(deploymentList);
            }

            List<ConfigMap> configMapList = kubernetesClient.configMaps().inNamespace(workerNamespace).withLabel("app.kubernetes.io/instance", gaffer).list().getItems();
            if (!configMapList.isEmpty()) {
                kubernetesClient.configMaps().inNamespace(workerNamespace).delete(configMapList);
            }

            List<Secret> secrets = kubernetesClient.secrets().inNamespace(workerNamespace).list().getItems();
            List<Secret> secretsToDelete = new ArrayList<>();
            for (final Secret secret : secrets) {
                if (secret.getMetadata().getName().equals(gaffer + "-gaffer-store-properties") || secret.getMetadata().getName().equals(gaffer) || secret.getMetadata().getName().equals("sh.helm.release.v1." + gaffer + ".v1")) {
                    secretsToDelete.add(secret);
                }
            }
            if (!secretsToDelete.isEmpty()) {
                kubernetesClient.secrets().inNamespace(workerNamespace).delete(secretsToDelete);
            }
            if (secretsToDelete.isEmpty() & configMapList.isEmpty() & deploymentList.isEmpty()) {
                //If all 3 are empty it means the gaffer which the user is trying to delete does not exist therefore
                //we return false
                LOGGER.debug(String.format("No deployments of %s to delete", gaffer));
                return false;
            }

        } catch (KubernetesClientException e) {
            LOGGER.debug(String.format("Failed to delete deployments of %s", gaffer));
            throw new ApiException(e.getCode(), e.getMessage());
        }
        cleanUpGafferDeploymentAfterTearDown(gaffer, workerNamespace);
        return true;
    }


    public List<GaaSGraph> getDeployments(final KubernetesClient kubernetesClient) throws ApiException {
        try {
            List<Deployment> deploymentList = kubernetesClient.apps().deployments().inNamespace(NAMESPACE).list().getItems();
            List<String> apiDeployments = new ArrayList<>();
            for (final Deployment deployment : deploymentList) {
                if (deployment.getMetadata().getName().contains(GAFFER_NAME_SUFFIX)) {
                    apiDeployments.add(deployment.getMetadata().getLabels().get("app.kubernetes.io/instance"));
                }
            }
            return listAllGraphs(kubernetesClient, apiDeployments);
        } catch (Exception e) {
            LOGGER.debug("Failed to list all Gaffers.");
            throw new ApiException(e.getLocalizedMessage());
        }
    }


    /**
     * Removes any resources left after a successful uninstallation including:
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
        deleteCollectionNamespacePod(gafferNamespace, workerLabelSelector);

        LOGGER.debug("Removing HDFS PVCs");
        deleteCollectionNamespacePersistentVolumeClaimWithHDFsLabelSelector(gafferNamespace, hdfsLabelSelector);

        LOGGER.debug("Removing Zookeeper PVCs");
        deleteCollectionNamespacePersistentVolumeClaimWithZookeeperLabels(gafferNamespace, zookeeperLabelSelector);

        LOGGER.debug("Removing any stranded pods");
        deleteCollectionNamespaceStandardPod(gafferNamespace, gafferLabelSelector);

    }

    private void deleteCollectionNamespacePod(final String gafferNamespace, final String workerLabelSelector) throws ApiException {
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
    }

    private void deleteCollectionNamespacePersistentVolumeClaimWithHDFsLabelSelector(final String gafferNamespace, final String hdfsLabelSelector) throws ApiException {
        deleteCollectionNamespacePersistentVolumeClaimAsync(gafferNamespace, hdfsLabelSelector, "Failed to remove HDFS PVCs");
    }

    private void deleteCollectionNamespacePersistentVolumeClaimWithZookeeperLabels(final String gafferNamespace, final String zookeeperLabelSelector) throws ApiException {
        deleteCollectionNamespacePersistentVolumeClaimAsync(gafferNamespace, zookeeperLabelSelector, "Failed to remove Zookeeper PVCs");
    }

    private void deleteCollectionNamespacePersistentVolumeClaimAsync(final String gafferNamespace, final String labelSelector, final String loggerMessage) throws ApiException {
        this.coreV1Api.deleteCollectionNamespacedPersistentVolumeClaimAsync(gafferNamespace, null, null,
                null, null, 0, labelSelector, null, null,
                null, null, null, null, null, (SimpleApiCallback<V1Status>) (result, e) -> {
                    if (e != null) {
                        LOGGER.error(loggerMessage, e);
                    }
                });
    }


    private void deleteCollectionNamespaceStandardPod(final String gafferNamespace, final String gafferLabelSelector) throws ApiException {
        this.coreV1Api.deleteCollectionNamespacedPodAsync(gafferNamespace, null, null, null,
                null, 0, gafferLabelSelector, null, null,
                null, null, null, null, null, (SimpleApiCallback<V1Status>) (result, e) -> {
                    if (e != null) {
                        LOGGER.error("Failed to remove stranded pods", e);
                    }
                });
    }

    private List<GaaSGraph> listAllGraphs(final KubernetesClient kubernetesClient, final List<String> apiDeployments) {
        List<GaaSGraph> graphs = new ArrayList<>();
        for (final String gaffer : apiDeployments) {
            try {
                GaaSGraph gaaSGraph = new GaaSGraph();
                gaaSGraph.graphId(gaffer);
                Collection<String> graphConfig = kubernetesClient.configMaps().inNamespace(NAMESPACE).withName(gaffer + "-gaffer-graph-config").get().getData().values();
                gaaSGraph.description(getValueOfConfig(graphConfig, "description"));
                if (getValueOfConfig(graphConfig, "configName") != null) {
                    gaaSGraph.configName(getValueOfConfig(graphConfig, "configName"));
                }
                int availableReplicas = kubernetesClient.apps().deployments().inNamespace(NAMESPACE).withName(gaffer + GAFFER_NAME_SUFFIX).get().getStatus().getAvailableReplicas();
                if (availableReplicas >= 1) {
                    gaaSGraph.status(RestApiStatus.UP);
                } else {
                    gaaSGraph.status(RestApiStatus.DOWN);
                }
                gaaSGraph.url("http://" + gaffer + "-" + NAMESPACE + "." + INGRESS_SUFFIX + "/ui");
                graphs.add(gaaSGraph);
            } catch (Exception e) {
                LOGGER.info(gaffer + " could not be retrieved ");
            }
        }
        return graphs;
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


    public void setCoreV1Api(final CoreV1Api coreV1Api) {
        this.coreV1Api = coreV1Api;
    }

}
