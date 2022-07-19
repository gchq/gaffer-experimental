GaaS REST Documentation
=======================

The Gaffer-as-a-Service REST API services requests to create, get and delete graphs.

## Building gaas-rest 
To build gaas-rest without needing to build the entire of gaffer-as-a-service run the command `mvn clean install -pl gaas-rest -am` from the `gaffer-as-a-service` directory. 
This command will build gaas-rest with any projects it depends on.

## Using jib plugin to build and push images
The docker image built by Jib plugin you can change the default image using configuration

#To build docker image locally

mvn clean install -DbuildType=dockerBuild -DimageName= -DuserName= -DcredHelper=


# To build docker image and push to docker repository
mvn clean install -DbuildType=build -DimageName=[IMAGE_NAME] -DuserName=[YOUR_DOCKER_USERNAME] -DcredHelper=


## Swagger UI

Run the Spring Boot app locally and access the Swagger dashboard at 
http://localhost:8080/swagger-ui/

## Java Code Coverage with JaCoCo Instructions
To generate a code coverage report run the command: `mvn -B verify -P coverage`
The coverage report can be found at: `target/site/jacoco/index.html`

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
1. Go to gaffer-as-a-service-tools/
2. In the openshift-prometheus.yaml file edit the final line `- targets: ['localhost:8080']`, the `localhost` part can be changed into a specific service that already exists in the same namespace in your cluster. E.g. if the name of your service is test-service you can change the target to `- targets: ['test-service:8080']`.
3. In the command line type in: `oc apply -f openshift-prometheus.yaml`. This should deploy to OpenShift.
4. You may have permission issues with the service account being used, it may need read/write permissions to specific directories in the container. (`oc adm policy add-scc-to-user USERID -z default`)
## Prometheus Endpoints

### check  prometheus targets

click Status dropdown and select Targets

http://example-url/targets

