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

package uk.gov.gchq.gaffer.gaas.stores;

import com.google.gson.Gson;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import static uk.gov.gchq.gaffer.gaas.util.Constants.ACCUMULO_ENABLED_KEY;
import static uk.gov.gchq.gaffer.gaas.util.Constants.SCHEMA_FILE_KEY;

@Service
public class AccumuloStoreType implements StoreType {

    @Override
    public String getType() {
        return "accumuloStore";
    }

    @Override
    public AbstractStoreTypeBuilder getStoreSpecBuilder() {
        return new AccumuloStoreSpecBuilder();
    }

    private static final class AccumuloStoreSpecBuilder extends AbstractStoreTypeBuilder {

        @Override
        public GafferSpec build() {
            final GafferSpec gafferSpec = super.build();
            gafferSpec.putNestedObject(new Gson().toJson(getSchema()), SCHEMA_FILE_KEY);
            gafferSpec.putNestedObject(true, ACCUMULO_ENABLED_KEY);
            return gafferSpec;
        }
    }
}
