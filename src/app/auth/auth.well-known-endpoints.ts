export class AuthWellKnownEndpoints {
    issuer: string;
    jwks_url: string;
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    end_session_endpoint: string;

    public setWellKnownEndpoints(data: any) {
        this.issuer = data.issuer;

    }
}