/*
 *
 *  * Copyright 2021 Crown Copyright
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package uk.gov.gchq.gaffer.gaas.factories;

import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import java.util.List;

abstract class AbstractStoreTypeBuilder {
    protected final GafferSpecBuilder gafferSpecBuilder;

    public AbstractStoreTypeBuilder() {
        this.gafferSpecBuilder = new GafferSpecBuilder();
    }

    public AbstractStoreTypeBuilder setGraphId(String graphId) {
        gafferSpecBuilder.setGraphId(graphId);
        return this;
    }
    public AbstractStoreTypeBuilder setDescription(String description) {
        gafferSpecBuilder.setDescription(description);
        return this;
    }

    public AbstractStoreTypeBuilder setStoreSpec(List<String> storeSpec) {
        gafferSpecBuilder.setStoreSpec(storeSpec);
        return this;
    }

    public AbstractStoreTypeBuilder setStoreProperties(final String storeType) {
        gafferSpecBuilder.setStoreType(storeType);
        return this;
    }

    // ingest etc

    public GafferSpec build() {
        return gafferSpecBuilder.build();
    }
}