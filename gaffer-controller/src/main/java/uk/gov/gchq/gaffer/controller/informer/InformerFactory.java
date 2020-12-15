/*
 * Copyright 2020 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package uk.gov.gchq.gaffer.controller.informer;

import io.kubernetes.client.informer.SharedInformerFactory;
import io.kubernetes.client.openapi.models.V1Deployment;
import io.kubernetes.client.openapi.models.V1DeploymentList;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1PodList;
import io.kubernetes.client.spring.extended.controller.annotation.GroupVersionResource;
import io.kubernetes.client.spring.extended.controller.annotation.KubernetesInformer;
import io.kubernetes.client.spring.extended.controller.annotation.KubernetesInformers;

import uk.gov.gchq.gaffer.controller.model.v1.Gaffer;
import uk.gov.gchq.gaffer.controller.model.v1.GafferList;

@KubernetesInformers({
        @KubernetesInformer(
                apiTypeClass = Gaffer.class,
                apiListTypeClass = GafferList.class,
                groupVersionResource =
                @GroupVersionResource(
                        apiGroup = "gchq.gov.uk",
                        resourcePlural = "gaffers"
                )
        ),
        @KubernetesInformer(
                apiTypeClass = V1Pod.class,
                apiListTypeClass = V1PodList.class,
                groupVersionResource =
                @GroupVersionResource(
                        resourcePlural = "pods"
                )
        ),
        @KubernetesInformer(
                apiTypeClass = V1Deployment.class,
                apiListTypeClass = V1DeploymentList.class,
                groupVersionResource =
                @GroupVersionResource(
                        apiGroup = "apps",
                        resourcePlural = "deployments"
                )
        )

})
public class InformerFactory extends SharedInformerFactory {

}
