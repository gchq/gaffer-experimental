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

import uk.gov.gchq.gaffer.common.model.v1.Gaffer;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_API_PATH_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.INGRESS_HOST_KEY;

public class GraphUrl {

    private static final String HTTP_PROTOCOL = "http://";

    public static GraphUrl from(final Gaffer gaffer) {
        final GafferSpec spec = gaffer.getSpec();
        return new GraphUrl(spec.getNestedObject(INGRESS_HOST_KEY).toString(), spec.getNestedObject(INGRESS_API_PATH_KEY).toString());
    }

    private String root;
    private String host;

    public GraphUrl(final String host, final String root) {
        this.host = host;
        this.root = root;
    }

    public String buildUrl() {
        return HTTP_PROTOCOL + host + root;
    }
}
