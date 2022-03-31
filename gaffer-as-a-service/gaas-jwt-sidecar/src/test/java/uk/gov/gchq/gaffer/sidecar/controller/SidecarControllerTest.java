package uk.gov.gchq.gaffer.sidecar.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.BodyInserters;
import uk.gov.gchq.gaffer.sidecar.util.UnitTest;

@WebFluxTest(controllers = SidecarController.class)
@UnitTest
public class SidecarControllerTest {
    @Autowired
    private WebTestClient webClient;

    @Test
    void authEndpointReturns200WhenValidCredentials(){
        final String authRequest = "{\"username\":\"javainuse\",\"password\":\"password\"}";
        webClient.post()
                .uri("/auth")
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromObject(authRequest))
                .exchange()
                .expectStatus().is2xxSuccessful();
    }
}
