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

package uk.gov.gchq.gaffer.gaas.sidecar.models;

import java.util.ArrayList;
import java.util.Map;

public class WhatAuthResponse {
    public WhatAuthResponse(final Map<String, String> attributes, final ArrayList<String> requiredFields, final Map<String, String> requiredHeaders) {
        this.attributes = attributes;
        this.requiredFields = requiredFields;
        this.requiredHeaders = requiredHeaders;
    }

    public Map<String, String> getAttributes() {
        return attributes;
    }

    public void setAttributes(final Map<String, String> attributes) {
        this.attributes = attributes;
    }

    public ArrayList<String> getRequiredFields() {
        return requiredFields;
    }

    public void setRequiredFields(final ArrayList<String> requiredFields) {
        this.requiredFields = requiredFields;
    }

    public Map<String, String> getRequiredHeaders() {
        return requiredHeaders;
    }

    public void setRequiredHeaders(final Map<String, String> requiredHeaders) {
        this.requiredHeaders = requiredHeaders;
    }

    private Map<String, String> attributes;
    private ArrayList<String> requiredFields;
    private Map<String, String> requiredHeaders;


}
