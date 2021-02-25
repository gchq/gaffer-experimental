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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CRDClient;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import uk.gov.gchq.gaffer.store.library.FileGraphLibrary;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class CustomObjectsApiService {

    @Autowired
    private CRDClient crdClient;

    public List<GraphConfig> getAllGraphs() throws GaaSRestApiException {

        final Object response = crdClient.getAllCRD();

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
            list.add(new GraphConfig.Builder().graphId(graphId).description(graphDescription).library(new FileGraphLibrary()).build());
        }
        return list;
    }

}
