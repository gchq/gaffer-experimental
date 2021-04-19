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

package uk.gov.gchq.gaffer.controller.model.v1;


import com.google.common.collect.Lists;

import javax.annotation.Nonnull;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * A representation of the Gaffer spec object. It extends a LinkedHashMap so that other values within the Gaffer
 * Helm chart can be used. The Helm chart is highly nested so the GafferSpec provides convenience methods for setting
 * and retrieving nested values.
 */
public class GafferSpec extends LinkedHashMap<String, Object> {

    /**
     * Nullsafe method for getting a nested object
     * @param keys the nested keys.
     * @return the value or null if not found.
     */
    public Object getNestedObject(@Nonnull final String... keys) {
        Object toReturn = this;
        for (final String key : keys) {
            if (toReturn == null) {
                return null;
            } else if (toReturn instanceof Map) {
                toReturn = ((Map) toReturn).get(key);
            } else {
                return null;
            }
        }

        return toReturn;
    }

    /**
     * Puts object into this Map. If the proceeding keys are not present, they will be created.
     * @param value The value you want to insert
     * @param keys The nested keys
     * @return true if successful, false if not.
     */
    public boolean putNestedObject(final Object value, final String... keys) {
        Map<String, Object> base = this;
        if (keys == null) {
            throw new IllegalArgumentException("Keys cannot be null");
        }
        List<String> baseKeys = Lists.newArrayList(keys);
        String finalKey = baseKeys.get(keys.length - 1);
        baseKeys.remove(keys.length - 1);

        for (final String key : baseKeys) {
            if (base.containsKey(key)) {
                Object newBase = base.get(key);
                if (newBase instanceof Map) {
                    base = (Map) newBase;
                } else {
                    // Can't proceed as one of the base keys is already defined and isn't a map
                    return false;
                }
            } else {
                base.put(key, new HashMap<String, Object>());
                base = (Map) base.get(key);
            }
        }

        base.put(finalKey, value);
        return true;
    }
}
