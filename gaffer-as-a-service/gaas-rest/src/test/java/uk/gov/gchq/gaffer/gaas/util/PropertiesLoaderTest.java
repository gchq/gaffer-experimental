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

package uk.gov.gchq.gaffer.gaas.util;


import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PropertiesLoaderTest {

  @Test
  public  void shouldSetStorePropertiesOnTheGraph() throws GaaSRestApiException {
     Map<String, Object> storeProperties = new HashMap<>();
    Map<String, Object> storeProperty = new HashMap<>();
    storeProperty.put("enabled", true);
    storeProperties.put("accumulo", storeProperty);

    PropertiesLoader pLoader = new PropertiesLoader();
    GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody("myGraph", "Another description", "accumulo", getSchema());
    pLoader.loadStoreProperties(gaaSCreateRequestBody);

    assertEquals(storeProperties, gaaSCreateRequestBody.getStoreProperties());


  }

  @Test
  public  void shouldThrowErrorForInvalidStoreType() throws GaaSRestApiException {
    PropertiesLoader pLoader = new PropertiesLoader();
    GaaSCreateRequestBody gaaSCreateRequestBody = new GaaSCreateRequestBody("myGraph", "Another description", "invalidStore", getSchema());

    Throwable exception = assertThrows(RuntimeException.class, () -> {
      pLoader.loadStoreProperties(gaaSCreateRequestBody);
    });
    assertTrue(exception.getLocalizedMessage().contains("StoreType is Invalid must be defined Valid Store Types supported are:"));
    assertTrue(exception.getLocalizedMessage().contains("accumulo"));
    assertTrue(exception.getLocalizedMessage().contains("federated"));
  }


  private LinkedHashMap<String, Object> getSchema() {
    final LinkedHashMap<String, Object> elementsSchema = new LinkedHashMap<>();
    elementsSchema.put("entities", new Object());
    elementsSchema.put("edges", new Object());
    elementsSchema.put("types", new Object());
    return elementsSchema;
  }

}