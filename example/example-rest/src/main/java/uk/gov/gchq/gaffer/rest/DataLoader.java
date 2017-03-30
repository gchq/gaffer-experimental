/*
 * Copyright 2016 Crown Copyright
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

package uk.gov.gchq.gaffer.rest;

import com.clearspring.analytics.stream.cardinality.HyperLogLogPlus;
import uk.gov.gchq.gaffer.data.element.Edge;
import uk.gov.gchq.gaffer.data.element.Entity;
import uk.gov.gchq.gaffer.graph.Graph;
import uk.gov.gchq.gaffer.operation.OperationException;
import uk.gov.gchq.gaffer.operation.impl.add.AddElements;
import uk.gov.gchq.gaffer.rest.factory.GraphFactory;
import uk.gov.gchq.gaffer.user.User;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.util.logging.Logger;


public class DataLoader implements ServletContextListener {
    private static final Logger LOGGER = Logger.getLogger(DataLoader.class.getName());

    @Override
    public void contextInitialized(final ServletContextEvent servletContextEvent) {
        final Graph graph = GraphFactory.createGraphFactory().getGraph();
        try {
            final Edge edge1 = new Edge.Builder()
                    .group("edge")
                    .source("vertex1")
                    .dest("vertex2")
                    .directed(true)
                    .property("count", 1)
                    .build();

            final HyperLogLogPlus hllp1 = new HyperLogLogPlus(5, 5);
            hllp1.offer("vertex2");
            final HyperLogLogPlus hllp2 = new HyperLogLogPlus(5, 5);
            hllp2.offer("vertex1");

            graph.execute(new AddElements.Builder()
                    .elements(edge1,
                            new Entity.Builder()
                                    .vertex("vertex1")
                                    .group("entity")
                                    .property("cardinality", hllp1)
                                    .build(),
                            new Entity.Builder()
                                    .vertex("vertex2")
                                    .group("entity")
                                    .property("cardinality", hllp2)
                                    .build())
                    .build(), new User());
        } catch (OperationException e) {
            LOGGER.info("Unable to load data: " + e.getMessage());
            throw new RuntimeException("Unable to load data", e);
        }

        LOGGER.info("Sample data has been loaded");
    }

    @Override
    public void contextDestroyed(final ServletContextEvent servletContextEvent) {
    }
}
