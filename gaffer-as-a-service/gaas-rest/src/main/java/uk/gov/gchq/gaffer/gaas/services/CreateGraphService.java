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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Map;
import static uk.gov.gchq.gaffer.gaas.factories.GafferHelmValuesFactory.from;

@Service
public class CreateGraphService {
  @Autowired
  private ResourceLoader resourceLoader;

  @Autowired
  private CRDClient crdClient;

  public void createGraph(final GaaSCreateRequestBody gaaSCreateRequestBodyInput) throws GaaSRestApiException {
    crdClient.createCRD(makeGafferHelmValues(gaaSCreateRequestBodyInput));
  }

  private Gaffer makeGafferHelmValues(final GaaSCreateRequestBody graph) throws GaaSRestApiException {
    loadStoreProperties(graph);
    return from(graph);
  }

  private void loadStoreProperties(final GaaSCreateRequestBody graph) throws GaaSRestApiException {
    String storeType = graph.getStoreType();
    Yaml yaml = new Yaml();
    try {
      InputStream inputStream = this.getClass()
              .getClassLoader()
              .getResourceAsStream("yaml/" + storeType + ".yaml");
      Map<String, Object> storeProperties = yaml.load(inputStream);
      graph.setStoreProperties(storeProperties);


    } catch (Exception e) {
      throw new RuntimeException("StoreType is Invalid must be defined Valid Store Types supported are: " + getStoreTypesAsStringList());
    }

  }

  private String getStoreTypesAsStringList() throws GaaSRestApiException {
    ArrayList<String> storeTypes = new ArrayList<>();
    Resource[] resources = loadResources("classpath*:yaml/*.yaml");
    for (final Resource resource : resources) {
      String filename = resource.getFilename().split("\\.", 2)[0];
      storeTypes.add(filename);
    }
    String str = storeTypes.toString().replaceAll("\\[|\\]", "");
    return str;
  }

  private Resource[] loadResources(final String pattern) throws GaaSRestApiException {
    try {
      return ResourcePatternUtils.getResourcePatternResolver(resourceLoader).getResources(pattern);
    } catch (IOException e) {
      throw new GaaSRestApiException(e.getLocalizedMessage(), e.getMessage(), 500);
    }

  }


}
