GaaS REST
=======================

The Gaffer-as-a-Service REST API services requests to create, get and delete graphs.


## Using jib plugin to build and push images
The docker image built by Jib plugin you can change the default image using configuration

#To build docker image locally

mvn clean install -DbuildType=dockerBuild -DimageName= -DuserName= -DcredHelper=


# To build docker image and push to docker repository
mvn clean install -DbuildType=build -DimageName=[IMAGE_NAME] -DuserName=[YOUR_DOCKER_USERNAME] -DcredHelper=


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

## Prometheus Tests

1. Ensure prerequisites are met
2. Login to the oc client using the `oc login` command via terminal
3. Add the available OpenShift namespace name to /application.properties for the value `namespace`
4. Run `mvn clean install -pl :gaas-rest -Popenshift-deploy`

## Deploying Prometheus to OpenShift
1. Go to gaffer-as-a-service/gaas-common/prometheus/
2. In the openshift-prometheus.yaml file edit the final line `- targets: ['localhost:8080']`, the `localhost` part can be changed into a specific service that already exists in the same namespace.
3. In the command line type in: `oc apply -f openshift-prometheus.yaml`. This should deploy to OpenShift.
4. You may have permission issues with the service account being used, it may need read/write permissions to specific directories in the container.(`oc adm policy add-scc-to-user USERID -z default`)
## Prometheus Endpoints

### check  prometheus targets

click Status dropdowns and select Targets

http://example-url/targets

the correct endpoint should be for now: {}/actuator/prometheus

Test Rest API via postman or Kai UI
## REST Endpoints

#### Create A Graph
POST `/graph`

Request Body:
```json
{
  "graphId": "Example ID", 
  "description": "Some description",
  "storeType":"accumuloStore"
}
```

#### Get All Graphs
GET `/graph`

#### Delete A Graph

DELETE `/graph/{graphId}`

#### prometheus Graph
http://prometheus-kai-dev.apps.ocp1.purplesky.cloud/graph


#### Create A Graph
search {CreateGraphService_total} or {createGraph_time_seconds} and execute and click Graph tab.
to return the 5minute rate that {CreateGraphService_total} of
rate(CreateGraphService_total[5m])

#### Get All Graphs
search {GetGafferService_total} or {getAllGraphs_time_seconds} and execute and click Graph tab.
to return the 5minute rate that {GetGafferService_total} of
rate(GetGafferService_total[5m])

For Delete operation
search {DeleteGraphService_total} or {deleteGraph_time_seconds} and execute and click Graph tab.
to return the 5minute rate that {DeleteGraphService_total} of
rate(DeleteGraphService_total[5m])
