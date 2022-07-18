/*
 * Copyright 2021-2022 Crown Copyright
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

package uk.gov.gchq.gaffer.gaas.sidecar.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Order(2)
@Configuration
public class CustomFilter implements GlobalFilter {

    Logger logger = LoggerFactory.getLogger(CustomFilter.class);

    @Override
    public Mono<Void> filter(final ServerWebExchange exchange, final GatewayFilterChain chain) {
        logger.info("Enter custom Filter and check x-email= ");
        ServerHttpRequest request = exchange.getRequest();
        if (request.getPath().toString().equals("/what-auth") || request.getPath().toString().equals("/swagger-ui") || request.getPath().toString().equals("/v3/api-docs/swagger-config")) {
            ServerHttpResponse response = exchange.getResponse();
            logger.info("Post Filter = " + response.getStatusCode());
        }
        if (request.getHeaders().getFirst("x-email") != null) {
            logger.info("Found x-email = ");
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate().header("username", request.getHeaders().getFirst("x-email")).build();
            ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();
            return chain.filter(mutatedExchange).then(Mono.fromRunnable(() -> {
                ServerHttpResponse response = exchange.getResponse();
                logger.info("Sidecar custom post Filter = {}", response.getStatusCode());
            }));
        }
        logger.info("Unauthorised User = {}.", HttpStatus.FORBIDDEN);
        return this.onError(exchange, "Unauthorised User", HttpStatus.FORBIDDEN);
    }

    private Mono<Void> onError(final ServerWebExchange exchange, final String err, final HttpStatus httpStatus) {
        logger.error("Error sidecar custom filter = ");
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }
}
