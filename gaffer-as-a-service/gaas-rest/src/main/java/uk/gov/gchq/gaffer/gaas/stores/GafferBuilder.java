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
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import java.util.Map;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GRAPH_ID_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_API_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_HOST_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_UI_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.SCHEMA_FILE_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.STORE_PROPERTIES_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Properties.INGRESS_SUFFIX;
import static uk.gov.gchq.gaffer.gaas.util.Properties.NAMESPACE;

public class GafferBuilder {

    protected GaaSCreateRequestBody graph;
    private String graphId;
    private String description;
    private Map<String, Object> schema;
    private Map<String, Object> properties;

    public Map<String, Object> getProperties() {
        return properties;
    }

    public void loopMap(final GafferSpec gafferSpec) {
        for (final Map.Entry<String, Object> entry : properties.entrySet()) {
            if (entry.getKey().equals("accumulo")) {
                gafferSpec.putNestedObject(true, "accumulo", "enabled");
                gafferSpec.putNestedObject(schema, SCHEMA_FILE_KEY);
            } else {
                gafferSpec.putNestedObject(properties, STORE_PROPERTIES_KEY);
            }
            System.out.println(entry.getKey() + ":" + entry.getValue());
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
        loopMap(gafferSpec);
        gafferSpec.putNestedObject(graphId, GRAPH_ID_KEY);
        gafferSpec.putNestedObject(description, DESCRIPTION_KEY);
        //gafferSpec.putNestedObject(properties);
        gafferSpec.putNestedObject(graphId.toLowerCase() + "-" + NAMESPACE + "." + INGRESS_SUFFIX, INGRESS_HOST_KEY);
        gafferSpec.putNestedObject("/rest", INGRESS_API_PATH_KEY);
        gafferSpec.putNestedObject("/ui", INGRESS_UI_PATH_KEY);
        return gafferSpec;
    }
}
