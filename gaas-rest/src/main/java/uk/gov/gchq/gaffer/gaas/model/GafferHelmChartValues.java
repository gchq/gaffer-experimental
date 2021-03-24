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

/**
 * GafferHelmValues is the helm Values object that is passed in to Gaffer's helm chart that deploys Gaffer to Kubernetes.
 * <p>
 * See <a href="https://github.com/gchq/gaffer-docker/blob/develop/kubernetes/gaffer/values.yaml">values.yaml</a> for
 * the default helm chart values and documentation how Gaffer is deployed to Kubernetes via helm.
 *
 * @see <a href="https://github.com/gchq/gaffer-docker/blob/develop/kubernetes/gaffer/values-federated.yaml">Federated Store overrides</a>
 * for more Gaffer store configuration overrides:
 */
public final class GafferHelmChartValues {

    private final NewGraph graph;
    private final AccumuloConfig accumulo;

    private GafferHelmChartValues(final Builder builder) {
        this.graph = builder.graph;
        this.accumulo = builder.accumulo;
    }

    public NewGraph getGraph() {
        return graph;
    }

    public AccumuloConfig getAccumuloStoreConfig() {
        return accumulo;
    }

    public boolean accumuloIsEnabled() {
        return accumulo != null && accumulo.isEnabled();
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

        public Builder graph(final NewGraph graph) {
            this.graph = graph;
            return this;
        }

        public GafferHelmChartValues build() {
            final GafferHelmChartValues helmValues = new GafferHelmChartValues(this);
            validateUserObject(helmValues);
            return helmValues;
        }

        private void validateUserObject(final GafferHelmChartValues helmValues) {
            if (helmValues.accumuloIsEnabled() && helmValues.getGraph().getStoreProperties() != null) {
                throw new IllegalArgumentException("Cannot specify an accumulo graph with store properties");
            }
        }
    }
}
