import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'medical-realm',
  clientId: 'medical-frontend' // the new PUBLIC client
});

export default keycloak;