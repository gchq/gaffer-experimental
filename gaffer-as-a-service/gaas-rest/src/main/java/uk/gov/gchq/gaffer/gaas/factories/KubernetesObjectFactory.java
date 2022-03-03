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

import com.google.common.collect.Lists;
import io.kubernetes.client.openapi.models.*;
import io.kubernetes.client.util.Yaml;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import uk.gov.gchq.gaffer.gaas.HelmCommand;
import uk.gov.gchq.gaffer.gaas.handlers.HelmValuesOverridesHandler;
import uk.gov.gchq.gaffer.gaas.model.Gaffer;
import uk.gov.gchq.gaffer.gaas.model.GafferSpec;

import java.util.ArrayList;
import java.util.List;

import static uk.gov.gchq.gaffer.gaas.util.Constants.*;


/**
 * Factory class used to create Kubernetes objects
 */
public class KubernetesObjectFactory implements IKubernetesObjectFactory {
    // Values.yaml constants
    private static final String GAFFER = "gaffer";

    // Command Constants
    private static final String HELM = "helm";
    private static final String VALUES_YAML = "values.yaml";
    private static final String VALUES_YAML_LOCATION = "/values/values.yaml";
    private static final String REPO_ARG = "--repo";
    private static final String VERSION_ARG = "--version";
    private static final String VALUES_ARG = "--values";
    private static final String NAMESPACE_ARG = "--namespace";
    private static final String REUSE_VALUES = "--reuse-values";
    private static final String CLEANUP_ON_FAIL = "--cleanup-on-fail";

    // Container Constants
    private static final String VALUES_VOLUME_MOUNT_NAME = "values";
    private static final String VALUES_MOUNT_LOCATION = "/values";

    private final String helmImage;
    private final String serviceAccountName;
    private final String restartPolicy;
    private final String helmRepo;
    private final String workerPullPolicy;
    private final String chartVersion;

    @Autowired
    private HelmValuesOverridesHandler helmValuesOverridesHandler;

    @Value("${openshift.enabled: false}")
    boolean openshiftEnabled;

    public KubernetesObjectFactory(final Environment env) {
        helmImage = env.getProperty(WORKER_IMAGE);
        serviceAccountName = env.getProperty(WORKER_SERVICE_ACCOUNT_NAME);
        restartPolicy = env.getProperty(WORKER_RESTART_POLICY);
        helmRepo = env.getProperty(WORKER_HELM_REPO);
        workerPullPolicy = env.getProperty(WORKER_IMAGE_PULL_POLICY);
        chartVersion = env.getProperty(CHART_VERSION);
    }

    @Override
    public V1Secret createValuesSecret(final Gaffer gaffer, final boolean initialDeployment) {
        GafferSpec spec = gaffer.getSpec();
        GafferSpec helmValues = spec != null ? spec : new GafferSpec();
        if (openshiftEnabled) {
            helmValues = addOpenShiftHelmValues(helmValues);
        }
        return createSecretFromValues(helmValues, gaffer);
    }

    private V1Secret createSecretFromValues(final Object helmValues, final Gaffer gaffer) {
        return new V1SecretBuilder()
                .withNewMetadata()
                .withName(gaffer.getMetadata().getName())
                .and()
                .addToStringData(VALUES_YAML, Yaml.dump(helmValues))
                .build();
    }

    private GafferSpec addOpenShiftHelmValues(final GafferSpec helmValues) {
        helmValues.putNestedObject("edge", "ingress", "annotations", "route.openshift.io/termination");
        helmValues.putNestedObject("max-age=31536000;includeSubDomains;preload", "ingress", "annotations", "haproxy.router.openshift.io/hsts_header");
        helmValues.putNestedObject("400Mi", "api", "resources", "requests", "memory");
        helmValues.putNestedObject("400m", "api", "resources", "requests", "cpu");
        helmValues.putNestedObject("400Mi", "api", "resources", "limits", "memory");
        helmValues.putNestedObject("400m", "api", "resources", "limits", "cpu");
        helmValues.putNestedObject("400Mi", "ui", "resources", "requests", "memory");
        helmValues.putNestedObject("100m", "ui", "resources", "requests", "cpu");
        helmValues.putNestedObject("400Mi", "ui", "resources", "limits", "memory");
        helmValues.putNestedObject("100m", "ui", "resources", "limits", "cpu");
        return helmValues;
    }

