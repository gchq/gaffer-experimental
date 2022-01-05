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

package uk.gov.gchq.gaffer.gaas.callback;

import io.kubernetes.client.openapi.ApiCallback;
import io.kubernetes.client.openapi.ApiException;
import java.util.List;
import java.util.Map;

/**
 * Just a shorthand way of doing a callback where implementations only have to handle success events through a single
 * handler. This allows for using lambda functions
 * @param <T> The type of object expected to be returned in a success event
 */
public interface SimpleApiCallback<T> extends ApiCallback<T> {

    void handle(final T result, final ApiException e);

    @Override
    default void onSuccess(T result, int statusCode, Map<String, List<String>> responseHeaders) {
        handle(result, null);
    }

    @Override
    default void onFailure(ApiException e, int statusCode, Map<String, List<String>> responseHeaders) {
        handle(null, e);
    }

    @Override
    default void onDownloadProgress(long bytesRead, long contentLength, boolean done) {
        // do nothing
    }

    @Override
    default void onUploadProgress(long bytesWritten, long contentLength, boolean done) {
        // do nothing
    }
}
