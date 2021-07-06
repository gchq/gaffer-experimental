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
import gaffer.elasticsearchstore.operation.GetElementsFromQueryObject;
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
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.search.SearchHit;
import java.util.ArrayList;
import java.util.List;

public class GetElementsFromQueryObjectHandler implements OperationHandler<GetElementsFromQueryObject, Iterable<Element>> {

    @Override
    public Iterable<Element> doOperation(final GetElementsFromQueryObject operation, final Context context, final Store store) throws OperationException {
        return getElementsFromSearch(operation, (ElasticStore) store);
    }

    private Iterable<Element> getElementsFromSearch(final GetElementsFromQueryObject operation, final ElasticStore store) throws OperationException {

        SearchResponse searchResponse;
        QueryBuilder queryBuilder;
        try {
            queryBuilder = (QueryBuilder) operation.getQueryObject();
        } catch (ClassCastException e) {
            throw new OperationException("Cannot recover query object from query " + e.getMessage());
        }

        try {
            searchResponse = store.getClient().prepareSearch(store.getProperties().getIndexName())
                    .setQuery(queryBuilder)
                            //.setFrom(10).setSize(2)
                    .execute()
                    .actionGet();
        } catch (IndexNotFoundException e) {
            throw new OperationException("elasticSearch Index " + store.getProperties().getIndexName() + " not found. Does it exist?");
        } catch (StoreException e) {
            throw new OperationException(e.getMessage());
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
