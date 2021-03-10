/*
 * Copyright 2020 Crown Copyright
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

package uk.gov.gchq.gaffer.gaas.utilities;

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import uk.gov.gchq.gaffer.gaas.auth.JwtTokenUtil;
import uk.gov.gchq.gaffer.gaas.auth.JwtUserDetailsService;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import uk.gov.gchq.gaffer.gaas.services.AuthService;
import uk.gov.gchq.gaffer.gaas.services.CreateGraphService;
import uk.gov.gchq.gaffer.gaas.services.GetGafferService;
import uk.gov.gchq.gaffer.gaas.services.GetNamespacesService;
import static org.mockito.Mockito.mock;

@TestConfiguration
public class UnitTestConfig {

    @Bean
    @Primary
    public ApiClient apiClient() {
        return mock(ApiClient.class);
    }

    @Bean
    public CRDClient crdClient() {
        return new CRDClient();
    }

    @Bean
    public CoreV1Api coreV1Api() {
        return new CoreV1Api(apiClient());
    }

    @Bean
    public CustomObjectsApi customObjectsApi() {
        return new CustomObjectsApi(apiClient());
    }

    @Bean
    public AuthService authService() {
        return new AuthService();
    }

    @Bean
    public CreateGraphService createGraphService() {
        return new CreateGraphService();
    }

    @Bean
    public GetGafferService getGafferService() {
        return new GetGafferService();
    }

    @Bean
    public GetNamespacesService getNamespacesService() {
        return new GetNamespacesService();
    }

    @Bean
    public JwtTokenUtil jwtTokenUtil() {
        return new JwtTokenUtil();
    }

    @Bean
    public JwtUserDetailsService jwtUserDetailsService() {
        return new JwtUserDetailsService();
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return mock(AuthenticationManager.class);
    }
}
