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

import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import java.util.List;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GRAPH_ID_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_API_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_HOST_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_UI_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Properties.INGRESS_SUFFIX;
import static uk.gov.gchq.gaffer.gaas.util.Properties.NAMESPACE;

public class GafferSpecBuilder {

    private String graphId;
    private String description;
    private Object schema;
    private String storeType;
    private List<String> storeSpec;

    public void setGraphId(final String graphId) {
        this.graphId = graphId;
    }

    public void setDescription(final String description) {
        this.description = description;
    }

    public void setStoreSpec(final List<String> storeSpec) {
        this.storeSpec = storeSpec;
    }

    public void setStoreType(final String storeType) {
        this.storeType = storeType;
    }
    // ingest, etc

    public GafferSpec build() {
        final GafferSpec gafferSpec = new GafferSpec();
        gafferSpec.putNestedObject(this.graphId, GRAPH_ID_KEY);
        gafferSpec.putNestedObject(description, DESCRIPTION_KEY);
        gafferSpec.putNestedObject(graphId.toLowerCase() + "-" + NAMESPACE + "." + INGRESS_SUFFIX, INGRESS_HOST_KEY);
        gafferSpec.putNestedObject("/rest", INGRESS_API_PATH_KEY);
        gafferSpec.putNestedObject("/ui", INGRESS_UI_PATH_KEY);
        //storeSpec.forEach(o -> gafferSpec.putNestedObject(o, "store", "spec"));
        // etc
        return gafferSpec;
    }
}
