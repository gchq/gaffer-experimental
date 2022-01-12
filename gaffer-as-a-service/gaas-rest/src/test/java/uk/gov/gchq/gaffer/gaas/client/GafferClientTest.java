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

package uk.gov.gchq.gaffer.gaas.client;

import io.fabric8.kubernetes.client.KubernetesClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import io.kubernetes.client.openapi.models.V1Namespace;
import io.kubernetes.client.openapi.models.V1NamespaceList;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.handlers.DeploymentHandler;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import uk.gov.gchq.gaffer.gaas.model.GraphUrl;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static uk.gov.gchq.gaffer.gaas.util.ApiExceptionTestFactory.makeApiException_timeout;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_API_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_HOST_KEY;

@UnitTest
public class GafferClientTest {

    @Autowired
    private GafferClient gafferClient;

    @MockBean
    private CoreV1Api coreV1Api;

    @MockBean
    private CustomObjectsApi customObjectsApi;

    @MockBean
    private DeploymentHandler deploymentHandler;

    @MockBean
    KubernetesClient kubernetesClient;

    @Value("${gaffer.namespace}")
    private String namespace;
    private final String plural = "gaffers";
    private final String pretty = null;

    @Test
    public void createGraph_ShouldReturnGraphUrl() throws GaaSRestApiException {
        GafferSpec gafferSpec = new GafferSpec();
        gafferSpec.putNestedObject("testgraph.apps.k8s.example.com", INGRESS_HOST_KEY);
        gafferSpec.putNestedObject("/rest", INGRESS_API_PATH_KEY);
        Gaffer gaffer = new Gaffer()
                .metaData(new V1ObjectMeta()
                        .namespace("gaffer-namespace")
                        .name("testgraph")
                ).spec(gafferSpec);
        GraphUrl expected = new GraphUrl("testgraph.apps.k8s.example.com", "/rest");
        assertEquals(expected.buildUrl(), gafferClient.createCRD(gaffer).buildUrl());

    }

    @Test
    public void createGraph_ShouldThrowGaasRestApiException_WhenRequestFails() throws GaaSRestApiException, ApiException {
        when(deploymentHandler.onGafferCreate(null)).thenThrow(new ApiException("Failed to create Gaffer as it is null"));
        //when(gafferClient.createCRD(null)).thenThrow(expectedException);
        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> gafferClient.createCRD(null));

        assertEquals("Failed to create Gaffer as it is null", exception.getTitle());
    }

    @Test
    public void getAllNameSpaces_ShouldThrowGaaSRestApiException_WhenCoreV1ApiThrowsApiEx() throws ApiException {
        final ApiException apiException = makeApiException_timeout();
        when(coreV1Api.listNamespace("true", null, null, null, null, 0, null, null, Integer.MAX_VALUE, Boolean.FALSE))
                .thenThrow(apiException);

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> gafferClient.getAllNameSpaces());

        assertEquals("Kubernetes Cluster Error: java.net.SocketTimeoutException: connect timed out", exception.getMessage());
    }


    @Test
    public void getGraphs_ShouldReturnEmptyWhenNoGraphsExists() {

        List<GaaSGraph> graphs = new ArrayList<>();
        when(deploymentHandler.getDeployments(kubernetesClient)).thenReturn(graphs);
        List<GaaSGraph> gaaSGraphs = gafferClient.listAllCRDs();

        assertEquals(graphs, gaaSGraphs);
    }

    @Test
    public void testGetAllNameSpaces_ShouldReturnMockedNamesSpaceResponse() throws ApiException, GaaSRestApiException {
        V1NamespaceList v1NamespaceList = new V1NamespaceList();
        v1NamespaceList.setApiVersion("v1");
        v1NamespaceList.setKind("NameSpaceList");
        List<V1Namespace> v1Namespace = new ArrayList<>();
        V1Namespace v1Namespace1 = new V1Namespace();
        V1ObjectMeta metadata = new V1ObjectMeta();
        metadata.setName("mockNameSpac");
        metadata.setNamespace("mockNameSpac");
        v1Namespace1.setMetadata(metadata);
        v1Namespace.add(v1Namespace1);
        v1NamespaceList.setItems(v1Namespace);

        when(coreV1Api.listNamespace(
                "true", null, null, null, null, 0, null, null, Integer.MAX_VALUE, Boolean.FALSE))
                .thenReturn(v1NamespaceList);

        List<String> allNameSpaces = gafferClient.getAllNameSpaces();

        assertEquals("mockNameSpac", allNameSpaces.get(0));
    }
}