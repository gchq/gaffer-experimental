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

package uk.gov.gchq.gaffer.controller;


import io.kubernetes.client.extended.controller.Controller;
import io.kubernetes.client.informer.SharedInformerFactory;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.spring.extended.controller.factory.KubernetesControllerFactory;
import io.kubernetes.client.util.ClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import uk.gov.gchq.gaffer.controller.factory.IKubernetesObjectFactory;
import uk.gov.gchq.gaffer.controller.factory.KubernetesObjectFactory;
import uk.gov.gchq.gaffer.controller.handler.DeploymentHandler;
import uk.gov.gchq.gaffer.controller.handler.StateHandler;
import uk.gov.gchq.gaffer.controller.informer.InformerFactory;

import java.io.IOException;

/**
 * Configuration for the application including which beans to inject. Extend this class to provide different values.
 */
@Configuration
public class AppConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(AppConfig.class);

    @Bean
    public ApiClient apiClient() throws IOException {
        return ClientBuilder.defaultClient();
    }

    @Bean
    public IKubernetesObjectFactory kubernetesObjectFactory(final Environment environment) {
        return new KubernetesObjectFactory(environment);
    }

    @Bean
    public CommandLineRunner commandLineRunner(
            final SharedInformerFactory sharedInformerFactory,
            @Qualifier("gaffer-deployment-handler") final Controller gafferController,
            @Qualifier("gaffer-state-handler") final Controller stateController) {
        return args -> {
            LOGGER.info("Starting Informers");
            sharedInformerFactory.startAllRegisteredInformers();
            LOGGER.info("Starting Controllers");
            gafferController.run();
            stateController.run();
        };
    }

    @Bean(name = "gaffer-deployment-handler")
    public KubernetesControllerFactory gafferDeploymentFactory(
        final SharedInformerFactory sharedInformerFactory, final DeploymentHandler reconciler) {
        return new KubernetesControllerFactory(sharedInformerFactory, reconciler);
    }

    @Bean(name = "gaffer-state-handler")
    public KubernetesControllerFactory stateFactory(
        final SharedInformerFactory sharedInformerFactory, final StateHandler reconciler) {
        return new KubernetesControllerFactory(sharedInformerFactory, reconciler);
    }

    @Bean
    public SharedInformerFactory sharedInformerFactory(final Environment environment) {
        return new InformerFactory(environment);
    }

    @Bean
    public DeploymentHandler deploymentHandler(final Environment environment, final IKubernetesObjectFactory kubernetesObjectFactory, final ApiClient apiClient) {
        return new DeploymentHandler(environment, kubernetesObjectFactory, apiClient);
    }

    @Bean
    public StateHandler stateHandler(final ApiClient apiClient) {
        return new StateHandler(apiClient);
    }

}
