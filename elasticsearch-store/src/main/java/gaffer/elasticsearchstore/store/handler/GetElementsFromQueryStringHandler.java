/*
 * Copyright 2016 Crown Copyright
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

package gaffer.elasticsearchstore.store.handler;

import gaffer.data.element.Element;
import gaffer.elasticsearchstore.operation.GetElementsFromQueryString;
import gaffer.elasticsearchstore.store.ElasticStore;
import gaffer.exception.SerialisationException;
import gaffer.jsonserialisation.JSONSerialiser;
import gaffer.operation.OperationException;
import gaffer.store.Context;
import gaffer.store.Store;
import gaffer.store.StoreException;
import gaffer.store.operation.handler.OperationHandler;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.index.IndexNotFoundException;
import org.elasticsearch.search.SearchHit;
import java.util.ArrayList;
import java.util.List;

public class GetElementsFromQueryStringHandler implements OperationHandler<GetElementsFromQueryString, Iterable<Element>> {

    @Override
    public Iterable<Element> doOperation(final GetElementsFromQueryString operation, final Context context, final Store store) throws OperationException {
        return getElementsFromQueryString(operation, (ElasticStore) store);
    }

    private Iterable<Element> getElementsFromQueryString(final GetElementsFromQueryString operation, final ElasticStore store) throws OperationException {
        SearchResponse searchResponse;
        String query = operation.getQueryString();
        try {
            searchResponse = store.getClient().prepareSearch(store.getProperties().getIndexName())
                    .setQuery(query)
                    .execute()
                    .actionGet();
        } catch (StoreException e) {
            throw new OperationException(e.getMessage());
        } catch (IndexNotFoundException e) {
            throw new OperationException("elasticSearch Index " + store.getProperties().getIndexName() + " not found. Does it exist?");
        }

        JSONSerialiser jsonSerialiser = new JSONSerialiser();
        List<Element> result = new ArrayList<>();
        for (SearchHit hit : searchResponse.getHits()) {
            try {
                result.add(jsonSerialiser.deserialise(hit.source(), Element.class));
            } catch (SerialisationException e) {
                e.printStackTrace();
            }
        }
        return result;
    }
}
