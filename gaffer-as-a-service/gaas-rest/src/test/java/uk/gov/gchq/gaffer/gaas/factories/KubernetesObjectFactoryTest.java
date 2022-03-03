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

package uk.gov.gchq.gaffer.gaas.factories;

import io.kubernetes.client.openapi.models.V1ObjectMeta;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1Secret;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import uk.gov.gchq.gaffer.gaas.HelmCommand;
import uk.gov.gchq.gaffer.gaas.model.v1.Gaffer;
import uk.gov.gchq.gaffer.gaas.model.v1.GafferSpec;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_HELM_REPO;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_IMAGE;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_IMAGE_PULL_POLICY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_NAMESPACE;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_RESTART_POLICY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_SERVICE_ACCOUNT_NAME;

class KubernetesObjectFactoryTest {

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
    void shouldUseEnvironmentToDetermineHelmRepo() {
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
        Integer helmRepoArgIndex = args.indexOf("--repo") + 1;
        assertEquals("file:///gaffer", args.get(helmRepoArgIndex));
    }

    @Test
    void shouldUseEnvironmentToDetermineImage() {
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
    void shouldUseEnvironmentToDetermineRestartPolicy() {
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
    void shouldUseEnvironmentToDetermineServiceAccountName() {
        // Given
        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob"));

        V1Pod helmPod = kubernetesObjectFactory.
                createHelmPod(gaffer, HelmCommand.INSTALL, "my-secret");

        // Then
        String serviceAccountName = helmPod.getSpec().getServiceAccountName();
        assertEquals("alice", serviceAccountName);
    }

    @Test
    public void shouldUseEnvironmentWithUnInstallHelmCommandToDetermineServiceAccountName() {
        // Given
        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob"));

        V1Pod helmPod = kubernetesObjectFactory.
                createHelmPod(gaffer, HelmCommand.UNINSTALL, "my-secret");

        // Then
        String serviceAccountName = helmPod.getSpec().getServiceAccountName();
        assertEquals("alice", serviceAccountName);
    }

    @Test
    public void shouldUseEnvironmentWithUpgradeHelmCommandToDetermineServiceAccountName() {
        // Given
        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);

        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob"));

        V1Pod helmPod = kubernetesObjectFactory.
                createHelmPod(gaffer, HelmCommand.UPGRADE, "my-secret");

        // Then
        String serviceAccountName = helmPod.getSpec().getServiceAccountName();
        assertEquals("alice", serviceAccountName);
    }

    @Test
    public void shouldCreateValuesSecret() {

        // Given
        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);
        // When
        GafferSpec spec = new GafferSpec();
        spec.put("key", "value");

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob").namespace("gaffer-namespace"));

        V1Secret valuesSecret = kubernetesObjectFactory.createValuesSecret(gaffer, false);
        assertNotNull(valuesSecret);
    }

    @Test
    public void shouldCreateValuesSecretWithOpenShiftValues() {

        // Given
        KubernetesObjectFactory kubernetesObjectFactory = new KubernetesObjectFactory(env);
        kubernetesObjectFactory.openshiftEnabled = true;
        // When
        GafferSpec spec = new GafferSpec();

        Gaffer gaffer = new Gaffer().spec(spec).metaData(new V1ObjectMeta().name("bob").namespace("gaffer-namespace"));

        V1Secret valuesSecret = kubernetesObjectFactory.createValuesSecret(gaffer, false);

        assertEquals("{values.yaml=ingress:\n" +
                "  annotations:\n" +
                "    route.openshift.io/termination: edge\n" +
                "    haproxy.router.openshift.io/hsts_header: max-age=31536000;includeSubDomains;preload\n" +
                "api:\n" +
                "  resources:\n" +
                "    requests:\n" +
                "      memory: 400Mi\n" +
                "      cpu: 400m\n" +
                "    limits:\n" +
                "      memory: 400Mi\n" +
                "      cpu: 400m\n" +
                "ui:\n" +
                "  resources:\n" +
                "    requests:\n" +
                "      memory: 400Mi\n" +
                "      cpu: 100m\n" +
                "    limits:\n" +
                "      memory: 400Mi\n" +
                "      cpu: 100m\n" +
                "}", valuesSecret.getStringData().toString());
    }

}
