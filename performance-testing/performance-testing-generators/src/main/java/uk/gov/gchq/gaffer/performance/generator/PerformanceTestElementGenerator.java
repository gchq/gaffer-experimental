/*
 * Copyright 2017 Crown Copyright
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
package uk.gov.gchq.gaffer.performance.generator;

import com.clearspring.analytics.stream.cardinality.HyperLogLogPlus;
import uk.gov.gchq.gaffer.commonutil.iterable.WrappedCloseableIterable;
import uk.gov.gchq.gaffer.data.element.Edge;
import uk.gov.gchq.gaffer.data.element.Element;
import uk.gov.gchq.gaffer.data.element.Entity;
import uk.gov.gchq.gaffer.data.generator.OneToManyElementGenerator;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static java.util.Arrays.asList;

public class PerformanceTestElementGenerator extends OneToManyElementGenerator<String> {

    @Override
    public Iterable<Element> getElements(final String line) {

        final String[] fields = extractFields(line);

        final int source = Integer.parseInt(fields[0]);
        final int dest = Integer.parseInt(fields[1]);

        final Edge edge = new Edge.Builder().group("edge")
                                            .source(source)
                                            .dest(dest)
                                            .directed(true)
                                            .property("count", 1L)
                                            .build();

        final List<Element> elements = new ArrayList<>();
        elements.add(edge);
        elements.addAll(getCardinalityEntities(edge));

        return new WrappedCloseableIterable<>(elements);
    }

    private Collection<? extends Element> getCardinalityEntities(final Edge edge) {

        final Entity src = new Entity("cardinality", edge.getSource());
        src.putProperty("edgeGroup", edge.getGroup());

        final Entity dest = new Entity("cardinality", edge.getDestination());
        dest.putProperty("edgeGroup", edge.getGroup());

        // create a hyperLogLogPlus instance using the provided edge.
        src.putProperty("cardinality", new HyperLogLogPlus(5, 5));
        dest.putProperty("cardinality", new HyperLogLogPlus(5, 5));

        return asList(src, dest);
    }

    private String[] extractFields(final String line) {
        return line.trim().split(",");
    }

    @Override
    public Iterable<String> getObjects(final Iterable<? extends Element> elements) {
        throw new UnsupportedOperationException("This generator cannot be used to generate elements.");
    }
}
