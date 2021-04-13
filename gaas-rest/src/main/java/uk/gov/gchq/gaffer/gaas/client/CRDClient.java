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

package uk.gov.gchq.gaffer.gaas.client;

import io.kubernetes.client.common.KubernetesObject;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import io.kubernetes.client.openapi.models.V1NamespaceList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferList;
import uk.gov.gchq.gaffer.controller.util.CommonUtil;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import uk.gov.gchq.gaffer.gaas.util.Properties;
import java.util.List;
import java.util.stream.Collectors;
import static uk.gov.gchq.gaffer.gaas.factories.GaaSRestExceptionFactory.from;

@Service
public class CRDClient {

    @Value("${group}")
    private String group;
    @Value("${version}")
    private String version;
    @Value("${gaffer.namespace}")
    private String namespace;
    private static final String PLURAL = "gaffers";
    private static final String PRETTY = null;
    private static final String DRY_RUN = null;
    private static final String FIELD_MANAGER = null;

    @Autowired
    private CustomObjectsApi customObjectsApi;

    @Autowired
    private CoreV1Api coreV1Api;

    private static final Logger LOGGER = LoggerFactory.getLogger(CRDClient.class);

    public void createCRD(final KubernetesObject requestBody) throws GaaSRestApiException {
        try {
            customObjectsApi.createNamespacedCustomObject(this.group, this.version, Properties.NAMESPACE, this.PLURAL, requestBody, this.PRETTY, this.DRY_RUN, this.FIELD_MANAGER);
        } catch (ApiException e) {
            if (requestBody == null || requestBody.getMetadata() == null) {
                LOGGER.debug("Failed to create CRD \"\". Kubernetes CustomObjectsApi returned Status Code: " + e.getCode(), e);
            } else {
                LOGGER.debug("Failed to create CRD with name \"" + requestBody.getMetadata().getName() + "\". Kubernetes CustomObjectsApi returned Status Code: " + e.getCode(), e);

            }
            throw from(e);
        }
    }

    public List<GaaSGraph> listAllCRDs() throws GaaSRestApiException {
        try {
            final Object customObject = customObjectsApi.listNamespacedCustomObject(this.group, this.version, Properties.NAMESPACE, this.PLURAL, this.PRETTY, null, null, null, null, null, null, null);
            return convertJsonToGraphs(customObject);
        } catch (ApiException e) {
            LOGGER.debug("Failed to list all CRDs. Kubernetes CustomObjectsApi returned Status Code: " + e.getCode(), e);
            throw from(e);
        }
    }

    public void deleteCRD(final String crdName) throws GaaSRestApiException {
        try {
            customObjectsApi.deleteNamespacedCustomObject(group, version, Properties.NAMESPACE, PLURAL, crdName, null, null, null, this.DRY_RUN, null);
        } catch (ApiException e) {
            LOGGER.debug("Failed to delete CRD. Kubernetes CustomObjectsApi returned Status Code: " + e.getCode(), e);
            throw from(e);
        }
    }

    public List<String> getAllNameSpaces() throws GaaSRestApiException {
        try {
            final V1NamespaceList v1NamespaceList =
                    coreV1Api.listNamespace(
                            "true", null, null, null, null, 0, null, null, Integer.MAX_VALUE, Boolean.FALSE);
            return namespacesAsList(v1NamespaceList);
        } catch (ApiException e) {
            LOGGER.debug("Failed to list all namespaces. Kubernetes CoreV1Api returned Status Code: " + e.getCode(), e);
            throw from(e);
        }
    }

    private List<String> namespacesAsList(final V1NamespaceList v1NamespaceList) {
        final List<String> list =
                v1NamespaceList.getItems().stream()
                        .map(v1Namespace -> v1Namespace.getMetadata().getName())
                        .collect(Collectors.toList());
        return list;
    }

    private List<GaaSGraph> convertJsonToGraphs(final Object response) {
        final GafferList gafferList = CommonUtil.convertToCustomObject(response, GafferList.class);
        final List<Gaffer> gaffers = (List<Gaffer>) gafferList.getItems();

        final List<GaaSGraph> list = gaffers.stream().map(gaffer -> new GaaSGraph()
                .graphId(gaffer.getSpec().getNestedObject("graph", "config", "graphId").toString())
                .description(gaffer.getSpec().getNestedObject("graph", "config", "description").toString())
                .status(gaffer.getStatus().getRestApiStatus())).collect(Collectors.toList());

        return list;
    }
}
