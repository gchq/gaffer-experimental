## Deploying Prometheus to OpenShift
1. Go to gaffer-as-a-service-tools/
2. In the openshift-prometheus.yaml file edit the final line `- targets: ['localhost:8080']`, the `localhost` part can be changed into a specific service that already exists in the same namespace in your cluster. E.g if the name of your service is test-service you can change the target to `- targets: ['test-service:8080']`.
3. In the command line type in: `oc apply -f openshift-prometheus.yaml`. This should deploy to OpenShift.
4. You may have permission issues with the service account being used, it may need read/write permissions to specific directories in the container.(`oc adm policy add-scc-to-user USERID -z default`)