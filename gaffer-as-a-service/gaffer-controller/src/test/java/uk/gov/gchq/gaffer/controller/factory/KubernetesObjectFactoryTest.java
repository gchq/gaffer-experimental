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

import io.kubernetes.client.openapi.models.V1ObjectMeta;
import io.kubernetes.client.openapi.models.V1Pod;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.controller.HelmCommand;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_HELM_REPO;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_IMAGE;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_IMAGE_PULL_POLICY;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_NAMESPACE;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_RESTART_POLICY;
import static uk.gov.gchq.gaffer.common.util.Constants.WORKER_SERVICE_ACCOUNT_NAME;

public class KubernetesObjectFactoryTest {

    private Environment env;

    @BeforeEach
    public void beforeEach() {
        env = mock(Environment.class);
        when(env.getProperty(WORKER_IMAGE)).thenReturn("helm:latest");
        when(env.getProperty(WORKER_IMAGE_PULL_POLICY)).thenReturn("Always");
        when(env.getProperty(WORKER_NAMESPACE)).thenReturn("default");
        when(env.getProperty(WORKER_RESTART_POLICY)).thenReturn("OnFailure");
        when(env.getProperty(WORKER_SERVICE_ACCOUNT_NAME)).thenReturn("alice");
        when(env.getProperty(WORKER_HELM_REPO)).thenReturn("file:///gaffer");
    }

    @Test
    public void shouldUseEnvironmentToDetermineHelmRepo() {
        // Given
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
        when(env.getProperty(WORKER_RESTART_POLICY)).thenReturn("OnFailure");


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
