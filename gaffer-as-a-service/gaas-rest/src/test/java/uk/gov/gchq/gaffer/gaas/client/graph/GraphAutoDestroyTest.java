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

import io.fabric8.kubernetes.client.DefaultKubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.server.mock.EnableKubernetesMockClient;
import io.kubernetes.client.openapi.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.util.ReflectionTestUtils;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.handlers.DeploymentHandler;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@UnitTest
@EnableKubernetesMockClient(crud = true)
class GraphAutoDestroyTest {

    private KubernetesClient kubernetesClient;

    @Autowired
    private GraphAutoDestroy graphAutoDestroy;

    @MockBean
    private DeploymentHandler deploymentHandler;


    @Test
    void shouldAutoDestroyGraph() throws ApiException, GaaSRestApiException {
        kubernetesClient = new DefaultKubernetesClient();
        ReflectionTestUtils.setField(graphAutoDestroy, "kubernetesClient", kubernetesClient);
        when(deploymentHandler.onAutoGafferDestroy(kubernetesClient)).thenReturn(true);
        assertEquals(true, graphAutoDestroy.autoDestroyGraph());
    }

    @Test
    void shouldReturnFalseAutoDestroyGraph() throws ApiException, GaaSRestApiException {
        kubernetesClient = new DefaultKubernetesClient();
        ReflectionTestUtils.setField(graphAutoDestroy, "kubernetesClient", kubernetesClient);
        when(deploymentHandler.onAutoGafferDestroy(kubernetesClient)).thenReturn(false);
        assertEquals(false, graphAutoDestroy.autoDestroyGraph());
    }

    @Test
    void autoDestroy_ShouldThrowGaaSRestApiException_WhenRequestFails() throws ApiException {

        kubernetesClient = new DefaultKubernetesClient();
        ReflectionTestUtils.setField(graphAutoDestroy, "kubernetesClient", kubernetesClient);
        when(deploymentHandler.onAutoGafferDestroy(kubernetesClient))
                .thenThrow(new ApiException("Failed to delete Gaffer as it is null"));

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> graphAutoDestroy.autoDestroyGraph());

        assertEquals("Kubernetes Cluster Error: Failed to delete Gaffer as it is null", exception.getMessage());
    }
}

