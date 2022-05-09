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
import org.springframework.test.web.reactive.server.WebTestClient;
import uk.gov.gchq.gaffer.gaas.sidecar.models.WhatAuthResponse;
import uk.gov.gchq.gaffer.gaas.sidecar.util.UnitTest;

import java.util.ArrayList;
import java.util.HashMap;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.jupiter.api.Assertions.assertEquals;

@WebFluxTest(controllers = SidecarController.class)
@UnitTest
public class SidecarControllerTest {
    @Autowired
    private WebTestClient webClient;

    @Test
    void whoamiEndpointReturns200WhenXEmailPresent() {
        final String xemail = "mytest@email.com";
        webClient.get()
                .uri("/whoami")
                .header("x-email", "mytest@email.com")
                .exchange()
                .expectStatus().is2xxSuccessful()
                .expectBody().toString().equals(xemail);
    }

    @Test
    void whatAuthShouldReturnWhatAuthInformationWhenSuccess() {
        String expected = "{\"attributes\":{\"withCredentials\":\"true\"},\"requiredFields\":[],\"requiredHeaders\":{}}";
        WebTestClient.BodyContentSpec response = webClient.get()
                .uri("/what-auth")
                .header("x-email", "mytest@email.com")
                .exchange()
                .expectStatus().is2xxSuccessful()
                .expectBody().consumeWith(res -> {
                    final String body = new String(res.getResponseBody(), UTF_8);

                    assertEquals(expected, body);
                });
    }
}