the correct endpoint should be: [http://your_service:8080]/actuator/prometheus

Test Rest API via postman or Kai UI

How to Access Event Logs on OpenShift
=======================
1. Log in to OpenShift using `oc login [token]`.
2. Get name of pod where gaas-rest is running using `oc get pods`.
3. Run `oc port-forward [podName] 8080`. This forwards the pod port 8080 (where GaaS-Rest runs) to localhost:8080.
4. Go to `http://localhost:8080/h2-console/`
5. Ensure that URL field in h2 console page is set to `jdbc:h2:file:./logs/logDB`
6. Log in using username and password

How to Access Swagger On OpenShift
=======================
1. Log in to OpenShift using `oc login [token]`.
2. Get name of pod where gaas-rest is running using `oc get pods`.
3. Run `oc port-forward [podName] 8080`. This forwards the pod port 8080 (where GaaS-Rest runs) to localhost:8080.
4. Go to `http://localhost:8080/swagger-ui/index.html`
5. The swagger UI will then be accessible

GaaS Endpoint Documentation
=======================

This section of documentation aims to provide explanations of the GaaS endpoints as well as example requests and responses to these endpoints.

# Authentication

Authentication is done in the sidecar components and not in GaaS-Rest. Therefore, you should check the documentation of the sidecar
which is being used in conjunction with GaaS-Rest in order to know how authentication works. 

# /gaas-rest-service/graphs
This endpoint has 2 operations which can be performed on it - GET and POST

## Get Graphs
Returns a list of graphs which are running in the cluster

`GET localhost:8081/gaas-rest-service/graphs`

Example request using cURL (using the JWT sidecar with bearer token authentication):
```
curl --location --request GET 'localhost:8081/gaas-rest-service/graphs' \
 --header 'Authorization: Bearer abc123.abc123.CDEFG456789' \
 --header 'Content-Type: application/json' \
```

An example of an empty response indicating that there are no graphs in the cluster which could be retrieved: 
```
HTTP Status: 200
{
    "graphs": []
}
```

An example of a response returning a list of graphs in the cluster:

```
HTTP Status: 200
{
    "graphs": [
        {
            "graphId": "myexamplegraph",
            "description": "An example graph",
            "url": "http://myexamplegraph-namespace.apps.k8s.example.com/ui",
            "status": "UP",
            "problems": null,
            "configName": "mapStore",
            "restUrl": "https://myexamplegraph-namespace.apps.k8s.example.com/rest"
        }
    ]
}
```

## Create (POST) Graphs
Creates a graph based on the passed in parameters. 

`POST localhost:8081/gaas-rest-service/graphs`

The data which must be passed to the POST request:

| Field          | Type           |  Description                                    | Optional           |
| :------------ :|:------------- :| : -------------------------------------------- :| :------------- :|
| graphId        | String         |   This is the name of your graph                 | No
| description    | String         |   This is the description of your graph         | No
| configName     | String         |   The type of graph e.g accumulo or mapStore   | No
| schema         | Object         |   The schema which will be used by the graph   | Yes (Not used by federatedStore)
| proxySubGraphs | Object         |   The proxy sub graphs which will be used by the graph   | Yes (Only used by federatedStore)

Example request using cURL (using the JWT sidecar with bearer token authentication) to create a mapStore graph with a basic schema:
```
curl --location --request POST 'localhost:8081/gaas-rest-service/graphs' \
--header 'Authorization: Bearer abc123.abc123.CDEFG456789' \
--header 'Content-Type: application/json' \
--data-raw '{
   "graphId":"myexamplegraph",
   "description":"An example graph",
   "configName":"mapStore",
   "schema": {
    "edges": {
        "BasicEdge": {
            "source": "vertex",
            "destination": "vertex",
             "description":"BasicEdge",
            "directed": "true",
            "properties": {
                "count": "count"
            }
        }
    },
    "entities": {
        "BasicEntity": {
            "vertex": "vertex",
             "description":"BasicEntity",
            "properties": {
                "count": "count"
            }
        }
    },
    "types": {
        "vertex": {
            "class": "java.lang.String"
        },
        "count": {
            "class": "java.lang.Integer",
            "aggregateFunction": {
                "class": "uk.gov.gchq.koryphe.impl.binaryoperator.Sum"
            }
        },
        "true": {
            "description": "A simple boolean that must always be true.",
            "class": "java.lang.Boolean",
            "validateFunctions": [
                { "class": "uk.gov.gchq.koryphe.impl.predicate.IsTrue" }
            ]
        }
    }
}
}'
```
Example request using cURL (using the JWT sidecar with bearer token authentication) to create a federatedStore graph with a proxy subgraph:
```
{
   "graphId":"myexamplefederatedgraph",
   "description":"A Federated Store",
   "configName":"federated",
   "proxySubGraphs":[
      {
         "graphId":"myproxygraph",
         "host":"myproxygraph-namespace.apps.k8s.example.com",
         "root":"/rest"
      }
   ]
}
```

A successful POST should return:

```
HTTP Status: 201
```

This simply indicates that the graph was created successfully. 

# /gaas-rest-service/graphs/{graphId}

Deletes a graph given the ID of a graph. This will delete the graph as well as all its associated resouces in the cluster.

`DELETE /gaas-rest-service/graphs/{graphId}`

Example request using cURL (using the JWT sidecar with bearer token authentication):

```
curl --location --request DELETE 'localhost:8081/gaas-rest-service/graphs/myexamplegraph' \
--header 'Authorization: Bearer abc123.abc123.CDEFG456789'
```

A successful DELETE should return:

```
HTTP Status: 204
```

This indicates that the DELETE operation was successful. 

# /gaas-rest-service/storetypes

Returns a list of storetypes which are supported by the API.

`GET /gaas-rest-service/storetypes`

Example request using cURL (using the JWT sidecar with bearer token authentication):

```
curl --location --request GET 'localhost:8081/gaas-rest-service/storetypes' \
--header 'Authorization: Bearer abc123.abc123.CDEFG456789'
```

A successful GET should return:

```
HTTP Status: 200
{
    "storeTypes": [
        {
            "name": "accumulo",
            "parameters": [
                "schema"
            ]
        },
        {
            "name": "federated",
            "parameters": [
                "proxies"
            ]
        },
        {
            "name": "mapStore",
            "parameters": [
                "schema"
            ]
        }
    ]
}
```

This list shows the store types which can be used to create a graph as well as the parameters they require.

Miscellaneous Notes
=======================
- If you want to install a specific chart version this can be done by adding a "--version" flag to the helm install
which occurs in KubernetesObjectFactory.java. Following the --version flag you must specify the version you want to use for example
--version 0.17.1 Currently, the helm install deploys the latest version by default.
