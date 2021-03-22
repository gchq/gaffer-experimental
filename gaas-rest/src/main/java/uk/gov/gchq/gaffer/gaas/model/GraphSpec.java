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

public class GraphSpec {
    private final NewGraph graph;

    public AccumuloConfig getAccumulo() {
        return accumulo;
    }

    private final AccumuloConfig accumulo;

    private GraphSpec(Builder builder) {
        this.graph = builder.graph;
        this.accumulo = builder.accumulo;
    }

    public NewGraph getGraph() {
        return graph;
    }

    public boolean accumuloIsEnabled() {
        return accumulo != null && accumulo.isEnabled();
    }

    public AccumuloConfig getAccumuloStoreConfig() {
        return accumulo;
    }

    public static class Builder {
        private NewGraph graph;
        private AccumuloConfig accumulo;

        public Builder() {
        }

        public Builder enableAccumulo() {
            this.accumulo = new AccumuloConfig().enable();
            return this;
        }

        public Builder graph(NewGraph graph) {
            this.graph = graph;
            return this;
        }

        public GraphSpec build() {
            GraphSpec graphSpec = new GraphSpec(this);
            validateUserObject(graphSpec);
            return graphSpec;
        }

        private void validateUserObject(GraphSpec graphSpec) {
            //Do some basic validations to check
            //if user object does not break any assumption of system
            if (graphSpec.accumuloIsEnabled()) {
                if (!graphSpec.graph.checkIfStorePropertyNull()) {
                    throw new IllegalArgumentException("Cannot specify an accumulo graph with store properties");
                }
            }
        }
    }
}