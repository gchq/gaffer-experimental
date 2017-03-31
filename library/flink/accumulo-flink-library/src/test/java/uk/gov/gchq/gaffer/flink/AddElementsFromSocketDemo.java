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
package uk.gov.gchq.gaffer.flink;

import uk.gov.gchq.gaffer.commonutil.StreamUtil;
import uk.gov.gchq.gaffer.data.element.Edge;
import uk.gov.gchq.gaffer.data.element.Element;
import uk.gov.gchq.gaffer.data.generator.ElementGenerator;
import uk.gov.gchq.gaffer.data.generator.OneToOneElementGenerator;
import uk.gov.gchq.gaffer.flink.operation.AddElementsFromSocket;
import uk.gov.gchq.gaffer.graph.Graph;
import uk.gov.gchq.gaffer.user.User;

/**
 * To run the demo:
 * <ul>
 * <li>
 * Use netcat to start a local server. In a terminal run the command: nc -l 9000
 * </li>
 * <li>
 * Run this main method via your IDE
 * </li>
 * <li>
 * In the terminal running netcat, add some elements, e.g:
 * <ul>
 * <li>
 * 1,2
 * </li>
 * <li>
 * 1,3
 * </li>
 * <li>
 * 3,2
 * </li>
 * </ul>
 * They must be in the format [source],[destination]. There isn't any error handling yet.
 * </li>
 * </ul>
 */
public class AddElementsFromSocketDemo {
    public static final int PORT = 9000;

    public static void main(String[] args) throws Exception {
        final ElementGenerator<String> elementGenerator = new OneToOneElementGenerator<String>() {
            private static final long serialVersionUID = -1393365807895711784L;

            @Override
            public Element _apply(final String csv) {
                final String[] parts = csv.split(",");
                return new Edge.Builder()
                        .group("edge")
                        .source(parts[0])
                        .dest(parts[1])
                        .directed(true)
                        .property("count", 1)
                        .build();
            }
        };

        final Graph graph = new Graph.Builder()
                .storeProperties(StreamUtil.storeProps(AddElementsFromSocketDemo.class))
                .addSchemas(StreamUtil.schemas(AddElementsFromSocketDemo.class))
                .build();

        graph.execute(new AddElementsFromSocket.Builder()
                .generator(elementGenerator)
                .hostname("localhost")
                .port(PORT)
                .build(), new User());
    }
}