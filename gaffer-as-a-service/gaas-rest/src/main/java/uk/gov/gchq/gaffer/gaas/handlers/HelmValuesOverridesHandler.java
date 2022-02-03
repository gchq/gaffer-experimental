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

import org.springframework.beans.factory.annotation.Autowired;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import static uk.gov.gchq.gaffer.gaas.util.Constants.HELM_SET_FLAG;

public class HelmValuesOverridesHandler {
    private final HashMap<String, String> hashMap = new HashMap<>();

    @Autowired
    public HelmValuesOverridesHandler() {
    }

    public void addOverride(final String key, final String value) {
        hashMap.put(key, value);
    }

    public ArrayList<String> helmOverridesStringBuilder(final ArrayList<String> list) {
        for (final Map.Entry<String, String> entry : hashMap.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            list.add(HELM_SET_FLAG);
            list.add(key + "=" + value);
        }
        return list;
    }

}
