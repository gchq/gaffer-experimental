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
    void whoamiEndpointReturns200WhenXEmailPresent(){
        final String xemail = "mytest@email.com";
        webClient.get()
                .uri("/whoami")
                .header("x-email", "mytest@email.com")
                .exchange()
                .expectStatus().is2xxSuccessful()
                .expectBody().toString().equals(xemail);
    }
}
