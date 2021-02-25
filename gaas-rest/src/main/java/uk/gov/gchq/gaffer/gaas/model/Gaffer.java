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
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.apache.commons.lang3.builder.ToStringBuilder;

import static uk.gov.gchq.gaffer.gaas.model.Constants.SERIALISED_NAME_API_VERSION;
import static uk.gov.gchq.gaffer.gaas.model.Constants.SERIALISED_NAME_KIND;
import static uk.gov.gchq.gaffer.gaas.model.Constants.SERIALISED_NAME_METADATA;
import static uk.gov.gchq.gaffer.gaas.model.Constants.SERIALISED_NAME_SPEC;
import static uk.gov.gchq.gaffer.gaas.model.Constants.SERIALISED_NAME_STATUS;

/**
 * Value object for Gaffer
 */
public class Gaffer implements KubernetesObject {

    @SerializedName(SERIALISED_NAME_API_VERSION)
    private String apiVersion;


    @SerializedName(SERIALISED_NAME_KIND)
    private String kind;

    @SerializedName(SERIALISED_NAME_METADATA)
    private V1ObjectMeta metadata;


    @SerializedName(SERIALISED_NAME_SPEC)
    private GafferSpec spec;


    @SerializedName(SERIALISED_NAME_STATUS)
    private GafferStatus status;


    public V1ObjectMeta getMetadata() {
        return metadata;
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public String getKind() {
        return kind;
    }

    public GafferSpec getSpec() {
        return spec;
    }

    public GafferStatus getStatus() {
        return status;
    }

    public Gaffer status(final GafferStatus status) {
        this.status = status;
        return this;
    }

    public Gaffer metaData(final V1ObjectMeta metadata) {
        this.metadata = metadata;
        return this;
    }

    public Gaffer apiVersion(final String apiVersion) {
        this.apiVersion = apiVersion;
        return this;
    }

    public Gaffer kind(final String kind) {
        this.kind = kind;
        return this;
    }

    public Gaffer spec(final GafferSpec spec) {
        this.spec = spec;
        return this;
    }

    @Override
    public boolean equals(final Object o) {
        if (this == o) {
            return true;
        }

        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        final Gaffer gaffer = (Gaffer) o;

        return new EqualsBuilder()
                .append(apiVersion, gaffer.apiVersion)
                .append(kind, gaffer.kind)
                .append(metadata, gaffer.metadata)
                .append(spec, gaffer.spec)
                .append(status, gaffer.status)
                .isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(17, 37)
                .append(apiVersion)
                .append(kind)
                .append(metadata)
                .append(spec)
                .append(status)
                .toHashCode();
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("apiVersion", apiVersion)
                .append("kind", kind)
                .append("metadata", metadata)
                .append("spec", spec)
                .append("status", status)
                .toString();
    }
}
