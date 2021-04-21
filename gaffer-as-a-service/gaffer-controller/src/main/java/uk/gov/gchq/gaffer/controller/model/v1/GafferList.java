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

package uk.gov.gchq.gaffer.controller.model.v1;

import com.google.gson.annotations.SerializedName;
import io.kubernetes.client.common.KubernetesListObject;
import io.kubernetes.client.common.KubernetesObject;
import io.kubernetes.client.openapi.models.V1ListMeta;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.util.List;

import static uk.gov.gchq.gaffer.controller.util.Constants.SERIALISED_NAME_API_VERSION;
import static uk.gov.gchq.gaffer.controller.util.Constants.SERIALISED_NAME_ITEMS;
import static uk.gov.gchq.gaffer.controller.util.Constants.SERIALISED_NAME_KIND;
import static uk.gov.gchq.gaffer.controller.util.Constants.SERIALISED_NAME_METADATA;

public class GafferList implements KubernetesListObject {

    @SerializedName(SERIALISED_NAME_METADATA)
    private V1ListMeta metadata;

    @SerializedName(SERIALISED_NAME_ITEMS)
    private List<Gaffer> items;

    @SerializedName(SERIALISED_NAME_API_VERSION)
    private String apiVersion;

    @SerializedName(SERIALISED_NAME_KIND)
    private String kind;

    public V1ListMeta getMetadata() {
        return metadata;
    }

    public List<? extends KubernetesObject> getItems() {
        return items;
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public String getKind() {
        return kind;
    }

    @Override
    public boolean equals(final Object o) {
        if (this == o) {
            return true;
        }

        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        final GafferList that = (GafferList) o;

        return new EqualsBuilder()
                .append(metadata, that.metadata)
                .append(items, that.items)
                .append(apiVersion, that.apiVersion)
                .append(kind, that.kind)
                .isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(17, 37)
                .append(metadata)
                .append(items)
                .append(apiVersion)
                .append(kind)
                .toHashCode();
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("metadata", metadata)
                .append("items", items)
                .append("apiVersion", apiVersion)
                .append("kind", kind)
                .toString();
    }
}
