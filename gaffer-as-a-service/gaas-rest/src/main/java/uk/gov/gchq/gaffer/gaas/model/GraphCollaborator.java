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

public class GraphCollaborator {

    private String graphId;

    private String userName;

    public GraphCollaborator graphId(final String graphId) {
        this.graphId = graphId;
        return this;
    }

    public GraphCollaborator userName(final String userName) {
        this.userName = userName;
        return this;
    }

    public String getGraphId() {
        return graphId;
    }

    public String getUserName() {
        return userName;
    }

    @Override
    public String toString() {
        return "GraphCollaborator{" +
                "graphId='" + graphId + '\'' +
                ", userName='" + userName + '\'' +
                '}';
    }
}
