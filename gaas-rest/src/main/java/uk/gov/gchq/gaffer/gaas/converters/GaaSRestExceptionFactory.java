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
import com.google.gson.JsonSyntaxException;
import io.kubernetes.client.openapi.ApiException;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.CrdErrorResponseBody;

public final class GaaSRestExceptionFactory {

    private static final String MESSAGE_PREFIX = "Kubernetes Cluster Error: ";

    public static GaaSRestApiException from(final ApiException e) {

        if (e.getCode() == 401 && isEmpty(e.getMessage())) {
            return new GaaSRestApiException(MESSAGE_PREFIX + "Invalid authentication credentials for Kubernetes cluster", e.getCode(), e);
        }

        if (e.getResponseBody() != null && isValidJson(e.getResponseBody())) {
            final Gson gson = new Gson();
            final JsonObject asJsonObject = new JsonParser().parse(e.getResponseBody()).getAsJsonObject();
            final CrdErrorResponseBody response = gson.fromJson(asJsonObject, CrdErrorResponseBody.class);
            return new GaaSRestApiException(MESSAGE_PREFIX + "(" + response.getReason() + ") " + response.getMessage(), e.getCode(), e);

        } else {
            final String message = MESSAGE_PREFIX + e.getMessage();
            if (e.getResponseBody() != null) {
                message.concat(" " + e.getResponseBody());
            }
            return new GaaSRestApiException(message, e.getCode(), e);
        }
    }

    private static boolean isEmpty(final String string) {
        return string == null || string.isEmpty();
    }

    private static boolean isValidJson(final String possibleJson) {
        try {
            return new JsonParser().parse(possibleJson).isJsonObject();
        } catch (JsonSyntaxException e) {
            return false;
        }
    }

    private GaaSRestExceptionFactory() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
