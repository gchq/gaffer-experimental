/*
 * Copyright 2016-2017 Crown Copyright
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

package uk.gov.gchq.gaffer.rest.application;

import uk.gov.gchq.gaffer.rest.serialisation.ExampleRestJsonProvider;
import uk.gov.gchq.gaffer.rest.serialisation.RestJsonProvider;

/**
 * An <code>ExampleApplicationConfig</code> replaces the RestJsonProvider with
 * a custom rest json provider that includes the HyperLogLogPlus json serialiser.
 */
public class ExampleApplicationConfig extends ApplicationConfig {
    @Override
    protected void addSystemResources() {
        resources.remove(RestJsonProvider.class);
        resources.add(ExampleRestJsonProvider.class);
    }
}
