

# Kai: Graph as a service

## Docker

To run the UI React app in a docker container, follow the steps below:
Make sure you are in the UI directory when running the commands.

* `docker -v` to check whether you have docker installed, if not visit: (https://docs.docker.com/get-docker/)
* `docker-compose version` to check whether you have docker-compose installed
* `docker build -t kai-ui-image:latest .` builds a production version of Kai as a docker container.
* `docker run -it -p 80:8081 --rm kai-ui-image:latest` runs the UI application on port 8081 within the container, which is mapped to the host's port 80
* `docker-compose up` runs the UI app on port 80 in production mode (by default it uses .env variables - you can also specify other .env files with `--env-file` arg)
* `docker ps` lists all running docker containers.
* `docker images` will show all top level images, their repository and tags, and their size.
* `docker stop [CONTAINER ID]` stops the specified running container by CONTAINER_ID (can be found with `docker ps` command).
* `docker logs -f [container ID]` shows a log of the actions happening to the UI container.

Once the process has finished, visit (http://localhost:80), where you will be able to see the UI.

## Deploying To Kubernetes

#### AWS (EKS Cluster)

##### Optional: Push the Docker image to ECR (Elastic Container Registry)

You can push your Docker image to AWS's Docker registry. To create a registry to push your image to:

1. Login to the ECR on your account using the command
`aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.[region].amazonaws.com`

*Optional - if you need to create a repository in ECR, use the following command:
```
aws ecr create-repository \
    --repository-name [REPOSITORY_NAME] \
    --image-scanning-configuration scanOnPush=true \
    --region [REGION]
```

2. Tag your local built image with your ECR registry location:  `docker tag [IMAGE_ID TAG] [ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/[REGISTRY_NAME]`

3. Push your image to the newly created registry
`docker push [ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/[NEW_REGISTRY_NAME]`

4. You can confirm it has successfully pushed by pulling the image down from the registry url successfully or logging in to the AWS console and manually checking the image in the ECR service

#### Deploying a Docker Image to an EKS Cluster

1. Create a kubernetes cluster in EKS with the `eksctl create cluster` command (addtional options `-n [CLUSTER_NAME]` `-r [REGION]`)

2. Use the [deployment.yml](./kubernetes/deployment.yml) to tell your EKS cluster how to deploy the Kai UI image to it using the command
`kubectl apply -f ./kubernetes/deployment.yml`
**ensure the .yml's Deployment containers image is pointing to the correct registry and `targetPort` matches the same port exposed in the Dockerfile so it is able to forward traffic to the correct Docker container port*

3. Check the images are successfully deployed by checking the pods are running
`kubectl get pods -o wide`

4. To access your Docker container app, you can get the url with the below command and request the EXTERNAL IP created to get the Kai UI App
`kubectl get svc -o wide`

#### (Useful Kubernetes Commands)
* `kubectl create -f <file>` - to create objects. E.g. to create the deployment service run the command: `kubectl create -f kai-deployment-service.yml`.
* `kubectl apply -f <file>` - to update existing objects. E.g. to update the deployment service created earlier, run the command: `kubectl apply -f kai-deployment-service.yml`.
* `kubectl delete [deployments|services|pods|nodes|etc]/[name_of_object]` -  to delete objects. E.g to delete a deploymnet, run the command `kubectl delete deployments/kai-ui-deployment`. 
* `kubectl get [deployments|services|pods|nodes|etc]` - to get a list of all the instances of the chosen resource currently ruunning in your cluster.
* `kubectl describe [deployments|services|pods|nodes|etc]` - to get details on the chosen resource currently running in your cluster.

For more commands, visit: (https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

## Available Scripts in UI Directory

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode. Open [http://localhost:8080](http://localhost:8080) to view it in the browser.
The page will reload if you make edits and you will also see any lint errors in the console.<br />

It also uses [Concurrently](https://www.npmjs.com/package/concurrently) to run a mock Kai Rest Api on port 5000 for the 
UI to send requests to. You can edit the example HTTP Responses for each endpoint in [middleware.js](./server/middleware.js).
It runs on an Express server so here are the support [Response docs](http://expressjs.com/en/5x/api.html#res).

#### `npm client`

Runs only the UI app in development without a dev backend and therefore will make via proxy.

#### `npm test`

Runs all tests with a coverage report. 

#### `npm watch`

Jest will launch all tests in watch mode. Every time you save a file, it will re-run the tests.<br />

You can specify a test file to run by using the `-p` option and the name (or directory name) tests you want to run. 

#### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### `npm run build-with-env`
Passes the variables in the .env files as environment variables to the scripts in the buildWithEnv.sh file.

The scripts in the buildWithEnv.sh file do the following:
* Check whether the `REACT_APP_API_PLATFORM` variable is empty
* If it is empty, it returns: `REACT_APP_API_PLATFORM is unset`
* If it is not empty, it runs the `react-scripts build` command, which has the same outcome as the `npm run build` script above

The purpose of this command is to validate whether an API platform has been set for Kai to use.
## AWS Integration

For production mode and build, a .env file must be configured for the following key/values to integrated with the deployed API and it's User Pool that you want to interface with:

```
REACT_APP_KAI_REST_API_HOST=https://my-example-api-gateway.amazonaws.com 
REACT_APP_COGNITO_USERPOOLID=eu-west-2_example123
REACT_APP_COGNITO_CLIENTID=abc123
```

#### Cognito Integration

The UI App must be authorise a User by retreiving a JWT (JSON Web Token) from Cognito and setting this in the API's request headers as `Authorisation` so that the API returns a successful response. It is configured by supplying the User Pool ID and Client ID created after deployment.

For dev mode it is configured by entering these values in [cognito-config.js](./src/rest/cognito-config.ts) and if production mode it can be configured as in [.env](./.env) file.

#### API Integration

To point this UI app to an Kai's API endpoint, assign the base endpoint for the environment variable `REACT_APP_KAI_REST_API_HOST`
in the [.env](./.env) file. 

The app has to run in Production mode (the build will use `NODE_ENV=production`) to send requests to Kai's API endpoint.
In Dev mode, it will use proxy endpoint which is set up to use localhost:5000 where a Dev mock Kai API can
be served.

## Notes

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
