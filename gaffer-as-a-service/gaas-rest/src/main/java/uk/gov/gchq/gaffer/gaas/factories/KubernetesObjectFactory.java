/*
 * Copyright 2020-2022 Crown Copyright
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
import io.kubernetes.client.custom.Quantity;
import io.kubernetes.client.openapi.models.V1Container;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1PodBuilder;
import io.kubernetes.client.openapi.models.V1PodSpec;
import io.kubernetes.client.openapi.models.V1ResourceRequirements;
import io.kubernetes.client.openapi.models.V1Secret;
import io.kubernetes.client.openapi.models.V1SecretBuilder;
import io.kubernetes.client.openapi.models.V1SecretVolumeSource;
import io.kubernetes.client.openapi.models.V1Volume;
import io.kubernetes.client.openapi.models.V1VolumeMount;
import io.kubernetes.client.util.Yaml;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import uk.gov.gchq.gaffer.gaas.HelmCommand;
import uk.gov.gchq.gaffer.gaas.handlers.HelmValuesOverridesHandler;
import uk.gov.gchq.gaffer.gaas.model.v1.Gaffer;
import uk.gov.gchq.gaffer.gaas.model.v1.GafferSpec;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import static uk.gov.gchq.gaffer.gaas.util.Constants.CHART_VERSION;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GAAS_LABEL_VALUE;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GAFFER_NAMESPACE_LABEL;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GAFFER_NAME_LABEL;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GAFFER_WORKER_CONTAINER_NAME;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GOAL_LABEL;
import static uk.gov.gchq.gaffer.gaas.util.Constants.K8S_COMPONENT_LABEL;
import static uk.gov.gchq.gaffer.gaas.util.Constants.K8S_INSTANCE_LABEL;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_HELM_REPO;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_IMAGE;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_IMAGE_PULL_POLICY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_LABEL_VALUE;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_RESTART_POLICY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.WORKER_SERVICE_ACCOUNT_NAME;


/**
 * Factory class used to create Kubernetes objects
 */
public class KubernetesObjectFactory implements IKubernetesObjectFactory {

    private static final Logger LOGGER = LoggerFactory.getLogger(KubernetesObjectFactory.class);

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
        helmValues = addOpenShiftHelmValues(helmValues);
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

    private HashMap<String, Quantity> workerPodRequestValues() {
        HashMap<String, Quantity> requests = new HashMap<>();
        requests.put("cpu", Quantity.fromString("100m"));
        requests.put("memory", Quantity.fromString("300Mi"));
        return requests;
    }

    private HashMap<String, Quantity> workerPodLimitsValues() {
        HashMap<String, Quantity> limits = new HashMap<>();
        limits.put("cpu", Quantity.fromString("100m"));
        limits.put("memory", Quantity.fromString("300Mi"));
        return limits;
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
                        .resources(new V1ResourceRequirements().requests(workerPodRequestValues()).limits(workerPodLimitsValues()))
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
            LOGGER.error("Pod should have a spec: " + spec);
            throw new RuntimeException("Pod should have a spec: " + spec);
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
                LOGGER.error("Unrecognized helm command: " + helmCommand);
                throw new RuntimeException("Unrecognized helm command: " + helmCommand);
        }
    }

    private ArrayList<String> installHelmList(final Gaffer gaffer, final HelmCommand helmCommand) {
        ArrayList<String> list = Lists.newArrayList(
                helmCommand.getCommand(),
                gaffer.getMetadata().getName(),
                GAFFER,
                REPO_ARG, helmRepo,
                VERSION_ARG, chartVersion,
                VALUES_ARG, VALUES_YAML_LOCATION,
                NAMESPACE_ARG, gaffer.getMetadata().getNamespace());

        return helmValuesOverridesHandler.helmOverridesStringBuilder(list);
    }
}
