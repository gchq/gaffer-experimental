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

package uk.gov.gchq.gaffer.gaas.stores;

import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser;
import uk.gov.gchq.gaffer.operation.Operation;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GRAPH_ID_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.HOOKS_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_API_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_HOST_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_UI_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.SCHEMA_FILE_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Properties.INGRESS_SUFFIX;
import static uk.gov.gchq.gaffer.gaas.util.Properties.NAMESPACE;

public class GafferBuilder {

    public static final String INGRESS_API_PATH_VALUE = "/rest";
    public static final String INGRESS_UI_PATH_VALUE = "/ui";

    private String graphId;
    private String description;
    private Map<String, String[]> operationAuths = new LinkedHashMap<>();
    private Map<String, Object> schema;
    private Map<String, Object> properties;

    public Map<String, Object> getProperties() {
        return properties;
    }

    public void addPropertiesToSpec(final GafferSpec gafferSpec) {
        for (final Map.Entry<String, Object> entry : properties.entrySet()) {
            gafferSpec.putNestedObject(entry.getValue(), entry.getKey());
        }
    }

    public Map<String, Object> getSchema() {
        return schema;
    }


    public String getGraphId() {
        return graphId;
    }


    public String getDescription() {
        return description;
    }

    public GafferBuilder setGraphId(final String graphId) {
        this.graphId = graphId;
        return this;
    }

    public GafferBuilder setDescription(final String description) {
        this.description = description;
        return this;
    }

    public GafferBuilder setSchema(final Map<String, Object> schema) {
        this.schema = schema;
        return this;
    }

    public GafferBuilder setProperties(final Map<String, Object> properties) {
        this.properties = properties;
        return this;
    }

    public GafferSpec build() {
        final GafferSpec gafferSpec = new GafferSpec();
        addPropertiesToSpec(gafferSpec);
        gafferSpec.putNestedObject(graphId, GRAPH_ID_KEY);
        gafferSpec.putNestedObject(description, DESCRIPTION_KEY);
        gafferSpec.putNestedObject(schema, SCHEMA_FILE_KEY);
        gafferSpec.putNestedObject(graphId.toLowerCase() + "-" + NAMESPACE + "." + INGRESS_SUFFIX, INGRESS_HOST_KEY);
        gafferSpec.putNestedObject(Arrays.asList(getOpAuthoriser()), HOOKS_KEY);
        gafferSpec.putNestedObject(INGRESS_API_PATH_VALUE, INGRESS_API_PATH_KEY);
        gafferSpec.putNestedObject(INGRESS_UI_PATH_VALUE, INGRESS_UI_PATH_KEY);
        return gafferSpec;
    }

    private Map<String, Object> getOpAuthoriser() {
        final Map<String, Object> opAuthoriser = new LinkedHashMap<>();
        opAuthoriser.put("class", OperationAuthoriser.class.getName());
        opAuthoriser.put("auths", operationAuths);
        return opAuthoriser;
    }
}
