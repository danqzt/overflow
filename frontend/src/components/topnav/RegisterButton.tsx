import {Button} from "@heroui/button";

export default function RegisterButton() {
    const clientId = import.meta.env.VITE_AUTH_KEYCLOAK_CLIENT_ID;
    const issuer = import.meta.env.VITE_AUTH_KEYCLOAK_ISSUER;
    const baseUrl = import.meta.env.VITE_AUTH_URL;
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: baseUrl,
        response_type: 'code',
        scope: 'openid'
    });
    const registerUrl = `${issuer}/protocol/openid-connect/registrations?${params.toString()}`;

    return (
        <Button as='a' href={registerUrl} color="secondary">Register</Button>
    );
}