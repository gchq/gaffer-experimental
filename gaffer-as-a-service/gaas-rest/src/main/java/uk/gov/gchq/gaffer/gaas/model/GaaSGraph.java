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

import org.apache.commons.lang3.builder.ToStringBuilder;
import uk.gov.gchq.gaffer.common.model.v1.RestApiStatus;
import java.util.List;

public class GaaSGraph {

    private String graphId;
    private String description;
    private String url;
    private RestApiStatus status;
    private List<String> problems;
    private String storeType;

    public GaaSGraph graphId(final String graphId) {
        this.graphId = graphId;
        return this;
    }

    public GaaSGraph description(final String description) {
        this.description = description;
        return this;
    }

    public GaaSGraph url(final String url) {
        this.url = url;
        return this;
    }

    public GaaSGraph status(final RestApiStatus status) {
        this.status = status;
        return this;
    }

    public GaaSGraph problems(final List<String> problems) {
        this.problems = problems;
        return this;
    }

    public GaaSGraph storeType(final String storeType) {
        this.storeType = storeType;
        return this;
    }

    public String getGraphId() {
        return graphId;
    }

    public String getDescription() {
        return description;
    }

    public String getUrl() {
        return url;
    }

    public RestApiStatus getStatus() {
        return status;
    }

    public List<String> getProblems() {
        return problems;
    }

    public String getStoreType() {
        return storeType;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("graphId", graphId)
                .append("description", description)
                .append("url", url)
                .append("status", status)
                .append("problems", problems)
                .append("storeType", storeType)
                .toString();
    }
}
