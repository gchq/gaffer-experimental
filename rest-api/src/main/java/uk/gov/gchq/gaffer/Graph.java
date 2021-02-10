package uk.gov.gchq.gaffer;

public class Graph {

	private  String graphId;
	private  String description;



	public Graph() {
	}
	public Graph(String graphId, String description) {
		this.graphId = graphId;
		this.description = description;
	}


	public  void setGraphId(String graphId) {
		this.graphId = graphId;
	}

	public String getGraphId() {
		return graphId;
	}

	public String getDescription() {
		return description;
	}

	public  void setDescription(String description) {
		this.description = description;
	}

	@Override
	public String toString() {
		return "{\"graphId\":\"graphId\",\"description\":\"description\"}";
	}
}