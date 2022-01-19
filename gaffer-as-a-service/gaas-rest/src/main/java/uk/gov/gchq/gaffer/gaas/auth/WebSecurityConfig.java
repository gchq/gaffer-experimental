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
package uk.gov.gchq.gaffer.gaas.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri: default}")
    String issuerUri;

    @Value("${cognito.enabled: false}")
    boolean cognitoEnabled;

    @Value("${jwt.enabled: false}")
    boolean jwtEnabled;

    @Value("${openshift.enabled: false}")
    boolean openshiftEnabled;

    @Autowired(required = false)
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    private final UserDetailsService jwtUserDetailsService;

    private final JwtRequestFilter jwtRequestFilter;

    public WebSecurityConfig(final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint, final UserDetailsService jwtUserDetailsService, final JwtRequestFilter jwtRequestFilter) {
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.jwtUserDetailsService = jwtUserDetailsService;
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Autowired(required = false)
    public void configureGlobal(final AuthenticationManagerBuilder auth) throws Exception {
        // configure AuthenticationManager so that it knows from where to load
        // user for matching credentials
        // Use BCryptPasswordEncoder
        auth.userDetailsService(jwtUserDetailsService).passwordEncoder(passwordEncoder());
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }


    @Override
    protected void configure(final HttpSecurity http) throws Exception {
        if (cognitoEnabled) {
            http
                    .authorizeRequests(authorizeRequests ->
                            authorizeRequests
                                    .antMatchers("/v2/api-docs", "/swagger-ui.html", "/swagger-ui/", "/swagger-ui/**", "/swagger-resources",
                                            "/swagger-resources/**", "/webjars/**", "/actuator/**").hasAuthority("SCOPE_services:read")
                                    .anyRequest().authenticated()
                    )
                    .oauth2ResourceServer(oauth2ResourceServer ->
                            oauth2ResourceServer
                                    .jwt(jwt ->
                                            jwt.decoder(JwtDecoders.fromIssuerLocation(issuerUri))
                                    )
                    );
        }
        if (jwtEnabled) {
            http.csrf().disable() // nosemgrep: java.spring.security.audit.spring-csrf-disabled.spring-csrf-disabled
                    //csrf is disabled as the application uses JWT and stateless and cookieless authentication when using this configuration
                    // don't authenticate this particular request
                    .authorizeRequests()
                    .antMatchers("/auth", "/v2/api-docs", "/swagger-ui.html", "/swagger-ui/", "/swagger-ui/**", "/swagger-resources",
                            "/swagger-resources/**", "/webjars/**", "/actuator/**")
                    .permitAll()
                    // all other requests need to be authenticated
                    .anyRequest()
                    .authenticated()
                    .and()
                    // make sure we use stateless session; session won't be used to
                    // store user's state.
                    .exceptionHandling()
                    .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                    .and()
                    .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

            // Add a filter to validate the tokens with every request
            http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        }
        if (openshiftEnabled) {
            http.csrf().disable() // nosemgrep: java.spring.security.audit.spring-csrf-disabled.spring-csrf-disabled
                    //csrf is disabled as the application uses JWT and stateless and cookieless authentication when using this configuration
                    // dont authenticate this particular request
                    .authorizeRequests()
                    .antMatchers("/auth", "/v2/api-docs", "/swagger-ui.html", "/swagger-ui/", "/swagger-ui/**", "/swagger-resources",
                            "/swagger-resources/**", "/webjars/**", "/actuator/**")
                    .permitAll()
                    // all other requests need to be authenticated
                    .anyRequest()
                    .authenticated()
                    .and()
                    // make sure we use stateless session; session won't be used to
                    // store user's state.
                    .exceptionHandling()
                    .and()
                    .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        }
        http.cors();

    }

}
