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
package uk.gov.gchq.gaffer.gaas.exception;

public class GaaSRestApiException extends Exception {
    private String body;
    private int statusCode;

    public GaaSRestApiException(final String message, final String body, final int statusCode) {
        super(message);
        this.body = body;
        this.statusCode = statusCode;
    }

    public GaaSRestApiException(final String message, final String body) {
        super(message);
        this.body = body;
        this.statusCode = 0;
    }

    public String getBody() {
        return body;
    }

    public int getStatusCode() {
        return statusCode;
    }
}