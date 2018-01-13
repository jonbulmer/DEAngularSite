import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { OidcSecurityService } from '../auth/services/oidc.security.service';
import './app.component.css';
import { AuthorizationResult } from '../auth/models/authorization-result.enum';

@Component({
    selector: 'app-component',
    templateUrl: 'app.component.html',
})


export class AppComponent implements OnInit, OnDestroy {

    title: string;

    isAuthorizedSubscription: Subscription;
    isAuthorized: boolean;

    onChecksessionChanged: Subscription;
    checksession = false;

    constructor(
        public oidcSecurityService: OidcSecurityService
    ) {
        if (this.oidcSecurityService.moduleSetup) {
            this.doCallbackLogicIfRequired();
        } else {
            this.oidcSecurityService.onModuleSetup.subscribe(() => {
                this.doCallbackLogicIfRequired();
            });
        }        
    }

    this.oidcSecurityService.onCheckSessionChanged.subscribe(
        (checksession: boolean) => {
            console.log('...recieved a check session event');
            this.checksession = checksession;
        });

    this.oidcSecurityService.onAuthorizationResult.subscribe(
        (authorizationResult: AuthorizationResult) => {
            this.onAuthorizationResultComplete(authorizationResult);
        });

        ngOnDestroy(): void {
            this.isAuthorizedSubscription.unsubscribe();
            this.oidcSecurityService.onModuleSetup.unsubscribe();
            this.oidcSecurityService.onCheckSessionChanged.unsubscribe();
            this.oidcSecurityService.onAuthorizationResult.unsubscribe();
        }

        ngOnInit() {
            this.isAuthorizedSubscription = this.oidcSecurityService.getIsAuthorized().subscribe(
                (isAuthorized: boolean) => {
                    this.isAuthorized = isAuthorized;
                });
        }

     
    
 

        login() {
            this.oidcSecurityService.authorize();
        }
    
        refreshSession() {
            console.log('start refreshSession');
            this.oidcSecurityService.authorize();
        }
    
        logout() {
            console.log('start logoff');
            this.oidcSecurityService.logoff();
        }        

        private doCallbackLogicIfRequired() {
            if (window.location.hash) {
                this.oidcSecurityService.authorizedCallback();
            }
        }

        private onAuthorizationResultComplete(authorizationResult: AuthorizationResult) {
            console.log('Auth result received:' + authorizationResult);
            if (authorizationResult === AuthorizationResult.unauthorized) {
                if (window.parent) {
                    // sent from the child iframe, for example the silent renew
                    window.parent.location.href = '/unauthorized';
                } else {
                    // sent from the main window
                    window.location.href = '/unauthorized';
                }
            }
        }
    }
}        
    
