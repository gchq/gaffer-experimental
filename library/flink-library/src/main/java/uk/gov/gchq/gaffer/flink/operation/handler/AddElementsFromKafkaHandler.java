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
package uk.gov.gchq.gaffer.flink.operation.handler;

import org.apache.commons.lang.StringUtils;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer010;
import org.apache.flink.streaming.util.serialization.SimpleStringSchema;
import uk.gov.gchq.gaffer.flink.operation.AddElementsFromKafka;
import uk.gov.gchq.gaffer.operation.OperationException;
import uk.gov.gchq.gaffer.store.Context;
import uk.gov.gchq.gaffer.store.Store;
import uk.gov.gchq.gaffer.store.operation.handler.OperationHandler;
import java.util.Properties;

public class AddElementsFromKafkaHandler implements OperationHandler<AddElementsFromKafka> {
    @Override
    public Object doOperation(final AddElementsFromKafka operation, final Context context, final Store store) throws OperationException {
        final Properties props = new Properties();
        props.put("bootstrap.servers", StringUtils.join(operation.getBootstrapServers(), ","));
        props.put("group.id", operation.getGroupId());

        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        env.addSource(new FlinkKafkaConsumer010<>(operation.getTopic(), new SimpleStringSchema(), props))
                .map(new GafferMapFunction(operation.getElementGenerator()))
                .returns(GafferMapFunction.getReturnClass())
                .addSink(new GafferSink(store));

        try {
            env.execute("Add elements from socket");
        } catch (Exception e) {
            throw new OperationException("Failed to add elements from kafta topic: " + operation.getTopic(), e);
        }

        return null;
    }
}
