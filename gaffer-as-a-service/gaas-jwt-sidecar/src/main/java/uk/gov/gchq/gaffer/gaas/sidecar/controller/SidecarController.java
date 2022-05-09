/*
 * Copyright 2022 Crown Copyright
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

package uk.gov.gchq.gaffer.gaas.sidecar.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import uk.gov.gchq.gaffer.gaas.sidecar.auth.JwtRequest;
import uk.gov.gchq.gaffer.gaas.sidecar.models.WhatAuthResponse;
import uk.gov.gchq.gaffer.gaas.sidecar.services.AuthService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Component
@CrossOrigin
@RestController
public class SidecarController {

    @Autowired
    private AuthService authService;

    @PostMapping("/auth")
    public ResponseEntity<String> createAuthenticationToken(@RequestBody final JwtRequest authenticationRequest) throws Exception {
        try {
            final String token = authService.getToken(authenticationRequest);
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @GetMapping(path = "/what-auth", produces = "application/json")
    public ResponseEntity<WhatAuthResponse> getWhatAuth() {
        Map<String, String> attributes = new HashMap<>();
        Map<String, String> requiredHeaders = new HashMap<>();
        requiredHeaders.put("Authorization", "Bearer");
        ArrayList requiredFields = new ArrayList();
        requiredFields.add("username");
        requiredFields.add("password");
        WhatAuthResponse body = new WhatAuthResponse(attributes, requiredFields, requiredHeaders);
        return new ResponseEntity(body, HttpStatus.OK);
    }

}
