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

package uk.gov.gchq.gaffer.gaas.util;

public final class Constants {

    // GafferSpec nested keys:
    public static final String[] GRAPH_ID_KEY = {"graph", "config", "graphId"};
    public static final String[] DESCRIPTION_KEY = {"graph", "config", "description"};
    public static final String[] HOOKS_KEY = {"graph", "config", "hooks"};
    public static final String[] SCHEMA_FILE_KEY = {"graph", "schema", "schema.json"};
    public static final String[] GAFFER_STORE_CLASS_KEY = {"graph", "storeProperties", "gaffer.store.class"};
    public static final String[] INGRESS_HOST_KEY = {"ingress", "host"};
    public static final String[] INGRESS_API_PATH_KEY = {"ingress", "pathPrefix", "api"};
    public static final String[] INGRESS_UI_PATH_KEY = {"ingress", "pathPrefix", "ui"};
    public static final String CONFIG_NAME_K8S_METADATA_LABEL = "configName";

    private Constants() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
