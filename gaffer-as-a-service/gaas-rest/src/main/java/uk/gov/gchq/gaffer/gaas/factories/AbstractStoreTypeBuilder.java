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

package uk.gov.gchq.gaffer.gaas.factories;

import uk.gov.gchq.gaffer.controller.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;

abstract class AbstractStoreTypeBuilder {

  protected final GafferSpecBuilder gafferSpecBuilder;
  protected GaaSCreateRequestBody graph;

  AbstractStoreTypeBuilder() {
    this.gafferSpecBuilder = new GafferSpecBuilder();
  }

  public AbstractStoreTypeBuilder setGraphId(final String graphId) {
    gafferSpecBuilder.setGraphId(graphId);
    return this;
  }

  public AbstractStoreTypeBuilder setDescription(final String description) {
    gafferSpecBuilder.setDescription(description);
    return this;
  }

  public GafferSpec build() {
    return gafferSpecBuilder.build();
  }
}
