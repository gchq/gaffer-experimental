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
package uk.gov.gchq.gaffer.random;

import uk.gov.gchq.gaffer.data.element.Edge;
import uk.gov.gchq.gaffer.operation.OperationException;
import uk.gov.gchq.gaffer.randomdatageneration.Constants;
import uk.gov.gchq.gaffer.randomdatageneration.generator.RandomElementGenerator;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.stream.StreamSupport;

public class Random {

    public static void main(final String[] args) throws OperationException, IOException {

        final long numEntities = Long.parseLong(args[0]);
        final long numEdges = Long.parseLong(args[1]);
        final String filePath = args[2];
        final double[] probabilities = new Constants().rmatProbabilities;

        final RandomElementGenerator generator = new RandomElementGenerator(numEntities, numEdges, probabilities);

        final FileWriter fileWriter = new FileWriter(filePath, true);
        final BufferedWriter writer = new BufferedWriter(fileWriter);

        StreamSupport.stream(generator.getElements("").spliterator(), false)
                     .filter(e -> e instanceof Edge)
                     .forEach(edge -> {
                         final StringBuilder sb = new StringBuilder();
                         sb.append(((Edge) edge).getSource());
                         sb.append(",");
                         sb.append(((Edge) edge).getDestination());

                         try {
                             writer.write(sb.toString());
                             writer.newLine();
                             writer.flush();
                         } catch (IOException e1) {
                             e1.printStackTrace();
                         }
                         System.out.println(sb.toString());
                     });

        writer.close();
        fileWriter.close();
    }
}
