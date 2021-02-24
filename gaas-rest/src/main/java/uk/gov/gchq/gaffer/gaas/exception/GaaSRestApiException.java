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
    private String details;

    public GaaSRestApiException(final String message, final String reason, final int code) {
        super(message);
        this.reason = reason;
        this.code = code;
        this.message = message;
        this.details = null;
    }

    public GaaSRestApiException(final String message, final String reason, final String details, final int code) {
        super(message);
        this.reason = reason;
        this.code = code;
        this.message = message;
        this.details = details;
    }

    public GaaSRestApiException(final String message, final String reason) {
        super(message);
        this.reason = reason;
        this.code = 0;
    }

    public String getMessage() {
        return this.message;
    }

    public String getBody() {
        return reason;
    }

    public int getStatusCode() {
        return code;
    }
}
