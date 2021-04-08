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
    @Pattern(regexp = "^[a-z0-9_-]*$", message = "Graph can contain only digits, lowercase letters or the special characters _ and -")
    private String graphId;
    @NotBlank(message = "Description should not be empty")
    private String description;
    @NotNull(message = "\"storeType\" must be defined. Valid Store Types supported are MAPSTORE, ACCUMULO, FEDERATED_STORE or PROXY_STORE")
    private StoreType storeType;
    private String proxyHost;
    private String proxyContextRoot;
    private Object elementsSchema;
    private Object typesSchema;

    public GaaSCreateRequestBody() {
    }

    public GaaSCreateRequestBody(final String graphId, final String description, final StoreType storeType) {
        this.graphId = graphId;
        this.description = description;
        this.storeType = storeType;
    }

    public GaaSCreateRequestBody(final String graphId, final String description, final StoreType storeType, final Map<String, Object> elementsSchema, final Map<String, Object> typesSchema) {
        this.graphId = graphId;
        this.description = description;
        this.storeType = storeType;
        this.elementsSchema = elementsSchema;
        this.typesSchema = typesSchema;
    }

    public GaaSCreateRequestBody(final String graphId, final String description, final StoreType storeType, final Map<String, Object> elementsSchema, final Map<String, Object> typesSchema, final String proxyHost, final String proxyContextRoot) {
        this.graphId = graphId;
        this.description = description;
        this.storeType = storeType;
        this.elementsSchema = elementsSchema;
        this.typesSchema = typesSchema;
        this.proxyHost = proxyHost;
        this.proxyContextRoot = proxyContextRoot;
    }

    public String getGraphId() {
        return graphId;
    }

    public String getDescription() {
        return description;
    }

    public Object getElementsSchema() {
        return elementsSchema;
    }

    public Object getTypesSchema() {
        return typesSchema;
    }

    public StoreType getStoreType() {
        return storeType;
    }

    public String getProxyHost() {
        return proxyHost;
    }

    public String getProxyContextRoot() {
        return proxyContextRoot;
    }

}
