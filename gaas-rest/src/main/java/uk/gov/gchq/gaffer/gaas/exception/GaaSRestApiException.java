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
    private String reason;
    private int code;
    private String message;

    public GaaSRestApiException(final String message, final String reason, final int code) {
        super(message);
        this.reason = reason;
        this.code = code;
    }

    public String getBody() {
        return reason;
    }

    public int getStatusCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
