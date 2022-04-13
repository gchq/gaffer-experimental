/*
 * Copyright 2021 Crown Copyright
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

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import uk.gov.gchq.gaffer.gaas.sidecar.auth.JwtTokenUtil;
import uk.gov.gchq.gaffer.gaas.sidecar.auth.JwtUserDetailsService;

@Order(1)
@Configuration
public class CustomFilter implements GlobalFilter {

    @Autowired
    private JwtUserDetailsService jwtUserDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    Logger logger = LoggerFactory.getLogger(CustomFilter.class);

    @Override
    public Mono<Void> filter(final ServerWebExchange exchange, final GatewayFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();
        if (request.getPath().toString().equals("/auth")) {
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                ServerHttpResponse response = exchange.getResponse();
                logger.info("Post Filter = " + response.getStatusCode());
            }));
        }
        final String requestTokenHeader = request.getHeaders().getFirst("Authorization");
        String username = null;
        String jwtToken = null;
        // JWT Token is in the form "Bearer token". Remove Bearer word and get
        // only the Token
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtTokenUtil.getUsernameFromToken(jwtToken);
            } catch (IllegalArgumentException e) {
                logger.warn("Unable to get JWT Token");
            } catch (ExpiredJwtException e) {
                logger.warn("JWT Token has expired");
            } catch (SignatureException e) {
                logger.warn("JWT validity cannot be asserted");
            }
        } else {
            logger.warn("JWT Token does not begin with Bearer String");
        }

        // Once we get the token validate it.
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.jwtUserDetailsService.loadUserByUsername(username);

            // if token is valid configure Spring Security to manually set
            // authentication

            if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                    ServerHttpResponse response = exchange.getResponse();
                    logger.info("Post Filter = " + response.getStatusCode());
                }));
            }
        }
        logger.info("Authorization = " + request.getHeaders().getFirst("Authorization"));
        return this.onError(exchange, "Unauthorised User", HttpStatus.FORBIDDEN);
    }

    private Mono<Void> onError(final ServerWebExchange exchange, final String err, final HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }
}
