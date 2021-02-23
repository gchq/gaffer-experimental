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

package uk.gov.gchq.gaffer.gaas.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import uk.gov.gchq.gaffer.gaas.auth.JwtRequest;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
public class AuthServiceTest {

    @Autowired
    AuthService authService;

    @MockBean
    AuthenticationManager authenticationManager;

    @Test
    public void getToken_shouldThrowBadCredentials_whenUserHasNullUsernameAndPassword() {
        final JwtRequest user = new JwtRequest();

        assertThrows(UsernameNotFoundException.class, () -> authService.getToken(user));
    }

    @Test
    public void getToken_shouldThrowBadCredentials_whenUserHasNullUsername() {
        final JwtRequest user = new JwtRequest();
        user.setPassword("p@$$word");

        assertThrows(UsernameNotFoundException.class, () -> authService.getToken(user));
    }

    @Test
    public void getToken_shouldThrowBadCredentials_whenUserHasNullPassword() {
        final JwtRequest user = new JwtRequest();
        user.setUsername("username");

        assertThrows(UsernameNotFoundException.class, () -> authService.getToken(user));
    }

    @Test
    public void getToken_shouldThrowBadCredentials_whenUserIsNotValid() {
        final JwtRequest user = new JwtRequest();
        user.setUsername("invalid_username");
        user.setPassword("paaaassword");

        assertThrows(UsernameNotFoundException.class, () -> authService.getToken(user));
    }

    @Test
    public void getToken_shouldThrowBadCredentials_whenUsernameIsNotValid() {
        final JwtRequest user = new JwtRequest();
        user.setUsername("invalid_user");
        user.setPassword("Pa$$_w0rd");

        assertThrows(UsernameNotFoundException.class, () -> authService.getToken(user));
    }

    @Test
    public void getToken_shouldReturnToken_whenUsernameIsValid() throws GaaSRestApiException {
        final JwtRequest user = new JwtRequest();
        user.setUsername("javainuse");
        user.setPassword("password");

        final String token = authService.getToken(user);

        assertEquals(179, token.length());
    }

    @Test
    public void getToken_whenAuthManagerThrowsBadCredential_throwGafferWorkerExceptionWithBadCredMessage() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenThrow(new BadCredentialsException("Bad credentials"));
        final JwtRequest user = new JwtRequest();
        user.setUsername("javainuse");
        user.setPassword("password");

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> authService.getToken(user));

        assertEquals("Bad credentials", exception.getBody());
        assertEquals("BadCredentialsException", exception.getMessage());
    }

    @Test
    public void getToken_whenAuthManagerThrowsAccountExpired_throwGafferWorkerExceptionWithAccountExpiredMessage() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenThrow(new AccountExpiredException("This account has expired"));
        final JwtRequest user = new JwtRequest();
        user.setUsername("javainuse");
        user.setPassword("password");

        final GaaSRestApiException exception = assertThrows(GaaSRestApiException.class, () -> authService.getToken(user));

        assertEquals("This account has expired", exception.getBody());
        assertEquals("AccountExpiredException", exception.getMessage());
    }
}
