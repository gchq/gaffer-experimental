GaaS API Documentation
=======================

This document aims to provide explanations of the GaaS endpoints as well as example requests and responses to these endpoints.

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

| Field          | Type           |  Description   | 
| :------------- :|:-------------:| : -----:|
| graphId        | String         |  This is the name of your graph                 | 
| description    | String         |   This is the description of your graph         |
| configName     | String         |    The type of graph e.g accumulo or mapStore   |
| schema         | Object         |    The schema which will be used by the graph   |

Example request using cURL (using the JWT sidecar with bearer token authentication):
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

A successful POST should return:

```
HTTP Status: 201
```

This simply indicates that the graph was created successfully. 

# /gaas-rest-service/graphs/{graphId}

Deletes a graph given the ID of a graph.

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