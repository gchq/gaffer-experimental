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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.stores.AbstractStoreTypeBuilder;
import uk.gov.gchq.gaffer.gaas.stores.StoreType;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StoreTypeFactory {

    private final List<StoreType> storeTypes;

    @Autowired
    public StoreTypeFactory(final List<StoreType> storeTypes) {
        this.storeTypes = storeTypes;
    }

    public AbstractStoreTypeBuilder getBuilder(final String type) {
        for (final StoreType storeTypes : storeTypes) {
            if (type.equalsIgnoreCase(storeTypes.getType())) {
                return storeTypes.getStoreSpecBuilder();
            }
        }
        final String storeTypesString = storeTypes.stream()
                .map(StoreType::getType).collect(Collectors.joining(", "));
        throw new RuntimeException("StoreType is Invalid must be defined Valid Store Types supported are: " + storeTypesString);
    }
}
