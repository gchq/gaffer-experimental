package uk.gov.gchq.gaffer.gaas.model;

import org.codehaus.jackson.annotate.JsonProperty;

public class GaaSAddCollaboratorRequestBody {
    @JsonProperty
    private String graphId;
    @JsonProperty
    private String collaborator;

    public GaaSAddCollaboratorRequestBody() {

    }

    public GaaSAddCollaboratorRequestBody(final String graphId, final String collaborator) {
        this.graphId = graphId;
        this.collaborator = collaborator;
    }

    public String getGraphId() {
        return graphId;
    }

    public String getCollaborator() {
        return collaborator;
    }
}
