#!/bin/bash

# Copyright 2020 Crown Copyright
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

set -e

function usage() {
    echo "Usage: ${0} <gaffer_version> <gaffer_docker_version> <docker_registry>" && exit 1
}

# Gets project root directory 
function getRootDirectory() {
    echo "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." >/dev/null 2>&1 && pwd)"
}

function init_project() {

    mkdir -p ${OPERATOR_BUILD_DIR} && rm -rf ${OPERATOR_BUILD_DIR}/*

    # Work around relative path from Gaffer Chart to HDFS Chart - otherwise this won't resolve. see https://github.com/gchq/gaffer-docker/issues/114
    cd ${OPERATOR_BUILD_DIR} && mkdir helm-charts
    wget -q https://github.com/gchq/gaffer-docker/releases/download/v${GAFFER_DOCKER_VERSION}/hdfs-${GAFFER_DOCKER_VERSION}.tgz -P helm-charts
    tar xvf helm-charts/hdfs-${GAFFER_DOCKER_VERSION}.tgz -C helm-charts

    operator-sdk init --plugins=helm.sdk.operatorframework.io/v1 \
        --project-name ${OPERATOR_NAME} \
        --domain=gaffer.gchq.gov.uk \
        --version=v1 \
        --helm-chart-repo https://gchq.github.io/gaffer-docker \
        --helm-chart gaffer \
        --helm-chart-version ${GAFFER_DOCKER_VERSION}
}

function init_kustomize() {
    cd ${OPERATOR_BUILD_DIR} && make kustomize
}

function build_and_push_operator() {
    # Configure additional permissions for the operator
    cat >> ${OPERATOR_BUILD_DIR}/config/rbac/role.yaml <<- EOF
- apiGroups: ["networking.k8s.io"]
  resources:
  - networkpolicies
  - ingresses
  verbs:
  - create
  - delete
  - get
  - list
  - patch
  - update
  - watch
- apiGroups: ["policy"]
  resources:
  - poddisruptionbudgets
  verbs:
  - create
  - delete
  - get
  - list
  - patch
  - update
  - watch
EOF

    cd ${OPERATOR_BUILD_DIR}
    make docker-build IMG=${OPERATOR_IMAGE}
    docker push ${OPERATOR_IMAGE}
}


function build_and_push_operator_bundle() {
    # Supply a pre-configured ClusterServiceVersion file to avoid interactive prompting
    mkdir -p ${OPERATOR_BUILD_DIR}/config/manifests/bases
    cat >> ${OPERATOR_BUILD_DIR}/config/manifests/bases/${OPERATOR_NAME}.clusterserviceversion.yaml <<- EOF
apiVersion: operators.coreos.com/v1alpha1
kind: ClusterServiceVersion
metadata:
  annotations:
    alm-examples: '[]'
    capabilities: Basic Install
    operators.operatorframework.io/builder: operator-sdk-v1.1.0
    operators.operatorframework.io/project_layout: helm.sdk.operatorframework.io/v1
  name: ${OPERATOR_NAME}.v${GAFFER_VERSION}
  namespace: placeholder
spec:
  apiservicedefinitions: {}
  customresourcedefinitions: {}
  description: Gaffer Operator for managing graph deployments
  displayName: Gaffer Operator
  icon:
  - base64data: ""
    mediatype: ""
  install:
    spec:
      deployments:
      - name: ${OPERATOR_NAME}-${GAFFER_VERSION}
        spec:
          replicas: 1
          selector:
            matchLabels:
              name: ${OPERATOR_NAME}
          strategy:
            type: Recreate
          template:
            metadata:
              labels:
                name: ${OPERATOR_NAME}
            spec:
              containers:
              - args:
                env:
                image: ${OPERATOR_IMAGE}
                imagePullPolicy: IfNotPresent
                name: ${OPERATOR_NAME}
                resources: {}
    strategy: deployment
  installModes:
  - supported: false
    type: OwnNamespace
  - supported: false
    type: SingleNamespace
  - supported: false
    type: MultiNamespace
  - supported: true
    type: AllNamespaces
  keywords:
  - gaffer
  - operator
  - graph
  - deployment
  links:
  - name: Gaffer Operator
    url: https://gchq.github.io/gaffer-docker/kubernetes/gaffer-operator
  maturity: alpha
  provider:
    name: GCHQ
    url: http://www.gchq.gov.uk
  version: ${GAFFER_VERSION}
EOF

    cat > ${OPERATOR_BUILD_DIR}/config/samples/kustomization.yaml <<- EOF
resources:
- charts_v1_gaffer.yaml
EOF

    cat >> ${OPERATOR_BUILD_DIR}/config/manifests/kustomization.yaml <<- EOF
resources:
- ../default
- ../samples
- ../scorecard
EOF

    cd ${OPERATOR_BUILD_DIR}
    make bundle VERSION="${GAFFER_VERSION}" IMG="${OPERATOR_IMAGE}"
    make bundle-build BUNDLE_IMG=${OPERATOR_BUNDLE_IMAGE} IMG=${OPERATOR_IMAGE}
    docker push ${OPERATOR_BUNDLE_IMAGE}
}

function build_and_push_operator_index() {
    opm index add -c docker --bundles "${OPERATOR_BUNDLE_IMAGE}" --tag "${OPERATOR_INDEX_IMAGE}"
    docker push ${OPERATOR_INDEX_IMAGE}
}

[[ $(which opm 2>/dev/null) && $(which operator-sdk 2>/dev/null) ]] || {
    echo "Installation of the Operator SDK and Operator Package Manager (opm) are required, see https://sdk.operatorframework.io and https://github.com/operator-framework/operator-registry"
    usage
}

GAFFER_VERSION="${1}"
GAFFER_DOCKER_VERSION="${2}"
DOCKER_REGISTRY="${3}"
[[ "x${GAFFER_VERSION}" == "x" || "x${GAFFER_DOCKER_VERSION}" == "x" || "x${DOCKER_REGISTRY}" == "x" ]] && {
    usage
}

# Retrieve versions from files
ROOT_DIR="$(getRootDirectory)"

# Import function to start a local docker registry
source "${ROOT_DIR}/gaffer-operator/scripts/local-registry.sh"

OPERATOR_NAME="gaffer-operator"
OPERATOR_BUILD_DIR="${ROOT_DIR}/${OPERATOR_NAME}/generated/${OPERATOR_NAME}"
mkdir -p ${OPERATOR_BUILD_DIR}

DOCKER_IMAGE_DOMAIN="gchq/gaffer"
OPERATOR_REPOSITORY="${DOCKER_REGISTRY}/${DOCKER_IMAGE_DOMAIN}/${OPERATOR_NAME}"
OPERATOR_BUNDLE_REPOSITORY="${OPERATOR_REPOSITORY}-bundle"
OPERATOR_INDEX_REPOSITORY="${OPERATOR_REPOSITORY}-index"

OPERATOR_IMAGE="${OPERATOR_REPOSITORY}:${GAFFER_VERSION}"
OPERATOR_BUNDLE_IMAGE="${OPERATOR_BUNDLE_REPOSITORY}:${GAFFER_VERSION}"
OPERATOR_INDEX_IMAGE="${OPERATOR_INDEX_REPOSITORY}:${GAFFER_VERSION}"

[[ ${DOCKER_REGISTRY} =~ localhost:([[:digit:]]+)$ ]] && start_local_registry "kind-registry" ${BASH_REMATCH[1]}

init_project
init_kustomize

build_and_push_operator
build_and_push_operator_bundle
build_and_push_operator_index
