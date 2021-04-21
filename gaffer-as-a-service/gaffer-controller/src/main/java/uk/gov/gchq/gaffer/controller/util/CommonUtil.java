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

package uk.gov.gchq.gaffer.controller.util;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import io.kubernetes.client.openapi.JSON;

public final class CommonUtil {

    private CommonUtil() {
        // Prevents instantiation
    }

    /**
     * Useful for interacting with Custom objects. Returns you the object in the class requested. This is useful
     * because Kubernetes objects tend to come back as a LinkedTreeSet which aren't particularly useful.
     * @param object The object you're trying to convert
     * @param clazz The class which you want it converted into
     * @param <T> The type which your're converting
     * @return Your object but serialised to the correct type
     */
    public static <T> T convertToCustomObject(final Object object, final Class<T> clazz) {
        if (object == null) {
            return null;
        }
        Gson gson = new JSON().getGson();
        JsonElement jsonElement = gson.toJsonTree(object);

        return gson.fromJson(jsonElement, clazz);
    }
}
