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

package gaffer.elasticsearchstore.store;

import static gaffer.store.StoreTrait.STORE_VALIDATION;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import gaffer.data.element.Element;
import gaffer.elasticsearchstore.operation.GetElementsFromQueryObject;
import gaffer.elasticsearchstore.operation.GetElementsFromQueryString;
import gaffer.elasticsearchstore.serialisation.SimpleElasticElementSerialiser;
import gaffer.elasticsearchstore.store.handler.AddElementsHandler;
import gaffer.elasticsearchstore.store.handler.GetElementsFromQueryObjectHandler;
import gaffer.elasticsearchstore.store.handler.GetElementsFromQueryStringHandler;
import gaffer.elasticsearchstore.store.handler.GetElementsHandler;
import gaffer.exception.SerialisationException;
import gaffer.operation.Operation;
import gaffer.operation.data.ElementSeed;
import gaffer.operation.data.EntitySeed;
import gaffer.operation.impl.add.AddElements;
import gaffer.operation.impl.get.GetAdjacentEntitySeeds;
import gaffer.operation.impl.get.GetAllElements;
import gaffer.operation.impl.get.GetElements;
import gaffer.store.Context;
import gaffer.store.Store;
import gaffer.store.StoreException;
import gaffer.store.StoreProperties;
import gaffer.store.StoreTrait;
import gaffer.store.operation.handler.OperationHandler;
import gaffer.store.schema.Schema;
import org.elasticsearch.action.admin.indices.create.CreateIndexRequest;
import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class ElasticStore extends Store {

    private static final Set<StoreTrait> TRAITS = new HashSet<>(Collections.singletonList(STORE_VALIDATION));

    private String indexName;

    @Override
    public void initialise(final Schema schema, final StoreProperties properties) throws StoreException {
        super.initialise(schema, properties);
        this.indexName = properties.get(ElasticProperties.INDEX_NAME);
    }

    @SuppressFBWarnings(value = "BC_UNCONFIRMED_CAST_OF_RETURN_VALUE", justification = "The properties should always be ElasticProperties")
    @Override
    public ElasticProperties getProperties() {
        return (ElasticProperties) super.getProperties();
    }

    public Client getClient() throws StoreException {
        String clusterAddress = getProperties().getElasticClusterAddress();
        int clusterPort = getProperties().getElasticClientPort();

        try {
            Client client = TransportClient.builder().build()
                    .addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName(clusterAddress), clusterPort));
            return client;
        } catch (UnknownHostException e) {
            throw new StoreException("Cannot connect to elastic cluster on " + clusterAddress + ":" + clusterPort);
        }
    }

    private void setIndex(final Client client, final Settings indexSettings) throws StoreException {
        CreateIndexRequest indexRequest = new CreateIndexRequest(indexName, indexSettings);
        client.admin().indices().create(indexRequest).actionGet();

//        XContentBuilder mapping;
//        try {
//            mapping = XContentFactory.jsonBuilder()
//                    .startObject()
//                            .startObject("properties")
//                                .startObject("destination")
//                                    .field("type", "string")
//                                    .field("index", "not_analyzed")
//                                .endObject()
//                                .startObject("source")
//                                    .field("type", "string")
//                                    .field("index", "not_analyzed")
//                                .endObject()
//                            .endObject()
//                    .endObject();
//        } catch (IOException e) {
//            throw new StoreException("Problem creating index " + indexName + ",could not create mappings: " + e.getMessage());
//        }
//
//        PutMappingResponse putMappingResponse = client.admin().indices()
//                .preparePutMapping(indexName)
//                .setSource(mapping)
//                .setType("type")
//                .execute().actionGet();

    }

    @Override
    public Set<StoreTrait> getTraits() {
        return TRAITS;
    }

    @Override
    protected boolean isValidationRequired() {
        return false;
    }

    @Override
    protected void addAdditionalOperationHandlers() {
        addOperationHandler(GetElementsFromQueryObject.class, new GetElementsFromQueryObjectHandler());
        addOperationHandler(GetElementsFromQueryString.class, new GetElementsFromQueryStringHandler());
    }

    @Override
    protected OperationHandler<GetElements<ElementSeed, Element>, Iterable<Element>> getGetElementsHandler() {
        return new GetElementsHandler();
    }

    @Override
    protected OperationHandler<GetAllElements<Element>, Iterable<Element>> getGetAllElementsHandler() {
        return null;
    }

    @Override
    protected OperationHandler<? extends GetAdjacentEntitySeeds, Iterable<EntitySeed>> getAdjacentEntitySeedsHandler() {
        return null;
    }

    @Override
    protected OperationHandler<? extends AddElements, Void> getAddElementsHandler() {
        return new AddElementsHandler();
    }

    @Override
    protected <OUTPUT> OUTPUT doUnhandledOperation(final Operation<?, OUTPUT> operation, final Context context) {
        return null;
    }

    public void addElements(final Iterable<Element> elements) throws StoreException {
        Client client = getClient();
        Settings settings = Settings.builder().build();
        setIndex(client, settings);
        /*
        TODO
        fix this so that if the index already exists it doesn't explode
         */
        BulkRequestBuilder bulkRequest = client.prepareBulk();
        SimpleElasticElementSerialiser serialiser = new SimpleElasticElementSerialiser();
        byte[] bytes;
        for (Element element : elements) {
            try {
                bytes = serialiser.serialise(element);
            } catch (SerialisationException e) {
                throw new StoreException("failed to serialise element: " + e.getMessage());
            }
            bulkRequest.add(client.prepareIndex(getProperties().getIndexName(), element.getGroup())
                            .setSource(bytes)
            );

//            try {
//                request.add(getClient().prepareIndex(getProperties().getIndex(), "edge")
//                        .setSource(mapper.writeValueAsBytes(element)));
//            IndexResponse response = client.prepareIndex(getProperties().getIndexName(),"edge")
//                    .setSource(json)
//                    .get();


        }
        /*TODO
        /handle failures
        */
        BulkResponse bulkResponse = bulkRequest.get();
        if (bulkResponse.hasFailures()) {
            throw new StoreException("Problems adding data to elasticsearch" + bulkResponse.buildFailureMessage());
        }
    }
}
