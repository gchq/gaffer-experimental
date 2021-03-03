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
package uk.gov.gchq.gaffer.gaas.controller;

import io.kubernetes.client.openapi.ApiClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import uk.gov.gchq.gaffer.gaas.auth.JwtRequest;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.services.AuthService;
import uk.gov.gchq.gaffer.gaas.services.CreateGraphService;
import uk.gov.gchq.gaffer.gaas.services.DeleteGraphService;
import uk.gov.gchq.gaffer.gaas.services.GetGafferService;
import uk.gov.gchq.gaffer.gaas.services.GetNamespacesService;
import uk.gov.gchq.gaffer.graph.GraphConfig;
import javax.validation.Valid;
import java.util.List;

@Component
@CrossOrigin
@RestController
public class GraphController {

    @Autowired
    private GetGafferService gafferService;
    @Autowired
    private CreateGraphService createGraphService;
    @Autowired
    private AuthService authService;
    @Autowired
    private DeleteGraphService deleteGraphService;
    @Autowired
    private ApiClient apiClient;
    @Autowired
    private GetNamespacesService getNamespacesService;

    @PostMapping("/auth")
    public ResponseEntity<String> createAuthenticationToken(@RequestBody final JwtRequest authenticationRequest) throws Exception {
        final String token = authService.getToken(authenticationRequest);
        return ResponseEntity.ok(token);
    }

    @PostMapping(path = "/graphs", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> addGraph(@Valid @RequestBody final GaaSCreateRequestBody gaaSCreateRequestBody) throws GaaSRestApiException {
        createGraphService.createGraph(gaaSCreateRequestBody);
        return new ResponseEntity(HttpStatus.CREATED);
    }

    @GetMapping(path = "/graphs", produces = "application/json")
    public ResponseEntity<List<GraphConfig>> getAllGraphs() throws GaaSRestApiException {
        final List<GraphConfig> list = gafferService.getAllGraphs();
        return new ResponseEntity(list, HttpStatus.OK);
    }

    @DeleteMapping(path = "/graphs/{graphId}", produces = "application/json")
    public ResponseEntity<?> deleteGraph(@PathVariable final String graphId) throws GaaSRestApiException {
        deleteGraphService.deleteGraph(graphId);
        return new ResponseEntity(HttpStatus.NO_CONTENT);
    }

    @GetMapping(path = "/namespaces", produces = "application/json")
    public ResponseEntity<?> getNamespaces() throws GaaSRestApiException {
        final List<String> namespaces = getNamespacesService.getNamespaces();
        return new ResponseEntity(namespaces, HttpStatus.OK);
    }
}
