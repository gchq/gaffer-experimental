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
import io.kubernetes.client.openapi.models.V1Container;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1PodBuilder;
import io.kubernetes.client.openapi.models.V1PodSpec;
import io.kubernetes.client.openapi.models.V1Secret;
import io.kubernetes.client.openapi.models.V1SecretBuilder;
import io.kubernetes.client.openapi.models.V1SecretVolumeSource;
import io.kubernetes.client.openapi.models.V1Volume;
import io.kubernetes.client.openapi.models.V1VolumeMount;
import io.kubernetes.client.util.Yaml;
import org.apache.commons.collections4.list.UnmodifiableList;
import org.apache.commons.text.RandomStringGenerator;
import org.springframework.core.env.Environment;

import uk.gov.gchq.gaffer.controller.HelmCommand;
import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;

import java.util.List;

import static uk.gov.gchq.gaffer.controller.util.Constants.GAAS_LABEL_VALUE;
import static uk.gov.gchq.gaffer.controller.util.Constants.GAFFER_NAMESPACE_LABEL;
import static uk.gov.gchq.gaffer.controller.util.Constants.GAFFER_NAME_LABEL;
import static uk.gov.gchq.gaffer.controller.util.Constants.GAFFER_WORKER_CONTAINER_NAME;
import static uk.gov.gchq.gaffer.controller.util.Constants.GENERATED_PASSWORD_LENGTH;
import static uk.gov.gchq.gaffer.controller.util.Constants.GENERATED_PASSWORD_LENGTH_DEFAULT;
import static uk.gov.gchq.gaffer.controller.util.Constants.GOAL_LABEL;
import static uk.gov.gchq.gaffer.controller.util.Constants.K8S_COMPONENT_LABEL;
import static uk.gov.gchq.gaffer.controller.util.Constants.K8S_INSTANCE_LABEL;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_HELM_IMAGE;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_HELM_IMAGE_DEFAULT;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_HELM_REPO;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_HELM_REPO_DEFAULT;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_LABEL_VALUE;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_RESTART_POLICY;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_RESTART_POLICY_DEFAULT;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_SERVICE_ACCOUNT_NAME;
import static uk.gov.gchq.gaffer.controller.util.Constants.WORKER_SERVICE_ACCOUNT_NAME_DEFAULT;

/**
 * Factory class used to create Kubernetes objects
 */
public class KubernetesObjectFactory implements IKubernetesObjectFactory {
    // Values.yaml constants
    private static final List<String> TABLE_PERMISSIONS = new UnmodifiableList<>(
            Lists.newArrayList("READ", "WRITE", "BULK_IMPORT", "ALTER_TABLE"));
    private static final String GRAPH = "graph";
    private static final String CONFIG = "config";
    private static final String GRAPH_ID = "graphId";
    private static final String ACCUMULO = "accumulo";
    private static final String USER_MANAGEMENT = "userManagement";
    private static final String GAFFER = "gaffer";
    private static final String PERMISSIONS = "permissions";
    private static final String TABLE = "table";
    private static final String ACCUMULO_SITE = "accumuloSite";
    private static final String INSTANCE_SECRET = "instance.secret";
    private static final String ROOT_PASSWORD = "rootPassword";
    private static final String USERS = "users";
    private static final String PASSWORD = "password";
    private static final String TRACER = "tracer";

    // Command Constants
    private static final String HELM = "helm";
    private static final String VALUES_YAML = "values.yaml";
    private static final String VALUES_YAML_LOCATION = "/values/values.yaml";
    private static final String REPO_ARG = "--repo";
    private static final String VALUES_ARG = "--values";
    private static final String NAMESPACE_ARG = "--namespace";
    private static final String REUSE_VALUES = "--reuse-values";
    private static final String CLEANUP_ON_FAIL = "--cleanup-on-fail";

    // Container Constants
    private static final String IMAGE_PULL_POLICY = "IfNotPresent";
    private static final String VALUES_VOLUME_MOUNT_NAME = "values";
    private static final String VALUES_MOUNT_LOCATION = "/values";

    private final String helmImage;
    private final String serviceAccountName;
    private final String restartPolicy;
    private final String helmRepo;
    private final int passwordLength;

    public KubernetesObjectFactory(final Environment env) {
        helmImage = env.getProperty(WORKER_HELM_IMAGE, WORKER_HELM_IMAGE_DEFAULT);
        serviceAccountName = env.getProperty(WORKER_SERVICE_ACCOUNT_NAME, WORKER_SERVICE_ACCOUNT_NAME_DEFAULT);
        restartPolicy = env.getProperty(WORKER_RESTART_POLICY, WORKER_RESTART_POLICY_DEFAULT);
        helmRepo = env.getProperty(WORKER_HELM_REPO, WORKER_HELM_REPO_DEFAULT);
        passwordLength = env.getProperty(GENERATED_PASSWORD_LENGTH, Integer.class, GENERATED_PASSWORD_LENGTH_DEFAULT);
    }

    private String generatePassword(final int length) {
        char[][] range = {{'a', 'z'}, {'A', 'Z'}, {'0', '9'}};
        return new RandomStringGenerator.Builder()
                .withinRange(range)
                .build()
                .generate(length);
    }

    @Override
    public V1Secret createValuesSecret(final Gaffer gaffer, final boolean initialDeployment) {
        GafferSpec spec = gaffer.getSpec();

        GafferSpec helmValues = spec != null ? spec : new GafferSpec();

        Object graphId = spec == null ? null : spec.getNestedObject(GRAPH, CONFIG, GRAPH_ID);

        if (graphId != null && graphId instanceof String) {
            helmValues.putNestedObject(TABLE_PERMISSIONS,
                    ACCUMULO, CONFIG, USER_MANAGEMENT, USERS, GAFFER, PERMISSIONS, TABLE, (String) graphId);
        }

        if (initialDeployment) {
            helmValues.putNestedObject(generatePassword(passwordLength), ACCUMULO, CONFIG, ACCUMULO_SITE, INSTANCE_SECRET);
            helmValues.putNestedObject(generatePassword(passwordLength), ACCUMULO, CONFIG, USER_MANAGEMENT, ROOT_PASSWORD);
            helmValues.putNestedObject(generatePassword(passwordLength), ACCUMULO, CONFIG, USER_MANAGEMENT, USERS, GAFFER, PASSWORD);
            helmValues.putNestedObject(generatePassword(passwordLength), ACCUMULO, CONFIG, USER_MANAGEMENT, USERS, TRACER, PASSWORD);
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
                .withNewServiceAccount(serviceAccountName)
                .withNewRestartPolicy(restartPolicy)
                .withContainers(new V1Container()
                        .name(GAFFER_WORKER_CONTAINER_NAME)
                        .image(helmImage)
                        .imagePullPolicy(IMAGE_PULL_POLICY)
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
                return Lists.newArrayList(helmCommand.getCommand(),
                        gaffer.getMetadata().getName(),
                        GAFFER,
                        REPO_ARG, helmRepo,
                        VALUES_ARG, VALUES_YAML_LOCATION,
                        NAMESPACE_ARG, gaffer.getMetadata().getNamespace());
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
}
