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

    getPayloadFromIdToken(encode = false): any {
        const token = this.getIdToken();
        return this.oidcSecurityValidation.getPayloadFromToken(token, encode);
    }

    setState(state: string): void {
        this.oidcSecurityCommon.authStateControl = state;
    }

    getState(): string {
        return this.oidcSecurityCommon.authStateControl;
    }

    setCustomRequestParameters(params: {
        [key: string]: string | number | boolean;
    }) {
        this.oidcSecurityCommon.customRequestParams = params;
    }    

    authorize() {
        const data = this.oidcSecurityCommon.wellKnownEndpoints;
        if (data && data !== '') {
            this.authWellKnownEndpointsLoaded = true;
        }    

        if (!this.authWellKnownEndpointsLoaded) {
            this.oidcSecurityCommon.logError(
                'Well known endpoints must be loaded before user can login!'
            );
            return;
        }   
        
        if (
            !this.oidcSecurityValidation.config_validate_response_type(
                this.authConfiguration.response_type
            )
        ) {
            // invalid response_type
            return;
        }

        this.resetAuthorizationData(false);   
        
        this.oidcSecurityCommon.logDebug('BEGIN Authorize, no auth data');
        
        let state = this.oidcSecurityCommon.authStateControl;
        if (state === '' || state === null) {
            state = Date.now() + '' + Math.random();
            this.oidcSecurityCommon.authStateControl = state;
        }
        
        const nonce = 'N' + Math.random() + '' + Date.now();
        this.oidcSecurityCommon.authNonce = nonce;
        this.oidcSecurityCommon.logDebug(
            'AuthorizedController created. local state: ' +   
                this.oidcSecurityCommon.authStateControl
        );

        const url = this.createAuthorizeUrl(
            nonce,
            state,
            this.authWellKnownEndpoints.authorization_endpoint
        );
        window.location.href = url;        
    }    

    authorizedCallback(hash?: string) {
        const silentRenew = this.oidcSecurityCommon.silentRenewRunning;
        const isRenewProcess = silentRenew === 'running';

        this.oidcSecurityCommon.logDebug(
            'BEGIN authorizedCallback, no auth data'
        );
        this.resetAuthorizationData(isRenewProcess);
                
        hash = hash || window.location.hash.substr(1);
        
        const result: any = hash
            .split('&')
            .reduce(function(resultData: any, item: string) {
                const parts = item.split('=');
                resultData[parts[0]] = parts[1];
                return resultData;
            }, {});

        this.oidcSecurityCommon.authResult = result;
        this.oidcSecurityCommon.logDebug(result);
        this.oidcSecurityCommon.logDebug(
            'authorizedCallback created, begin token validation'
        );                    

        let access_token = '';
        let id_token = '';
        let authResponseIsValid = false;
        let decoded_id_token: any;

        this.getSigningKeys().subscribe(jwtKeys => {
            this.jwtKeys = jwtKeys;        
            
        if (!result.error) {
            // validate state
            if (
                this.oidcSecurityValidation.validateStateFromHashCallback(
                    result.state,
                    this.oidcSecurityCommon.authStateControl
                )
            ) {
                if (
                    this.authConfiguration.response_type ===
                    'id_token token'
                ) {
                    access_token = result.access_token;
                }
                id_token = result.id_token;

                decoded_id_token = this.oidcSecurityValidation.getPayloadFromToken(
                    id_token,
                    false
                );

                // validate jwt signature
                if (
                    this.oidcSecurityValidation.validate_signature_id_token(
                        id_token,
                        this.jwtKeys
                    )
                ) {
                    // validate nonce
                    if (
                        this.oidcSecurityValidation.validate_id_token_nonce(
                            decoded_id_token,
                            this.oidcSecurityCommon.authNonce
                        )
                    ) {
                        // validate required fields id_token
                        if (
                            this.oidcSecurityValidation.validate_required_id_token(
                                decoded_id_token
                            )
                        ) {
                            // validate max offset from the id_token issue to now
                            if (
                                this.oidcSecurityValidation.validate_id_token_iat_max_offset(
                                    decoded_id_token,
                                    this.authConfiguration
                                        .max_id_token_iat_offset_allowed_in_seconds
                                )
                            ) {
                                // validate iss
                                if (
                                    this.oidcSecurityValidation.validate_id_token_iss(
                                        decoded_id_token,
                                        this.authWellKnownEndpoints.issuer
                                    )
                                ) {
                                    // validate aud
                                    if (
                                        this.oidcSecurityValidation.validate_id_token_aud(
                                            decoded_id_token,
                                            this.authConfiguration.client_id
                                        )
                                    ) {
                                        // validate_id_token_exp_not_expired
                                        if (
                                            this.oidcSecurityValidation.validate_id_token_exp_not_expired(
                                                decoded_id_token
                                            )
                                        ) {
                                            // flow id_token token
                                            if (
                                                this.authConfiguration
                                                    .response_type ===
                                                'id_token token'
                                            ) {
                                                // valiadate at_hash and access_token
                                                if (
                                                    this.oidcSecurityValidation.validate_id_token_at_hash(
                                                        access_token,
                                                        decoded_id_token.at_hash
                                                    ) ||
                                                    !access_token
                                                ) {
                                                    authResponseIsValid = true;
                                                    this.successful_validation();
                                                } else {
                                                    this.oidcSecurityCommon.logWarning(
                                                        'authorizedCallback incorrect at_hash'
                                                    );
                                                }
                                            } else {
                                                authResponseIsValid = true;
                                                this.successful_validation();
                                            }
                                        } else {
                                            this.oidcSecurityCommon.logWarning(
                                                'authorizedCallback token expired'
                                            );
                                        }
                                    } else {
                                        this.oidcSecurityCommon.logWarning(
                                            'authorizedCallback incorrect aud'
                                        );
                                    }
                                } else {
                                    this.oidcSecurityCommon.logWarning(
                                        'authorizedCallback incorrect iss does not match authWellKnownEndpoints issuer'
                                    );
                                }
                            } else {
                                this.oidcSecurityCommon.logWarning(
                                    'authorizedCallback Validation, iat rejected id_token was issued too far away from the current time'
                                );
                            }
                        } else {
                            this.oidcSecurityCommon.logDebug(
                                'authorizedCallback Validation, one of the REQUIRED properties missing from id_token'
                            );
                        }
                    } else {
                        this.oidcSecurityCommon.logWarning(
                            'authorizedCallback incorrect nonce'
                        );
                    }
                } else {
                    this.oidcSecurityCommon.logDebug(
                        'authorizedCallback Signature validation failed id_token'
                    );
                }
            } else {
                this.oidcSecurityCommon.logWarning(
                    'authorizedCallback incorrect state'
                );
            }
        }

        this.oidcSecurityCommon.silentRenewRunning = '';   
        
        if (authResponseIsValid) {
            this.setAuthorizationData(access_token, id_token);
            if (this.authConfiguration.auto_userinfo) {
                this.getUserinfo(
                    isRenewProcess,
                    result,
                    id_token,
                    decoded_id_token
                ).subscribe(response => {
                    if (response) {
                        if (
                            this.authConfiguration
                                .trigger_authorization_result_event
                        ) {
                            this.onAuthorizationResult.emit(
                                AuthorizationResult.authorized
                            );
                        } else {
                            this.router.navigate([
                                this.authConfiguration.post_login_route
                            ]);
                        }
                    } else {
                        if (
                            this.authConfiguration
                                .trigger_authorization_result_event
                        ) {
                            this.onAuthorizationResult.emit(
                                AuthorizationResult.unauthorized
                            );
                        } else {
                            this.router.navigate([
                                this.authConfiguration.unauthorized_route
                            ]);
                        }
                    }
                });
            } else {
                this.runTokenValidation();
                if (
                    this.authConfiguration
                        .trigger_authorization_result_event
                ) {
                    this.onAuthorizationResult.emit(
                        AuthorizationResult.authorized
                    );
                } else {
                    this.router.navigate([
                        this.authConfiguration.post_login_route
                    ]);
                }
            }
        } else {
            // something went wrong
            this.oidcSecurityCommon.logDebug(
                'authorizedCallback, token(s) validation failed, resetting'
            );
            this.resetAuthorizationData(false);
            if (this.authConfiguration.trigger_authorization_result_event) {
                this.onAuthorizationResult.emit(
                    AuthorizationResult.unauthorized
                );
            } else {
                this.router.navigate([
                    this.authConfiguration.unauthorized_route
                ]);
            }
        }
    });        
    }     

    refreshSession() {
        this.oidcSecurityCommon.logDebug('BEGIN refresh session Authorize');

        let state = this.oidcSecurityCommon.authStateControl;
        if (state === '' || state === null) {
            state = Date.now() + '' + Math.random();
            this.oidcSecurityCommon.authStateControl = state;
        }

        const nonce = 'N' + Math.random() + '' + Date.now();
        this.oidcSecurityCommon.authNonce = nonce;
        this.oidcSecurityCommon.logDebug(
            'RefreshSession created. adding myautostate: ' +
                this.oidcSecurityCommon.authStateControl
        );

        const url = this.createAuthorizeUrl(
            nonce,
            state,
            this.authWellKnownEndpoints.authorization_endpoint,
            'none'
        );

        this.oidcSecurityCommon.silentRenewRunning = 'running';
        this.oidcSecuritySilentRenew.startRenew(url);
    }

    handleError(error: any) {
        this.oidcSecurityCommon.logError(error);
        if (error.status === 403 || error.status === '403') {
            if (this.authConfiguration.trigger_authorization_result_event) {
                this.onAuthorizationResult.emit(
                    AuthorizationResult.unauthorized
                );
            } else {
                this.router.navigate([this.authConfiguration.forbidden_route]);
            }
        } else if (error.status === 401 || error.status === '401') {
            const silentRenew = this.oidcSecurityCommon.silentRenewRunning;
            this.resetAuthorizationData(silentRenew !== '');
            if (this.authConfiguration.trigger_authorization_result_event) {
                this.onAuthorizationResult.emit(
                    AuthorizationResult.unauthorized
                );
            } else {
                this.router.navigate([
                    this.authConfiguration.unauthorized_route
                ]);
            }
        }
    }    

    private setUserData(userData: any): void {
        this.oidcSecurityCommon.userData = userData;
        this._userData.next(userData);
    }

    private setIsAuthorized(isAuthorized: boolean): void {
        this._isAuthorizedValue = isAuthorized;
        this._isAuthorized.next(isAuthorized);
    }

    private createAuthorizeUrl(
        nonce: string,
        state: string,
        authorization_endpoint: string,
        prompt?: string
    ): string {
        const urlParts = authorization_endpoint.split('?');
        const authorizationUrl = urlParts[0];
        let params = new HttpParams({
            fromString: urlParts[1],
            encoder: new UriEncoder()
        });        
        params = params.set('client_id', this.authConfiguration.client_id);
        params = params.append(
            'redirect_uri',
            this.authConfiguration.redirect_url
        );
        return `${authorizationUrl}?${params}`;
    }

    private resetAuthorizationData(isRenewProcess: boolean) {
        if (!isRenewProcess) {
            if (this.authConfiguration.auto_userinfo) {
                // Clear user data. Fixes #97.
                this.setUserData('');
            }
            this.setIsAuthorized(false);
            this.oidcSecurityCommon.resetStorageData(isRenewProcess);
            this.checkSessionChanged = false;
        }
    }

    private onCheckSessionChanged() {
        this.oidcSecurityCommon.logDebug('onCheckSessionChanged');
        this.checkSessionChanged = true;
    }

    private onWellKnownEndpointsLoaded() {
        this.oidcSecurityCommon.logDebug('onWellKnownEndpointsLoaded');
        this.authWellKnownEndpointsLoaded = true;
    }

    private onUserDataChanged() {
        this.oidcSecurityCommon.logDebug(
            `onUserDataChanged: last = ${this.lastUserData}, new = ${
                this._userData.value
            }`
        );

        if (this.lastUserData && !this._userData.value) {
            this.oidcSecurityCommon.logDebug(
                'onUserDataChanged: Logout detected.'
            );
            // TODO should we have an action here
        }
        this.lastUserData = this._userData.value;
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