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

import gaffer.store.StoreProperties;
import java.nio.file.Path;

public class ElasticProperties extends StoreProperties {

    public static final String ELASTIC_HOME = "elastic.home";
    public static final String CLUSTER_NAME = "cluster.name";
    public static final String ELASTIC_CLUSTER_ADDRESS = "elastic.address";
    public static final String ELASTIC_CLIENT_PORT = "elastic.clientport";
    public static final String NODE_DATA = "node.data";
    public static final String INDEX_NAME = "index.name";
    public static final String CLIENT_TRANSPORT_SNIFF = "client.transport.sniff";

    public ElasticProperties() {
        super();
    }

    public ElasticProperties(final Path propertiesFileLocation) {
        super(propertiesFileLocation);
    }

    public String getElasticHome() {
        return get(ELASTIC_HOME);
    }

    public void setElasticHome(final String elasticHome) {
        set(ELASTIC_HOME, elasticHome);
    }

    public Boolean getNodeData() {
        return Boolean.parseBoolean(get(NODE_DATA));
    }

    public void setNodeData(final boolean nodeData) {
        set(NODE_DATA, Boolean.toString(nodeData));
    }

    public String getIndexName() {
        return get(INDEX_NAME);
    }

    public void setIndexName(final String indexName) {
        set(INDEX_NAME, indexName);
    }

    public String getElasticClusterAddress() {
        return get(ELASTIC_CLUSTER_ADDRESS);
    }

    public void setElasticClusterAddress(final String elasticClusterAddress) {
        set(ELASTIC_CLUSTER_ADDRESS, elasticClusterAddress);
    }

    public Integer getElasticClientPort() {
        return Integer.parseInt(get(ELASTIC_CLIENT_PORT, "9300"));
    }

    public void setElasticClientPort(final int elasticClientPort) {
        set(ELASTIC_CLIENT_PORT, Integer.toString(elasticClientPort));
    }
}
