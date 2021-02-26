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

package uk.gov.gchq.gaffer.gaas.model;

import io.kubernetes.client.common.KubernetesObject;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import static uk.gov.gchq.gaffer.gaas.converters.CrdExceptionHandler.handle;

public class CRDClient {
    private String group;
    private String version;
    private String plural;
    private Object body;
    private String pretty;
    private String dryRun;
    private String fieldManager;
    @Value("${namespace}")
    private String namespace;

    @Autowired
    private ApiClient apiClient;

    public CRDClient() {
        this.group = "gchq.gov.uk";
        this.version = "v1";
        this.plural = "gaffers";
        this.pretty = null;
        this.dryRun = null;
        this.fieldManager = null;
    }

    public void createCRD(final KubernetesObject requestBody) throws GaaSRestApiException {
        final CustomObjectsApi customObjectsApi = new CustomObjectsApi(apiClient);
        try {
            customObjectsApi.createNamespacedCustomObject(this.group, this.version, this.namespace, this.plural, requestBody, this.pretty, this.dryRun, this.fieldManager);
        } catch (ApiException e) {
            handle(e);
        }
    }

    public Object getAllCRD() throws GaaSRestApiException {
        final CustomObjectsApi customObjectsApi = new CustomObjectsApi(apiClient);
        try {
            return customObjectsApi.listNamespacedCustomObject(this.group, this.version, this.namespace, this.plural, null, null, null, null, null, null, null, null);
        } catch (ApiException e) {
            handle(e);
        }
        return null;

    }
}
