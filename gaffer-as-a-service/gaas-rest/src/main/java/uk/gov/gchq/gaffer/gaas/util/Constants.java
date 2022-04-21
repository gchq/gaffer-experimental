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

package uk.gov.gchq.gaffer.gaas.util;

public final class Constants {

    // GafferSpec nested keys:
    public static final String[] GRAPH_ID_KEY = {"graph", "config", "graphId"};
    public static final String[] DESCRIPTION_KEY = {"graph", "config", "description"};
    public static final String[] CONFIG_NAME_KEY = {"graph", "config", "configName"};
    public static final String[] HOOKS_KEY = {"graph", "config", "hooks"};
    public static final String[] SCHEMA_FILE_KEY = {"graph", "schema", "schema.json"};
    public static final String[] GAFFER_STORE_CLASS_KEY = {"graph", "storeProperties", "gaffer.store.class"};
    public static final String[] GAFFER_OPERATION_DECLARATION_KEY = {"graph", "operationDeclarations"};
    public static final String[] INGRESS_HOST_KEY = {"ingress", "host"};
    public static final String[] INGRESS_API_PATH_KEY = {"ingress", "pathPrefix", "api"};
    public static final String[] INGRESS_UI_PATH_KEY = {"ingress", "pathPrefix", "ui"};

    public static final String CONFIG_NAME_K8S_METADATA_LABEL = "configName";
    public static final String CONFIG_YAML_CLASSPATH = "/config";
    public static final String HELM_SET_FLAG = "--set";

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
    public static final String WORKER_NAMESPACE = "gaffer.namespace";
    public static final String WORKER_IMAGE = "worker.image";
    public static final String WORKER_IMAGE_PULL_POLICY = "worker.imagePullPolicy";
    public static final String WORKER_HELM_REPO = "worker.helm.repo";
    public static final String WORKER_SERVICE_ACCOUNT_NAME = "worker.service.account";
    public static final String WORKER_RESTART_POLICY = "worker.restart.policy";
    public static final String CONTROLLER_CLUSTER_SCOPE = "controller.scope.cluster";

    // CRD
    public static final String GROUP = "gchq.gov.uk";
    public static final String PLURAL = "gaffers";
    public static final String VERSION = "v1";

    // Common labels and names
    public static final String GAFFER_WORKER_CONTAINER_NAME = "gaffer-worker";
    public static final String GAAS_LABEL_VALUE = "gaffer-as-a-service";
    public static final String WORKER_LABEL_VALUE = "worker";
    public static final String GAFFER_NAME_LABEL = "gaffer.name";
    public static final String GAFFER_NAMESPACE_LABEL = "gaffer.namespace";
    public static final String GOAL_LABEL = "goal";
    public static final String K8S_NAME_LABEL = "app.kubernetes.io/name";
    public static final String GAFFER_K8S_NAME_LABEL_VALUE = "gaffer";
    public static final String K8S_COMPONENT_LABEL = "app.kubernetes.io/component";
    public static final String GAFFER_API_K8S_COMPONENT_LABEL_VALUE = "api";
    public static final String K8S_INSTANCE_LABEL = "app.kubernetes.io/instance";
    public static final String CHART_VERSION = "chart.version";

    private Constants() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
