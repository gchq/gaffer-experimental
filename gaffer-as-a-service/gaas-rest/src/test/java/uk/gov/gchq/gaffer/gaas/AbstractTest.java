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

package uk.gov.gchq.gaffer.gaas;

import com.google.gson.Gson;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.context.WebApplicationContext;
import uk.gov.gchq.gaffer.gaas.client.CRDClient;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest
public abstract class AbstractTest {

    protected MockMvc mvc;

    @Autowired
    WebApplicationContext webApplicationContext;

    @Autowired
    private CRDClient crdClient;

    protected MvcResult token;

    protected static final String TEST_GRAPH_ID = "testgraphid";
    protected static final String TEST_GRAPH_DESCRIPTION = "Test Graph Description";

    @Value("${gaffer.namespace}")
    protected String namespace;

    @Value("${cognito.enabled}")
    protected boolean cognitoEnabled;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    protected String issuerUri;

    protected String mapToJson(final Object obj) {
        return new Gson().toJson(obj);
    }

    @BeforeEach
    public void setUp() throws Exception {
        this.mvc = webAppContextSetup(webApplicationContext).build();
        final String authRequest = "{\"username\":\"javainuse\",\"password\":\"password\"}";

        token = mvc.perform(post("/auth")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(authRequest)).andReturn();
    }
}
