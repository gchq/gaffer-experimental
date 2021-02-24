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
package uk.gov.gchq.gaffer.gaas.converters;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.kubernetes.client.openapi.ApiException;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CrdErrorResponseBody;

public class CrdExceptionHandler {

    public static void handle(final ApiException e) throws GaaSRestApiException {
        final Gson gson = new Gson();
        final JsonObject asJsonObject = new JsonParser().parse(e.getResponseBody()).getAsJsonObject();
        final CrdErrorResponseBody response = gson.fromJson(asJsonObject, CrdErrorResponseBody.class);
        throw new GaaSRestApiException(response.getMessage(), response.getReason(), e.getCode(), e);
    }

    protected CrdExceptionHandler() {
        throw new UnsupportedOperationException();
    }
}
