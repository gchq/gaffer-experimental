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

package uk.gov.gchq.gaffer.gaas.util;

import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.model.v1.Gaffer;


import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class CommonUtilTest {

    @Test
    public void shouldReturnNullIfObjectIsNull() {
        assertNull(CommonUtil.convertToCustomObject(null, Object.class));
    }

    @Test
    public void shouldReturnTransformedObject() {
        // Given
        HashMap<Object, Object> map = new HashMap<>();
        HashMap<Object, Object> metadata = new HashMap<>();
        metadata.put("name", "my-graph");
        metadata.put("namespace", "my-gaffer-namespace");
        map.put("metadata", metadata);

        // When
        Gaffer gaffer = CommonUtil.convertToCustomObject(map, Gaffer.class);

        // Then
        assertEquals("my-graph", gaffer.getMetadata().getName());
        assertEquals("my-gaffer-namespace", gaffer.getMetadata().getNamespace());
    }

}
