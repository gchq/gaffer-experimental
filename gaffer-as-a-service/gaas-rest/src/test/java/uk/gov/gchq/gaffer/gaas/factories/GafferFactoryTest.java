/*
 * Copyright 2020-2022 Crown Copyright
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

package uk.gov.gchq.gaffer.gaas.factories;

import com.google.gson.Gson;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.v1.Gaffer;
import uk.gov.gchq.gaffer.gaas.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import uk.gov.gchq.gaffer.proxystore.operation.GetProxyProperties;
import uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl;
import uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyPropertiesHandler;
import uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler;
import uk.gov.gchq.gaffer.store.operation.declaration.OperationDeclaration;
import uk.gov.gchq.gaffer.store.operation.declaration.OperationDeclarations;

import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static uk.gov.gchq.gaffer.gaas.util.Constants.CONFIG_NAME_K8S_METADATA_LABEL;
import static uk.gov.gchq.gaffer.gaas.util.Constants.CONFIG_NAME_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GAFFER_OPERATION_DECLARATION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GAFFER_STORE_CLASS_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GRAPH_ID_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GROUP;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_API_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_HOST_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_UI_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.VERSION;
import static uk.gov.gchq.gaffer.gaas.util.Properties.INGRESS_SUFFIX;
import static uk.gov.gchq.gaffer.gaas.util.Properties.NAMESPACE;

@UnitTest
class GafferFactoryTest {

    private final Gson gson = new Gson();
    private static final String DEFAULT_SYSTEM_USER = "GAAS_SYSTEM_USER";

    private static final String KIND = "Gaffer";

    @Test
    void emptyGafferSpec_shouldReturnGafferWithOverridesOnly() {
        final Gaffer gaffer = GafferFactory.from(new GafferSpec(), new GaaSCreateRequestBody("empty_config_id", "Empty graph config", getSchema(), "empty_config", "10"));

        final String expected = "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"empty_config\"},\"name\":\"empty_config_id\"},\"spec\":{\"graph\":{\"schema\":{\"schema.json\":\"{\\\"entities\\\":{},\\\"edges\\\":{},\\\"types\\\":{}}\"},\"config\":{\"configName\":\"empty_config\",\"description\":\"Empty graph config\",\"graphId\":\"empty_config_id\"}},\"ingress\":{\"host\":\"empty_config_id-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(gaffer));
    }

    @Test
    void proxyStoreRequest_shouldReturnProxyStoreRequestBody() {
        final GafferSpec proxyConfig = new GafferSpec();
        proxyConfig.putNestedObject("http://my.graph.co.uk", "graph", "storeProperties", "gaffer.host");
        proxyConfig.putNestedObject("uk.gov.gchq.gaffer.proxystore.ProxyStore", "graph", "storeProperties", "gaffer.store.class");

        final Gaffer requestBody = GafferFactory.from(proxyConfig, new GaaSCreateRequestBody("MyGraph", "Another description", getSchema(), "proxyNoContextRoot", "10"));

        final String expected = "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"proxyNoContextRoot\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"schema\":{\"schema.json\":\"{\\\"entities\\\":{},\\\"edges\\\":{},\\\"types\\\":{}}\"},\"storeProperties\":{\"gaffer.host\":\"http://my.graph.co.uk\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\"},\"config\":{\"configName\":\"proxyNoContextRoot\",\"description\":\"Another description\",\"graphId\":\"MyGraph\"}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    void federatedStoreRequest_shouldReturnFederatedRequestBody() {
        final GafferSpec federatedConfig = getGafferSpec();

        GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody("MyGraph", "Another description", "federated", "10", null);

        final Gaffer requestBody = GafferFactory.from(federatedConfig, gaaSCreateRequestBody);

        final Gaffer expectedGaffer = getGaffer(federatedConfig, gaaSCreateRequestBody);

        compareGaffer(expectedGaffer, requestBody);
    }

    @Test
    void federatedStoreRequest_shouldReturnFederatedRequestBodyWithAllOperations() {
        final GafferSpec federatedConfig = getGafferSpec();

        final OperationDeclarations declarations = new OperationDeclarations.Builder()
                .declaration(new OperationDeclaration.Builder()
                        .handler(new GetProxyPropertiesHandler())
                        .operation(GetProxyProperties.class)
                        .build())
                .build();

        federatedConfig.putNestedObject(declarations, "graph", "operationDeclarations");

        GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedOpDeclaration", "10");

        final Gaffer requestBody = GafferFactory.from(federatedConfig, gaaSCreateRequestBody);

        final Gaffer expected = getGaffer(federatedConfig, gaaSCreateRequestBody);

        compareGaffer(expected, requestBody);

    }

    @Test
    void accumuloStoreRequestShouldReturnAccumuloRequestBody() {
        final GafferSpec accumuloConfig = new GafferSpec();
        accumuloConfig.putNestedObject(true, "accumulo", "enabled");

        final Gaffer gaffer = GafferFactory.from(accumuloConfig, new GaaSCreateRequestBody("MyGraph", "Another description", getSchema(), "accumulo", "10"));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"accumulo\"},\"name\":\"MyGraph\"},\"spec\":{\"accumulo\":" +
                        "{\"enabled\":true},\"graph\":{\"schema\":{\"schema.json\":\"{\\\"entities\\\":{},\\\"edges\\\":{},\\\"types\\\":{}}\"},\"config\":{\"configName\":" +
                        "\"accumulo\",\"description\":\"Another description\",\"graphId\":\"MyGraph\"}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\"," +
                        "\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(gaffer));
    }

    @Test
    void mapStoreStoreRequestShouldReturnMapStoreRequestBody() {
        final GafferSpec mapStoreConfig = new GafferSpec();
        mapStoreConfig.putNestedObject("uk.gov.gchq.gaffer.cache.impl.HashMapCacheService", "graph", "storeProperties", "gaffer.cache.service.class");
        mapStoreConfig.putNestedObject(true, "graph", "storeProperties", "gaffer.store.job.tracker.enabled");

        final Gaffer requestBody = GafferFactory.from(mapStoreConfig, new GaaSCreateRequestBody("MyGraph", "Another description", getSchema(), "mapStore", "10"));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"mapStore\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":" +
                        "{\"schema\":{\"schema.json\":\"{\\\"entities\\\":{},\\\"edges\\\":{},\\\"types\\\":{}}\"},\"storeProperties\":" +
                        "{\"gaffer.store.job.tracker.enabled\":true,\"gaffer.cache.service.class\":\"uk.gov.gchq.gaffer.cache.impl.HashMapCacheService\"}," +
                        "\"config\":{\"configName\":\"mapStore\",\"description\":\"Another description\",\"graphId\":\"MyGraph\"}},\"ingress\":{\"host\":" +
                        "\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

    @Test
    void federatedBigStoreRequest_shouldReturnFederatedRequestBody() {
        final GafferSpec federatedConfig = getGafferSpec();

        GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody("MyGraph", "Another description", getSchema(), "federatedBig", "10");

        final Gaffer requestBody = GafferFactory.from(federatedConfig, gaaSCreateRequestBody);

        final Gaffer expected = getGaffer(federatedConfig, gaaSCreateRequestBody);
        compareGaffer(expected, requestBody);
    }

    private LinkedHashMap<String, Object> getSchema() {
        final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
        elementsSchema.put("entities", new Object());
        elementsSchema.put("edges", new Object());
        elementsSchema.put("types", new Object());
        return elementsSchema;
    }


    private void compareGaffer(final Gaffer expected, final Gaffer requestBody) {
         assertEquals(expected.getSpec().getNestedObject(GAFFER_OPERATION_DECLARATION_KEY).toString(), requestBody.getSpec().getNestedObject(GAFFER_OPERATION_DECLARATION_KEY).toString());
        assertEquals(expected.getSpec().getNestedObject(GRAPH_ID_KEY), requestBody.getSpec().getNestedObject(GRAPH_ID_KEY));
        assertEquals(expected.getSpec().getNestedObject(DESCRIPTION_KEY), requestBody.getSpec().getNestedObject(DESCRIPTION_KEY));
        assertEquals(expected.getSpec().getNestedObject(CONFIG_NAME_KEY), requestBody.getSpec().getNestedObject(CONFIG_NAME_KEY));
        assertEquals(expected.getMetadata().getName(), requestBody.getMetadata().getName());
        assertEquals(expected.getSpec().getNestedObject(GAFFER_STORE_CLASS_KEY), requestBody.getSpec().getNestedObject(GAFFER_STORE_CLASS_KEY));
        assertEquals(expected.getSpec().getNestedObject("graph", "storeProperties", "gaffer.store.properties.class"), requestBody.getSpec().getNestedObject("graph", "storeProperties", "gaffer.store.properties.class"));
        assertEquals(expected.getSpec().getNestedObject("graph", "storeProperties", "gaffer.serialiser.json.modules"), requestBody.getSpec().getNestedObject("graph", "storeProperties", "gaffer.serialiser.json.modules"));
        assertEquals(expected.getSpec().getNestedObject(INGRESS_HOST_KEY), requestBody.getSpec().getNestedObject(INGRESS_HOST_KEY));
        assertEquals(expected.getSpec().getNestedObject(INGRESS_API_PATH_KEY), requestBody.getSpec().getNestedObject(INGRESS_API_PATH_KEY));
        assertEquals(expected.getSpec().getNestedObject(INGRESS_UI_PATH_KEY), requestBody.getSpec().getNestedObject(INGRESS_UI_PATH_KEY));
    }

    @NotNull
    private GafferSpec getGafferSpec() {
        final GafferSpec federatedConfig = new GafferSpec();
        federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
        federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
        federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
        return federatedConfig;
    }

    private Gaffer getGaffer(final GafferSpec federatedConfig, final GaaSCreateRequestBody gaaSCreateRequestBody) {

        return new Gaffer()
                .apiVersion(GROUP + "/" + VERSION)
                .kind(KIND)
                .metaData(getMetadata(gaaSCreateRequestBody))
                .spec(getFederatedStoreGafferSpec(federatedConfig, gaaSCreateRequestBody));
    }

    private GafferSpec getFederatedStoreGafferSpec(final GafferSpec federatedSpec, final GaaSCreateRequestBody createGraphRequest) {

        final GafferSpec federatedConfig = getGafferSpec();

        federatedConfig.putNestedObject(createGraphRequest.getGraphId(), GRAPH_ID_KEY);
        federatedConfig.putNestedObject(createGraphRequest.getDescription(), DESCRIPTION_KEY);
        federatedConfig.putNestedObject(createGraphRequest.getConfigName(), CONFIG_NAME_KEY);
        federatedConfig.putNestedObject(getOperationDeclarations(federatedSpec), GAFFER_OPERATION_DECLARATION_KEY);
        federatedConfig.putNestedObject(createGraphRequest.getGraphId().toLowerCase() + "-" + NAMESPACE + "." + INGRESS_SUFFIX, INGRESS_HOST_KEY);
        federatedConfig.putNestedObject("/rest", INGRESS_API_PATH_KEY);
        federatedConfig.putNestedObject("/ui", INGRESS_UI_PATH_KEY);

        return federatedConfig;
    }

    private OperationDeclarations  getOperationDeclarations(final GafferSpec federatedSpec) {
        OperationDeclarations declarations = null;

        if (federatedSpec != null && federatedSpec.getNestedObject(GAFFER_OPERATION_DECLARATION_KEY) != null) {
            declarations = (OperationDeclarations) federatedSpec.getNestedObject(GAFFER_OPERATION_DECLARATION_KEY);
        } else {
             declarations = new OperationDeclarations.Builder()
                     .declaration(new OperationDeclaration.Builder()
                             .handler(new GetProxyUrlHandler())
                             .operation(GetProxyUrl.class)
                             .build())
                     .build();
        }


        return declarations;
    }

    private V1ObjectMeta getMetadata(final GaaSCreateRequestBody gaaSCreateRequestBody) {
        final Map<String, String> labels = new HashMap<>();
        labels.put(CONFIG_NAME_K8S_METADATA_LABEL, gaaSCreateRequestBody.getConfigName());

        final V1ObjectMeta metadata = new V1ObjectMeta()
                .name(gaaSCreateRequestBody.getGraphId())
                .labels(labels);
        return metadata;
    }


}
