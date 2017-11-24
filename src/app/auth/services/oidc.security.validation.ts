import { Injectable } from '@angular/core';
import { OidcSecurityCommon } from './oidc.security.common';

import { KJUR, KEYUTIL, hextob64u } from 'jsrsasign';

// http://openid.net/specs/openid-connect-implicit-1_0.html

// id_token
//// id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery) MUST exactly match the value of the iss (issuer) Claim.
//// id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified by the iss (issuer) Claim as an audience.The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences not trusted by the Client.
// id_token C3: If the ID Token contains multiple audiences, the Client SHOULD verify that an azp Claim is present.
// id_token C4: If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
//// id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the alg Header Parameter of the JOSE Header. The Client MUST use the keys provided by the Issuer.
//// id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the OpenID Connect Core 1.0 [OpenID.Core] specification.
//// id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account for clock skew).
//// id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time, limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
//// id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one that was sent in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.The precise method for detecting replay attacks is Client specific.
// id_token C10: If the acr Claim was requested, the Client SHOULD check that the asserted Claim Value is appropriate.The meaning and processing of acr Claim Values is out of scope for this document.
// id_token C11: When a max_age request is made, the Client SHOULD check the auth_time Claim value and request re- authentication if it determines too much time has elapsed since the last End- User authentication.

//// Access Token Validation
//// access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA] for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
//// access_token C2: Take the left- most half of the hash and base64url- encode it.
//// access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash is present in the ID Token.

@Injectable()
export class OidcSecurityValidation {
    constructor(private oidcSecrityCommon: OidcSecurityCommon) {
    }

    // id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account for clock skew).
    isTokenExpired(token: string, offsetSeconds?: number): boolean {
        
                let decoded: any;
                decoded = this.getPayloadFromToken(token, false);
        
                return !(this.validate_id_token_exp_not_expired(decoded, offsetSeconds));
            }
        
            // id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account for clock skew).
            validate_id_token_exp_not_expired(decoded_id_token: string, offsetSeconds?: number): boolean {
                let tokenExpirationDate = this.getTokenExpirationDate(decoded_id_token);
                offsetSeconds = offsetSeconds || 0;
        
                if (tokenExpirationDate == null) {
                    return false;
                }
        
                // Token not expired?
                return (tokenExpirationDate.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
            }
    private urlBase64Decode(str: string) {
        let output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }

        return window.atob(output);
    }
}