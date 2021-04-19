GaaS REST
=======================

The Gaffer-as-a-Service REST API services requests to create, get and delete graphs.


## Swagger UI

Run the Spring Boot app locally and access the Swagger dashboard at 
http://localhost:8080/swagger-ui/


## OpenShift Deployment

#### Deployment Prerequisites

* OpenShift cluster
* OpenShift namespace
* Openshift CLI (oc client)


#### Steps

1. Ensure prerequisites are met 
2. Login to the oc client using the `oc login` command via terminal 
2. Add the available OpenShift namespace name to /application.properties for the value `namespace`
3. Run `mvn clean install -pl :gaas-rest -Popenshift-deploy`

## REST Endpoints

#### Create A Graph
POST `/graph`

Request Body:
```json
{
  "graphId": "Example ID", 
  "description": "Some description"
}
```

#### Get All Graphs
GET `/graph`

#### Delete A Graph

DELETE `/graph/{graphId}`


## Authentication

#### Dev Mode:
When running the API in dev mode, use the 'dev' login details to access the graph endpoints.

Username: javainuse

Password: password


## Integration Tests

Steps to run both OpenShift integration and end-to-end tests (only). This command uses the failsafe plugin and will run 
all test classes whose name starts or ends with <i>IT</i>.

1. `oc login` to an OpenShift cluster
2. Set the correct namespace in application.properties
3. Run `mvn verify -pl :gaas-rest -Pintegration-test`
