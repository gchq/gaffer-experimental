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

package uk.gov.gchq.gaffer.controller.util;

public final class Constants {

    private Constants() {
        // Prevents Instantiation
    }

    // Serialised names
    public static final String SERIALISED_NAME_API_VERSION = "apiVersion";
    public static final String SERIALISED_NAME_KIND = "kind";
    public static final String SERIALISED_NAME_METADATA = "metadata";
    public static final String SERIALISED_NAME_SPEC = "spec";
    public static final String SERIALISED_NAME_STATUS = "status";
    public static final String SERIALISED_NAME_ITEMS = "items";
    public static final String SERIALISED_NAME_PROBLEMS = "problems";
    public static final String SERIALISED_NAME_REST_API_STATUS = "restApiStatus";

    // Configuration
    public static final String WORKER_NAMESPACE = "worker.namespace";
    public static final String WORKER_HELM_IMAGE = "worker.helm.image";
    public static final String WORKER_HELM_REPO = "worker.helm.repo";
    public static final String WORKER_SERVICE_ACCOUNT_NAME = "worker.service.account";
    public static final String WORKER_RESTART_POLICY = "worker.restart.policy";
    public static final String GENERATED_PASSWORD_LENGTH = "worker.password.length";
    public static final String CONTROLLER_CLUSTER_SCOPE = "controller.scope.cluster";

    // Configuration defaults
    public static final String WORKER_NAMESPACE_DEFAULT = "gaffer-workers";
    public static final String WORKER_HELM_IMAGE_DEFAULT = "dtzar/helm-kubectl:latest";
    public static final String WORKER_HELM_REPO_DEFAULT = "https://gchq.github.io/gaffer-docker";
    public static final String WORKER_SERVICE_ACCOUNT_NAME_DEFAULT = "gaffer-workers";
    public static final String WORKER_RESTART_POLICY_DEFAULT = "Never";
    public static final Integer GENERATED_PASSWORD_LENGTH_DEFAULT = 10;

    // CRD
    public static final String GROUP = "gchq.gov.uk";
    public static final String PLURAL = "gaffers";
    public static final String VERSION = "v1";

    // Common labels and names
    public static final String GAFFER_WORKER_CONTAINER_NAME = "gaffer-worker";
    public static final String GAFFER_NAME_LABEL = "gaffer.name";
    public static final String GAFFER_NAMESPACE_LABEL = "gaffer.namespace";
    public static final String GOAL_LABEL = "goal";
    public static final String K8S_NAME_LABEL = "app.kubernetes.io/name";
    public static final String GAFFER_K8S_NAME_LABEL_VALUE = "gaffer";
    public static final String K8S_COMPONENT_LABEL = "app.kubernetes.io/component";
    public static final String GAFFER_API_K8S_COMPONENT_LABEL_VALUE = "api";
    public static final String K8S_INSTANCE_LABEL = "app.kubernetes.io/instance";

}
