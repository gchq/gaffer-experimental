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

import com.google.gson.reflect.TypeToken;
import io.kubernetes.client.openapi.ApiCallback;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.ApiResponse;
import io.kubernetes.client.openapi.models.V1Deployment;
import io.kubernetes.client.openapi.models.V1DeploymentStatus;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.junit.jupiter.api.Test;

import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferStatus;
import uk.gov.gchq.gaffer.controller.model.v1.RestApiStatus;

import java.lang.reflect.Type;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;
import static uk.gov.gchq.gaffer.controller.util.Constants.GAFFER_API_K8S_COMPONENT_LABEL_VALUE;
import static uk.gov.gchq.gaffer.controller.util.Constants.GAFFER_K8S_NAME_LABEL_VALUE;
import static uk.gov.gchq.gaffer.controller.util.Constants.K8S_COMPONENT_LABEL;
import static uk.gov.gchq.gaffer.controller.util.Constants.K8S_INSTANCE_LABEL;
import static uk.gov.gchq.gaffer.controller.util.Constants.K8S_NAME_LABEL;

public class StateHandlerTest {

    @Test
    public void shouldSetTheRestApiStatusToDownIfThereAreNoReadyReplicas() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        StateHandler stateHandler = new StateHandler(client);

        when(client.buildCall(eq("/apis/gchq.gov.uk/v1/namespaces/test/gaffers/my-test-gaffer/status"),
                eq("GET"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(), any(String[].class), any()))
                .thenAnswer(invocationOnMock -> {
                    ApiCallback callback = invocationOnMock.getArgument(9);
                    if (callback != null) {
                        callback.onSuccess(new Gaffer(), 200, new HashMap<>());
                    }
                    return null;
                });

        Type objectType = new TypeToken<Object>() {
        }.getType();
        when(client.execute(null, objectType)).thenReturn(new ApiResponse<>(200, new HashMap<>(), new Gaffer()));


        // When
        V1Deployment deployment = new V1Deployment()
                .metadata(new V1ObjectMeta()
                        .namespace("test")
                        .putLabelsItem(K8S_NAME_LABEL, GAFFER_K8S_NAME_LABEL_VALUE)
                        .putLabelsItem(K8S_COMPONENT_LABEL, GAFFER_API_K8S_COMPONENT_LABEL_VALUE)
                        .putLabelsItem(K8S_INSTANCE_LABEL, "my-test-gaffer")
                )
                .status(new V1DeploymentStatus()
                        .readyReplicas(0)
                );


        stateHandler.onUpdate(null, deployment);

        // Then
        Gaffer gaffer = new Gaffer()
                .status(new GafferStatus()
                        .restApiStatus(RestApiStatus.DOWN)
                );

        verify(client, times(1)).buildCall(eq("/apis/gchq.gov.uk/v1/namespaces/test/gaffers/my-test-gaffer/status"),
                eq("PUT"), anyList(), anyList(), eq(gaffer), anyMap(), anyMap(), anyMap(), any(String[].class), any());

    }

    @Test
    public void shouldSetTheRestApiStatusToUpIfThereAreReadyReplicas() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        StateHandler stateHandler = new StateHandler(client);

        when(client.buildCall(eq("/apis/gchq.gov.uk/v1/namespaces/test/gaffers/my-test-gaffer/status"),
                eq("GET"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(), any(String[].class), any()))
                .thenAnswer(invocationOnMock -> {
                    ApiCallback callback = invocationOnMock.getArgument(9);
                    if (callback != null) {
                        callback.onSuccess(new Gaffer(), 200, new HashMap<>());
                    }
                    return null;
                });

        Type objectType = new TypeToken<Object>() {
        }.getType();
        when(client.execute(null, objectType)).thenReturn(new ApiResponse<>(200, new HashMap<>(), new Gaffer()));


        // When
        V1Deployment deployment = new V1Deployment()
                .metadata(new V1ObjectMeta()
                        .namespace("test")
                        .putLabelsItem(K8S_NAME_LABEL, GAFFER_K8S_NAME_LABEL_VALUE)
                        .putLabelsItem(K8S_COMPONENT_LABEL, GAFFER_API_K8S_COMPONENT_LABEL_VALUE)
                        .putLabelsItem(K8S_INSTANCE_LABEL, "my-test-gaffer")
                )
                .status(new V1DeploymentStatus()
                        .readyReplicas(1)
                );


        stateHandler.onUpdate(null, deployment);

        // Then
        Gaffer gaffer = new Gaffer()
                .status(new GafferStatus()
                        .restApiStatus(RestApiStatus.UP)
                );

        verify(client, times(1)).buildCall(eq("/apis/gchq.gov.uk/v1/namespaces/test/gaffers/my-test-gaffer/status"),
                eq("PUT"), anyList(), anyList(), eq(gaffer), anyMap(), anyMap(), anyMap(), any(String[].class), any());

    }

