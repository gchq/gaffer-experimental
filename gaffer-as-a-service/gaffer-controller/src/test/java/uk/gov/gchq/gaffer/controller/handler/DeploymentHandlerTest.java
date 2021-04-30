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
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1PodSpec;
import io.kubernetes.client.openapi.models.V1PodStatus;
import io.kubernetes.client.openapi.models.V1Secret;
import io.kubernetes.client.openapi.models.V1SecretVolumeSource;
import io.kubernetes.client.openapi.models.V1Status;
import io.kubernetes.client.openapi.models.V1Volume;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.HelmCommand;
import uk.gov.gchq.gaffer.controller.factory.KubernetesObjectFactory;
import java.lang.reflect.Type;
import java.util.HashMap;
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
import static uk.gov.gchq.gaffer.common.util.Constants.GAAS_LABEL_VALUE;
import static uk.gov.gchq.gaffer.common.util.Constants.GAFFER_NAMESPACE_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.GAFFER_NAME_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.K8S_INSTANCE_LABEL;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_HELM_REPO;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_IMAGE;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_IMAGE_PULL_POLICY;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_NAMESPACE;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_RESTART_POLICY;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_SERVICE_ACCOUNT_NAME;

class DeploymentHandlerTest {

    private Environment environment;

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
    public void shouldCreateHelmDeploymentOnAdd() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        // Mimicking successful secret creation call
        when(client.buildCall(anyString(), anyString(), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(),
                any(String[].class), any(ApiCallback.class))).then(invocationOnMock -> {
                    ApiCallback callback = invocationOnMock.getArgument(9);
                    callback.onSuccess(invocationOnMock.getArgument(4), 200, null);
                    return null;
                });

