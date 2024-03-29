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

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpResponse;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import uk.gov.gchq.gaffer.gaas.sidecar.auth.JwtTokenUtil;
import uk.gov.gchq.gaffer.gaas.sidecar.auth.JwtUserDetailsService;
import uk.gov.gchq.gaffer.gaas.sidecar.util.UnitTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@WebFluxTest(controllers = CustomFilter.class)
@UnitTest
public class CustomFilterTest {

    @Autowired
    private CustomFilter customFilter;

    @MockBean
    private JwtUserDetailsService jwtUserDetailsService;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    private ArgumentCaptor<ServerWebExchange> captor = ArgumentCaptor.forClass(ServerWebExchange.class);


    @Test
    void shouldPassFilterAndReturnSuccessWhenAuthEndpointCalled() {
        final String authRequest = "{\"username\":\"validUser\",\"password\":\"abc123\"}";
        MockServerHttpRequest request = MockServerHttpRequest.post("/auth").contentType(MediaType.APPLICATION_JSON).body(authRequest);

        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        MockServerHttpResponse mockServerHttpResponse = new MockServerHttpResponse();
        GatewayFilterChain filterChain = mock(GatewayFilterChain.class);

        when(filterChain.filter(captor.capture())).thenReturn(Mono.fromRunnable(() -> {
            exchange.getResponse().setStatusCode(HttpStatus.OK);
        }));

        customFilter.filter(exchange, filterChain).block();

        exchange.getResponse().setComplete();

        assertTrue(exchange.getResponse().getStatusCode().is2xxSuccessful());
    }

    @Test
    void shouldPassFilterAndReturn200WhenValidTokenHeaderPresent() {
        when(jwtTokenUtil.getUsernameFromToken(anyString())).thenReturn("user");

        UserDetails userDetails = mock(UserDetails.class);
        when(jwtUserDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);

        when(jwtTokenUtil.validateToken(anyString(), any(UserDetails.class))).thenReturn(true);
        MockServerHttpRequest request = MockServerHttpRequest.get("/gaas-rest-service/graphs").header("Authorization", "Bearer 1234username42343242").build();

        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        GatewayFilterChain filterChain = mock(GatewayFilterChain.class);

        when(filterChain.filter(captor.capture())).thenReturn(Mono.fromRunnable(() -> {
            exchange.getResponse().setStatusCode(HttpStatus.OK);
        }));
        customFilter.filter(exchange, filterChain).block();

        exchange.getResponse().setComplete();
        assertEquals("user", exchange.getRequest().getHeaders().get("username").get(0));
        assertTrue(exchange.getResponse().getStatusCode().is2xxSuccessful());
    }


    @Test
    void shouldReturnForbiddenErrorWhenAuthorizationHeaderNotPresent() {
        when(jwtTokenUtil.getUsernameFromToken(anyString())).thenReturn("user");

        UserDetails userDetails = mock(UserDetails.class);
        when(jwtUserDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);

        when(jwtTokenUtil.validateToken(anyString(), any(UserDetails.class))).thenReturn(true);
        MockServerHttpRequest request = MockServerHttpRequest.get("/gaas-rest-service/graphs").build();

        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        GatewayFilterChain filterChain = mock(GatewayFilterChain.class);

        customFilter.filter(exchange, filterChain).block();
        exchange.getResponse().setComplete();

        assertTrue(exchange.getResponse().getStatusCode().is4xxClientError());
    }


}


