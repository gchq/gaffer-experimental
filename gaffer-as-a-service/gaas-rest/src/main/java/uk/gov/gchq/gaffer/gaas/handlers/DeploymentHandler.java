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
import io.fabric8.kubernetes.api.model.apps.DeploymentBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1Secret;
import io.kubernetes.client.openapi.models.V1Status;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import uk.gov.gchq.gaffer.gaas.HelmCommand;
import uk.gov.gchq.gaffer.gaas.callback.SimpleApiCallback;
import uk.gov.gchq.gaffer.gaas.factories.IKubernetesObjectFactory;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import uk.gov.gchq.gaffer.gaas.model.GraphCollaborator;
import uk.gov.gchq.gaffer.gaas.model.v1.Gaffer;
import uk.gov.gchq.gaffer.gaas.model.v1.RestApiStatus;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static uk.gov.gchq.gaffer.gaas.util.Constants.GAFFER_NAMESPACE_LABEL;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GAFFER_NAME_LABEL;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_NAMESPACE;
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
                LOGGER.error("Failed to create worker pod", e);
                throw e;
            }


        } catch (final ApiException e) {
            LOGGER.error("Failed to create Gaffer", e);
            throw e;
        }

        return true;
    }

    public boolean deleteCollaborator(final String graphId, final String collaboratorToDelete, final KubernetesClient kubernetesClient) throws ApiException {
        try {
            deleteCollaboratorLabel(graphId + "-gaffer-api", collaboratorToDelete, kubernetesClient);
            deleteCollaboratorLabel(graphId + "-gaffer-ui", collaboratorToDelete, kubernetesClient);
            return true;
        } catch (KubernetesClientException e) {
            LOGGER.error("Failed to delete collaborator", e);
            throw new ApiException(e.getCode(), e.getMessage());
        }
    }

    public boolean deleteCollaboratorByUsername(final String graphId, final String collaboratorToDelete, final String username, final KubernetesClient kubernetesClient) throws ApiException {
        try {
            if (kubernetesClient.apps().deployments().inNamespace(NAMESPACE).withName(graphId + "-gaffer-api").get().getMetadata().getLabels().get("creator").equals(username)) {
                deleteCollaboratorLabel(graphId + "-gaffer-api", collaboratorToDelete, kubernetesClient);
                deleteCollaboratorLabel(graphId + "-gaffer-ui", collaboratorToDelete, kubernetesClient);
                return true;
            }
            return false;
        } catch (KubernetesClientException e) {
            LOGGER.error("Failed to delete collaborator", e);
            throw new ApiException(e.getCode(), e.getMessage());
        }
    }

    private void deleteCollaboratorLabel(final String deploymentName, final String collaboratorToDelete, final KubernetesClient kubernetesClient) {
        kubernetesClient.apps().deployments().inNamespace(NAMESPACE)
                .withName(deploymentName).edit(
                d -> new DeploymentBuilder(d).editMetadata().removeFromLabels("collaborator/" + collaboratorToDelete).endMetadata().build()
        );
    }

    public boolean addGraphCollaborator(final String gaffer, final KubernetesClient kubernetesClient, final String usernameToAdd) throws ApiException {
        try {
            updateDeploymentLabels(gaffer + "-gaffer-api", kubernetesClient, usernameToAdd);
            updateDeploymentLabels(gaffer + "-gaffer-ui", kubernetesClient, usernameToAdd);
            return true;
        } catch (KubernetesClientException e) {
            LOGGER.error("Failed to add collaborator.", e);
            throw new ApiException(e.getCode(), e.getMessage());
        }
    }

    public boolean addGraphCollaboratorWithUsername(final String gaffer, final KubernetesClient kubernetesClient, final String usernameToAdd, final String username) throws ApiException {
        try {
            if (kubernetesClient.apps().deployments().inNamespace(NAMESPACE).withName(gaffer + "-gaffer-api").get().getMetadata().getLabels().get("creator").equals(username)) {
                updateDeploymentLabels(gaffer + "-gaffer-api", kubernetesClient, usernameToAdd);
                updateDeploymentLabels(gaffer + "-gaffer-ui", kubernetesClient, usernameToAdd);
                return true;
            }
            return false;
        } catch (KubernetesClientException e) {
            LOGGER.error("Failed to add collaborator.", e);
            throw new ApiException(e.getCode(), e.getMessage());
        }
    }

    private void updateDeploymentLabels(final String deploymentName, final KubernetesClient kubernetesClient, final String usernameToAdd) {
        kubernetesClient.apps().deployments().inNamespace(NAMESPACE)
                .withName(deploymentName).edit(
                d -> new DeploymentBuilder(d).editMetadata().addToLabels("collaborator/" + usernameToAdd, usernameToAdd).endMetadata().build()
        );
    }

    @NotNull
    private String getSecretName(final Gaffer gaffer, final V1Secret helmValuesSecret) throws ApiException {
        coreV1Api.createNamespacedSecret(workerNamespace, helmValuesSecret, null, null, null);
        LOGGER.info("Successfully created secret for new install. Trying pod deployment now...");
        String secretName = gaffer.getSpec().getNestedObject("graph", "config", "graphId").toString();
        if (secretName == null) {
            // This would be really weird, and we'd want to know about it.
            LOGGER.error("A secret was generated without a name. Unable to proceed");
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
        getGraphCollaborators(gaffer, kubernetesClient);
        ;
        try {
            List<Deployment> deploymentList = kubernetesClient.apps().deployments().inNamespace(workerNamespace).withLabel("app.kubernetes.io/instance", gaffer).list().getItems();
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
                LOGGER.error("No deployments of {} to delete", gaffer);
                return false;
            }

        } catch (KubernetesClientException e) {
            LOGGER.error("Failed to delete deployments of {}", gaffer);
            throw new ApiException(e.getCode(), e.getMessage());
        }
        cleanUpGafferDeploymentAfterTearDown(gaffer, workerNamespace);
        return true;
    }

    public boolean onGafferDeleteByUsername(final String gaffer, final KubernetesClient kubernetesClient, final String username) throws ApiException {
        try {
            List<Deployment> deploymentList = kubernetesClient.apps().deployments().inNamespace(NAMESPACE).withLabel("app.kubernetes.io/instance", gaffer).withLabel("creator", username).list().getItems();
            if (!deploymentList.isEmpty()) {
                kubernetesClient.apps().deployments().inNamespace(workerNamespace).delete(deploymentList);
            }

            List<ConfigMap> configMapList = kubernetesClient.configMaps().inNamespace(workerNamespace).withLabel("app.kubernetes.io/instance", gaffer).withLabel("creator", username).list().getItems();
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
            if (!deploymentList.isEmpty() || !configMapList.isEmpty()) {
                //The secrets do not have a label associated with them therefore check if there are deployments or configmaps
                //related to the secrets in order to determine if the user has permissions to delete the secrets
                if (!secretsToDelete.isEmpty()) {
                    kubernetesClient.secrets().inNamespace(workerNamespace).delete(secretsToDelete);
                }
            }

            if (configMapList.isEmpty() & deploymentList.isEmpty()) {
                //If all 3 are empty it means the gaffer which the user is trying to delete does not exist therefore
                //we return false
                LOGGER.debug("No deployments of {} to delete", gaffer);
                return false;
            }

        } catch (KubernetesClientException e) {
            LOGGER.debug("Failed to delete deployments of {}", gaffer);
            throw new ApiException(e.getCode(), e.getMessage());
        }
        cleanUpGafferDeploymentAfterTearDown(gaffer, workerNamespace);
        return true;
    }


    public List<GaaSGraph> getDeployments(final KubernetesClient kubernetesClient) throws ApiException {
        try {
            List<Deployment> deploymentList = kubernetesClient.apps().deployments().inNamespace(NAMESPACE).list().getItems();
            return listAllGraphs(kubernetesClient, getAPIDeployments(deploymentList));
        } catch (Exception e) {
            LOGGER.error("Failed to list all Gaffers.", e);
            throw new ApiException(e.getLocalizedMessage());
        }
    }

    public List<GaaSGraph> getDeploymentsByUsername(final KubernetesClient kubernetesClient, final String username) throws ApiException {
        try {
            List<Deployment> deploymentList = kubernetesClient.apps().deployments().inNamespace(NAMESPACE).withLabel("creator", username).list().getItems();
            deploymentList.addAll(kubernetesClient.apps().deployments().inNamespace(NAMESPACE).withLabel("collaborator/" + username, username).list().getItems());
            return listAllGraphs(kubernetesClient, getAPIDeployments(deploymentList));
        } catch (Exception e) {
            LOGGER.debug("Failed to list all Gaffers.");
            throw new ApiException(e.getLocalizedMessage());
        }
    }

    private List<String> getAPIDeployments(final List<Deployment> deploymentList) {
        List<String> apiDeployments = new ArrayList<>();
        for (final Deployment deployment : deploymentList) {
            if (deployment.getMetadata().getName().contains(GAFFER_NAME_SUFFIX)) {
                apiDeployments.add(deployment.getMetadata().getLabels().get("app.kubernetes.io/instance"));
            }
        }
        return apiDeployments;
    }

    /**
     * Starts the Uninstallation process for a Gaffer Graph.
     *
     * @param kubernetesClient kubernetesClient
     * @return True if the uninstallation process started, false if not
     * @throws ApiException exception
     */
    public boolean onAutoGafferDestroy(final KubernetesClient kubernetesClient) throws ApiException {
        boolean autoDestroy = false;
        try {
            List<Deployment> deploymentList = kubernetesClient.apps().deployments().inNamespace(workerNamespace).withLabel("graphAutoDestroyDate").list().getItems();
            if (!deploymentList.isEmpty()) {
                for (final Deployment deployment : deploymentList) {
                    String graphAutoDestroyDate = deployment.getMetadata().getLabels().get("graphAutoDestroyDate").toLowerCase().replaceAll("_", ":");
                    LocalDateTime graphAutoDestroyDateTime = LocalDateTime.parse(graphAutoDestroyDate);
                    LocalDateTime currentTime = LocalDateTime.now();
                    if (graphAutoDestroyDateTime.isBefore(currentTime) || graphAutoDestroyDateTime.isEqual(currentTime)) {
                        String graphId = deployment.getMetadata().getLabels().get("app.kubernetes.io/instance");
                        LOGGER.info("Graph to be deleted {} {}", graphId, graphAutoDestroyDateTime);
                        autoDestroy = onGafferDelete(deployment.getMetadata().getLabels().get("app.kubernetes.io/instance"), kubernetesClient);
                        LOGGER.info("Graph is deleted {} {}", graphId, graphAutoDestroyDateTime);
                    }
                }
            }

        } catch (KubernetesClientException e) {
            LOGGER.error("Failed to gaffer auto destroy deployments");
            throw new ApiException(e.getCode(), e.getMessage());
        }
        return autoDestroy;
    }


    /**
     * Starts the Uninstallation process for a Gaffer Graph.
     *
     * @param gaffer           The Gaffer Object
     * @param kubernetesClient kubernetesClient
     * @return
     * @throws ApiException exception
     */
    public List<GraphCollaborator> getGraphCollaborators(final String gaffer, final KubernetesClient kubernetesClient) throws ApiException {
        List<Deployment> deploymentList = kubernetesClient.apps().deployments().inNamespace(workerNamespace).withLabel("app.kubernetes.io/instance", gaffer).list().getItems();
        Map<String, String> labels = null;
        try {
            if (!deploymentList.isEmpty()) {
                for (final Deployment deployment : deploymentList) {
                    labels = deployment.getMetadata().getLabels();
                }
            }
            List<GraphCollaborator> graphCollaborators = listGraphCollaborators(labels, gaffer);
            //graphCollaborators.forEach(graphCollaborator -> System.out.println(graphCollaborator.getUserName().toLowerCase()));
            return graphCollaborators;

        } catch (Exception e) {
            LOGGER.error("Failed to list all graph collaborators.", e);
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

        LOGGER.info("Removing any workers working on this gaffer deployment");
        deleteCollectionNamespacePod(gafferNamespace, workerLabelSelector);

        LOGGER.info("Removing HDFS PVCs");
        deleteCollectionNamespacePersistentVolumeClaimWithHDFsLabelSelector(gafferNamespace, hdfsLabelSelector);

        LOGGER.info("Removing Zookeeper PVCs");
        deleteCollectionNamespacePersistentVolumeClaimWithZookeeperLabels(gafferNamespace, zookeeperLabelSelector);

        LOGGER.info("Removing any stranded pods");
        deleteCollectionNamespaceStandardPod(gafferNamespace, gafferLabelSelector);

    }

    private void deleteCollectionNamespacePod(final String gafferNamespace, final String workerLabelSelector) throws ApiException {
        this.coreV1Api.deleteCollectionNamespacedPodAsync(workerNamespace, null, null, null,
                null, 0, workerLabelSelector, null, null,
                null, null, null, null, null, (SimpleApiCallback<V1Status>) (result, err) -> {
                    if (err == null) {
                        try {
                            LOGGER.info("All worker pods have been removed. Removing any attached secrets");
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

    private List<GaaSGraph> listAllGraphs(final KubernetesClient kubernetesClient, final List<String> graphIds) {
        List<GaaSGraph> graphs = new ArrayList<>();
        for (final String graphId : graphIds) {
            try {
                GaaSGraph gaaSGraph = new GaaSGraph();
                gaaSGraph.graphId(graphId);
                Collection<String> graphConfig = kubernetesClient.configMaps().inNamespace(NAMESPACE).withName(graphId + "-gaffer-graph-config").get().getData().values();
                gaaSGraph.description(getValueOfConfig(graphConfig, "description"));
                if (getValueOfConfig(graphConfig, "configName") != null) {
                    gaaSGraph.configName(getValueOfConfig(graphConfig, "configName"));
                }
                int availableReplicas = kubernetesClient.apps().deployments().inNamespace(NAMESPACE).withName(graphId + GAFFER_NAME_SUFFIX).get().getStatus().getAvailableReplicas();
                if (availableReplicas >= 1) {
                    gaaSGraph.status(RestApiStatus.UP);
                } else {
                    gaaSGraph.status(RestApiStatus.DOWN);
                }
                gaaSGraph.url("http://" + graphId + "-" + NAMESPACE + "." + INGRESS_SUFFIX + "/ui");
                gaaSGraph.restUrl("https://" + graphId + "-" + NAMESPACE + "." + INGRESS_SUFFIX + "/rest");

                List<Deployment> deploymentList = kubernetesClient.apps().deployments().inNamespace(NAMESPACE).withLabel("app.kubernetes.io/instance", graphId).list().getItems();
                if (!deploymentList.isEmpty()) {
                    for (final Deployment deployment : deploymentList) {
                        if (deployment.getMetadata().getLabels().get("graphAutoDestroyDate") != null) {
                            gaaSGraph.graphAutoDestroyDate(deployment.getMetadata().getLabels().get("graphAutoDestroyDate").toLowerCase().replaceAll("_", ":"));
                        }
                    }
                }

                graphs.add(gaaSGraph);
            } catch (Exception e) {
                LOGGER.info("{} could not be retrieved ", graphId, e);
            }
        }
        return graphs;
    }

    private List<GraphCollaborator> listGraphCollaborators(final Map<String, String> labels, final String graphId) {
        List<GraphCollaborator> graphCollaborators = new ArrayList<>();

        Map<String, String> collaborator =
                labels.entrySet()
                        .stream()
                        .filter(map -> map.getKey().startsWith("collaborator"))
                        .collect(Collectors.toMap(map -> map.getKey(), map -> map.getValue()));

        if (collaborator != null) {
            for (Map.Entry<String, String> entry : collaborator.entrySet()) {
                GraphCollaborator graphCollaborator = new GraphCollaborator();
                graphCollaborator.graphId(graphId);
                graphCollaborator.username(entry.getKey());
                graphCollaborators.add(graphCollaborator);
            }
        }


        return graphCollaborators;
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
