/*
 * Copyright 2021 Crown Copyright
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


import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.kubernetes.client.common.KubernetesObject;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import uk.gov.gchq.gaffer.store.library.FileGraphLibrary;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import static uk.gov.gchq.gaffer.gaas.converters.GaaSRestExceptionFactory.from;

public class CRDClient {
    private String group;
    private String version;
    private String plural;
    private Object body;
    private String pretty;
    private String dryRun;
    private String fieldManager;
    @Value("${namespace}")
    private String namespace;

    @Autowired
    private ApiClient apiClient;

    public CRDClient() {
        this.group = "gchq.gov.uk";
        this.version = "v1";
        this.plural = "gaffers";
        this.pretty = null;
        this.dryRun = null;
        this.fieldManager = null;
    }

    public void createCRD(final KubernetesObject requestBody) throws GaaSRestApiException {
        final CustomObjectsApi customObjectsApi = new CustomObjectsApi(apiClient);
        try {
            customObjectsApi.createNamespacedCustomObject(this.group, this.version, this.namespace, this.plural, requestBody, this.pretty, this.dryRun, this.fieldManager);
        } catch (ApiException e) {
            throw from(e);
        }
    }

    public List<GraphConfig>  getAllCRD() throws GaaSRestApiException {
        final CustomObjectsApi customObjectsApi = new CustomObjectsApi(apiClient);
        try {
            Object customObject = customObjectsApi.listNamespacedCustomObject(this.group, this.version, this.namespace, this.plural, null, null, null, null, null, null, null, null);
           return convertJsonToGraphs(customObject);
        } catch (ApiException e) {
            throw from(e);
        }
    }

    public void deleteCRD(final String crdName) throws GaaSRestApiException {
        final CustomObjectsApi customObjectsApi = new CustomObjectsApi(apiClient);
        try {
            customObjectsApi.deleteNamespacedCustomObject(group, version, namespace, plural, crdName, null, null, null, null, null);
        } catch (ApiException e) {
            throw from(e);
        }
    }

    public List<GraphConfig> convertJsonToGraphs(final Object response) {
        final Gson gson = new Gson();
        JsonObject jsonObject = new JsonParser().parse(gson.toJson(response)).getAsJsonObject();
        JsonArray items = jsonObject.get("items").getAsJsonArray();
        final List<GraphConfig> list = new ArrayList();
        Iterator<JsonElement> iterator = items.iterator();
        while (iterator.hasNext()) {
            JsonElement key = iterator.next();
            final JsonElement graph = key.getAsJsonObject().get("spec").getAsJsonObject().get("graph").getAsJsonObject().get("config");
            final String graphId = gson.fromJson(graph.getAsJsonObject().get("graphId"), String.class);
            final String graphDescription = gson.fromJson(graph.getAsJsonObject().get("description"), String.class);
            list.add(new GraphConfig.Builder().graphId(graphId).description(graphDescription).library(new FileGraphLibrary()).build());
        }
        return list;
    }


}
