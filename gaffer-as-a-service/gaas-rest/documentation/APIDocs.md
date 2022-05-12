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
 --data-raw '{
     "username":"javainuse",
     "password":"password"
 }'
```

An example response from this request could be:

```
HTTP Status: 200
{
    "graphs": []
}
```

This request shows an empty response indicating that there are no graphs in the cluster which could be retrieved.

## Create (POST) Graphs
Creates a graph based on the passed in parameters. 