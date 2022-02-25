/*
 * Copyright 2022 Crown Copyright
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

package uk.gov.gchq.gaffer.gaas.handlers;

import org.junit.jupiter.api.Test;
import uk.gov.gchq.gaffer.gaas.util.UnitTest;
import java.util.ArrayList;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static uk.gov.gchq.gaffer.gaas.util.Constants.HELM_SET_FLAG;

@UnitTest
public class HelmValuesOverridesHandlerTest {
    @Test
    public void shouldAddKeyValueToHashmapAndReturnStringList() {
        HelmValuesOverridesHandler helmValuesOverridesHandler = new HelmValuesOverridesHandler();
        helmValuesOverridesHandler.addOverride("myKey", "myValue");
        ArrayList<String> expectedList = new ArrayList<>();
        ArrayList<String> list = new ArrayList<>();
        expectedList.add(HELM_SET_FLAG);
        expectedList.add("myKey=myValue");
        assertEquals(expectedList, helmValuesOverridesHandler.helmOverridesStringBuilder(list));
    }
}
