# GaaS-Sidecar
This application runs alongside the GaaS-Rest service and provides authentication for rest. The authentication method of this sidecar is JWT.

## Building an Image
In order to build and push an image to dockerhub run the following command:

`mvn clean install -DbuildType=build -DimageName=[IMAGE_NAME] -DuserName=[YOUR_DOCKER_USERNAME]`

## Deploying to OpenShift
1) Build an image as detailed in the "Building an Image" section.
2) Add the image to the GaaS-Rest helm deployment as a separate container.

This application is not designed to be run/deployed as a standalone application. It must be run/deployed in conjunction with GaaS-Rest
as it does not serve any purpose other than to authenticate users who wish to access rest.