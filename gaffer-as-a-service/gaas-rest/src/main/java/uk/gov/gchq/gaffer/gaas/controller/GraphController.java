/*
 * Copyright 2020-2022 Crown Copyright
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import uk.gov.gchq.gaffer.gaas.handlers.HelmValuesOverridesHandler;
import uk.gov.gchq.gaffer.gaas.model.GaaSCreateRequestBody;
import uk.gov.gchq.gaffer.gaas.model.GaaSGraph;
import uk.gov.gchq.gaffer.gaas.model.GafferConfigSpec;
import uk.gov.gchq.gaffer.gaas.services.CreateFederatedStoreGraphService;
import uk.gov.gchq.gaffer.gaas.services.CreateGraphService;
import uk.gov.gchq.gaffer.gaas.services.DeleteGraphService;
import uk.gov.gchq.gaffer.gaas.services.GetGaaSGraphConfigsService;
import uk.gov.gchq.gaffer.gaas.services.GetGaffersService;
import uk.gov.gchq.gaffer.gaas.services.GetNamespacesService;
import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@CrossOrigin
@RestController
public class GraphController {

    private static final Logger LOGGER = LoggerFactory.getLogger(GraphController.class);

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
    @Autowired
    private HelmValuesOverridesHandler helmValuesOverridesHandler;
    @Value("${admin.users: {}}")
    private String[] admins;

    Logger logger = LoggerFactory.getLogger(GraphController.class);


    @PostMapping(path = "/graphs", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createGraph(@Valid @RequestBody final GaaSCreateRequestBody requestBody, @RequestHeader final HttpHeaders headers) throws GaaSRestApiException {

        graphAutoDestroyDateLabel(requestBody);

        try {
            addCreatorLabel(Objects.requireNonNull(headers.getFirst("username")));
        } catch (Exception e) {
            logger.error("Could not retrieve username");
        }
        if (requestBody.isFederatedStoreRequest()) {
            createFederatedStoreGraphService.createFederatedStore(requestBody);
        } else {
            createGraphService.createGraph(requestBody);
        }
        return new ResponseEntity(HttpStatus.CREATED);
    }


    @GetMapping(path = "/graphs", produces = "application/json")
    public ResponseEntity<List<GaaSGraph>> getAllGraphs(@RequestHeader final HttpHeaders headers) throws GaaSRestApiException {
        final Map<String, Object> responseBody = new HashMap<>();
        if (isAdmin(headers.getFirst("username"))) {
            responseBody.put("graphs", getGaffersService.getAllGraphs());
        } else {
            responseBody.put("graphs", getGaffersService.getUserCreatedGraphs(emailStripper(headers.getFirst("username"))));
        }
        return new ResponseEntity(responseBody, HttpStatus.OK);
    }

    @GetMapping(path = "/storetypes", produces = "application/json")
    public ResponseEntity<List<GafferConfigSpec>> getGafferConfigSpecs(@RequestHeader final HttpHeaders headers) throws GaaSRestApiException {
        final Map<String, Object> body = new HashMap<>();
        body.put("storeTypes", getStoreTypesService.getGafferConfigSpecs());

        return new ResponseEntity(body, HttpStatus.OK);
    }

    @DeleteMapping(path = "/graphs/{graphId}", produces = "application/json")
    public ResponseEntity<?> deleteGraph(@PathVariable final String graphId, @RequestHeader final HttpHeaders headers) throws GaaSRestApiException {
        if (isAdmin(headers.getFirst("username"))) {
            if (deleteGraphService.deleteGraph(graphId)) {
                return new ResponseEntity(HttpStatus.NO_CONTENT);
            }
        } else {
            if (deleteGraphService.deleteGraphByUsername(graphId, emailStripper(headers.getFirst("username")))) {
                return new ResponseEntity(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping(path = "/namespaces", produces = "application/json")
    public ResponseEntity<?> getNamespaces(@RequestHeader final HttpHeaders headers) throws GaaSRestApiException {
        final List<String> namespaces = getNamespacesService.getNamespaces();
        return new ResponseEntity(namespaces, HttpStatus.OK);
    }


    private void addCreatorLabel(final String email) {
        String strippedEmail = emailStripper(email);
        if (isCreatorLabelValid(strippedEmail)) {
            helmValuesOverridesHandler.addOverride("labels.creator", strippedEmail);
        }
    }

    private boolean isCreatorLabelValid(final String email) {
        Pattern pattern = Pattern.compile("(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])");
        Matcher matcher = pattern.matcher(email);
        return matcher.matches();
    }

    private void graphAutoDestroyDateLabel(final GaaSCreateRequestBody requestBody) {
        if (requestBody.getGraphLifetimeInDays() != null && !requestBody.getGraphLifetimeInDays().isEmpty() && !requestBody.getGraphLifetimeInDays().toLowerCase().equals("never")) {
            LocalDateTime currentTime = LocalDateTime.now();
            long graphLifetimeInDays = new Long(requestBody.getGraphLifetimeInDays());
            logger.info("graphLifetimeInDays: {}", graphLifetimeInDays);
            String graphAutoDestroyDate = currentTime.plusDays(graphLifetimeInDays).toString();
            logger.info("labels.graphAutoDestroyDate : {}", graphAutoDestroyDate);
            helmValuesOverridesHandler.addOverride("labels.graphAutoDestroyDate", graphAutoDestroyDate.toLowerCase().replaceAll(":", "_"));
        }
    }

    private String emailStripper(final String email) {
        String strippedEmail = email;
        if (email.contains("@")) {
            strippedEmail = email.substring(0, email.indexOf('@'));
        }
        return strippedEmail;
    }

    private boolean isAdmin(final String username) {
        List<String> adminList = new ArrayList<>(Arrays.asList(admins));
        return adminList.contains(username);

    }
}
