/*
 * Copyright 2022 Crown Copyright
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.BodyInserters;
import uk.gov.gchq.gaffer.gaas.sidecar.util.UnitTest;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.jupiter.api.Assertions.assertEquals;

@WebFluxTest(controllers = SidecarController.class)
@UnitTest
public class SidecarControllerTest {
    @Autowired
    private WebTestClient webClient;

    @Test
    void givenValidCredentialsWhenAccessingAuthEndpointThenReturn200() {
        final String authRequest = "{\"username\":\"javainuse\",\"password\":\"password\"}";
        webClient.post()
                .uri("/auth")
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromObject(authRequest))
                .exchange()
                .expectStatus().is2xxSuccessful();
    }

    @Test
    void givenInvalidCredentialsWhenAccessingAuthEndpointThenReturn401() {
        final String authRequest = "{\"username\":\"invalid\",\"password\":\"something\"}";
        webClient.post()
                .uri("/auth")
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromObject(authRequest))
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void whatAuthShouldReturnObjectWhenSuccess() throws Exception {
        String expected = "{\"attributes\":{},\"requiredFields\":[\"username\",\"password\"],\"requiredHeaders\":{\"Authorization\":\"Bearer\"}}";
        WebTestClient.BodyContentSpec response = webClient.get()
                .uri("/what-auth")
                .exchange()
                .expectStatus().is2xxSuccessful()
                .expectBody().consumeWith(res -> {
                    final String body = new String(res.getResponseBody(), UTF_8);

                    assertEquals(expected, body);
                });
    }
}
