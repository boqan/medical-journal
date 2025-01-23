package com.batanasov.medical_record_app.service;

import com.batanasov.medical_record_app.exception.KeyCloakClientException;
import com.batanasov.medical_record_app.exception.KeyCloakUserException;
import com.batanasov.medical_record_app.exception.UnauthorizedRoleRegistrationException;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.ClientsResource;
import org.keycloak.admin.client.resource.RealmResource;

import org.keycloak.admin.client.resource.RoleResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.ClientRepresentation;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class KeycloakAdminClientService {

    private final Keycloak keycloak;
    private final String realm;

    public KeycloakAdminClientService(Keycloak keycloak,
                                      @Value("${keycloak.realm}") String realm) {
        this.keycloak = keycloak;
        this.realm = realm;
    }

    /**
     * Create a user in Keycloak with given username/password and realm role.
     * Return the newly created user's ID (UUID in Keycloak).
     */
    public String createUser(String username, String password, String roleName) {
        // 1) build user representation
        UserRepresentation user = new UserRepresentation();
        user.setUsername(username);
        user.setEnabled(true);

        // 2) create user
        RealmResource realmResource = keycloak.realm(realm);
        Response response = realmResource.users().create(user);

        if (response.getStatus() != 201) {
            String error = "Could not create user in Keycloak. Response status: " + response.getStatus();
            log.error(error);
            throw new KeyCloakUserException(error);
        }

        // Keycloak returns the new user ID in the "Location" header
        String userId = getCreatedId(response);

        // 3) set password (make it non-temporary)
        CredentialRepresentation cred = new CredentialRepresentation();
        cred.setType(CredentialRepresentation.PASSWORD);
        cred.setValue(password);
        cred.setTemporary(false);

        UsersResource usersResource = realmResource.users();
        usersResource.get(userId).resetPassword(cred);

        // 4) Assign the user a client-level role (instead of a realm-level one)
        if (roleName != null) {
            // a) find the client by clientId = "medical-backend"

            ClientsResource clientsResource = realmResource.clients();
            List<ClientRepresentation> foundClients = clientsResource.findByClientId("medical-backend");
            if (foundClients == null || foundClients.isEmpty()) {
                String error = "Client 'medical-backend' not found in realm " + realm;
                log.error(error);
                throw new KeyCloakClientException(error);
            }
            String clientUuid = foundClients.get(0).getId();

            if(roleName.equals("admin")) {
                throw new UnauthorizedRoleRegistrationException("Unauthorized role registration - you cannot register an admin user");
            }

            // b) get the role from the client
            RoleResource roleResource = clientsResource.get(clientUuid).roles().get(roleName);
            RoleRepresentation roleRep = roleResource.toRepresentation();

            // c) assign client-level role to the user
            usersResource.get(userId)
                    .roles()
                    .clientLevel(clientUuid)
                    .add(Collections.singletonList(roleRep));
        }

        log.info("Created user in Keycloak: userId={}, username={}, role={}", userId, username, roleName);
        return userId;
    }

    private String getCreatedId(Response response) {
        String path = response.getLocation().getPath();
        // path looks like: /realms/<realm>/users/<userId>
        return path.substring(path.lastIndexOf("/") + 1);
    }
}