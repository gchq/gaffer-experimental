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

package uk.gov.gchq.gaffer.gaas.factories;

import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.federatedstore.operation.AddGraph;
import uk.gov.gchq.gaffer.gaas.SpringContext;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.stores.AbstractStoreTypeBuilder;
import static uk.gov.gchq.gaffer.common.util.Constants.GROUP;
import static uk.gov.gchq.gaffer.common.util.Constants.VERSION;

/**
 * GafferHelmValuesFactory is a factory class that creates a Gaffer Helm Values Object that can be passed to the
 * Kubernetes java client and use helm to deploy a Gaffer custom resource instance to a Kubernetes cluster..
 * <p>
 * See <a href="https://github.com/gchq/gaffer-docker/blob/develop/kubernetes/gaffer/values.yaml">values.yaml</a> for
 * the default helm chart values and documentation how Gaffer is deployed to Kubernetes via helm.
 *
 * @see <a href="https://github.com/gchq/gaffer-docker/blob/develop/kubernetes/gaffer/values-federated.yaml">Federated Store overrides</a>
 * for more Gaffer store configuration overrides:
 */
public final class GafferHelmValuesFactory {

    private static final String KIND = "Gaffer";
    private static final String DEFAULT_SYSTEM_USER = "GAAS_SYSTEM_USER";

    public static Gaffer from(final GaaSCreateRequestBody graph) {

        // TODO: Validate only - and . special characters, see Kubernetes metadata regex
        final V1ObjectMeta metadata = new V1ObjectMeta().name(graph.getGraphId());

        return new Gaffer()
                .apiVersion(GROUP + "/" + VERSION)
                .kind(KIND)
                .metaData(metadata)
                .spec(createGafferSpecFrom(graph));
    }

    private static GafferSpec createGafferSpecFrom(final GaaSCreateRequestBody graph) {

        AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(SpringContext.class);

        StoreTypeFactory storeTypeFactory = context.getBean(StoreTypeFactory.class);

        final AbstractStoreTypeBuilder builder = storeTypeFactory.getBuilder(graph.getStoreType())
                .setGraphId(graph.getGraphId())
                .setDescription(graph.getDescription())
                .addOperationAuthoriser(AddGraph.class, DEFAULT_SYSTEM_USER)
                .setSchema(graph.getSchema())
                .setProperties(graph.getStoreProperties());
        return builder.build();

    }

    private GafferHelmValuesFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
