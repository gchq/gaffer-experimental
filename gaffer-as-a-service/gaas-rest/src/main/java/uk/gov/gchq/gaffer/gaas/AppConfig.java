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

package uk.gov.gchq.gaffer.gaas;

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import io.kubernetes.client.util.ClientBuilder;
import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import uk.gov.gchq.gaffer.gaas.factories.IKubernetesObjectFactory;
import uk.gov.gchq.gaffer.gaas.factories.KubernetesObjectFactory;
import uk.gov.gchq.gaffer.gaas.handlers.DeploymentHandler;
import uk.gov.gchq.gaffer.gaas.handlers.HelmValuesOverridesHandler;

import java.io.IOException;

@Configuration
public class AppConfig {

    @Bean
    public ApiClient apiClient() throws IOException {
        return ClientBuilder.defaultClient();
    }

    @Bean
    public CustomObjectsApi customObjectsApi() throws IOException {
        return new CustomObjectsApi(apiClient());
    }

    @Bean
    public CoreV1Api coreV1Api() throws IOException {
        return new CoreV1Api(apiClient());
    }

    @Bean
    public IKubernetesObjectFactory kubernetesObjectFactory(final Environment environment) {
        return new KubernetesObjectFactory(environment);
    }

    @Bean
    public DeploymentHandler deploymentHandler(final Environment environment, final IKubernetesObjectFactory kubernetesObjectFactory, final ApiClient apiClient) {
        return new DeploymentHandler(environment, kubernetesObjectFactory);
    }

    @Bean
    public TimedAspect timedAspect(final MeterRegistry registry) {
        return new TimedAspect(registry);
    }

    @Bean
    public HelmValuesOverridesHandler helmValuesOverrides() {
        return new HelmValuesOverridesHandler();
    }
}
