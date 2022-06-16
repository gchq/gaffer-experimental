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
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.spi.LoggingEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.test.util.ReflectionTestUtils;
import uk.gov.gchq.gaffer.gaas.factories.IKubernetesObjectFactory;
import uk.gov.gchq.gaffer.gaas.model.v1.Gaffer;
import uk.gov.gchq.gaffer.gaas.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.util.TestAppender;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static uk.gov.gchq.gaffer.gaas.util.Constants.CONFIG_NAME_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GRAPH_ID_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_HELM_REPO;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_IMAGE;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_IMAGE_PULL_POLICY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_NAMESPACE;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_RESTART_POLICY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_SERVICE_ACCOUNT_NAME;

@UnitTest
@EnableKubernetesMockClient(crud = true)
class DeploymentHandlerTest {

    KubernetesClient kubernetesClient;

    private Environment environment;

    @MockBean
    IKubernetesObjectFactory kubernetesObjectFactory;


    @BeforeEach
    public void beforeEach() {
        environment = mock(Environment.class);
        // default values
        when(environment.getProperty(WORKER_NAMESPACE)).thenReturn("kai-dev");
        when(environment.getProperty(WORKER_IMAGE)).thenReturn("tzar/helm-kubectl:latest");
        when(environment.getProperty(WORKER_IMAGE_PULL_POLICY)).thenReturn("IfNotPresent");
        when(environment.getProperty(WORKER_RESTART_POLICY)).thenReturn("Never");
        when(environment.getProperty(WORKER_SERVICE_ACCOUNT_NAME)).thenReturn("gaffer-workers");
        when(environment.getProperty(WORKER_HELM_REPO)).thenReturn("https://gchq.github.io/gaffer-workers");
    }

    @Test
    void shouldLogMessagesWhenOnGafferCreateCalled() throws ApiException {
        final TestAppender appender = new TestAppender();
        Logger deploymentHandlerLogger = Logger.getLogger(DeploymentHandler.class);
        deploymentHandlerLogger.setLevel(Level.ALL);
        deploymentHandlerLogger.addAppender(appender);

        try {
            Gaffer gaffer = getGaffer();
            DeploymentHandler deploymentHandler = new DeploymentHandler(environment, kubernetesObjectFactory);
            deploymentHandler.setCoreV1Api(mock(CoreV1Api.class));
            deploymentHandler.onGafferCreate(gaffer);
        } finally {
            deploymentHandlerLogger.removeAppender(appender);
        }

        final List<LoggingEvent> log = appender.getLog();

        assertEquals("Received new add request", log.get(0).getMessage());
        assertEquals("Successfully created secret for new install. Trying pod deployment now...", log.get(1).getMessage());
        assertEquals("Install Pod deployment successful", log.get(2).getMessage());
    }

    @Test
    void shouldLogMessagesWhenOnGafferCreateThrows() throws ApiException {
        final TestAppender appender = new TestAppender();
        Logger deploymentHandlerLogger = Logger.getLogger(DeploymentHandler.class);
        deploymentHandlerLogger.setLevel(Level.ALL);
        deploymentHandlerLogger.addAppender(appender);

        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        CoreV1Api coreV1Api = mock(CoreV1Api.class);
        ReflectionTestUtils.setField(handler, "coreV1Api", coreV1Api);
        when(coreV1Api.createNamespacedSecret(anyString(), any(), any(), any(), any())).thenThrow(new ApiException());

        try {
            handler.onGafferCreate(null);
        } catch (Exception ignored) {

        } finally {
            deploymentHandlerLogger.removeAppender(appender);
        }

        final List<LoggingEvent> log = appender.getLog();
        assertEquals("Failed to create Gaffer", log.get(1).getMessage());
    }

