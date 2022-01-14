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

import com.google.common.collect.Lists;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.kubernetes.client.extended.controller.reconciler.Reconciler;
import io.kubernetes.client.extended.controller.reconciler.Request;
import io.kubernetes.client.extended.controller.reconciler.Result;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1PodSpec;
import io.kubernetes.client.openapi.models.V1Secret;
import io.kubernetes.client.openapi.models.V1SecretVolumeSource;
import io.kubernetes.client.openapi.models.V1Status;
import io.kubernetes.client.openapi.models.V1Volume;
import io.kubernetes.client.spring.extended.controller.annotation.AddWatchEventFilter;
import io.kubernetes.client.spring.extended.controller.annotation.DeleteWatchEventFilter;
import io.kubernetes.client.spring.extended.controller.annotation.KubernetesReconciler;
import io.kubernetes.client.spring.extended.controller.annotation.KubernetesReconcilerWatch;
import io.kubernetes.client.spring.extended.controller.annotation.KubernetesReconcilerWatches;
import io.kubernetes.client.spring.extended.controller.annotation.UpdateWatchEventFilter;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferStatus;
import uk.gov.gchq.gaffer.common.model.v1.RestApiStatus;
import uk.gov.gchq.gaffer.common.util.CommonUtil;
import uk.gov.gchq.gaffer.gaas.HelmCommand;
import uk.gov.gchq.gaffer.gaas.callback.SimpleApiCallback;
import uk.gov.gchq.gaffer.gaas.factories.IKubernetesObjectFactory;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import static uk.gov.gchq.gaffer.common.util.Constants.GAAS_LABEL_VALUE;
import static uk.gov.gchq.gaffer.common.util.Constants.GAFFER_NAMESPACE_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.GAFFER_NAME_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.GOAL_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.GROUP;
import static uk.gov.gchq.gaffer.common.util.Constants.K8S_INSTANCE_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.PLURAL;
import static uk.gov.gchq.gaffer.common.util.Constants.VERSION;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_NAMESPACE;
import static uk.gov.gchq.gaffer.gaas.HelmCommand.UNINSTALL;
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
     * Handles upgrades for Gaffer Graphs. When the spec is updated on a Gaffer Object. This handler responds by running
     * Helm upgrades according to the new spec.
     *
     * @param oldGaffer The Old Gaffer Object
     * @param newGaffer The New Gaffer Object
     * @return True if an upgrade was attempted, false if not
     */
    @UpdateWatchEventFilter(apiTypeClass = Gaffer.class)
    public boolean onGafferUpdate(final Gaffer oldGaffer, final Gaffer newGaffer) {
        Long oldGeneration = oldGaffer.getMetadata().getGeneration();
        if (oldGeneration == null || oldGeneration.equals(newGaffer.getMetadata().getGeneration())) { // This implies no spec update
            LOGGER.debug("Skipping update as spec wasn't updated");
            return false;
        }
        LOGGER.info("Starting Upgrade of {}", newGaffer.getMetadata().getName());

        try {
            coreV1Api.createNamespacedSecretAsync(workerNamespace, kubernetesObjectFactory.createValuesSecret(newGaffer, false),
                    null, null, null, (SimpleApiCallback<V1Secret>) (result, err) -> {
                        if (err == null) {
                            LOGGER.debug("Secret Generation was successful. Now trying pod");
                            try {
                                String secretname = result.getMetadata() == null ? null : result.getMetadata().getName();
                                if (secretname == null) {
                                    // This would be really weird and we'd want to know about it.
                                    throw new RuntimeException("A secret was generated without a name. Unable to proceed");
                                }
                                coreV1Api.createNamespacedPod(workerNamespace, kubernetesObjectFactory.createHelmPod(newGaffer, HelmCommand.UPGRADE,
                                        secretname), null, null, null);
                                LOGGER.info("Upgrade successfully started");
                            } catch (ApiException e) {
                                LOGGER.error("Failed to deploy upgrade pod", e);
                            }
                        } else {
                            LOGGER.error("Failed to create secret for upgrade", err);
                        }
                    });
        } catch (final ApiException e) {
            LOGGER.error("Failed to deploy secret", e);
            return false;
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

    // Pod events

    /**
     * Pod add events are not reconciled
     *
     * @param pod The Pod
     * @return false
     */
    @AddWatchEventFilter(apiTypeClass = V1Pod.class)
    public boolean onPodAdd(final V1Pod pod) {
        return false; // Do nothing when a pod is added
    }

    /**
     * Pod delete events are not reconciled
     *
     * @param pod          The pod
     * @param isCacheStale whether the cache entry for the pod is stale.
     * @return false
     */
    @DeleteWatchEventFilter(apiTypeClass = V1Pod.class)
    public boolean onPodDelete(final V1Pod pod, final boolean isCacheStale) {
        return false; // Do nothing when a pod is deleted
    }

    /**
     * Responds to pod update events. If a pod in the worker namespace finishes (either by succeeding or failing), This
     * handler will kick in to remove the pod so that further upgrades / installs / deletes can happen. In the event
     * of a pod failing, the pod logs will be added to the Gaffer's Status object.
     * This handler will do nothing if:
     * <ul>
     *     <li>The pod is outside the worker's namespace</li>
     *     <li>The pod doesn't have the worker labels</li>
     *     <li>The pod is in a phase other than Completed or Failed</li>
     *     <li>The pod has a deletion timestamp, indicating the pod has already been deleted</li>
     * </ul>
     *
     * @param unused The old pod
     * @param newPod The new pod
     * @return true if processed, false if not or it failed in some way
     */
    @UpdateWatchEventFilter(apiTypeClass = V1Pod.class)
    public boolean onPodUpdate(final V1Pod unused, final V1Pod newPod) {
        V1ObjectMeta metadata = newPod.getMetadata();
        if (metadata == null) {
            throw new RuntimeException("Pods should have metadata");
        }
        String instance = metadata.getLabels() == null ? null : metadata.getLabels().get(K8S_INSTANCE_LABEL);
        String podNamespace = metadata.getNamespace();
        if (!workerNamespace.equals(podNamespace) || !GAAS_LABEL_VALUE.equals(instance) || metadata.getDeletionTimestamp() != null) {
            return false; // Don't care about pods in other namespaces or if the pod has already been processed
        } else if (metadata.getName() == null) {
            throw new RuntimeException("All pods should be named");
        }


        String phase = newPod.getStatus() == null ? null : newPod.getStatus().getPhase();
        try {
            if (SUCCEEDED.equals(phase)) {
                Map<String, String> labels = metadata.getLabels();
                if (labels != null &&
                        UNINSTALL.getCommand().equals(labels.get(GOAL_LABEL))) {
                    cleanUpGafferDeploymentAfterTearDown(labels.get(GAFFER_NAME_LABEL), labels.get(GAFFER_NAMESPACE_LABEL));
                } else {
                    tearDownWorker(newPod);
                }
            } else if (FAILED.equals(phase)) {
                Map<String, String> labels = metadata.getLabels();
                boolean appendToStatus = !UNINSTALL.getCommand().equals(labels.get(GOAL_LABEL));
                recordLogsAndTearDown(newPod, appendToStatus);
            } else {
                return false;
            }
        } catch (final ApiException e) {
            LOGGER.error("Failed to remove worker pods", e);
            return false;
        }

        return true;
    }

    // Reconciler

    /**
     * The reconcile doesn't really do anything. All of the logic is in the filters.
     *
     * @param request the request
     * @return a result
     */
    public Result reconcile(final Request request) {
        LOGGER.info("Successfully handled {}", request.getName());
        return new Result(false);
    }

    // Private methods

    /**
     * Tears down a worker pod and any associated values secrets
     *
     * @param workerPod The worker pod
     * @throws ApiException if there is an issue with a Kubernetes API call
     */
    private void tearDownWorker(final V1Pod workerPod) throws ApiException {
        String phase = workerPod.getStatus() == null ? null : workerPod.getStatus().getPhase();
        LOGGER.info("Attempting to tear down {} worker and any associated values secrets", phase);
        V1ObjectMeta metaData = workerPod.getMetadata();
        if (metaData == null || metaData.getName() == null) {
            throw new RuntimeException("Worker Pod should not be null and should have");
        }
        coreV1Api.deleteNamespacedPodAsync(metaData.getName(), workerNamespace, null, null,
                0, null, null, null, (SimpleApiCallback<V1Pod>) (result, err) -> {
                    if (err == null) {
                        V1PodSpec spec = result.getSpec();
                        if (spec == null) {
                            throw new RuntimeException("Expected Pod to have a spec");
                        }
                        if (spec.getVolumes() != null) {
                            List<V1Volume> valuesVolumes = spec.getVolumes().stream().filter(v -> "values".equals(v.getName())).collect(Collectors.toList());
                            if (valuesVolumes.size() == 1) {
                                V1SecretVolumeSource valuesSecret = valuesVolumes.get(0).getSecret();
                                if (valuesSecret == null) {
                                    throw new RuntimeException("Expected Values to be a secret");
                                }
                                try {
                                    coreV1Api.deleteNamespacedSecret(valuesSecret.getSecretName(), workerNamespace, null,
                                            null, null, null, null, null);
                                    LOGGER.info("Successfully removed worker");

                                } catch (final ApiException e) {
                                    LOGGER.error("Failed to delete Secret", e);
                                }
                            } else {
                                LOGGER.info("Successfully removed worker");
                            }
                        }
                    } else {
                        LOGGER.error("Failed to tear down the worker");
                    }

                });
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

    /**
     * Records the logs from the failed pod and then tears it down
     *
     * @param pod            the pod to be torn down
     * @param appendToStatus Whether to try and append the logs to the Gaffer Status
     * @throws ApiException if there is an issue with a Kubernetes API call
     */
    private void recordLogsAndTearDown(final V1Pod pod, final boolean appendToStatus) throws ApiException {
        V1ObjectMeta podMeta = pod.getMetadata();
        String podName = podMeta == null ? null : podMeta.getName();

        if (podName == null) {
            throw new RuntimeException("Worker pod must have a name");
        } else if (podMeta.getLabels() == null || !podMeta.getLabels().containsKey(GAFFER_NAME_LABEL) ||
                !podMeta.getLabels().containsKey(GAFFER_NAMESPACE_LABEL)) {
            throw new RuntimeException("Worker must have namespace and name labels");
        }

        String gafferName = podMeta.getLabels().get(GAFFER_NAME_LABEL);
        String gafferNamespace = podMeta.getLabels().get(GAFFER_NAMESPACE_LABEL);

        coreV1Api.readNamespacedPodLogAsync(podName, workerNamespace, null, null,
                null, null, null, null, null, null,
                null, (SimpleApiCallback<String>) (result, err) -> {
                    if (err == null) {
                        LOGGER.warn("Worker failed. Logs:");
                        LOGGER.warn(result);
                        try {
                            if (appendToStatus) {
                                Object response = customObjectsApi.getNamespacedCustomObjectStatus(GROUP, VERSION,
                                        gafferNamespace, PLURAL, gafferName);

                                Gaffer gaffer = CommonUtil.convertToCustomObject(response, Gaffer.class);
                                GafferStatus status = gaffer.getStatus();
                                if (status == null) {
                                    gaffer.status(new GafferStatus().problems(Lists.newArrayList(result)));
                                } else if (status.getProblems() == null) {
                                    gaffer.status(status.problems(Lists.newArrayList(result)));
                                } else {
                                    gaffer.getStatus().getProblems().add(0, result);
                                }
                                customObjectsApi.replaceNamespacedCustomObjectStatus(GROUP, VERSION, gafferNamespace, PLURAL,
                                        gafferName, gaffer, null, null);
                            }
                            tearDownWorker(pod);
                        } catch (final ApiException e) {
                            LOGGER.error("Failed to patch Gaffer Status", e);
                        }

                    } else {
                        LOGGER.error("Failed to read pod logs. Will continue to tear down", err);
                        try {
                            tearDownWorker(pod);
                        } catch (final ApiException e) {
                            LOGGER.error("Failed to tear down pod", e);
                        }
                    }
                });
    }

}
