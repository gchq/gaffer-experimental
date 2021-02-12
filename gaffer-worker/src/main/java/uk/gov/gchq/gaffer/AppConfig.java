package uk.gov.gchq.gaffer;

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.util.ClientBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class AppConfig {
    @Bean
    public ApiClient apiClient() throws IOException {
      return ClientBuilder.defaultClient();
    }
}
