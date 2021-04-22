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

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.io.Serializable;
import java.util.Map;

/**
 * <b>GaaS: Create Gaffer Request Body</b>
 */
public class GaaSCreateRequestBody implements Serializable {

    @NotNull(message = "Graph id should not be null")
    @NotBlank(message = "Graph id should not be null")
    @Pattern(regexp = "[a-z0-9]*$", message = "Graph ID can contain only digits or lowercase letters")
    private String graphId;
    @NotBlank(message = "Description should not be empty")
    private String description;
    @NotNull(message = "\"storeType\" must be defined. Valid Store Types supported are MAPSTORE, ACCUMULO, FEDERATED_STORE or PROXY_STORE")
    private String storeType;
    private String proxyHost;
    private String proxyContextRoot;
    private Map<String, Object> schema;

    public GaaSCreateRequestBody() {
    }

    public GaaSCreateRequestBody(final String graphId, final String description, final String storeType, final Map<String, Object> schema) {
        this.graphId = graphId;
        this.description = description;
        this.storeType = storeType;
        this.schema = schema;
    }
    public GaaSCreateRequestBody(final String graphId, final String description, final String storeType) {
        this.graphId = graphId;
        this.description = description;
        this.storeType = storeType;
    }

    public GaaSCreateRequestBody(final String graphId, final String description, final String storeType, final Map<String, Object> schema, final String proxyHost, final String proxyContextRoot) {
        this.graphId = graphId;
        this.description = description;
        this.storeType = storeType;
        this.schema = schema;
        this.proxyHost = proxyHost;
        this.proxyContextRoot = proxyContextRoot;
    }

    public String getGraphId() {
        return graphId;
    }

    public String getDescription() {
        return description;
    }

    public Map<String, Object> getSchema() {
        return schema;
    }

    public String getStoreType() {
        return storeType;
    }

    public String getProxyHost() {
        return proxyHost;
    }

    public String getProxyContextRoot() {
        return proxyContextRoot;
    }

}
