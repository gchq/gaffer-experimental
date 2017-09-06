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
package uk.gov.gchq.gaffer.gafferpop.groovyplugin;

import com.google.common.collect.Sets;
import org.apache.tinkerpop.gremlin.groovy.plugin.AbstractGremlinPlugin;
import org.apache.tinkerpop.gremlin.groovy.plugin.IllegalEnvironmentException;
import org.apache.tinkerpop.gremlin.groovy.plugin.PluginAcceptor;
import org.apache.tinkerpop.gremlin.groovy.plugin.PluginInitializationException;

import uk.gov.gchq.gaffer.data.element.IdentifierType;
import uk.gov.gchq.gaffer.data.element.function.ElementFilter;
import uk.gov.gchq.gaffer.data.element.function.ElementTransformer;
import uk.gov.gchq.gaffer.data.elementdefinition.view.View;
import uk.gov.gchq.gaffer.data.elementdefinition.view.ViewElementDefinition;
import uk.gov.gchq.gaffer.gafferpop.GafferPopGraph;
import uk.gov.gchq.koryphe.impl.function.Concat;
import uk.gov.gchq.koryphe.impl.predicate.Exists;

import java.util.Set;

public final class GafferPopGremlinPlugin extends AbstractGremlinPlugin {
    private static final Set<String> IMPORTS = Sets.newHashSet(
            getPackage(GafferPopGraph.class),
            getPackage(View.class),
            getPackage(ViewElementDefinition.class),
            getPackage(ElementFilter.class),
            getPackage(ElementTransformer.class),
            getPackage(IdentifierType.class),
            getPackage(Exists.class),
            getPackage(Concat.class)
    );

    private static String getPackage(final Class<?> clazz) {
        return IMPORT_SPACE + clazz.getPackage().getName() + DOT_STAR;
    }

    @Override
    public String getName() {
        return GafferPopGraph.class.getName();
    }

    @Override
    public void pluginTo(final PluginAcceptor pluginAcceptor) throws PluginInitializationException, IllegalEnvironmentException {
        pluginAcceptor.addImports(IMPORTS);
    }

    @Override
    public void afterPluginTo(final PluginAcceptor pluginAcceptor) throws IllegalEnvironmentException, PluginInitializationException {
    }
}
