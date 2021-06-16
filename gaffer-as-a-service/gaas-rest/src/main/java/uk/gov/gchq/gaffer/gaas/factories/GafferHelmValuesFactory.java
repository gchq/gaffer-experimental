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
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.util.GaaSGraphConfigsLoader;
import uk.gov.gchq.gaffer.graph.hook.OperationAuthoriser;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import static uk.gov.gchq.gaffer.common.util.Constants.GROUP;
import static uk.gov.gchq.gaffer.common.util.Constants.VERSION;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
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
public final class GafferHelmValuesFactory {

    private static final String KIND = "Gaffer";
    private static final String DEFAULT_SYSTEM_USER = "GAAS_SYSTEM_USER";
    private static final String INGRESS_API_PATH_VALUE = "/rest";
    private static final String INGRESS_UI_PATH_VALUE = "/ui";
    private static final String[] GAFFER_STORE_CLASS_NESTED_KEYS = {"graph", "storeProperties", "gaffer.store.class"};

    public static Gaffer from(final GaaSCreateRequestBody graph) throws GaaSRestApiException {

        // TODO: Validate only - and . special characters, see Kubernetes metadata regex
        final V1ObjectMeta metadata = new V1ObjectMeta().name(graph.getGraphId());

        return new Gaffer()
                .apiVersion(GROUP + "/" + VERSION)
                .kind(KIND)
                .metaData(metadata)
                .spec(createGafferSpecFrom(graph));
    }

    private static GafferSpec createGafferSpecFrom(final GaaSCreateRequestBody graphOverrides) throws GaaSRestApiException {

        final GaaSGraphConfigsLoader loader = new GaaSGraphConfigsLoader();
        final GafferSpec config = loader.getConfig("/config", graphOverrides.getConfigName());

        config.putNestedObject(graphOverrides.getGraphId(), GRAPH_ID_KEY);
        config.putNestedObject(graphOverrides.getDescription(), DESCRIPTION_KEY);

        if (!FederatedStore.class.getName().equals(config.getNestedObject(GAFFER_STORE_CLASS_NESTED_KEYS))) {
            config.putNestedObject(graphOverrides.getSchema(), SCHEMA_FILE_KEY);
        }

        config.putNestedObject(Arrays.asList(getOperationAuthoriser()), HOOKS_KEY);
        config.putNestedObject(graphOverrides.getGraphId().toLowerCase() + "-" + NAMESPACE + "." + INGRESS_SUFFIX, INGRESS_HOST_KEY);
        config.putNestedObject(INGRESS_API_PATH_VALUE, INGRESS_API_PATH_KEY);
        config.putNestedObject(INGRESS_UI_PATH_VALUE, INGRESS_UI_PATH_KEY);
        return config;
    }

    private static Map<String, Object> getOperationAuthoriser() {
        final Map<String, String[]> operationAuths = new LinkedHashMap<>();
        operationAuths.put(AddGraph.class.getName(), new String[] {DEFAULT_SYSTEM_USER});

        final Map<String, Object> opAuthoriser = new LinkedHashMap<>();
        opAuthoriser.put("class", OperationAuthoriser.class.getName());
        opAuthoriser.put("auths", operationAuths);

        return opAuthoriser;
    }

    private GafferHelmValuesFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
