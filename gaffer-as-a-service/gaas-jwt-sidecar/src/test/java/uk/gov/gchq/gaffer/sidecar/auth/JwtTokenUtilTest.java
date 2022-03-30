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
package uk.gov.gchq.gaffer.sidecar.auth;

import io.jsonwebtoken.SignatureException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import uk.gov.gchq.gaffer.sidecar.util.UnitTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

@UnitTest
class JwtTokenUtilTest {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;


    @Test
    void changedSignatureToken() {
        //given
        UserDetails userDetails = mock(UserDetails.class);
        given(userDetails.getUsername()).willReturn("nenad");

        //when
        String token = jwtTokenUtil.generateToken(userDetails).concat("a");

        //then
        assertThrows(SignatureException.class, () -> jwtTokenUtil.validateToken(token, userDetails));
    }

    @Test
    void validToken() {
        //given
        UserDetails userDetails = mock(UserDetails.class);
        given(userDetails.getUsername()).willReturn("nenad");

        //when
        String token = jwtTokenUtil.generateToken(userDetails);
        boolean tokenValidated = jwtTokenUtil.validateToken(token, userDetails);

        //then
        assertThat(tokenValidated).isTrue();
    }

    @Test
    void invalidToken() {
        //given
        UserDetails authenticatedUser = mock(UserDetails.class);
        given(authenticatedUser.getUsername()).willReturn("nenad");
        UserDetails intruder = mock(UserDetails.class);
        given(intruder.getUsername()).willReturn("n3nad");

        //when
        String token = jwtTokenUtil.generateToken(authenticatedUser);
        boolean tokenValidated = jwtTokenUtil.validateToken(token, intruder);

        //then
        assertThat(tokenValidated).isFalse();
    }
}

