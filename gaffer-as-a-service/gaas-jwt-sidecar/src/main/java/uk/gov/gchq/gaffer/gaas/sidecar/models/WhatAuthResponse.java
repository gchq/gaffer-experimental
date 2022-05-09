package uk.gov.gchq.gaffer.gaas.sidecar.models;

import java.util.ArrayList;
import java.util.Map;

public class WhatAuthResponse {
    public WhatAuthResponse(Map<String,String> attributes, ArrayList<String> requiredFields, Map<String, String> requiredHeaders){
        this.attributes = attributes;
        this.requiredFields = requiredFields;
        this.requiredHeaders = requiredHeaders;
    }

    public Map<String, String> getAttributes() {
        return attributes;
    }

    public void setAttributes(Map<String, String> attributes) {
        this.attributes = attributes;
    }

    public ArrayList<String> getRequiredFields() {
        return requiredFields;
    }

    public void setRequiredFields(ArrayList<String> requiredFields) {
        this.requiredFields = requiredFields;
    }

    public Map<String, String> getRequiredHeaders() {
        return requiredHeaders;
    }

    public void setRequiredHeaders(Map<String, String> requiredHeaders) {
        this.requiredHeaders = requiredHeaders;
    }

    private Map<String, String> attributes;
    private ArrayList<String> requiredFields;
    private Map<String,String> requiredHeaders;


}
