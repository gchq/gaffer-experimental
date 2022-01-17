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

import io.fabric8.kubernetes.api.model.ConfigMapBuilder;
import io.fabric8.kubernetes.api.model.apps.DeploymentBuilder;
import io.fabric8.kubernetes.api.model.apps.DeploymentList;
import io.fabric8.kubernetes.api.model.apps.DeploymentListBuilder;
import io.fabric8.kubernetes.api.model.apps.DeploymentStatusBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.server.mock.EnableKubernetesMockClient;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import io.kubernetes.client.openapi.models.V1Secret;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.factories.IKubernetesObjectFactory;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import java.util.HashMap;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_HELM_REPO;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_IMAGE;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_IMAGE_PULL_POLICY;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_NAMESPACE;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_RESTART_POLICY;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_SERVICE_ACCOUNT_NAME;
import static uk.gov.gchq.gaffer.gaas.util.Constants.CONFIG_NAME_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GRAPH_ID_KEY;

@EnableKubernetesMockClient(crud = true)
@UnitTest
class DeploymentHandlerTest {

    private Environment environment;

    @MockBean
    private CoreV1Api coreV1Api;

    @MockBean
    private KubernetesClient kubernetesClient;

    @MockBean
    IKubernetesObjectFactory kubernetesObjectFactory;

    @BeforeEach
    public void beforeEach() {
        environment = mock(Environment.class);
        // default values
        when(environment.getProperty(WORKER_NAMESPACE)).thenReturn("gaffer-workers");
        when(environment.getProperty(WORKER_IMAGE)).thenReturn("tzar/helm-kubectl:latest");
        when(environment.getProperty(WORKER_IMAGE_PULL_POLICY)).thenReturn("IfNotPresent");
        when(environment.getProperty(WORKER_RESTART_POLICY)).thenReturn("Never");
        when(environment.getProperty(WORKER_SERVICE_ACCOUNT_NAME)).thenReturn("gaffer-workers");
        when(environment.getProperty(WORKER_HELM_REPO)).thenReturn("https://gchq.github.io/gaffer-workers");
    }

    @Test
    public void shouldReturnDeploymentsWhenGetDeploymentsCalled() {
        ApiClient client = mock(ApiClient.class);
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory, client);
        handler.setCoreV1Api(mock(CoreV1Api.class));

        HashMap<String, String> labels = new HashMap<>();
        labels.put("app.kubernetes.io/instance", "test");

        HashMap<String, String> data = new HashMap<>();
        data.put("graphConfig.json", "{\"configName\":\"mapStore\",\"description\":\"Test Graph Description\",\"graphId\":\"test\",\"hooks\":[]}");

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").endMetadata().build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test-gaffer-graph-config").endMetadata().withData(data).build());
        assertTrue(handler.getDeployments(kubernetesClient).size() == 1);
    }

    @Test
    public void shouldCreateDeployment() throws ApiException {
        ApiClient client = mock(ApiClient.class);
        Gaffer gaffer = getGaffer();

        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory, client);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        handler.onGafferCreate(gaffer);
    }

    @Test
    public void shouldThrowException_WhenGafferIsNull() {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory, client);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        Gaffer gaffer = getGaffer();
        when(kubernetesObjectFactory.createValuesSecret(gaffer, true)).thenReturn(new V1Secret());
        final ApiException exception = assertThrows(ApiException.class, () -> handler.onGafferCreate(null));

        assertEquals("io.kubernetes.client.openapi.ApiException", exception.toString());


    }

    @Test
    public void shouldUninstallTheHelmDeploymentOnDelete() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory, client);
        handler.setCoreV1Api(mock(CoreV1Api.class));

        DeploymentList deploymentList = new DeploymentListBuilder().withItems(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").endMetadata().build(), new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").endMetadata().build()).build();

        kubernetesClient.apps().deployments().inNamespace("gaffer-workers").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").endMetadata().build());
        kubernetesClient.apps().deployments().inNamespace("gaffer-workers").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").endMetadata().build());
        handler.onGafferDelete("test", false, kubernetesClient);

        assertTrue(kubernetesClient.apps().deployments().list().getItems().size() != deploymentList.getItems().size());
    }

    private Gaffer getGaffer() {
        GafferSpec gafferSpec = new GafferSpec();
        gafferSpec.putNestedObject("name", GRAPH_ID_KEY);
        gafferSpec.putNestedObject("somedesc", DESCRIPTION_KEY);
        gafferSpec.putNestedObject("mapStore", CONFIG_NAME_KEY);
        return new Gaffer()
                .metaData(new V1ObjectMeta()
                        .namespace("gaffer-namespace")
                        .name("name")
                ).spec(gafferSpec);
    }

}
