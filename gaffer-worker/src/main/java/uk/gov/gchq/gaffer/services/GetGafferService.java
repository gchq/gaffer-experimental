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
package uk.gov.gchq.gaffer.services;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import uk.gov.gchq.gaffer.Exception.GafferWorkerApiException;
import uk.gov.gchq.gaffer.model.Graph;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;


@Component
public class GetGafferService {


    @Autowired
    private ApiClient apiClient;

    public List<Graph> getGraphs() throws ApiException {
        CustomObjectsApi apiInstance = new CustomObjectsApi(apiClient);
        String group = "gchq.gov.uk"; // String | the custom resource's group
        String version = "v1"; // String | the custom resource's version
        String namespace = "kai-helm-3"; // String | The custom resource's namespace
        String plural = "gaffers"; // String | the custom resource's plural name. For TPRs this would be lowercase plural kind.
        String name = "getgraphgraph"; // String | the custom object's name
        final Object response = apiInstance.listNamespacedCustomObject(group, version, namespace, plural, null, null, null, null, null, null, null, null);
        JsonObject jsonObject = new JsonParser().parse(new Gson().toJson(response)).getAsJsonObject();
        JsonArray items = jsonObject.get("items").getAsJsonArray();
        final List<Graph> list = new ArrayList();
        Iterator<JsonElement> iterator = items.iterator();
        while (iterator.hasNext()) {
            JsonElement key = iterator.next();
            final JsonElement graph = key.getAsJsonObject().get("spec").getAsJsonObject().get("graph").getAsJsonObject().get("config");
            String graphId = graph.getAsJsonObject().get("graphId").toString();
            String graphDescription = graph.getAsJsonObject().get("description").toString();
            list.add(new Graph(graphId, graphDescription));
        }
        return list;
    }

    public void createGraph(final Graph graph) throws GafferWorkerApiException {
        CustomObjectsApi customObject = new CustomObjectsApi(apiClient);
        String jsonString = "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"name\":\"" + graph.getGraphId() + "\"},\"spec\":{\"graph\":{\"config\":{\"graphId\":\"" + graph.getGraphId() + "\",\"description\":\"" + graph.getDescription() + "\"}}}}";
        JsonObject jsonObject = new JsonParser().parse(jsonString).getAsJsonObject();
        try {
            customObject.createNamespacedCustomObject("gchq.gov.uk", "v1", "kai-helm-3", "gaffers", jsonObject, null, null, null);
        } catch (ApiException e) {
            JsonObject resultJsonObject = new JsonParser().parse(e.getResponseBody()).getAsJsonObject();
            JsonElement code = resultJsonObject.get("code");
            throw new GafferWorkerApiException(resultJsonObject.get("message").getAsString(), resultJsonObject.get("reason").getAsString(), code.getAsInt());
        }
    }

}

