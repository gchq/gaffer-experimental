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

import io.fabric8.kubernetes.api.model.ConfigMapBuilder;
import io.fabric8.kubernetes.api.model.apps.DeploymentBuilder;
import io.fabric8.kubernetes.api.model.apps.DeploymentStatusBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.server.mock.EnableKubernetesMockClient;
import io.kubernetes.client.openapi.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.test.util.ReflectionTestUtils;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.factories.IKubernetesObjectFactory;
import uk.gov.gchq.gaffer.gaas.handlers.DeploymentHandler;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import java.util.HashMap;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
@EnableKubernetesMockClient(crud = true)
class GraphAutoDestroyTest {

    KubernetesClient kubernetesClient;

    @Autowired
    GraphAutoDestroy graphAutoDestroy;

    @MockBean
    private DeploymentHandler deploymentHandler;


    @Test
    void shouldAutoDestroyGraph() throws ApiException, GaaSRestApiException {
        ReflectionTestUtils.setField(graphAutoDestroy, "kubernetesClient", kubernetesClient);
        HashMap<String, String> labels = new HashMap<>();
        labels.put("app.kubernetes.io/instance", "test");
        labels.put("graphAutoDestroyDate", "2022-06-09t15:55:34.006");

        HashMap<String, String> data = new HashMap<>();
        data.put("graphConfig.json", "{\"configName\":\"mapStore\",\"graphLifetimeInDays\":\"10\",\"description\":\"Test Graph Description\",\"graphId\":\"test\",\"hooks\":[]}");

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").endMetadata().build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test-gaffer-graph-config").endMetadata().withData(data).build());

        graphAutoDestroy.autoDestroyGraph();


        assertEquals(0, kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().size());
    }

    @Test
    void shouldAutoDestroyGraphEmpty() throws ApiException, GaaSRestApiException {
        ReflectionTestUtils.setField(graphAutoDestroy, "kubernetesClient", kubernetesClient);
        HashMap<String, String> labels = new HashMap<>();
        labels.put("app.kubernetes.io/instance", "test");

        HashMap<String, String> data = new HashMap<>();
        data.put("graphConfig.json", "{\"configName\":\"mapStore\",\"graphLifetimeInDays\":\"never\",\"description\":\"Test Graph Description\",\"graphId\":\"test\",\"hooks\":[]}");

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").endMetadata().build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test-gaffer-graph-config").endMetadata().withData(data).build());

        graphAutoDestroy.autoDestroyGraph();


        assertEquals(2, kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().size());
    }





}
