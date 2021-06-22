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
import java.util.List;
import java.util.Map;

/**
 * Request Body for Creating Federated Store Gaffers
 */
public class FederatedRequestBody implements CreateRequestBody {

    @JsonProperty("graphId")
    private String graphId;
    @JsonProperty("description")
    private String description;
    @JsonProperty("proxySubGraphs")
    private List<ProxySubGraph> proxySubGraphs;
    @JsonProperty("configName")
    private String configName;

    public FederatedRequestBody() {
    }

    public FederatedRequestBody(final String graphId, final String graphDescription, final List<ProxySubGraph> proxySubGraphs, final String configName) {
        this.graphId = graphId;
        this.description = graphDescription;
        this.proxySubGraphs = proxySubGraphs;
        this.configName = configName;
    }

    @Override
    public String getGraphId() {
        return graphId;
    }

    @Override
    public String getDescription() {
        return description;
    }

    @Override
    public Map<String, Object> getSchema() {
        return null;
    }

    @Override
    public String getConfigName() {
        return configName;
    }

    public List<ProxySubGraph> getProxySubGraphs() {
        return proxySubGraphs;
    }
}
