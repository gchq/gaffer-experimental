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

package uk.gov.gchq.gaffer.gaas.services;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class CustomObjectsApiService {

    @Autowired
    private ApiClient apiClient;

    public List<GraphConfig>  getAllGraphs() throws ApiException {
        CustomObjectsApi apiInstance = new CustomObjectsApi(apiClient);
        String group = "gchq.gov.uk"; // String | the custom resource's group
        String version = "v1"; // String | the custom resource's version
        String namespace = "kai-helm-3"; // String | The custom resource's namespace
        String plural = "gaffers"; // String | the custom resource's plural name. For TPRs this would be lowercase plural kind.
        String name = "getgraphgraph"; // String | the custom object's name

        final Object response = apiInstance.listNamespacedCustomObject(group, version, namespace, plural, null, null, null, null, null, null, null, null);

        return convertJsonToGraphs(response);
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
            list.add(new GraphConfig.Builder().graphId(graphId).description(graphDescription).build());
        }
        return list;
    }

}
