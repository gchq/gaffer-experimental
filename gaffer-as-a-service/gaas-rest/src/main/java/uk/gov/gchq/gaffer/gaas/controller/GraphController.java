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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import uk.gov.gchq.gaffer.gaas.auth.JwtRequest;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import uk.gov.gchq.gaffer.gaas.model.GafferConfigSpec;
import uk.gov.gchq.gaffer.gaas.services.AuthService;
import uk.gov.gchq.gaffer.gaas.services.CreateFederatedStoreGraphService;
import uk.gov.gchq.gaffer.gaas.services.CreateGraphService;
import uk.gov.gchq.gaffer.gaas.services.DeleteGraphService;
import uk.gov.gchq.gaffer.gaas.services.GetGaaSGraphConfigsService;
import uk.gov.gchq.gaffer.gaas.services.GetGaffersService;
import uk.gov.gchq.gaffer.gaas.services.GetNamespacesService;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@CrossOrigin
@RestController
public class GraphController {

    @Autowired
    private ApiClient apiClient;
    @Autowired
    private GetGaffersService getGaffersService;
    @Autowired
    private CreateGraphService createGraphService;
    @Autowired
    private CreateFederatedStoreGraphService createFederatedStoreGraphService;
    @Autowired
    private DeleteGraphService deleteGraphService;
    @Autowired
    private GetNamespacesService getNamespacesService;
    @Autowired
    private GetGaaSGraphConfigsService getStoreTypesService;
    @Autowired(required = false)
    private AuthService authService;

    @Value("${cognito.enabled: false}")
    boolean cognitoEnabled;

    @Value("${openshift.enabled: false}")
    boolean openshiftEnabled;

    @PostMapping("/auth")
    public ResponseEntity<String> createAuthenticationToken(@RequestBody final JwtRequest authenticationRequest) throws Exception {
        if (!cognitoEnabled) {
            final String token = authService.getToken(authenticationRequest);
            return ResponseEntity.ok(token);
        }
        return null;
    }

    @PostMapping(path = "/graphs", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createGraph(@Valid @RequestBody final GaaSCreateRequestBody requestBody, @RequestHeader final HttpHeaders headers) throws GaaSRestApiException {
        if (requestBody.isFederatedStoreRequest()) {
            createFederatedStoreGraphService.createFederatedStore(requestBody);
        } else {
            createGraphService.createGraph(requestBody);
        }
        return getResponseEntity(new ResponseEntity(HttpStatus.CREATED), headers);
    }

    @GetMapping(path = "/graphs", produces = "application/json")
    public ResponseEntity<List<GaaSGraph>> getAllGraphs(@RequestHeader final HttpHeaders headers) throws GaaSRestApiException {
        final Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("graphs", getGaffersService.getAllGraphs());
        return getResponseEntity(new ResponseEntity(responseBody, HttpStatus.OK), headers);
    }

    @GetMapping(path = "/storetypes", produces = "application/json")
    public ResponseEntity<List<GafferConfigSpec>> getGafferConfigSpecs(@RequestHeader final HttpHeaders headers) throws GaaSRestApiException {
        final Map<String, Object> body = new HashMap<>();
        body.put("storeTypes", getStoreTypesService.getGafferConfigSpecs());

        return getResponseEntity(new ResponseEntity(body, HttpStatus.OK), headers);
    }

    @DeleteMapping(path = "/graphs/{graphId}", produces = "application/json")
    public ResponseEntity<?> deleteGraph(@PathVariable final String graphId, @RequestHeader final HttpHeaders headers) throws GaaSRestApiException {
        deleteGraphService.deleteGraph(graphId);
        return getResponseEntity(new ResponseEntity(HttpStatus.NO_CONTENT), headers);
    }

    @GetMapping(path = "/namespaces", produces = "application/json")
    public ResponseEntity<?> getNamespaces(@RequestHeader final HttpHeaders headers) throws GaaSRestApiException {
        final List<String> namespaces = getNamespacesService.getNamespaces();
        return getResponseEntity(new ResponseEntity(namespaces, HttpStatus.OK), headers);
    }

    private Boolean checkForXEmail(final HttpHeaders headers) {
        return (headers.get("x-email") != null);
    }

    public ResponseEntity getResponseEntity(final ResponseEntity responseEntity, final HttpHeaders headers) {
        if (openshiftEnabled) {
            if (checkForXEmail(headers)) {
                return responseEntity;
            } else {
                return new ResponseEntity(HttpStatus.FORBIDDEN);
            }
        } else {
            return responseEntity;
        }
    }
}
