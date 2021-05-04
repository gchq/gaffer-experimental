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

package uk.gov.gchq.gaffer.controller.handler;

import io.kubernetes.client.extended.controller.reconciler.Reconciler;
import io.kubernetes.client.extended.controller.reconciler.Request;
import io.kubernetes.client.extended.controller.reconciler.Result;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import io.kubernetes.client.openapi.models.V1Deployment;
import io.kubernetes.client.spring.extended.controller.annotation.AddWatchEventFilter;
import io.kubernetes.client.spring.extended.controller.annotation.DeleteWatchEventFilter;
import io.kubernetes.client.spring.extended.controller.annotation.KubernetesReconciler;
import io.kubernetes.client.spring.extended.controller.annotation.KubernetesReconcilerWatch;
import io.kubernetes.client.spring.extended.controller.annotation.KubernetesReconcilerWatches;
import io.kubernetes.client.spring.extended.controller.annotation.UpdateWatchEventFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferStatus;
import uk.gov.gchq.gaffer.common.model.v1.RestApiStatus;
import uk.gov.gchq.gaffer.common.util.CommonUtil;
import uk.gov.gchq.gaffer.controller.callback.SimpleApiCallback;

import java.util.Map;

import static uk.gov.gchq.gaffer.common.model.v1.RestApiStatus.DOWN;
import static uk.gov.gchq.gaffer.common.model.v1.RestApiStatus.UP;
import static uk.gov.gchq.gaffer.common.util.Constants.GAFFER_API_K8S_COMPONENT_LABEL_VALUE;
import static uk.gov.gchq.gaffer.common.util.Constants.GAFFER_K8S_NAME_LABEL_VALUE;
import static uk.gov.gchq.gaffer.common.util.Constants.GROUP;
import static uk.gov.gchq.gaffer.common.util.Constants.K8S_COMPONENT_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.K8S_INSTANCE_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.K8S_NAME_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.PLURAL;
import static uk.gov.gchq.gaffer.common.util.Constants.VERSION;

/**
 * Monitors Gaffer deployments and updates the status of Gaffer objects.
 */
@KubernetesReconciler(
        watches =
        @KubernetesReconcilerWatches({
                @KubernetesReconcilerWatch(
                        apiTypeClass = V1Deployment.class
                )
        })
)
public class StateHandler implements Reconciler {
    private static final Logger LOGGER = LoggerFactory.getLogger(StateHandler.class);

    private final CustomObjectsApi customObjectsApi;

    public StateHandler(final ApiClient apiClient) {
        this.customObjectsApi = new CustomObjectsApi(apiClient);
    }

    /**
     * Doesn't handle Add events
     * @param deployment the new deployment
     * @return false
     */
    @AddWatchEventFilter(apiTypeClass = V1Deployment.class)
    public boolean onAdd(final V1Deployment deployment) {
        return false;
    }

    /**
     * Doesn't handle Delete events
     * @param deployment the deployment
     * @param isCacheStale whether the cache entry for the deployment is stale.
     * @return false
     */
    @DeleteWatchEventFilter(apiTypeClass = V1Deployment.class)
    public boolean onDelete(final V1Deployment deployment, final boolean isCacheStale) {
        return false;
    }

    /**
     * Handler for update events. The status manager uses the number of READY pods as a gauge for if the REST API is
     * up. Will only handle deployments which have the correct labels.
     * @param unused The outgoing deployment
     * @param incoming The incoming deployment
     * @return true if successfully handled, false if not
     */
    @UpdateWatchEventFilter(apiTypeClass = V1Deployment.class)
    public boolean onUpdate(final V1Deployment unused, final V1Deployment incoming) {
        // Weed out any non Gaffer API related deployments
        Map<String, String> labels = incoming.getMetadata() == null ? null : incoming.getMetadata().getLabels();
        if (labels == null || !GAFFER_K8S_NAME_LABEL_VALUE.equals(labels.get(K8S_NAME_LABEL)) ||
                !GAFFER_API_K8S_COMPONENT_LABEL_VALUE.equals(labels.get(K8S_COMPONENT_LABEL))) {
            return false;
        }

        final String namespace = incoming.getMetadata().getNamespace();
        if (namespace == null) {
            // This would indicate a bug
            LOGGER.warn("Received deployment with no namespace. Cannot continue");
            LOGGER.warn(incoming.toString());
            return false;
        }
        LOGGER.info("Received Gaffer Deployment update for {}. Updating REST API status",
                incoming.getMetadata().getName());

        final String name = incoming.getMetadata().getLabels().get(K8S_INSTANCE_LABEL);
        Integer readyReplicas = incoming.getStatus() == null ? null : incoming.getStatus().getReadyReplicas();
        RestApiStatus restApiStatus = readyReplicas == null || readyReplicas < 1 ? DOWN : UP;

        updateRestApiStatus(name, namespace, restApiStatus);
        return true;
    }

    private void updateRestApiStatus(final String name, final String namespace, final RestApiStatus restApiStatus) {
        try {
            this.customObjectsApi
                    .getNamespacedCustomObjectStatusAsync(GROUP, VERSION, namespace, PLURAL, name, (SimpleApiCallback<Object>) (result, err) -> {
                if (err == null) {
                    Gaffer gaffer = CommonUtil.convertToCustomObject(result, Gaffer.class);

                    if (gaffer.getStatus() == null) {
                        gaffer.status(new GafferStatus().restApiStatus(restApiStatus));
                    } else if (restApiStatus.equals(gaffer.getStatus().getRestApiStatus())) {
                        // no need to update
                        return;
                    } else {
                        gaffer.getStatus().restApiStatus(restApiStatus);
                    }
                    try {
                        this.customObjectsApi.replaceNamespacedCustomObjectStatus(GROUP, VERSION, namespace, PLURAL,
                                name, gaffer, null, null);
                    } catch (final ApiException e) {
                        LOGGER.error("Failed to Replace Custom object status", e);
                    }
                } else {
                    LOGGER.error("Failed to get the Status", err);
                }
            });
        } catch (final ApiException e) {
            LOGGER.error("Failed to update REST API Status", e);
        }
    }

    /**
     * reconcile doesn't really do anything. All logic is done in the filters.
     * @param request The incoming request
     * @return a new Result
     */
    @Override
    public Result reconcile(final Request request) {
        LOGGER.info("Successfully handled {}", request.getName());
        return new Result(false);
    }
}
