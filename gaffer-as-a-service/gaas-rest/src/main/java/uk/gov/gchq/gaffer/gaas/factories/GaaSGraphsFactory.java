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

import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferList;
import uk.gov.gchq.gaffer.controller.model.v1.RestApiStatus;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import static uk.gov.gchq.gaffer.gaas.util.Constants.DESCRIPTION_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.GRAPH_ID_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_API_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_HOST_KEY;

public final class GaaSGraphsFactory {

    private static final String URL_PROTOCOL = "http://";
    private static final String DEFAULT_VALUE = "n/a";

    public static List<GaaSGraph> from(final GafferList gafferList) {

        final List<Gaffer> gaffers = (List<Gaffer>) gafferList.getItems();

        return gaffers.stream()
                .filter(gaffer -> gaffer.getSpec() != null && gaffer.getSpec().getNestedObject(GRAPH_ID_KEY) != null)
                .map(GaaSGraphsFactory::getGaaSGraph)
                .collect(Collectors.toList());
    }

    public static GaaSGraph from(final Gaffer gaffer) {
        return getGaaSGraph(gaffer);
    }

    private static GaaSGraph getGaaSGraph(Gaffer gaffer) {
        return new GaaSGraph()
                .graphId(gaffer.getSpec().getNestedObject(GRAPH_ID_KEY).toString())
                .description(getDescription(gaffer))
                .url(getUrl(gaffer))
                .status(getStatus(gaffer))
                .problems(getProblems(gaffer));
    }

    private static String getDescription(final Gaffer gaffer) {
        return gaffer.getSpec().getNestedObject(DESCRIPTION_KEY) != null ? gaffer.getSpec().getNestedObject(DESCRIPTION_KEY).toString() : DEFAULT_VALUE;
    }

    private static String getUrl(final Gaffer gaffer) {
        if (gaffer.getSpec().getNestedObject(INGRESS_HOST_KEY) == null || gaffer.getSpec().getNestedObject(INGRESS_API_PATH_KEY) == null) {
            return DEFAULT_VALUE;
        }
        return URL_PROTOCOL + gaffer.getSpec().getNestedObject(INGRESS_HOST_KEY).toString() + gaffer.getSpec().getNestedObject(INGRESS_API_PATH_KEY).toString();
    }

    private static RestApiStatus getStatus(final Gaffer gaffer) {
        return gaffer.getStatus() != null && gaffer.getStatus().getRestApiStatus() != null ? gaffer.getStatus().getRestApiStatus() : RestApiStatus.DOWN;
    }

    private static List<String> getProblems(final Gaffer gaffer) {
        return gaffer.getStatus() != null && gaffer.getStatus().getProblems() != null ? gaffer.getStatus().getProblems() : new ArrayList<String>();
    }


    private GaaSGraphsFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
