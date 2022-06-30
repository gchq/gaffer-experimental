/*
 * Copyright 2021-2022 Crown Copyright
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

import org.json.JSONObject;
import uk.gov.gchq.gaffer.gaas.model.v1.RestApiStatus;

import java.util.List;

public class GaaSGraph {

    private String graphId;

    private String description;
    private String url;
    private RestApiStatus status;
    private List<String> problems;
    private String configName;
    private String restUrl;
    private String graphAutoDestroyDate;
    private String elements;
    private String types;


    public GaaSGraph elements(String elements) {
        this.elements = elements;
        return this;
    }

    public GaaSGraph types(String types) {
        this.types = types;
        return this;
    }

    public GaaSGraph configName(final String config) {
        this.configName = config;
        return this;
    }


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

    public GaaSGraph restUrl(final String restUrl) {
        this.restUrl = restUrl;
        return this;
    }

    public GaaSGraph graphAutoDestroyDate(final String expiredDate) {
        this.graphAutoDestroyDate = expiredDate;
        return this;
    }

    public String getGraphAutoDestroyDate() {
        return graphAutoDestroyDate;
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

    public String getConfigName() {
        return configName;
    }

    public String getRestUrl() {
        return restUrl;
    }

    public String getTypes() { return types; }

    public String getElements() { return elements; }


    @Override
    public String toString() {
        return "GaaSGraph{" +
                "graphId='" + graphId + '\'' +
                ", description='" + description + '\'' +
                ", ui url='" + url + '\'' +
                ", rest url='" + url + '\'' +
                ", config=" + configName + '\'' +
                ", status=" + status +
                ", graph auto destroy date=" + graphAutoDestroyDate + '\'' +
                ", problems=" + problems +
                '}';
    }
}
