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

package uk.gov.gchq.gaffer.common.model.v1;

import com.google.gson.annotations.SerializedName;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.apache.commons.lang3.builder.ToStringBuilder;
import uk.gov.gchq.gaffer.common.util.Constants;

import java.util.List;

/**
 * Value object for the Gaffer Status
 */
public class GafferStatus {

    @SerializedName(Constants.SERIALISED_NAME_PROBLEMS)
    private List<String> problems;

    @SerializedName(Constants.SERIALISED_NAME_REST_API_STATUS)
    private RestApiStatus restApiStatus;

    public List<String> getProblems() {
        return problems;
    }

    public RestApiStatus getRestApiStatus() {
        return restApiStatus;
    }

    public GafferStatus problems(final List<String> problems) {
        this.problems = problems;
        return this;
    }

    public GafferStatus restApiStatus(final RestApiStatus restApiStatus) {
        this.restApiStatus = restApiStatus;
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

        final GafferStatus that = (GafferStatus) o;

        return new EqualsBuilder()
                .append(problems, that.problems)
                .append(restApiStatus, that.restApiStatus)
                .isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(17, 37)
                .append(problems)
                .append(restApiStatus)
                .toHashCode();
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("problems", problems)
                .append("restApiStatus", restApiStatus)
                .toString();
    }
}