    @Test
    void shouldLogMessagesWhenGetDeploymentsThrows() {
        final TestAppender appender = new TestAppender();
        Logger deploymentHandlerLogger = Logger.getLogger(DeploymentHandler.class);
        deploymentHandlerLogger.setLevel(Level.ALL);
        deploymentHandlerLogger.addAppender(appender);

        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").endMetadata().build());

        try {
            handler.getDeployments(kubernetesClient);
        } catch (Exception ignored) {

        } finally {
            deploymentHandlerLogger.removeAppender(appender);
        }

        final List<LoggingEvent> log = appender.getLog();
        assertEquals("Failed to list all Gaffers.", log.get(0).getMessage());
    }

    @Test
    void shouldReturnDeploymentsWhenGetDeploymentsCalled() throws ApiException {
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));

        HashMap<String, String> labels = new HashMap<>();
        labels.put("app.kubernetes.io/instance", "test");
        labels.put("graphAutoDestroyDate", "");

        HashMap<String, String> data = new HashMap<>();
        data.put("graphConfig.json", "{\"configName\":\"mapStore\",\"graphLifetimeInDays\":\"10\",\"description\":\"Test Graph Description\",\"graphId\":\"test\",\"hooks\":[]}");

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").endMetadata().build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test-gaffer-graph-config").endMetadata().withData(data).build());
        assertEquals(1, handler.getDeployments(kubernetesClient).size());
    }

    @Test
    void shouldReturnOnlyUserCreatedDeploymentsWhenGetDeploymentsByUsernameCalled() throws ApiException {
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));

        HashMap<String, String> labels = new HashMap<>();
        labels.put("app.kubernetes.io/instance", "test");

        HashMap<String, String> usernameLabels = new HashMap<>();
        usernameLabels.put("app.kubernetes.io/instance", "test2");
        usernameLabels.put("creator", "myUser");

        HashMap<String, String> data = new HashMap<>();
        data.put("graphConfig.json", "{\"configName\":\"mapStore\",\"description\":\"Test Graph Description\",\"graphId\":\"test\",\"hooks\":[]}");

        HashMap<String, String> data2 = new HashMap<>();
        data2.put("graphConfig.json", "{\"configName\":\"mapStore\",\"description\":\"Test Graph Description\",\"graphId\":\"test2\",\"hooks\":[]}");

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").endMetadata().build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test-gaffer-graph-config").endMetadata().withData(data).build());

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test2-gaffer-api").withLabels(usernameLabels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test2-gaffer-ui").endMetadata().build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test2-gaffer-graph-config").endMetadata().withData(data2).build());
        assertEquals(1, handler.getDeploymentsByUsername(kubernetesClient, "myUser").size());
    }

    @Test
    void shouldReturnOnlyUserCreatedDeploymentsAndCollaboratorGraphsWhenGetDeploymentsByUsernameCalled() throws ApiException {
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));

        HashMap<String, String> labels = new HashMap<>();
        labels.put("app.kubernetes.io/instance", "test");

        HashMap<String, String> usernameLabels = new HashMap<>();
        usernameLabels.put("app.kubernetes.io/instance", "test2");
        usernameLabels.put("creator", "myUser");

        HashMap<String, String> collaboratorLabels = new HashMap<>();
        collaboratorLabels.put("app.kubernetes.io/instance", "test2");
        collaboratorLabels.put("creator", "someOtherUser");
        collaboratorLabels.put("collaborator/myUser", "myUser");

        HashMap<String, String> data = new HashMap<>();
        data.put("graphConfig.json", "{\"configName\":\"mapStore\",\"description\":\"Test Graph Description\",\"graphId\":\"test\",\"hooks\":[]}");

        HashMap<String, String> data2 = new HashMap<>();
        data2.put("graphConfig.json", "{\"configName\":\"mapStore\",\"description\":\"Test Graph Description\",\"graphId\":\"test2\",\"hooks\":[]}");

        HashMap<String, String> data3 = new HashMap<>();
        data3.put("graphConfig.json", "{\"configName\":\"mapStore\",\"description\":\"Test Graph Description\",\"graphId\":\"test3\",\"hooks\":[]}");


        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").endMetadata().build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test-gaffer-graph-config").endMetadata().withData(data).build());

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test2-gaffer-api").withLabels(usernameLabels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test2-gaffer-ui").endMetadata().build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test2-gaffer-graph-config").endMetadata().withData(data2).build());

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test3-gaffer-api").withLabels(collaboratorLabels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test3-gaffer-ui").endMetadata().build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test3-gaffer-graph-config").endMetadata().withData(data3).build());

        assertEquals(2, handler.getDeploymentsByUsername(kubernetesClient, "myUser").size());
    }

    @Test
    void shouldReturnTrueWhenCreateDeploymentSuccessful() throws ApiException {
        Gaffer gaffer = getGaffer();

        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        assertTrue(handler.onGafferCreate(gaffer));
    }

    @Test
    void shouldThrowException_WhenGafferIsNull() {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        Gaffer gaffer = getGaffer();
        when(kubernetesObjectFactory.createValuesSecret(gaffer, true)).thenReturn(new V1Secret());
        final NullPointerException exception = assertThrows(NullPointerException.class, () -> handler.onGafferCreate(null));

        assertEquals("java.lang.NullPointerException", exception.toString());
    }

    @Test
    void shouldUninstallTheHelmDeploymentOnDelete() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        Map<String, String> labels = new HashMap<>();
        labels.put("creator", "myUser");
        labels.put("app.kubernetes.io/instance", "test");
        DeploymentList deploymentList = new DeploymentListBuilder().withItems(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().build(), new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().build()).build();

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().build());
        handler.onGafferDelete("test", kubernetesClient);

        assertNotEquals(deploymentList.getItems().size(), kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().size());
    }

    @Test
    void shouldAutoDestroyGraph() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));

        LocalDateTime currentTime = LocalDateTime.now();
        HashMap<String, String> labels = new HashMap<>();
        labels.put("app.kubernetes.io/instance", "test");
        labels.put("graphAutoDestroyDate", currentTime.toString());

        HashMap<String, String> data = new HashMap<>();
        data.put("graphConfig.json", "{\"configName\":\"mapStore\",\"graphLifetimeInDays\":\"10\",\"description\":\"Test Graph Description\",\"graphId\":\"test\",\"hooks\":[]}");

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test-gaffer-graph-config").endMetadata().withData(data).build());

        handler.onAutoGafferDestroy(kubernetesClient);


        assertEquals(0, kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().size());
    }

    @Test
    void shouldNotAutoDestroyGraphWhenGraphAutoDestroyDateIsEmpty() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));

        LocalDateTime currentTime = LocalDateTime.now();
        HashMap<String, String> labels = new HashMap<>();
        labels.put("app.kubernetes.io/instance", "test");

        HashMap<String, String> data = new HashMap<>();
        data.put("graphConfig.json", "{\"configName\":\"mapStore\",\"graphLifetimeInDays\":\"10\",\"description\":\"Test Graph Description\",\"graphId\":\"test\",\"hooks\":[]}");

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().withStatus(new DeploymentStatusBuilder().withAvailableReplicas(1).build()).build());
        kubernetesClient.configMaps().inNamespace("kai-dev").create(new ConfigMapBuilder().withNewMetadata().withName("test-gaffer-graph-config").endMetadata().withData(data).build());

        handler.onAutoGafferDestroy(kubernetesClient);


        assertEquals(2, kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().size());
    }


    @Test
    void shouldUninstallTheHelmDeploymentOnDeleteWithUsername() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        Map<String, String> labels = new HashMap<>();
        labels.put("creator", "myUser");
        labels.put("app.kubernetes.io/instance", "test");
        DeploymentList deploymentList = new DeploymentListBuilder().withItems(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().build(), new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().build()).build();

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().build());
        handler.onGafferDeleteByUsername("test", kubernetesClient, "myUser");

        assertNotEquals(deploymentList.getItems().size(), kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().size());
    }

    @Test
    void shouldNotUninstallTheHelmDeploymentOnDeleteWithUsernameWhenUserDoesNotMatchCreator() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        Map<String, String> labels = new HashMap<>();
        labels.put("creator", "myUser");
        DeploymentList deploymentList = new DeploymentListBuilder().withItems(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().build(), new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().build()).build();

        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().build());
        handler.onGafferDeleteByUsername("test", kubernetesClient, "someOtherUser");

        assertEquals(deploymentList.getItems().size(), kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().size());
    }

    @Test
    void shouldLogMessagesWhenOnGafferDeleteThrows() {
        final TestAppender appender = new TestAppender();
        Logger deploymentHandlerLogger = Logger.getLogger(DeploymentHandler.class);
        deploymentHandlerLogger.setLevel(Level.ALL);
        deploymentHandlerLogger.addAppender(appender);

        DeploymentHandler deploymentHandler = new DeploymentHandler(environment, kubernetesObjectFactory);
        deploymentHandler.setCoreV1Api(mock(CoreV1Api.class));
        try {
            deploymentHandler.onGafferDelete("test", kubernetesClient);
        } catch (Exception ignored) {

        } finally {
            deploymentHandlerLogger.removeAppender(appender);
        }


        final List<LoggingEvent> log = appender.getLog();
        assertEquals("No deployments of test to delete", log.get(0).getMessage());
    }

    @Test
    void shouldAddCollaboratorLabelWhenAddGraphCollaboratorCalled() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        Map<String, String> labels = new HashMap<>();
        labels.put("creator", "myUser");
        labels.put("app.kubernetes.io/instance", "test");


        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().build());
        handler.addGraphCollaborator("test", kubernetesClient, "someUser");

        assertEquals("someUser", kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().get(0).getMetadata().getLabels().get("collaborator/someUser"));
        assertEquals("someUser", kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().get(1).getMetadata().getLabels().get("collaborator/someUser"));

    }

    @Test
    void shouldAddCollaboratorLabelWhenAddGraphCollaboratorWithUsernameCalledAndUserIsGraphCreator() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        Map<String, String> labels = new HashMap<>();
        labels.put("creator", "myUser");
        labels.put("app.kubernetes.io/instance", "test");


        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().build());
        handler.addGraphCollaboratorWithUsername("test", kubernetesClient, "someUser", "myUser");

        assertEquals("someUser", kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().get(0).getMetadata().getLabels().get("collaborator/someUser"));
        assertEquals("someUser", kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().get(1).getMetadata().getLabels().get("collaborator/someUser"));

    }

    @Test
    void shouldNotAddCollaboratorLabelWhenAddGraphCollaboratorWithUsernameCalledAndUserIsNotGraphCreator() throws ApiException {
        // Given
        ApiClient client = mock(ApiClient.class);
        when(client.escapeString(anyString())).thenCallRealMethod();
        DeploymentHandler handler = new DeploymentHandler(environment, kubernetesObjectFactory);
        handler.setCoreV1Api(mock(CoreV1Api.class));
        Map<String, String> labels = new HashMap<>();
        labels.put("creator", "anotherUser");
        labels.put("app.kubernetes.io/instance", "test");


        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-api").withLabels(labels).endMetadata().build());
        kubernetesClient.apps().deployments().inNamespace("kai-dev").create(new DeploymentBuilder().withNewMetadata().withName("test-gaffer-ui").withLabels(labels).endMetadata().build());
        boolean result = handler.addGraphCollaboratorWithUsername("test", kubernetesClient, "someUser", "myUser");

        assertFalse(result);
        assertEquals(null, kubernetesClient.apps().deployments().inNamespace("kai-dev").list().getItems().get(0).getMetadata().getLabels().get("collaborator/someUser"));

    }

    private Gaffer getGaffer() {
        GafferSpec gafferSpec = new GafferSpec();
        gafferSpec.putNestedObject("name", GRAPH_ID_KEY);
        gafferSpec.putNestedObject("someDescription", DESCRIPTION_KEY);
        gafferSpec.putNestedObject("mapStore", CONFIG_NAME_KEY);
        return new Gaffer()
                .metaData(new V1ObjectMeta()
                        .namespace("gaffer-namespace")
                        .name("name")
                ).spec(gafferSpec);
    }

}
