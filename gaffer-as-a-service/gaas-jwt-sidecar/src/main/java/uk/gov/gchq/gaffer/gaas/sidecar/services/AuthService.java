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

package uk.gov.gchq.gaffer.gaas.sidecar.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import uk.gov.gchq.gaffer.gaas.sidecar.auth.JwtRequest;
import uk.gov.gchq.gaffer.gaas.sidecar.auth.JwtTokenUtil;
import uk.gov.gchq.gaffer.gaas.sidecar.auth.JwtUserDetailsService;

@Service
public class AuthService {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private JwtUserDetailsService userDetailsService;

    Logger logger = LoggerFactory.getLogger(AuthService.class);

    public String getToken(final JwtRequest authenticationRequest) {
        logger.info("Find user details =");
        final UserDetails userDetails = userDetailsService
                .loadUserByUsername(authenticationRequest.getUsername());
        logger.info("Found user details =");
        return jwtTokenUtil.generateToken(userDetails);
    }

    public String getOwnerName(final JwtRequest authenticationRequest) {
        logger.info("Find owner name =");
        final UserDetails userDetails = userDetailsService
                .loadUserByUsername(authenticationRequest.getUsername());
        logger.info("Found owner name =");
        return userDetails.getUsername();
    }
}
