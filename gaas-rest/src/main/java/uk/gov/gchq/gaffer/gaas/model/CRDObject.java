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

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

public class CRDObject {
    private String group;
    private String version;
    private String plural;
    private Object body;
    private String pretty;
    private String dryRun;
    private String fieldManager;
    @Value("${namespace}")
    private String namespace;

    private CustomObjectsApi customObject;
    @Autowired
    private ApiClient apiClient;

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getPlural() {
        return plural;
    }

    public String getfieldManager() {
        return fieldManager;
    }

    public void setfieldManager(String fieldManager) {
        this.fieldManager = fieldManager;
    }

    public String getDryRun() {
        return dryRun;
    }

    public void setDryRun(String dryRun) {
        this.dryRun = dryRun;
    }

    public String getPretty() {
        return pretty;
    }

    public void setPretty(String pretty) {
        this.pretty = pretty;
    }

    public Object getBody() {
        return body;
    }

    public void setBody(Object body) {
        this.body = body;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public void setPlural(String plural) {
        this.plural = plural;
    }

    public CRDObject(String group, String version, String namespace, String plural, Object body, String pretty, String dryRun,
                     String fieldManager) {
        this.setGroup(group);
        this.setVersion(version);
        this.setPlural(plural);
        this.setBody(body);
        this.setPretty(pretty);
        this.setDryRun(dryRun);
        this.setfieldManager(fieldManager);
        this.setNamespace(namespace);
    }

    public CRDObject(Object body) {
        this.setGroup("gchq.gov.uk");
        this.setVersion("v1");
        this.setPlural("gaffers");
        this.setBody(body);
        this.setPretty(null);
        this.setDryRun(null);
        this.setfieldManager(null);
    }

    public void createCRD() throws ApiException {
        customObject = new CustomObjectsApi(apiClient);
        customObject.createNamespacedCustomObject(group, version, namespace, plural, body, pretty, dryRun, fieldManager);

    }
}
