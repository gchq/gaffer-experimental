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

function start_local_registry() {

    local _reg_name="${1}"
    local _reg_port="${2}"

    echo "Starting local registry: ${_reg_name}:${_reg_port}"
    running="$(docker inspect -f '{{.State.Running}}' "${_reg_name}" 2>/dev/null || true)"
    if [ "${running}" != 'true' ]; then
      docker run \
        -d --restart=always -p "${_reg_port}:5000" --name "${_reg_name}" \
        registry:2
    fi
}
