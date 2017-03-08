/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package gaffer.gafferpop;

import gaffer.commonutil.StreamUtil;
import gaffer.commonutil.iterable.CloseableIterator;
import gaffer.graph.Graph;
import org.apache.commons.configuration.BaseConfiguration;
import org.apache.commons.configuration.Configuration;
import org.apache.tinkerpop.gremlin.structure.Edge;
import org.apache.tinkerpop.gremlin.structure.Property;
import org.apache.tinkerpop.gremlin.structure.VertexProperty;
import org.junit.Test;
import java.util.Arrays;
import java.util.Iterator;

public class CustomGafferPopGraphTest {
    private static final Configuration TEST_CONFIGURATION = new BaseConfiguration() {{
        this.setProperty(GafferPopGraph.GRAPH, GafferPopGraph.class.getName());
        this.setProperty(GafferPopGraph.USER_ID, "user01");
        this.setProperty(GafferPopGraph.DATA_AUTHS, new String[]{"Public"});
    }};

    @Test
    public void shouldAddElementsTwiceAndAggregate() {
        // Given
        final Graph gafferGraph = getGafferGraph();
        final GafferPopGraph graph = GafferPopGraph.open(TEST_CONFIGURATION, gafferGraph);

        // When
        addElements(graph);
        addElements(graph);

        // Then
        final CloseableIterator<GafferPopVertex> vertices = graph.vertices(Arrays.asList("id_123", "id_999"), "entity");
        while (vertices.hasNext()) {
            final GafferPopVertex vertex = vertices.next();
            System.out.println();
            System.out.println(vertex.toString());

            System.out.println("Properties: ");
            final Iterator<VertexProperty<Object>> properties = vertex.properties(vertex.keys().toArray(new String[vertex.keys().size()]));
            while (properties.hasNext()) {
                final VertexProperty<Object> prop = properties.next();
                System.out.println("\t" + prop.key() + "=" + prop.value());
            }
        }

        final Iterator<Edge> edges = graph.edges(new EdgeId("id_123", "id_999"));
        while (edges.hasNext()) {
            final Edge edge = edges.next();
            System.out.println();
            System.out.println(edge.toString());

            System.out.println("Properties: ");
            final Iterator<Property<Object>> properties = edge.properties(edge.keys().toArray(new String[edge.keys().size()]));
            while (properties.hasNext()) {
                final Property<Object> prop = properties.next();
                System.out.println("\t" + prop.key() + "=" + prop.value());
            }
        }
    }

    private void addElements(final GafferPopGraph graph) {
        GafferPopVertex sourceVertex = new GafferPopVertex("entity", "id_123", graph);
        sourceVertex.property("type", "first_type");
        sourceVertex.property("visibility", "Public");
        sourceVertex.property("description", "This should work.");
        graph.addVertex(sourceVertex);

        GafferPopVertex sinkVertex = new GafferPopVertex("entity", "id_999", graph);
        sinkVertex.property("type", "second_type");
        sinkVertex.property("visibility", "Public");
        sinkVertex.property("description", "But it isn't for some reason.");
        graph.addVertex(sinkVertex);

        GafferPopEdge edge = new GafferPopEdge("knows", sourceVertex, sinkVertex, graph);
        edge.property("weight", 0.5d);
        graph.addEdge(edge);
    }

    private Graph getGafferGraph() {
        return new Graph.Builder()
                .storeProperties(StreamUtil.openStream(this.getClass(), "/gaffer/store.properties", true))
                .addSchemas(StreamUtil.openStreams(this.getClass(), "/gaffer/schema", true))
                .build();
    }
}