    @Test
    public void shouldNotUpdateStatusIfRestApiStatusIsUnchanged() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        StateHandler stateHandler = new StateHandler(client);

        when(client.buildCall(eq("/apis/gchq.gov.uk/v1/namespaces/test/gaffers/my-test-gaffer/status"),
                eq("GET"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(), any(String[].class), any()))
                .thenAnswer(invocationOnMock -> {
                    ApiCallback callback = invocationOnMock.getArgument(9);
                    if (callback != null) {
                        callback.onSuccess(new Gaffer().status(new GafferStatus().restApiStatus(RestApiStatus.UP)), 200, new HashMap<>());
                    }
                    return null;
                });

        Type objectType = new TypeToken<Object>() {
        }.getType();
        when(client.execute(null, objectType)).thenReturn(new ApiResponse<>(200, new HashMap<>(), new Gaffer()));


        // When
        V1Deployment deployment = new V1Deployment()
                .metadata(new V1ObjectMeta()
                        .namespace("test")
                        .putLabelsItem(K8S_NAME_LABEL, GAFFER_K8S_NAME_LABEL_VALUE)
                        .putLabelsItem(K8S_COMPONENT_LABEL, GAFFER_API_K8S_COMPONENT_LABEL_VALUE)
                        .putLabelsItem(K8S_INSTANCE_LABEL, "my-test-gaffer")
                )
                .status(new V1DeploymentStatus()
                        .readyReplicas(1)
                );


        stateHandler.onUpdate(null, deployment);

        // Then
        Gaffer gaffer = new Gaffer()
                .status(new GafferStatus()
                        .restApiStatus(RestApiStatus.UP)
                );

        verify(client, times(0)).buildCall(eq("/apis/gchq.gov.uk/v1/namespaces/test/gaffers/my-test-gaffer/status"),
                eq("PUT"), anyList(), anyList(), eq(gaffer), anyMap(), anyMap(), anyMap(), any(String[].class), any());
    }

    @Test
    public void shouldDoNothingOnDeploymentCreation() {
        // When
        StateHandler stateHandler = new StateHandler(mock(ApiClient.class));
        // Then
        assertFalse(stateHandler.onAdd(new V1Deployment()));
    }

    @Test
    public void shouldDoNothingOnDeploymentDeletion() {
        // When
        StateHandler stateHandler = new StateHandler(mock(ApiClient.class));
        // Then
        assertFalse(stateHandler.onDelete(new V1Deployment(), true));
    }

    @Test
    public void shouldDoNothingIfDeploymentIsUnrelatedToGafferAPI() {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        StateHandler stateHandler = new StateHandler(client);

        // When
        V1Deployment deployment = new V1Deployment()
                .metadata(new V1ObjectMeta()
                        .namespace("test")
                        .putLabelsItem(K8S_NAME_LABEL, GAFFER_K8S_NAME_LABEL_VALUE)
                        .putLabelsItem(K8S_COMPONENT_LABEL, "not-the-api")
                        .putLabelsItem(K8S_INSTANCE_LABEL, "my-test-gaffer")
                )
                .status(new V1DeploymentStatus()
                        .readyReplicas(1)
                );


        stateHandler.onUpdate(null, deployment);

        // Then
        verifyZeroInteractions(client);
    }
}
