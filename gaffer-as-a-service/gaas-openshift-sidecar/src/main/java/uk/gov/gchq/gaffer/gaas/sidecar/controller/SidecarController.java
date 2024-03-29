/*
 * Copyright 2021-2022 Crown Copyright
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import uk.gov.gchq.gaffer.gaas.sidecar.models.WhatAuthResponse;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Component
@CrossOrigin
@RestController
public class SidecarController {

    Logger logger = LoggerFactory.getLogger(SidecarController.class);

    @GetMapping(path = "/whoami", produces = "application/json")
    ResponseEntity<String> whoami(@RequestHeader("x-email") final String email) {
        logger.info("Found x-email");
        return new ResponseEntity<>(email, HttpStatus.OK);
    }
    @GetMapping(path = "/what-auth", produces = "application/json")
    public ResponseEntity<WhatAuthResponse> getWhatAuth() {
        Map<String, String> attributes = new HashMap<>();
        attributes.put("withCredentials", "true");
        Map<String, String> requiredHeaders = new HashMap<>();
        ArrayList requiredFields = new ArrayList();
        WhatAuthResponse body = new WhatAuthResponse(attributes, requiredFields, requiredHeaders);
        return new ResponseEntity(body, HttpStatus.OK);
    }
}
