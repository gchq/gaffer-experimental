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
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.utilities.UnitTest;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static uk.gov.gchq.gaffer.gaas.utilities.ApiExceptionTestFactory.makeApiException_loggedOutOfCluster;
import static uk.gov.gchq.gaffer.gaas.utilities.ApiExceptionTestFactory.makeApiException_timeout;

@UnitTest
public class CRDClientTest {

  @Autowired
  private CRDClient crdClient;

  @MockBean
  private CoreV1Api coreV1Api;

  @MockBean
  private CustomObjectsApi customObjectsApi;

  @Value("${group}")
  private String group;
  @Value("${version}")
  private String version;
  @Value("${namespace}")
  private String namespace;
  private final String plural = "gaffers";
  private final String pretty = null;

  @Test
  public void getAllNameSpaces_ShouldThrowGaaSRestApiException_WhenCoreV1ApiThrowsApiEx() throws ApiException {
    final ApiException apiException = makeApiException_timeout();
    when(coreV1Api.listNamespace("true", null, null, null, null, 0, null, null, Integer.MAX_VALUE, Boolean.FALSE))
            .thenThrow(apiException);

    final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> crdClient.getAllNameSpaces());

    assertEquals("Kubernetes Cluster Error: java.net.SocketTimeoutException: connect timed out", exception.getMessage());
  }


  @Test
  public void getGraphCRDs_ShouldThrowGaaSRestApiException_WhenCustomApiThrowsTimeoutEx() throws ApiException {
    final ApiException apiException = makeApiException_timeout();
    when(customObjectsApi.listNamespacedCustomObject(group, this.version, this.namespace, this.plural, this.pretty, null, null, null, null, null, null, null))
            .thenThrow(apiException);
    final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> crdClient.listAllCRDs());

    assertEquals("Kubernetes Cluster Error: java.net.SocketTimeoutException: connect timed out", exception.getMessage());
  }

  @Test
  public void getGraphCRDs_ShouldThrowGaaSRestApiException_WhenCustomApiThrowsApiEx() throws ApiException {
    final ApiException apiException = makeApiException_loggedOutOfCluster();
    when(customObjectsApi.listNamespacedCustomObject(group, this.version, this.namespace, this.plural, this.pretty, null, null, null, null, null, null, null))
            .thenThrow(apiException);

    final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> crdClient.listAllCRDs());

    assertEquals("Kubernetes Cluster Error: Invalid authentication credentials for Kubernetes cluster", exception.getMessage());
    assertEquals(401, exception.getStatusCode());
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

    List<String> allNameSpaces = crdClient.getAllNameSpaces();

    assertEquals("mockNameSpac", allNameSpaces.get(0));
  }


}
