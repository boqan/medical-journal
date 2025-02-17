package com.batanasov.medical_record_app.security;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeyCloakConfig {

    @Bean
    public Keycloak keycloak(@Value("${keycloak.auth-server-url}") String serverUrl,
                             @Value("${keycloak.realm}") String realm,
                             @Value("${keycloak.resource}") String clientId,
                             @Value("${keycloak.credentials.secret}") String clientSecret) {

        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                .clientId(clientId)
                .clientSecret(clientSecret)
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .build();
    }
}
