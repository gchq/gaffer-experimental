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

package uk.gov.gchq.gaffer.gaas.controller;

import io.kubernetes.client.openapi.ApiClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.context.WebApplicationContext;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest
public class GraphControllerAuthTest {

  protected MockMvc mvc;

  @MockBean
  private ApiClient apiClient;

  @Autowired
  private WebApplicationContext webApplicationContext;

  @Test
  public void authEndpointShouldReturn401StatusWhenValidUsernameAndPassword() throws Exception {
    this.mvc = webAppContextSetup(webApplicationContext).build();
    final String authRequest = "{\"username\":\"invalidUser\",\"password\":\"abc123\"}";

    final MvcResult tokenResponse = mvc.perform(post("/auth")
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .content(authRequest)).andReturn();

    assertEquals(401, tokenResponse.getResponse().getStatus());
    assertEquals("Bad credentials", tokenResponse.getResolvedException().getMessage());
  }
}