    @Override
    public V1Pod createHelmPod(final Gaffer gaffer, final HelmCommand helmCommand, final String secretName) {
        V1Pod helmPod = new V1PodBuilder()
                .withNewMetadata()
                .withName(gaffer.getMetadata().getName() + "-" + helmCommand.getCommand() + "-worker")
                .addToLabels(GAFFER_NAME_LABEL, gaffer.getMetadata().getName())
                .addToLabels(GAFFER_NAMESPACE_LABEL, gaffer.getMetadata().getNamespace())
                .addToLabels(GOAL_LABEL, helmCommand.getCommand())
                .addToLabels(K8S_INSTANCE_LABEL, GAAS_LABEL_VALUE)
                .addToLabels(K8S_COMPONENT_LABEL, WORKER_LABEL_VALUE)
                .and()
                .withNewSpec()
                .withServiceAccountName(serviceAccountName)
                .withRestartPolicy(restartPolicy)
                .withContainers(new V1Container()
                        .name(GAFFER_WORKER_CONTAINER_NAME)
                        .image(helmImage)
                        .imagePullPolicy(workerPullPolicy)
                        .command(Lists.newArrayList(HELM))
                        .args(createHelmArgs(gaffer, helmCommand))
                )
                .and()
                .build();

        if (secretName != null) {
            attachSecret(helmPod, secretName);
        }
        return helmPod;
    }

    private void attachSecret(final V1Pod helmPod, final String secretName) {
        V1PodSpec spec = helmPod.getSpec();
        if (spec == null) {
            throw new RuntimeException("Pod should have a spec");
        }

        spec.addVolumesItem(
                new V1Volume()
                        .name(VALUES_VOLUME_MOUNT_NAME)
                        .secret(new V1SecretVolumeSource()
                                .optional(false)
                                .secretName(secretName))
        );

        V1Container helmContainer = spec.getContainers().get(0);
        helmContainer.addVolumeMountsItem(new V1VolumeMount()
                .mountPath(VALUES_MOUNT_LOCATION)
                .name(VALUES_VOLUME_MOUNT_NAME)
                .readOnly(true)
        );
    }

    private List<String> createHelmArgs(final Gaffer gaffer, final HelmCommand helmCommand) {
        switch (helmCommand) {
            case INSTALL:
                return Lists.newArrayList(installHelmList(gaffer, helmCommand));
            case UPGRADE:
                return Lists.newArrayList(
                        helmCommand.getCommand(),
                        gaffer.getMetadata().getName(),
                        GAFFER,
                        REPO_ARG, helmRepo,
                        VALUES_ARG, VALUES_YAML_LOCATION,
                        NAMESPACE_ARG, gaffer.getMetadata().getNamespace(),
                        REUSE_VALUES,
                        CLEANUP_ON_FAIL
                );
            case UNINSTALL:
                return Lists.newArrayList(
                        helmCommand.getCommand(),
                        gaffer.getMetadata().getName(),
                        NAMESPACE_ARG, gaffer.getMetadata().getNamespace()
                );
            default:
                throw new RuntimeException("Unrecognized command: " + helmCommand);
        }
    }

    private ArrayList<String> installHelmList(final Gaffer gaffer, final HelmCommand helmCommand) {
        ArrayList<String> list = Lists.newArrayList(
                helmCommand.getCommand(),
                gaffer.getMetadata().getName(),
                GAFFER,
                REPO_ARG, helmRepo,
                VALUES_ARG, VALUES_YAML_LOCATION,
                NAMESPACE_ARG, gaffer.getMetadata().getNamespace());
        if (openshiftEnabled) {
            return helmValuesOverridesHandler.helmOverridesStringBuilder(list);
        }
        return list;
    }
}
