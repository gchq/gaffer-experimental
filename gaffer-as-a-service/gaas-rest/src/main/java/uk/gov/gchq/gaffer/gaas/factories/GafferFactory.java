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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
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
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import static uk.gov.gchq.gaffer.common.util.Constants.GROUP;
import static uk.gov.gchq.gaffer.common.util.Constants.VERSION;
import static uk.gov.gchq.gaffer.gaas.util.Constants.CONFIG_NAME_K8S_METADATA_LABEL;
import static uk.gov.gchq.gaffer.gaas.util.Constants.CONFIG_NAME_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GAFFER_OPERATION_DECLARATION_KEY;
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
 * Kubernetes java client and use helm to deploy a Gaffer custom resource instance to a Kubernetes cluster.
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
        final Map<String, String> labels = new HashMap<>();
        labels.put(CONFIG_NAME_K8S_METADATA_LABEL, createGraphRequest.getConfigName());

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
        config.putNestedObject(overrides.getGraphId(), GRAPH_ID_KEY);
        config.putNestedObject(overrides.getDescription(), DESCRIPTION_KEY);
        config.putNestedObject(overrides.getConfigName(), CONFIG_NAME_KEY);
        if (FederatedStore.class.getName().equals(config.getNestedObject(GAFFER_STORE_CLASS_KEY))) {
            config.putNestedObject(Collections.singletonList(getOperationAuthoriserHook(config.getNestedObject(HOOKS_KEY))), HOOKS_KEY);
            config.putNestedObject(createOperationDeclaration(config), GAFFER_OPERATION_DECLARATION_KEY);
        } else {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
            try {
                config.putNestedObject(objectMapper.writeValueAsString(overrides.getSchema()), SCHEMA_FILE_KEY);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }


        // Mandatory Ingress values
        config.putNestedObject(overrides.getGraphId().toLowerCase() + "-" + NAMESPACE + "." + INGRESS_SUFFIX, INGRESS_HOST_KEY);
        config.putNestedObject("/rest", INGRESS_API_PATH_KEY);
        config.putNestedObject("/ui", INGRESS_UI_PATH_KEY);
        return config;
    }

    private static Map<String, Object> getOperationAuthoriserHook(final Object existingAuths) {

        final Map<String, List> formattedAuths = getFormattedAuths(existingAuths);

        if (formattedAuths.isEmpty() || !formattedAuths.containsKey(AddGraph.class.getName())) {
            formattedAuths.put(AddGraph.class.getName(), new ArrayList<>(Collections.singletonList(DEFAULT_SYSTEM_USER)));
        }
        final Map<String, Object> opAuthoriser = new LinkedHashMap<>();
        opAuthoriser.put("class", OperationAuthoriser.class.getName());
        opAuthoriser.put("auths", formattedAuths);

        return opAuthoriser;
    }

    private static Map<String, List> getFormattedAuths(final Object existingAuths) {
        final Map<String, List> formattedAuths = new LinkedHashMap<>();
        Map<String, Object> notFormattedAuths = new LinkedHashMap<>();
        if (existingAuths != null) {
            final List<Object> configResult = (ArrayList) existingAuths;
            for (final Object key : configResult) {
                if (((LinkedHashMap) key).get("class") != null && ((LinkedHashMap) key).get("class").equals(OperationAuthoriser.class.getName())) {
                    notFormattedAuths = (LinkedHashMap) ((LinkedHashMap) key).get("auths");
                }
            }
            if (notFormattedAuths != null) {
                notFormattedAuths.forEach((key, value) -> {
                    List<String> auths = formatExistingAuths(key, value);
                    if (key != null && auths != null && !auths.isEmpty()) {
                        formattedAuths.put(key, auths);
                    }
                });
            }
        }
        return formattedAuths;
    }

    private static Set<Object> createOperationDeclaration(final GafferSpec config) {
        final List<Object> operations = new ArrayList<>();
        if (config.getNestedObject(GAFFER_OPERATION_DECLARATION_KEY) != null) {
            operations.add(config.getNestedObject(GAFFER_OPERATION_DECLARATION_KEY));
        }
        final Map<String, Object> proxyUrlDeclaration = new HashMap<>();
        final Map<String, String> proxyUrlClass = new HashMap<>();

        proxyUrlClass.put("class", "uk.gov.gchq.gaffer.proxystore.operation.handler.GetProxyUrlHandler");

        proxyUrlDeclaration.put("operation", "uk.gov.gchq.gaffer.proxystore.operation.GetProxyUrl");
        proxyUrlDeclaration.put("handler", proxyUrlClass);

        final Set<Object> objects = new HashSet<>();
        objects.add(proxyUrlDeclaration);

        objects.addAll(operations);

        return objects;
    }


    private static List<String> formatExistingAuths(final String key, final Object exsistingAuths) {
        if (exsistingAuths != null) {
            final List<String> result = new ArrayList();
            if (exsistingAuths instanceof List) {
                List<String> authsResult = (ArrayList) exsistingAuths;
                for (final String auth : authsResult) {
                    if (!Objects.equals(auth, "") && !Objects.equals(auth, "null") && auth != null) {
                        result.add(auth);
                    }
                }
            }
            if (key.equals(AddGraph.class.getName()) && !result.contains(DEFAULT_SYSTEM_USER)) {
                result.add(DEFAULT_SYSTEM_USER);
            }
            return result;
        }
        return Collections.emptyList();
    }

    private GafferFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
