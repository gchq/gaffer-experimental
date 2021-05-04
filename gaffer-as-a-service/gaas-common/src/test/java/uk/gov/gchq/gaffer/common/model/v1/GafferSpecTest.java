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


package uk.gov.gchq.gaffer.common.model.v1;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GafferSpecTest {

    @Test
    public void shouldRejectNullKeys() {
        // Given
        GafferSpec gafferSpec = new GafferSpec();
        // When
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> gafferSpec.putNestedObject("myValue", (String[]) null));

        // Then
        assertNotNull(exception.getMessage());
    }

    @Test
    public void shouldBeAbleToSetNestedKeys() {
        // Given
        GafferSpec gafferSpec = new GafferSpec();
        // When
        gafferSpec.putNestedObject("value", "my", "nested");

        // Then
        assertEquals("value", ((Map) gafferSpec.get("my")).get("nested"));
    }

    @Test
    public void shouldBeAbleToRetrieveNestedKeys() {
        // Given
        GafferSpec gafferSpec = new GafferSpec();

        // When
        gafferSpec.putNestedObject("value", "my", "nested");

        // Then
        assertEquals("value", gafferSpec.getNestedObject("my", "nested"));
    }

    @Test
    public void shouldReturnNullIfPathIsWrong() {
        // Given
        GafferSpec gafferSpec = new GafferSpec();

        // When
        gafferSpec.putNestedObject("value", "my", "nested");

        // Then
        assertNull(gafferSpec.getNestedObject("your", "nested"));
        assertNull(gafferSpec.getNestedObject("my", "other"));
        assertNull(gafferSpec.getNestedObject("my", "nested", "thing"));
    }
}
