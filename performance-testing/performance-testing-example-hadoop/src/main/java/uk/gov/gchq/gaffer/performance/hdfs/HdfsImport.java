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
package uk.gov.gchq.gaffer.performance.hdfs;

import uk.gov.gchq.gaffer.accumulostore.AccumuloProperties;
import uk.gov.gchq.gaffer.commonutil.StreamUtil;
import uk.gov.gchq.gaffer.graph.Graph;
import uk.gov.gchq.gaffer.hdfs.operation.AddElementsFromHdfs;
import uk.gov.gchq.gaffer.operation.OperationException;
import uk.gov.gchq.gaffer.store.schema.Schema;
import uk.gov.gchq.gaffer.user.User;

public final class HdfsImport {

    private HdfsImport() {
    }

    public static void main(final String[] args) throws OperationException {

        final String inputPath = System.getProperty("gaffer.inputPath");
        final String failurePath = System.getProperty("gaffer.failurePath");
        final String outputPath = System.getProperty("gaffer.outputPath");

        final AccumuloProperties properties = AccumuloProperties.loadStoreProperties(StreamUtil.storeProps(HdfsImport.class));
        final Schema schema = Schema.fromJson(StreamUtil.schemas(HdfsImport.class));

        final Graph graph = new Graph.Builder().storeProperties(properties)
                                               .addSchema(schema)
                                               .build();

        final AddElementsFromHdfs operation = new AddElementsFromHdfs.Builder().addInputPath(inputPath)
                                                                               .failurePath(failurePath)
                                                                               .outputPath(outputPath)
                                                                               .mapperGenerator(PerformanceTestMapperGenerator.class)
                                                                               .build();

        graph.execute(operation, new User());

    }
}
