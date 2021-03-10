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

package uk.gov.gchq.gaffer.gaas.model;

import com.google.gson.annotations.SerializedName;
import io.kubernetes.client.common.KubernetesObject;
import io.kubernetes.client.openapi.models.V1ObjectMeta;

/**
 * Gaas Rest Create Gaffer CRD Request Body
 */
public class CRDCreateRequestBody implements KubernetesObject {

    public static final String SERIALISED_NAME_API_VERSION = "apiVersion";
    public static final String SERIALISED_NAME_KIND = "kind";
    public static final String SERIALISED_NAME_METADATA = "metadata";
    public static final String SERIALISED_NAME_SPEC = "spec";

    @SerializedName(SERIALISED_NAME_API_VERSION)
    private String apiVersion;

    @SerializedName(SERIALISED_NAME_KIND)
    private String kind;

    @SerializedName(SERIALISED_NAME_METADATA)
    private V1ObjectMeta metadata;

    @SerializedName(SERIALISED_NAME_SPEC)
    private GraphSpec spec;

    public CRDCreateRequestBody apiVersion(final String apiVersion) {
        this.apiVersion = apiVersion;
        return this;
    }

    public CRDCreateRequestBody kind(final String kind) {
        this.kind = kind;
        return this;
    }

    public CRDCreateRequestBody metaData(final V1ObjectMeta metadata) {
        this.metadata = metadata;
        return this;
    }

    public CRDCreateRequestBody spec(final GraphSpec spec) {
        this.spec = spec;
        return this;
    }

    @Override
    public V1ObjectMeta getMetadata() {
        return metadata;
    }

    @Override
    public String getApiVersion() {
        return apiVersion;
    }

    @Override
    public String getKind() {
        return kind;
    }

    public GraphSpec getSpec() {
        return spec;
    }
}
