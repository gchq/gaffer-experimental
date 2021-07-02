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

import io.kubernetes.client.openapi.models.V1ObjectMeta;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.federatedstore.FederatedStore;
import uk.gov.gchq.gaffer.federatedstore.operation.AddGraph;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import static uk.gov.gchq.gaffer.common.util.Constants.GROUP;
import static uk.gov.gchq.gaffer.common.util.Constants.VERSION;
import static uk.gov.gchq.gaffer.gaas.util.Constants.AUTHS_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GAFFER_STORE_CLASS_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GRAPH_ID_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.HOOKS_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_API_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_HOST_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_UI_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.SCHEMA_FILE_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Properties.INGRESS_SUFFIX;
import static uk.gov.gchq.gaffer.gaas.util.Properties.NAMESPACE;

/**
 * GafferHelmValuesFactory is a factory class that creates a Gaffer Helm Values Object that can be passed to the
 * Kubernetes java client and use helm to deploy a Gaffer custom resource instance to a Kubernetes cluster..
 * <p>
 * See <a href="https://github.com/gchq/gaffer-docker/blob/develop/kubernetes/gaffer/values.yaml">values.yaml</a> for
 * the default helm chart values and documentation how Gaffer is deployed to Kubernetes via helm.
 *
 * @see <a href="https://github.com/gchq/gaffer-docker/blob/develop/kubernetes/gaffer/values-federated.yaml">Federated Store overrides</a>
 * for more Gaffer store configuration overrides:
 */
public final class GafferFactory {

  private static final String KIND = "Gaffer";
  private static final String DEFAULT_SYSTEM_USER = "GAAS_SYSTEM_USER";

  public static Gaffer from(final GafferSpec gafferSpecConfig, final GaaSCreateRequestBody createGraphRequest) {

    // TODO: Validate only - and . special characters, see Kubernetes metadata regex

    HashMap<String, String> labels = new HashMap<>();
    labels.put("configName", createGraphRequest.getConfigName());

    final V1ObjectMeta metadata = new V1ObjectMeta()
            .name(createGraphRequest.getGraphId())
            .labels(labels);

    return new Gaffer()
            .apiVersion(GROUP + "/" + VERSION)
            .kind(KIND)
            .metaData(metadata)
            .spec(overrideGafferSpecConfig(gafferSpecConfig, createGraphRequest));
  }

  private static GafferSpec overrideGafferSpecConfig(final GafferSpec config, final GaaSCreateRequestBody overrides) {
    final Map<String, Object> opAuthoriser = new LinkedHashMap<>();
    config.putNestedObject(overrides.getGraphId(), GRAPH_ID_KEY);
    config.putNestedObject(overrides.getDescription(), DESCRIPTION_KEY);

    if (FederatedStore.class.getName().equals(config.getNestedObject(GAFFER_STORE_CLASS_KEY))) {
      config.putNestedObject(Collections.singletonList(getOperationAuthoriserHook(config.getNestedObject(AUTHS_KEY))), HOOKS_KEY);
    } else {
      config.putNestedObject(overrides.getSchema(), SCHEMA_FILE_KEY);
    }

    // Mandatory Ingress values
    config.putNestedObject(overrides.getGraphId().toLowerCase() + "-" + NAMESPACE + "." + INGRESS_SUFFIX, INGRESS_HOST_KEY);
    config.putNestedObject("/rest", INGRESS_API_PATH_KEY);
    config.putNestedObject("/ui", INGRESS_UI_PATH_KEY);
    return config;
  }

  private static Map<String, Object> getOperationAuthoriserHook(Object existingAuths) {
    final Map<String, String[]> auths = new LinkedHashMap<>();
    final Map<String, String[]> configResult = (LinkedHashMap) existingAuths;
    if (configResult != null) {
      configResult.forEach((key, value) -> {
        String[] result = checkValue(key, value);
        if (key != null && result != null && result.length != 0) {
          auths.put(key, result);
        }
      });
    }

    if (auths.isEmpty() || !configResult.containsKey(AddGraph.class.getName())) {
      auths.put(AddGraph.class.getName(), new String[] {DEFAULT_SYSTEM_USER});
    }
    final Map<String, Object> opAuthoriser = new LinkedHashMap<>();
    opAuthoriser.put("class", OperationAuthoriser.class.getName());
    opAuthoriser.put("auths", auths);

    return opAuthoriser;
  }

  private static String[] checkValue(String key, String[] value) {
    if (value != null) {
      final List<String> result = new ArrayList();
      for (int i = 0; i < value.length; i++) {
        if (value[i] != "" && value[i] != "null" && value[i] != null) {
          result.add(value[i]);
        }
      }
      if (key.equals(AddGraph.class.getName()) && !result.contains(DEFAULT_SYSTEM_USER)) {
        result.add(DEFAULT_SYSTEM_USER);
      }
      return result.toArray(new String[result.size()]);
    }
    return null;
  }


  private GafferFactory() {
    // prevents calls from subclass
    throw new UnsupportedOperationException();
  }
}
