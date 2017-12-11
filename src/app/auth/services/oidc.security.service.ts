import { PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, EventEmitter, Output } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';
import { 
    AuthConfiguration, 
    OpenIDImplicitFlowConfiguration  
} from '../modules/auth.configuration';
import { OidcSecurityValidation } from './oidc.security.validation';
import { OidcSecurityCheckSession } from './oidc.security.check-session';
import { OidcSecuritySilentRenew } from './oidc.security.silent-renew';
import { OidcSecurityUserService } from './oidc.security.user-service';
import { OidcSecurityCommon } from './oidc.security.common';
import { AuthWellKnownEndpoints } from './auth.well-known-endpoints';
import { JwtKeys } from './jwtkeys';
import { AuthorizationResult } from './authorization-result.enum';
import { UriEncoder } from './uri-encoder';
import { timer } from 'rxjs/observable/timer';
import { pluck, take, catchError, timeInterval } from 'rxjs/operators';

@Injectable()
export class OidcSecurityService {
    @Output() onModuleSetup: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() 
    onAuthorizationResult: EventEmitter<AuthorizationResult> = new EventEmitter<
        AuthorizationResult
    >(true);

    checkSessionChanged: boolean;
    moduleSetup = false;
    private _isAuthorized = new BehaviorSubject<boolean>(false);
    private _isAuthorizedValue: boolean;   

    private lastUserData: any = undefined;
    private _userData = new BehaviorSubject<any>('');
    
    private oidcSecurityValidation: OidcSecurityValidation;
    private jwtKeys: JwtKeys;
    private authWellKnownEndpointsLoaded = false;
    private runTokenValidationRunning: boolean;    
    
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private http: HttpClient,
        private authConfiguration: AuthConfiguration,
        private router: Router,
        private oidcSecurityCheckSession: OidcSecurityCheckSession,
        private oidcSecuritySilentRenew: OidcSecuritySilentRenew,
        private oidcSecurityUserService: OidcSecurityUserService,
        private oidcSecurityCommon: OidcSecurityCommon,
        private authWellKnownEndpoints: AuthWellKnownEndpoints
    ) {}

    setupModule(
        openIDImplicitFlowConfiguration: OpenIDImplicitFlowConfiguration
    ): void {
        this.authConfiguration.init(openIDImplicitFlowConfiguration);
        this.oidcSecurityValidation = new OidcSecurityValidation(
            this.oidcSecurityCommon
        );

        this.oidcSecurityCheckSession.onCheckSessionChanged.subscribe(() => {
            this.onCheckSessionChanged();
        });
        this.authWellKnownEndpoints.onWellKnownEndpointsLoaded.subscribe(() => {
            this.onWellKnownEndpointsLoaded();
        });
        this._userData.subscribe(() => {
            this.onUserDataChanged();
        });

        this.oidcSecurityCommon.setupModule();

        const userData = this.oidcSecurityCommon.userData;
        if (userData !== '') {
            this.setUserData(userData);
        }

        const isAuthorized = this.oidcSecurityCommon.isAuthorized;
        if (isAuthorized !== undefined) {
            this.setIsAuthorized(isAuthorized);

            // Start the silent renew
            this.runTokenValidation();
        }

        this.oidcSecurityCommon.logDebug(
            'STS server: ' + this.authConfiguration.stsServer
        );

        if (isPlatformBrowser(this.platformId)) {
            // Client only code.
            this.authWellKnownEndpoints.onWellKnownEndpointsLoaded.subscribe(
                () => {
                    this.moduleSetup = true;
                    this.onModuleSetup.emit();

                    if (this.authConfiguration.silent_renew) {
                        this.oidcSecuritySilentRenew.initRenew();
                    }

                    if (this.authConfiguration.start_checksession && !this.oidcSecurityCheckSession.doesSessionExist()) {
                        this.oidcSecurityCheckSession.init().subscribe(() => {
                            this.oidcSecurityCheckSession.pollServerSession(
                                this.authConfiguration.client_id
                            );
                        });
                    }
                }
            );

            this.authWellKnownEndpoints.setupModule();
        } else {
            this.moduleSetup = true;
            this.onModuleSetup.emit();
        }        
    }
    
    getUserData(): Observable<any> {
        return this._userData.asObservable();
    }

    getIsAuthorized(): Observable<boolean> {
        return this._isAuthorized.asObservable();
    }
    
    getToken(): any {
        if (!this._isAuthorizedValue) {
            return '';
        }

        const token = this.oidcSecurityCommon.getAccessToken();
        return decodeURIComponent(token);
    }

    getIdToken(): any {
        if (!this._isAuthorizedValue) {
            return '';
        }

        const token = this.oidcSecurityCommon.getIdToken();
        return decodeURIComponent(token);
    }

    private setIsAuthorized(isAuthorized: boolean): void {
        this._isAuthorizedValue = isAuthorized;
        this._isAuthorized.next(isAuthorized);
    }

    getPayloadFromIdToken(encode = false): any {
        const token = this.getIdToken();
        return this.oidcSecurityValidation.getPayloadFromToken(token, encode);
    }

    private handleErrorGetSigningKeys(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || {};
            const err = JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    private runTokenValidation() {
        if (this.runTokenValidationRunning) {
            return;
        }
        this.runTokenValidationRunning = true;

        const source = timer(5000, 3000).pipe(
            timeInterval(),
            pluck('interval'),
            take(10000)
        );

        source.subscribe(
            () => {
                if (this._userData.value) {
                    if (
                        this.oidcSecurityValidation.isTokenExpired(
                            this.oidcSecurityCommon.idToken,
                            this.authConfiguration
                                .silent_renew_offset_in_seconds
                        )
                    ) {
                        this.oidcSecurityCommon.logDebug(
                            'IsAuthorized: id_token isTokenExpired, start silent renew if active'
                        );

                        if (this.authConfiguration.silent_renew) {
                            this.refreshSession();
                        } else {
                            this.resetAuthorizationData(false);
                        }
                    }
                }
            },
            (err: any) => {
                this.oidcSecurityCommon.logError('Error: ' + err);
            },
            () => {
                this.oidcSecurityCommon.logDebug('Completed');
            }
        );
    }

    
}