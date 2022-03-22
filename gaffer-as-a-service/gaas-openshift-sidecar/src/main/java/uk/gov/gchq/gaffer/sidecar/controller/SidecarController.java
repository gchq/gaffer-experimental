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

package uk.gov.gchq.gaffer.sidecar.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import uk.gov.gchq.gaffer.sidecar.handlers.HelmValuesOverridesHandler;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@CrossOrigin
@RestController
public class SidecarController {

    @Autowired
    private HelmValuesOverridesHandler helmValuesOverridesHandler;

//    @Value("${cognito.enabled: false}")
//    boolean cognitoEnabled;

    @Value("${openshift.enabled: false}")
    boolean openshiftEnabled;

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

    @GetMapping(path = "/whoami", produces = "application/json")
    ResponseEntity<String> whoami(@RequestHeader("x-email") final String email) {
        if (addCreatorLabel(email)) {
            return new ResponseEntity<String>(email, HttpStatus.OK);
        }
        return new ResponseEntity<>("Validation error: Email must consist of alphanumeric characters or '-', '_' and '.' ", HttpStatus.BAD_REQUEST);
    }

    private boolean addCreatorLabel(final String email) {
        String strippedEmail = email;
        if (email.contains("@")) {
            strippedEmail = email.substring(0, email.indexOf('@'));
        }
        if (isCreatorLabelValid(strippedEmail)) {
            helmValuesOverridesHandler.addOverride("labels.creator", strippedEmail);
            return true;
        }
        return false;
    }

    private boolean isCreatorLabelValid(final String email) {
        Pattern pattern = Pattern.compile("(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])");
        Matcher matcher = pattern.matcher(email);
        return matcher.matches();
    }

}
