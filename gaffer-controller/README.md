Gaffer Controller
=======================

The Gaffer Controller watches for changes in Gaffer resources and deploys them
using the Gaffer Helm chart. It uses two docker images, one for the controller and one for a worker which carries
out helm commands.

## Deployment Prerequisites
* A kubernetes cluster
* kubectl
* helm
* docker

## Build and run tests:
```bash
# From the base of the project
mvn clean install -pl :gaffer-controller
```

## How to run on a local Kind image

```bash
cd gaffer-controller
docker build -t gchq/gaffer-controller:latest .
docker build -t gchq/gaffer-worker:latest ./worker

kind load docker-image gchq/gaffer-controller:latest
kind load docker-image gchq/gaffer-worker:latest

helm install gaffer-controller ./deploy/helm
```

## Deploy a Gaffer Graph using the controller
```bash
kubectl apply example/add-gaffer.yaml
```

## Single deployment vs Multiple deployment
You can either deploy the controller as a single entity which watches Gaffer instances across the whole cluster, 
or as a per-namespace deployment which only controls instances for that specific namespace. Whatever you choose will
be dependent on your needs and rules for the cluster your working with.

the default scope setting is namespace (multiple deployments) but you can change it:
```bash
helm install gaffer-controller ./deploy/helm --set controller.applicationProperties."controller\.scope.\.cluster"=true
```
