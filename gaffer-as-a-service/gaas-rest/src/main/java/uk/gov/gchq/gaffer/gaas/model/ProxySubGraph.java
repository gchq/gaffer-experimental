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

package uk.gov.gchq.gaffer.gaas.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProxySubGraph {

    @JsonProperty("graphId")
    private String graphId;

    @JsonProperty("host")
    private String host;

    @JsonProperty("root")
    private String root;

    public ProxySubGraph() {
    }

    public ProxySubGraph(final String graphId, final String host, final String root) {
        this.graphId = graphId;
        this.host = host;
        this.root = root;
    }

    public String getGraphId() {
        return graphId;
    }

    public String getHost() {
        return host;
    }

    public String getRoot() {
        return root;
    }
}
