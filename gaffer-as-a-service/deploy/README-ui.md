# Copyright 2021-2022 Crown Copyright
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


## Kai: Helm Deployments

#### Openshift Production Deployment

1. Navigate to the UI directory

`$ cd ui/`

2. Login to Openshift. If logging in to the online console, you can select your username in the top right corner and use the 'Copy Login Command' feature to paste in to your terminal.

`$ oc login --token [TOKEN] --server [SERVER]`

3. Create a new project or select an existing one.

New Project: `$ oc new-project [PROJECT_NAME]`
(Optional: append a project display name and/or description `--display-name=[DISPLAYNAME] --description=[DESCRIPTION]`)

Existing Project: `$ oc project [PROJECT_NAME]`

4. Use the helmchart in ./deploy directory to deploy Kai to Openshift.

`$ helm install [NAME] helm`

(Optional: supply overrides with flags [`--set key=value`] or file `-f [FILE_NAME].yaml`)

If you any changes to the values in the helm chart you can run the following command to update the deployment

`$ helm upgrade --install [NAME] helm`

#### Dev Deployment With Mock Kai API

1. Follow steps 1 through to 3 from the OpenShift production deployment guide.

2. Run the `$ npm run server` script to start the express server

3. Use the helmchart in ./deploy directory to deploy Kai to Openshift with development variables enabled:

`$ helm install [NAME] helm --set envVariables.reactAPIPlatform="test" --set envVariables.kaiRestAPIHost="http://localhost:4000"`

If you make any changes to the values in the helm chart you can run the following command to update the deployment

`$ helm upgrade --install [NAME] helm --set envVariables.reactAPIPlatform="test" --set envVariables.kaiRestAPIHost="http://localhost:4000"`

