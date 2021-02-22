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

package uk.gov.gchq.gaffer.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import uk.gov.gchq.gaffer.auth.JwtRequest;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
public class AuthServiceTest {

    @Autowired
    AuthService authService;

    @Test
    public void getToken_shouldThrowBadCredentials_whenUserHasNullUsernameAndPassword() {
        final JwtRequest user = new JwtRequest();

        assertThrows(BadCredentialsException.class, () -> authService.getToken(user));
    }

    @Test
    public void getToken_shouldThrowBadCredentials_whenUserHasNullUsername() {
        final JwtRequest user = new JwtRequest();
        user.setPassword("p@$$word");

        assertThrows(BadCredentialsException.class, () -> authService.getToken(user));
    }

    @Test
    public void getToken_shouldThrowBadCredentials_whenUserHasNullPassword() {
        final JwtRequest user = new JwtRequest();
        user.setUsername("username");

        assertThrows(BadCredentialsException.class, () -> authService.getToken(user));
    }

    @Test
    public void getToken_shouldThrowBadCredentials_whenUserIsNotValid() {
        final JwtRequest user = new JwtRequest();
        user.setUsername("invalid_username");
        user.setPassword("paaaassword");

        assertThrows(BadCredentialsException.class, () -> authService.getToken(user));
    }

    @Test
    public void getToken_shouldThrowBadCredentials_whenUsernameIsNotValid() {
        final JwtRequest user = new JwtRequest();
        user.setUsername("invalid_user");
        user.setPassword("Pa$$_w0rd");

        assertThrows(BadCredentialsException.class, () -> authService.getToken(user));
    }

    @Test
    public void getToken_shouldReturnToken_whenUsernameIsValid() {
        final JwtRequest user = new JwtRequest();
        user.setUsername("javainuse");
        user.setPassword("password");

        final String token = authService.getToken(user);

        assertEquals(179, token.length());
    }
}
