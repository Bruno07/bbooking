import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Router from "./router"
import './index.css'
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'bbooking',
  clientId: 'catalog'
};

const initOptions = { onLoad: 'check-sso' };

createRoot(document.getElementById('root')!).render(
    <ReactKeycloakProvider authClient={new Keycloak(keycloakConfig)} initOptions={initOptions}>
      <StrictMode>
        <Router />
      </StrictMode>
    </ReactKeycloakProvider>,
)
