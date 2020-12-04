Gaffer Controller
=======================

The Gaffer Controller watches for changes in Gaffer resources and deploys them
using the Gaffer Helm chart.

## Deployment Prerequisites
* A kubernetes cluster
* kubectl
* helm
* docker

## Build and run tests:
```bash
mvn clean install
```

## How to run on a local Kind image

```bash
docker build -t gchq/gaffer-controller:latest
kind load docker-image gchq/gaffer-controller:latest
kubectl create namespace gaffer-workers
helm install gaffer-controller ./deploy/helm/gaffer-controller -n gaffer-workers
```

## Deploy a Gaffer Graph using the controller
```bash
kubectl apply example/add-gaffer.yaml
```
