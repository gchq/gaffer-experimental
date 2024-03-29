/*
 * Copyright 2021-2022 Crown Copyright
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

package uk.gov.gchq.gaffer.gaas.client.graph;

import io.fabric8.kubernetes.client.KubernetesClient;
import io.kubernetes.client.openapi.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.handlers.DeploymentHandler;
import static uk.gov.gchq.gaffer.gaas.factories.GaaSRestExceptionFactory.from;

@Component
public class GraphAutoDestroy {

    @Autowired
    private DeploymentHandler deploymentHandler;

    @Autowired
    KubernetesClient kubernetesClient;

    private static final Logger LOGGER = LoggerFactory.getLogger(GraphAutoDestroy.class);

    @Scheduled(cron = "0 0/5 * * * ?")
    public boolean autoDestroyGraph() throws GaaSRestApiException {

        try {
            return deploymentHandler.onAutoGafferDestroy(kubernetesClient);
        } catch (ApiException e) {
            LOGGER.error("Failed to auto destroy graph. Kubernetes client returned Status Code: {}",  e.getCode(), e);
            throw from(e);
        }

    }
}
