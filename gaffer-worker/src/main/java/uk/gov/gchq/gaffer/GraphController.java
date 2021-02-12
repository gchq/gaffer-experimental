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
package uk.gov.gchq.gaffer;

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CustomObjectsApi;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.jose4j.json.internal.json_simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uk.gov.gchq.gaffer.auth.JwtRequest;
import uk.gov.gchq.gaffer.auth.JwtTokenUtil;
import uk.gov.gchq.gaffer.auth.JwtUserDetailsService;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


@Component
@CrossOrigin
@RestController
public class GraphController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private JwtUserDetailsService userDetailsService;

    @Autowired
    private ApiClient apiClient;


    @GetMapping("/graphs")
    public List<Graph> graph(@RequestParam(value = "name", defaultValue = "gaffer") final String name) {
        ArrayList<Graph> graphList = new ArrayList<>();
        graphList.add(new Graph("OurGraph", "YES"));
        return graphList;
    }

    @PostMapping(path = "/graphs", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> graph(@RequestBody final Graph graph) throws IOException {
        CustomObjectsApi customObject = new CustomObjectsApi(apiClient);
        V1ObjectMeta objectMeta = new V1ObjectMeta();
        objectMeta.setName(graph.getGraphId());
        JSONObject graphSetup = new JSONObject();
        graphSetup.put("kind", "Gaffer");
        graphSetup.put("metadata", objectMeta);
        graphSetup.put("apiVersion", "gchq.gov.uk/v1");

        try {
            Object result = customObject.createNamespacedCustomObject("gchq.gov.uk", "v1", "kai-helm-3", "gaffers", graphSetup, null, null, null);
            System.out.println(result);
        } catch (ApiException e) {
            System.err.println("Exception when calling CustomObjectsApi#createNamespacedCustomObject");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Reason: " + e.getResponseBody());
            System.err.println("Response headers: " + e.getResponseHeaders());
            e.printStackTrace();
        }
        return new ResponseEntity(HttpStatus.CREATED);

    }

    @PostMapping("/auth")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody final JwtRequest authenticationRequest) throws Exception {

        authenticate(authenticationRequest.getUsername(), authenticationRequest.getPassword());

        final UserDetails userDetails = userDetailsService
                .loadUserByUsername(authenticationRequest.getUsername());

        final String token = jwtTokenUtil.generateToken(userDetails);
        return ResponseEntity.ok(token);
    }

    private void authenticate(final String username, final String password) throws Exception {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (DisabledException e) {
            throw new Exception("USER_DISABLED", e);
        } catch (BadCredentialsException e) {
            throw new Exception("INVALID_CREDENTIALS", e);
        }
    }

    @DeleteMapping("/graphs/{graphId}")
    public String deleteGraph(@PathVariable final String graphId) {
        return "Record Deleted";
    }
}
