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

package uk.gov.gchq.gaffer.gaas.factories;

import com.google.gson.Gson;
import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.federatedstore.operation.AddGraph;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser;
import uk.gov.gchq.gaffer.operation.Operation;
import uk.gov.gchq.gaffer.operation.impl.get.GetAllElements;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;

@UnitTest
public class GafferFactoryTest {

  private final Gson gson = new Gson();
  private static final String DEFAULT_SYSTEM_USER = "GAAS_SYSTEM_USER";


  @Test
  public void emptyGafferSpec_shouldReturnGafferWithOverridesOnly() {
    final Gaffer gaffer = GafferFactory.from(new GafferSpec(), new GaaSCreateRequestBody("empty_config_id", "Empty graph config", getSchema(), "empty_config"));

    final String expected = "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"empty_config\"},\"name\":\"empty_config_id\"},\"spec\":{\"graph\":{\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}},\"config\":{\"description\":\"Empty graph config\",\"graphId\":\"empty_config_id\"}},\"ingress\":{\"host\":\"empty_config_id-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(gaffer));
  }

  @Test
  public void proxyStoreRequest_shouldReturnProxyStoreRequestBody() {
    final GafferSpec proxyConfig = new GafferSpec();

    proxyConfig.putNestedObject("http://my.graph.co.uk", "graph", "storeProperties", "gaffer.host");
    proxyConfig.putNestedObject("uk.gov.gchq.gaffer.proxystore.ProxyStore", "graph", "storeProperties", "gaffer.store.class");

    final Gaffer requestBody = GafferFactory.from(proxyConfig, new GaaSCreateRequestBody("MyGraph", "Another description", getSchema(), "proxyNoContextRoot"));

    final String expected = "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"proxyNoContextRoot\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}},\"storeProperties\":{\"gaffer.host\":\"http://my.graph.co.uk\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.proxystore.ProxyStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void federatedStoreRequest_shouldReturnFederatedRequestBody() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federated"));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federated\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void federatedStoreRequest_shouldReturnFederatedRequestBodyWithAllOperations() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
    HashMap<String, Object> contents = new HashMap<>();
    HashMap<String, String> contentsOfHandler = new HashMap<>();

    contentsOfHandler.put("class", "uk.gov.gchq.gaffer.proxystore.operation.handler.TestOperationHandler");

    contents.put("operation", "uk.gov.gchq.gaffer.proxystore.operation.TestOperation");
    contents.put("handler", contentsOfHandler);

    federatedConfig.putNestedObject(contents, "graph", "operationDeclarations");
    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedOpDeclaration"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\"," +
                    "\"metadata\":{\"labels\":{\"configName\":\"federatedOpDeclaration\"}," +
                    "\"name\":\"MyGraph\"}," +
                    "\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"}," +
                    "\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"},{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.TestOperationHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.TestOperation\"}]," +
                    "\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"," +
                    "\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\"," +
                    "\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]}}," +
                    "\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void accumuloStoreRequestShouldReturnAccumuloRequestBody() {
    final GafferSpec accumuloConfig = new GafferSpec();
    accumuloConfig.putNestedObject(true, "accumulo", "enabled");

    final Gaffer requestBody = GafferFactory.from(accumuloConfig, new GaaSCreateRequestBody("MyGraph", "Another description", getSchema(), "accumulo"));

        final String expected =
                "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"accumulo\"},\"name\":\"MyGraph\"},\"spec\":{\"accumulo\":{\"enabled\":true},\"graph\":{\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"}}," +
                        "\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
        assertEquals(expected, gson.toJson(requestBody));
    }

  @Test
  public void mapStoreStoreRequestShouldReturnMapStoreRequestBody() {
    final GafferSpec mapStoreConfig = new GafferSpec();
    mapStoreConfig.putNestedObject("uk.gov.gchq.gaffer.cache.impl.HashMapCacheService", "graph", "storeProperties", "gaffer.cache.service.class");
    mapStoreConfig.putNestedObject(true, "graph", "storeProperties", "gaffer.store.job.tracker.enabled");

    final Gaffer requestBody = GafferFactory.from(mapStoreConfig, new GaaSCreateRequestBody("MyGraph", "Another description", getSchema(), "mapStore"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"mapStore\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"schema\":{\"schema.json\":{\"entities\":{},\"edges\":{},\"types\":{}}},\"storeProperties\":{\"gaffer.store.job.tracker.enabled\":true,\"gaffer.cache.service.class\":\"uk.gov.gchq.gaffer.cache.impl.HashMapCacheService\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\"}},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void federatedBigStoreRequest_shouldReturnFederatedRequestBody() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedBig"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federatedBig\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void federatedBigStoreRequestWithValidOpAuthsInTheConfigYamlWithoutAddGraphClass_shouldOverrideToOneConfiguredInGafferSpecConfig() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
    federatedConfig.putNestedObject(getOperationAuthorizerHookWithValidOpAuthsInTheConfigYamlWithoutAddGraphClass(), "graph", "config", "hooks");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedBig"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federatedBig\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.operation.Operation\":[\"User\"],\"uk.gov.gchq.gaffer.operation.impl.get.GetAllElements\":[\"AdminUser\",\"SuperUser\"],\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void federatedBigStoreRequestOperationAuthorisationForAddGraphClassWithDefaultSystemUserValueAndOtherUsers_shouldOverrideToOneConfiguredinGafferSpecConfig() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
    federatedConfig.putNestedObject(getOperationAuthorizerHookWithValidOpAuthsInTheConfigYamlWithAddGraphClass(), "graph", "config", "hooks");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedBig"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federatedBig\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"],\"uk.gov.gchq.gaffer.operation.Operation\":[\"User\"],\"uk.gov.gchq.gaffer.operation.impl.get.GetAllElements\":[\"AdminUser\",\"SuperUser\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }


  @Test
  public void federatedBigStoreRequestWithAddGraphClassEmptyStringValueInOpAuthsConfigYaml_shouldNotOverrideToOneConfiguredInGafferSpecConfig() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
    federatedConfig.putNestedObject(getOperationAuthorizerHookWithEmptyStringValueInAddGraphClass(), "graph", "config", "hooks");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedBig"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federatedBig\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void federatedBigStoreRequestWithIncorrectUserValuesOpAuthsInTheConfigYaml_shouldNotOverrideToOneConfiguredInGafferSpecConfig() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
    federatedConfig.putNestedObject(getOperationAuthorizerHookWithIncorrectUserValues(), "graph", "config", "hooks");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedBig"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federatedBig\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void federatedBigStoreRequestOperationAuthorisationWithNullValueInAddGraphClass_shouldNotOverrideToOneConfiguredinGafferSpecConfig() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
    federatedConfig.putNestedObject(getOperationAuthorizerHookWithNullValueInAddGraphClass(), "graph", "config", "hooks");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedBig"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federatedBig\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void federatedBigStoreRequestOperationAuthorisationWithEmptyAuths_shouldNotOverrideToOneConfiguredInGafferSpecConfig() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
    federatedConfig.putNestedObject(getOperationAuthorizerHookWithEmptyAuths(), "graph", "config", "hooks");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedBig"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federatedBig\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void federatedBigStoreRequestOperationAuthorisationWithAddGraphClassInvalidUserValue_shouldNotOverrideToOneConfiguredInGafferSpecConfig() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
    federatedConfig.putNestedObject(getOperationAuthorizerHookWithAddGraphClassInvalidUserValue(), "graph", "config", "hooks");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedBig"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federatedBig\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  @Test
  public void federatedBigStoreRequestOperationAuthorisationForAddGraphClassWithInvalidDefaultSystemUserValue_shouldOverrideToOneConfiguredInGafferSpecConfig() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
    federatedConfig.putNestedObject(getOperationAuthorizerHookForAddGraphClassWithInvalidDefaultSystemUserValue(), "graph", "config", "hooks");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedBig"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federatedBig\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"User\",\"GAAS_SYSTEM_USER\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }


  @Test
  public void federatedBigStoreRequestWithoutOperationAuthorisationClass_shouldNotOverrideToOneConfiguredInGafferSpecConfig() {
    final GafferSpec federatedConfig = new GafferSpec();
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules", "graph", "storeProperties", "gaffer.serialiser.json.modules");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStore", "graph", "storeProperties", "gaffer.store.class");
    federatedConfig.putNestedObject("uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties", "graph", "storeProperties", "gaffer.store.properties.class");
    federatedConfig.putNestedObject(getOperationAuthorizerHookWithoutOperationAuthorisationClass(), "graph", "config", "hooks");

    final Gaffer requestBody = GafferFactory.from(federatedConfig, new GaaSCreateRequestBody("MyGraph", "Another description", null, "federatedBig"));

    final String expected =
            "{\"apiVersion\":\"gchq.gov.uk/v1\",\"kind\":\"Gaffer\",\"metadata\":{\"labels\":{\"configName\":\"federatedBig\"},\"name\":\"MyGraph\"},\"spec\":{\"graph\":{\"storeProperties\":{\"gaffer.serialiser.json.modules\":\"uk.gov.gchq.gaffer.sketches.serialisation.json.SketchesJsonModules\",\"gaffer.store.properties.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStoreProperties\",\"gaffer.store.class\":\"uk.gov.gchq.gaffer.federatedstore.FederatedStore\"},\"config\":{\"description\":\"Another description\",\"graphId\":\"MyGraph\",\"hooks\":[{\"class\":\"uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser\",\"auths\":{\"uk.gov.gchq.gaffer.federatedstore.operation.AddGraph\":[\"GAAS_SYSTEM_USER\"]}}]},\"operationDeclarations\":[{\"handler\":{\"class\":\"uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler\"},\"operation\":\"uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl\"}]},\"ingress\":{\"host\":\"mygraph-kai-dev.apps.my.kubernetes.cluster\",\"pathPrefix\":{\"ui\":\"/ui\",\"api\":\"/rest\"}}}}";
    assertEquals(expected, gson.toJson(requestBody));
  }

  private LinkedHashMap<String, Object> getSchema() {
    final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
    elementsSchema.put("entities", new Object());
    elementsSchema.put("edges", new Object());
    elementsSchema.put("types", new Object());
    return elementsSchema;
  }

  private static List<Object> getOperationAuthorizerHookWithValidOpAuthsInTheConfigYamlWithoutAddGraphClass() {
    final Map<String, ArrayList> auths = new LinkedHashMap<>();
    auths.put(Operation.class.getName(), new ArrayList<>(Arrays.asList("User")));
    auths.put(GetAllElements.class.getName(), new ArrayList<>(Arrays.asList("AdminUser", "SuperUser")));
    final List<Object> opAuthorizer = getOperationAuthoriserHook(auths);

    return opAuthorizer;
  }

  private static List<Object> getOperationAuthorizerHookWithValidOpAuthsInTheConfigYamlWithAddGraphClass() {
    final Map<String, ArrayList> auths = new LinkedHashMap<>();
    auths.put(AddGraph.class.getName(), new ArrayList<>(Arrays.asList(DEFAULT_SYSTEM_USER)));
    auths.put(Operation.class.getName(), new ArrayList<>(Arrays.asList("User")));
    auths.put(GetAllElements.class.getName(), new ArrayList<>(Arrays.asList("AdminUser", "SuperUser")));
    final List<Object> opAuthorizer = getOperationAuthoriserHook(auths);
    return opAuthorizer;
  }

  private static List<Object> getOperationAuthorizerHookWithIncorrectUserValues() {
    final Map<String, ArrayList> auths = new LinkedHashMap<>();
    auths.put(Operation.class.getName(), null);
    auths.put(GetAllElements.class.getName(), new ArrayList<>(Arrays.asList("")));
    final List<Object> opAuthorizer = getOperationAuthoriserHook(auths);
    return opAuthorizer;
  }

  private static List<Object> getOperationAuthorizerHookForAddGraphClassWithInvalidDefaultSystemUserValue() {
    final Map<String, ArrayList> auths = new LinkedHashMap<>();
    auths.put(AddGraph.class.getName(), new ArrayList<>(Arrays.asList("", "User")));
    final List<Object> opAuthoriser = getOperationAuthoriserHook(auths);
    return opAuthoriser;
  }


  private static List<Object> getOperationAuthorizerHookWithEmptyStringValueInAddGraphClass() {
    final Map<String, ArrayList> auths = new LinkedHashMap<>();
    auths.put(AddGraph.class.getName(), new ArrayList<>(Arrays.asList("")));
    final List<Object> opAuthorizer = getOperationAuthoriserHook(auths);
    return opAuthorizer;
  }

  private static List<Object> getOperationAuthorizerHookWithNullValueInAddGraphClass() {
    final Map<String, ArrayList> auths = new LinkedHashMap<>();
    auths.put(AddGraph.class.getName(), null);
    final List<Object> opAuthoriser = getOperationAuthoriserHook(auths);
    return opAuthoriser;
  }

  private static List<Object> getOperationAuthorizerHookWithEmptyAuths() {
    final Map<String, ArrayList> auths = new LinkedHashMap<>();
    final List<Object> opAuthoriser = getOperationAuthoriserHook(auths);
    return opAuthoriser;
  }

  private static List<Object> getOperationAuthorizerHookWithAddGraphClassInvalidUserValue() {
    final Map<String, ArrayList> auths = new LinkedHashMap<>();
    auths.put(AddGraph.class.getName(), new ArrayList<>(Arrays.asList("null")));
    final List<Object> opAuthoriser = getOperationAuthoriserHook(auths);
    return opAuthoriser;
  }

  private static List<Object> getOperationAuthorizerHookWithoutOperationAuthorisationClass() {
    final Map<String, ArrayList> auths = new LinkedHashMap<>();
    auths.put(AddGraph.class.getName(), new ArrayList<>(Arrays.asList("null")));
    final List<Object> opAuthoriser = getOperationAuthorizerHookWithoutOperationAuthorisationClass(auths);
    return opAuthoriser;
  }

  private static List<Object> getOperationAuthoriserHook(final Map<String, ArrayList> auths) {
    final Map<String, Object> opAuthoriser = new LinkedHashMap();
    opAuthoriser.put("class", OperationAuthoriser.class.getName());
    opAuthoriser.put("auths", auths);

    final List<Object> opAuthoriserList = new ArrayList<>();
    opAuthoriserList.add(opAuthoriser);
    return opAuthoriserList;
  }

  private static List<Object> getOperationAuthorizerHookWithoutOperationAuthorisationClass(final Map<String, ArrayList> auths) {
    final Map<String, Object> opAuthoriser = new LinkedHashMap();
    opAuthoriser.put("auths", auths);

    final List<Object> opAuthoriserList = new ArrayList<>();
    opAuthoriserList.add(opAuthoriser);
    return opAuthoriserList;
  }
}
