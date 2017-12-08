import { Injectable, EventEmitter, Output } from "@angular/core";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeInterval';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/timer';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';
import { AuthConfiguration, OpenIDImplicitFlowConfiguration  } from '../modules/auth.configuration';
import { OidcSecurityValidation } from './oidc.security.validation';
import { OidcSecurityCheckSession } from './oidc.security.check-session';
import { OidcSecuritySilentRenew } from './oidc.security.silent-renew';
import { OidcSecurityUserService } from './oidc.security.user-service';
import { OidcSecurityCommon } from './oidc.security.common';

import { JwtKeys } from './jwtkeys';
import { AuthorizationResult } from './authorization-result.enum';
import { UriEncoder } from './uri-encoder';

/**
 * Implement this class-interface to create a custom storage.
 */
@Injectable()
export class OidcSecurityService {

    @Output() onModuleSetup: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() onAuthorizationResult: EventEmitter<AuthorizationResult> = new EventEmitter<AuthorizationResult>(true);

    private _isAuthorizedValue: boolean;   

    private oidcSecurityValidation: OidcSecurityValidation;
    
    constructor(
        private oidcSecurityCommon: OidcSecurityCommon
    ) {
    }

    setupModule(openIDImplicitFlowConfiguration: OpenIDImplicitFlowConfiguration): void {

    }

    getIdToken(): any {
        if (!this._isAuthorizedValue) {
            return '';
        }

        let token = this.oidcSecurityCommon.getIdToken();
        return decodeURIComponent(token);
    }

    getPayloadFromIdToken(encode = false): any {
        const token = this.getIdToken();
        return this.oidcSecurityValidation.getPayloadFromToken(token, encode);
    }
    
}