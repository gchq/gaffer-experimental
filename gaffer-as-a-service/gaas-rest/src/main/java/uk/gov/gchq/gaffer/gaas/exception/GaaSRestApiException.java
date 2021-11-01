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

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.apache.commons.lang3.builder.ToStringBuilder;

public class GaaSRestApiException extends Exception {

    private String title;
    private int code;

    public GaaSRestApiException(final String title, final String message, final int code) {
        super(message);
        this.title = title;
        this.code = code;
    }

    public GaaSRestApiException(final String message, final int code, final Throwable cause) {
        super(message, cause);
        this.title = cause.getMessage();
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public int getStatusCode() {
        return code;
    }

    @Override
    public boolean equals(final Object o) {
        if (this == o) {
            return true;
        }

        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        GaaSRestApiException that = (GaaSRestApiException) o;

        return new EqualsBuilder().append(code, that.code).append(title, that.title).append(getMessage(), that.getMessage()).isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(17, 37)
                .append(title)
                .append(code)
                .append(getMessage())
                .toHashCode();
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("title", title)
                .append("message", super.getMessage())
                .append("code", code)
                .toString();
    }
}
