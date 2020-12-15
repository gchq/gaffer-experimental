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

package uk.gov.gchq.gaffer.controller.factory;

import com.google.common.collect.Lists;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1Secret;
import io.kubernetes.client.util.Yaml;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

import uk.gov.gchq.gaffer.controller.HelmCommand;
import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static uk.gov.gchq.gaffer.controller.util.Constants.GENERATED_PASSWORD_LENGTH;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_HELM_IMAGE;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_HELM_IMAGE_DEFAULT;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_HELM_REPO;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_HELM_REPO_DEFAULT;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_RESTART_POLICY;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_RESTART_POLICY_DEFAULT;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_SERVICE_ACCOUNT_NAME;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_SERVICE_ACCOUNT_NAME_DEFAULT;

public class KubernetesObjectFactoryTest {

    @Test
    public void shouldMergeValuesInWithGeneratedPasswordsOnInitialDeployment() {
        // Given
        Environment env = mock(Environment.class);
        when(env.getProperty(GENERATED_PASSWORD_LENGTH, Integer.class, 10)).thenReturn(10);
        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob"));


        V1Secret secret = kubernetesObjectFactory.createValuesSecret(gaffer, true);

        // Then
        // Using GafferSpec to take advantage of the nesting methods
        GafferSpec values = Yaml.loadAs(secret.getStringData().get("values.yaml"), GafferSpec.class);
        assertEquals("value", values.get("key"));
        assertTrue(values.containsKey("accumulo"));
    }

    @Test
    public void shouldNotMergeValuesInWithGeneratedPasswordsWhenNotAnInitialDeployment() {
        // Given
        Environment env = mock(Environment.class);
        when(env.getProperty(GENERATED_PASSWORD_LENGTH, Integer.class, 10)).thenReturn(10);
        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob"));


        V1Secret secret = kubernetesObjectFactory.createValuesSecret(gaffer, false);

        // Then
        // Using GafferSpec to take advantage of the nesting methods
        GafferSpec values = Yaml.loadAs(secret.getStringData().get("values.yaml"), GafferSpec.class);
        assertEquals("value", values.get("key"));
        assertFalse(values.containsKey("accumulo"));
    }

    @Test
    public void shouldSetTheTablePermissionsIfTheGraphIdIsChanged() {
        // Given
        Environment env = mock(Environment.class);
        when(env.getProperty(GENERATED_PASSWORD_LENGTH, Integer.class, 10)).thenReturn(10);
        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");
        spec.putNestedObject("myGraphId", "graph", "config", "graphId");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob"));


        V1Secret secret = kubernetesObjectFactory.createValuesSecret(gaffer, false);

        // Then
        // Using GafferSpec to take advantage of the nesting methods
        GafferSpec values = Yaml.loadAs(secret.getStringData().get("values.yaml"), GafferSpec.class);
        assertEquals(Lists.newArrayList("READ", "WRITE", "BULK_IMPORT", "ALTER_TABLE"), values.getNestedObject(
                "accumulo", "config", "userManagement", "users", "gaffer", "permissions", "table", "myGraphId"));
    }

    @Test
    public void shouldUseEnvironmentToDetermineHelmRepo() {
        // Given
        Environment env = mock(Environment.class);
        // These just prevent null pointers
        when(env.getProperty(GENERATED_PASSWORD_LENGTH, Integer.class, 10)).thenReturn(10);
        when(env.getProperty(any(String.class), any(String.class))).then(invocationOnMock -> invocationOnMock.getArgument(1));
        // The thing we're actually testing
        when(env.getProperty(WORKER_HELM_REPO, WORKER_HELM_REPO_DEFAULT)).thenReturn("file:///gaffer");



        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob"));

        V1Pod helmPod = kubernetesObjectFactory.
                createHelmPod(gaffer, HelmCommand.INSTALL, "my-secret");

        // Then
        List<String> args = helmPod.getSpec().getContainers().get(0).getArgs();
        Integer helmRepoArgIndex = args.indexOf("--repo") +  1;
        assertEquals("file:///gaffer", args.get(helmRepoArgIndex));
    }

    @Test
    public void shouldUseEnvironmentToDetermineImage() {
        // Given
        Environment env = mock(Environment.class);
        // These just prevent null pointers
        when(env.getProperty(any(String.class), any(String.class))).then(invocationOnMock -> invocationOnMock.getArgument(1));
        when(env.getProperty(GENERATED_PASSWORD_LENGTH, Integer.class, 10)).thenReturn(10);
        // The thing we're actually testing
        when(env.getProperty(WORKER_HELM_IMAGE, WORKER_HELM_IMAGE_DEFAULT)).thenReturn("helm:latest");


        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob"));

        V1Pod helmPod = kubernetesObjectFactory.
                createHelmPod(gaffer, HelmCommand.INSTALL, "my-secret");

        // Then
        String image = helmPod.getSpec().getContainers().get(0).getImage();
        assertEquals("helm:latest", image);
    }

    @Test
    public void shouldUseEnvironmentToDetermineRestartPolicy() {
        // Given
        Environment env = mock(Environment.class);
        // These just prevent null pointers
        when(env.getProperty(any(String.class), any(String.class))).then(invocationOnMock -> invocationOnMock.getArgument(1));
        when(env.getProperty(GENERATED_PASSWORD_LENGTH, Integer.class, 10)).thenReturn(10);
        // The thing we're actually testing
        when(env.getProperty(WORKER_RESTART_POLICY, WORKER_RESTART_POLICY_DEFAULT)).thenReturn("OnFailure");


        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob"));

        V1Pod helmPod = kubernetesObjectFactory.
                createHelmPod(gaffer, HelmCommand.INSTALL, "my-secret");

        // Then
        String restartPolicy = helmPod.getSpec().getRestartPolicy();
        assertEquals("OnFailure", restartPolicy);
    }

    @Test
    public void shouldUseEnvironmentToDetermineServiceAccountName() {
        // Given
        Environment env = mock(Environment.class);
        // These just prevent null pointers
        when(env.getProperty(any(String.class), any(String.class))).then(invocationOnMock -> invocationOnMock.getArgument(1));
        when(env.getProperty(GENERATED_PASSWORD_LENGTH, Integer.class, 10)).thenReturn(10);
        // The thing we're actually testing
        when(env.getProperty(WORKER_SERVICE_ACCOUNT_NAME, WORKER_SERVICE_ACCOUNT_NAME_DEFAULT)).thenReturn("alice");


        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob"));

        V1Pod helmPod = kubernetesObjectFactory.
                createHelmPod(gaffer, HelmCommand.INSTALL, "my-secret");

        // Then
        String serviceAccountName = helmPod.getSpec().getServiceAccount();
        assertEquals("alice", serviceAccountName);
    }

    @Test
    public void shouldRunTheHelmDeploymentInTheSameNamespaceThatTheGafferGraphHas() {
        // Given
        Environment env = mock(Environment.class);
        // These just prevent null pointers
        when(env.getProperty(any(String.class), any(String.class))).then(invocationOnMock -> invocationOnMock.getArgument(1));
        when(env.getProperty(GENERATED_PASSWORD_LENGTH, Integer.class, 10)).thenReturn(10);
        // The thing we're actually testing

        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob").namespace("gaffer-namespace"));

        V1Pod helmPod = kubernetesObjectFactory.
                createHelmPod(gaffer, HelmCommand.INSTALL, "my-secret");

        // Then
        List<String> args = helmPod.getSpec().getContainers().get(0).getArgs();
        Integer namespaceIndex = args.indexOf("--namespace") +  1;
        assertEquals("gaffer-namespace", args.get(namespaceIndex));
    }

}
