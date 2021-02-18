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
package uk.gov.gchq.gaffer.services;

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DeleteGraphService {
    @Autowired
    private ApiClient apiClient;

    public void deleteGraph(final String graphId) throws ApiException {
        CustomObjectsApi apiInstance = new CustomObjectsApi(apiClient);
        String group = "gchq.gov.uk"; // String | the custom resource's group
        String version = "v1"; // String | the custom resource's version
        String namespace = "kai-helm-3"; // String | The custom resource's namespace
        String plural = "gaffers"; // String | the custom resource's plural name. For TPRs this would be lowercase plural kind.
        apiInstance.deleteNamespacedCustomObject(group, version, namespace, plural, graphId, null, null, null, null, null);
    }
}