        Type podType = new TypeToken<V1Pod>() {
        }.getType();
        when(client.execute(null, podType)).thenReturn(new ApiResponse<>(200, new HashMap<>(), new V1Pod()));

        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(environment);

        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory, client);

        // When
        Gaffer gaffer = new Gaffer()
                .metaData(new V1ObjectMeta()
                        .namespace("gaffer-namespace")
                        .name("name")
                );

        handler.onGafferCreate(gaffer);

        // Then
        // should create pod
        verify(client, times(1)).execute(null, podType);

        // should create the right pod
        V1Pod expected = kubernetesObjectFactory.createHelmPod(gaffer, HelmCommand.INSTALL, "name");
        verify(client, times(1)).execute(null, podType);
        verify(client, times(1)).buildCall(eq("/api/v1/namespaces/gaffer-workers/pods"),
                eq("POST"), anyList(), anyList(), eq(expected), anyMap(), anyMap(), anyMap(), any(String[].class), any());

    }

    @Test
    public void shouldUpgradeHelmDeploymentOnSpecUpdate() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        // Mimicking successful secret creation call
        when(client.buildCall(anyString(), anyString(), anyList(), anyList(), any(V1Secret.class), anyMap(), anyMap(), anyMap(),
                any(String[].class), any(ApiCallback.class))).then(invocationOnMock -> {
            ApiCallback callback = invocationOnMock.getArgument(9);
            callback.onSuccess(invocationOnMock.getArgument(4), 200, null);
            return null;
        });

        Type podType = new TypeToken<V1Pod>() {
        }.getType();
        when(client.execute(null, podType)).thenReturn(new ApiResponse<>(200, new HashMap<>(), new V1Pod()));
        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(environment);
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory, client);

        // When
        Gaffer gaffer = new Gaffer()
                .metaData(new V1ObjectMeta()
                        .namespace("gaffer-namespace")
                        .name("name")
                        .generation(1L)
                );

        Gaffer gaffer2 = new Gaffer()
                .metaData(new V1ObjectMeta()
                        .namespace("gaffer-namespace")
                        .name("name")
                        .generation(2L)
                );

        handler.onGafferUpdate(gaffer, gaffer2);

        // Then
        V1Pod expected = kubernetesObjectFactory.createHelmPod(gaffer2, HelmCommand.UPGRADE, "name");
        verify(client, times(1)).execute(null, podType);
        verify(client, times(1)).buildCall(eq("/api/v1/namespaces/gaffer-workers/pods"),
                eq("POST"), anyList(), anyList(), eq(expected), anyMap(), anyMap(), anyMap(), any(String[].class), any());
    }

    @Test
    public void shouldNotUpgradeHelmDeploymentIfGenerationIsUnchanged() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);

        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(environment);
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory, client);

        // When
        Gaffer gaffer = new Gaffer()
                .metaData(new V1ObjectMeta()
                        .namespace("gaffer-namespace")
                        .name("name")
                        .generation(1L)
                );

        Gaffer gaffer2 = new Gaffer()
                .metaData(new V1ObjectMeta()
                        .namespace("gaffer-namespace")
                        .name("name")
                        .generation(1L)
                );

        handler.onGafferUpdate(gaffer, gaffer2);

        // Then
        verifyZeroInteractions(client);
    }

    @Test
    public void shouldUninstallTheHelmDeploymentOnDelete() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(environment);
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory, client);

        // When
        Gaffer gaffer = new Gaffer()
                .metaData(new V1ObjectMeta()
                        .namespace("gaffer-namespace")
                        .name("name")
                        .generation(1L)
                );

        Type podType = new TypeToken<V1Pod>() {
        }.getType();
        when(client.execute(null, podType)).thenReturn(new ApiResponse<>(200, new HashMap<>(), new V1Pod()));

        handler.onGafferDelete(gaffer, false);

        // Then
        V1Pod expected = kubernetesObjectFactory.createHelmPod(gaffer, HelmCommand.UNINSTALL, null);
        verify(client, times(1)).executeAsync(any(), eq(podType), any());
        verify(client, times(1)).buildCall(eq("/api/v1/namespaces/gaffer-workers/pods"),
                eq("POST"), anyList(), anyList(), eq(expected), anyMap(), anyMap(), anyMap(), any(String[].class), any());
    }

    @Test
    public void shouldClearUpRemainingResourcesLeftAfterSuccessfulUninstall() throws ApiException {
        // Given
       ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        DeploymentHandler handler = new DeploymentHandler(environment, mock(KubernetesObjectFactory.class), client);

        // When
        V1Pod uninstallWorker = new V1Pod()
                .status(
                        new V1PodStatus()
                        .phase("Succeeded")
                )
                .metadata(
                    new V1ObjectMeta()
                        .name("my-uninstall-worker")
                        .namespace("gaffer-workers")
                        .putLabelsItem("goal", "uninstall") // <---- This will be checked
                        .putLabelsItem(GAFFER_NAME_LABEL, "my-gaffer")
                        .putLabelsItem(GAFFER_NAMESPACE_LABEL, "my-gaffer-namespace")
                        .putLabelsItem(K8S_INSTANCE_LABEL, GAAS_LABEL_VALUE)
                );

        handler.onPodUpdate(null, uninstallWorker);

        // Then

        // Clear workers
        verify(client, times(1)).buildCall(eq("/api/v1/namespaces/gaffer-workers/pods"),
                eq("DELETE"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(), any(String[].class), any());

        // Clear dangling pods
        verify(client, times(1)).buildCall(eq("/api/v1/namespaces/my-gaffer-namespace/pods"),
                eq("DELETE"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(), any(String[].class), any());

        // Clear pvcs - one for hdfs and one for zookeeper
        verify(client, times(2)).buildCall(eq("/api/v1/namespaces/my-gaffer-namespace/persistentvolumeclaims"),
                eq("DELETE"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(), any(String[].class), any());

    }

    @Test
    public void shouldClearUpWorkersAfterTheyAreCompleted() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        DeploymentHandler handler = new DeploymentHandler(environment, mock(KubernetesObjectFactory.class), client);

        V1Pod installWorker = new V1Pod()
                .status(
                        new V1PodStatus()
                                .phase("Succeeded")
                )
                .spec(new V1PodSpec()
                        .addVolumesItem(new V1Volume()
                                .name("values")
                                .secret(new V1SecretVolumeSource()
                                        .secretName("my-values-secret-name")
                                )
                        )
                )
                .metadata(
                    new V1ObjectMeta()
                        .name("my-install-worker")
                        .namespace("gaffer-workers")
                        .putLabelsItem("goal", "install")
                        .putLabelsItem(GAFFER_NAME_LABEL, "my-gaffer")
                        .putLabelsItem(GAFFER_NAMESPACE_LABEL, "my-gaffer-namespace")
                        .putLabelsItem(K8S_INSTANCE_LABEL, GAAS_LABEL_VALUE)
                );

        // Mimicking successful pod deletion call
        when(client.buildCall(eq("/api/v1/namespaces/gaffer-workers/pods/my-install-worker"), eq("DELETE"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(),
                any(String[].class), any(ApiCallback.class))).then(invocationOnMock -> {
            ApiCallback callback = invocationOnMock.getArgument(9);
            if (callback != null) {
                callback.onSuccess(installWorker, 200, null);
            }
            return null;
        });

        Type statusType = new TypeToken<V1Status>() {
        }.getType();
        when(client.execute(null, statusType)).thenReturn(new ApiResponse<>(200, new HashMap<>(), new V1Status()));

        // When
        handler.onPodUpdate(null, installWorker);

        // Then
        // worker pod
        verify(client, times(1)).buildCall(eq("/api/v1/namespaces/gaffer-workers/pods/my-install-worker"), eq("DELETE"), anyList(), anyList(),
                any(), anyMap(), anyMap(), anyMap(), any(String[].class), any());

        //
        verify(client, times(1)).buildCall(eq("/api/v1/namespaces/gaffer-workers/secrets/my-values-secret-name"), eq("DELETE"), anyList(), anyList(),
                any(), anyMap(), anyMap(), anyMap(), any(String[].class), any());


    }

    @Test
    public void shouldAttemptToClearUpWorkersIfTheyFail() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        DeploymentHandler handler = new DeploymentHandler(environment, mock(KubernetesObjectFactory.class), client);

        V1Pod installWorker = new V1Pod()
                .status(
                        new V1PodStatus()
                                .phase("Failed")
                )
                .spec(new V1PodSpec()
                        .addVolumesItem(new V1Volume()
                                .name("values")
                                .secret(new V1SecretVolumeSource()
                                        .secretName("my-values-secret-name")
                                )
                        )
                )
                .metadata(
                        new V1ObjectMeta()
                                .name("my-install-worker")
                                .namespace("gaffer-workers")
                                .putLabelsItem("goal", "install")
                                .putLabelsItem(GAFFER_NAME_LABEL, "my-gaffer")
                                .putLabelsItem(GAFFER_NAMESPACE_LABEL, "my-gaffer-namespace")
                                .putLabelsItem(K8S_INSTANCE_LABEL, GAAS_LABEL_VALUE)
                );

        // Mimicking successful pod deletion call
        when(client.buildCall(eq("/api/v1/namespaces/gaffer-workers/pods/my-install-worker"), eq("DELETE"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(),
                any(String[].class), any(ApiCallback.class))).then(invocationOnMock -> {
            ApiCallback callback = invocationOnMock.getArgument(9);
            if (callback != null) {
                callback.onSuccess(installWorker, 200, null);
            }
            return null;
        });

        // Mimicking successful logs retrieval call
        when(client.buildCall(eq("/api/v1/namespaces/gaffer-workers/pods/my-install-worker/log"), eq("GET"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(),
                any(String[].class), any(ApiCallback.class))).then(invocationOnMock -> {
            ApiCallback callback = invocationOnMock.getArgument(9);
            if (callback != null) {
                callback.onSuccess("here are the logs", 200, null);
            }
            return null;
        });


        Type objectType = new TypeToken<Object>() {
        }.getType();
        when(client.execute(null, objectType)).thenReturn(new ApiResponse<>(200, new HashMap<>(), new Gaffer()));

        Type statusType = new TypeToken<V1Status>() {
        }.getType();
        when(client.execute(null, statusType)).thenReturn(new ApiResponse<>(200, new HashMap<>(), new V1Status()));

        // When
        handler.onPodUpdate(null, installWorker);

        // Then
        // worker pod
        verify(client, times(1)).buildCall(eq("/api/v1/namespaces/gaffer-workers/pods/my-install-worker"), eq("DELETE"), anyList(), anyList(),
                any(), anyMap(), anyMap(), anyMap(), any(String[].class), any());

        //
        verify(client, times(1)).buildCall(eq("/api/v1/namespaces/gaffer-workers/secrets/my-values-secret-name"), eq("DELETE"), anyList(), anyList(),
                any(), anyMap(), anyMap(), anyMap(), any(String[].class), any());
    }

    @Test
    public void shouldAppendLogsToGafferStatusIfTheyFail() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();

        DeploymentHandler handler = new DeploymentHandler(environment, mock(KubernetesObjectFactory.class), client);

        V1Pod installWorker = new V1Pod()
                .status(
                        new V1PodStatus()
                                .phase("Failed")
                )
                .spec(new V1PodSpec()
                        .addVolumesItem(new V1Volume()
                                .name("values")
                                .secret(new V1SecretVolumeSource()
                                        .secretName("my-values-secret-name")
                                )
                        )
                )
                .metadata(
                    new V1ObjectMeta()
                        .name("my-install-worker")
                        .namespace("gaffer-workers")
                        .putLabelsItem("goal", "install")
                        .putLabelsItem(GAFFER_NAME_LABEL, "my-gaffer")
                        .putLabelsItem(GAFFER_NAMESPACE_LABEL, "my-gaffer-namespace")
                        .putLabelsItem(K8S_INSTANCE_LABEL, GAAS_LABEL_VALUE)
                );

        when(client.buildCall(eq("/api/v1/namespaces/gaffer-workers/pods/my-install-worker/log"), anyString(), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(),
                any(String[].class), any(ApiCallback.class))).then(invocationOnMock -> {
            ApiCallback callback = invocationOnMock.getArgument(9);
            if (callback != null) {
                callback.onSuccess("here are the logs", 200, null);
            }
            return null;
        });

        Type objectType = new TypeToken<Object>() {
        }.getType();
        when(client.execute(null, objectType)).thenReturn(new ApiResponse<>(200, new HashMap<>(), new Gaffer()));

        // When
        handler.onPodUpdate(null, installWorker);

        // Then

        verify(client, times(1)).buildCall(eq("/api/v1/namespaces/gaffer-workers/pods/my-install-worker/log"), eq("GET"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(),
                any(String[].class), any(ApiCallback.class));

        verify(client, times(1)).buildCall(eq("/apis/gchq.gov.uk/v1/namespaces/my-gaffer-namespace/gaffers/my-gaffer/status"), eq("GET"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(),
                any(String[].class), any());

        verify(client, times(1)).buildCall(eq("/apis/gchq.gov.uk/v1/namespaces/my-gaffer-namespace/gaffers/my-gaffer/status"), eq("PUT"), anyList(), anyList(), any(), anyMap(), anyMap(), anyMap(),
                any(String[].class), any());

    }
}
