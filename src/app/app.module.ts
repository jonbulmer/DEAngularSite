import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule }  from '@angular/platform-browser';

import { AppComponent } from './start/app.component';
import { Configuration } from './app.constants';
import { routing } from './admin/admin.routes';

import { HttpClientModule } from '@angular/common/http';

import { SecureFileService } from './admin/securefile/SecureFileService';

import { ForbiddenComponent } from './admin/forbidden/forbidden.component';
import { HomeComponent } from  './home/home.component';
import { NavComponent } from './shared/navbar.component';
import { LogoComponent } from './shared/logo.component';
import { ErrorComponent } from './error/error.component';
import { AppRoutingModule } from './shared/app.routing';
import { CompanyListComponent } from './companies/company-list.component';
import { AdminModule } from './admin/admin.module';

import { UnauthorizedComponent } from './admin/unauthorized/unauthorized.component';
import { SecureFilesComponent } from './admin/securefile/securefiles.component';

import { AuthModule } from './auth/modules/auth.module';
import { OidcSecurityService } from '../app/auth/services/oidc.security.service';
import { OpenIDImplicitFlowConfiguration } from './auth/modules/auth.configuration';

import { DataEventRecordsModule } from './admin/dataeventrecords/dataeventrecords.module';

import { AuthorizationGuard } from './admin/authorization.guard';
import { AuthorizationCanGuard } from './admin/authorization.can.guard';

import { OidcConfigService } from './auth/services/oidc.security.config.service';
import { AuthWellKnownEndpoints } from './auth/models/auth.well-known-endpoints';


export function loadConfig(oidcConfigService: OidcConfigService) {
    console.log('APP_INITIALIZER STARTING');
    return () => oidcConfigService.load(`${window.location.origin}/api/ClientAppSettings`);
}



@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        routing,
        HttpClientModule,
        AdminModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        ForbiddenComponent,
        NavComponent,
        LogoComponent,
        HomeComponent,
        UnauthorizedComponent,
        SecureFilesComponent,
        ErrorComponent,
        CompanyListComponent
    ],
    providers: [
        OidcSecurityService,
        Configuration
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {


    clientConfiguration: any;

    constructor(
        public oidcSecurityService: OidcSecurityService,
        private http: HttpClient,
        configuration: Configuration
    ) {
        this.configClient().subscribe((config: any) => {
            this.clientConfiguration = config;
            const openIDImplicitFlowConfiguration = new OpenIDImplicitFlowConfiguration();

            openIDImplicitFlowConfiguration.stsServer = this.clientConfiguration.stsServer;
            openIDImplicitFlowConfiguration.redirect_url = this.clientConfiguration.redirect_url;
            // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer
            // identified by the iss (issuer) Claim as an audience.
            // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
            // or if it contains additional audiences not trusted by the Client.
            openIDImplicitFlowConfiguration.client_id = this.clientConfiguration.client_id;
            openIDImplicitFlowConfiguration.response_type = this.clientConfiguration.response_type;
            openIDImplicitFlowConfiguration.scope = this.clientConfiguration.scope;
            openIDImplicitFlowConfiguration.post_logout_redirect_uri = this.clientConfiguration.post_logout_redirect_uri;
            openIDImplicitFlowConfiguration.start_checksession = this.clientConfiguration.start_checksession;
            openIDImplicitFlowConfiguration.silent_renew = this.clientConfiguration.silent_renew;
            openIDImplicitFlowConfiguration.post_login_route = this.clientConfiguration.startup_route;
            // HTTP 403
            openIDImplicitFlowConfiguration.forbidden_route = this.clientConfiguration.forbidden_route;
            // HTTP 401
            openIDImplicitFlowConfiguration.unauthorized_route = this.clientConfiguration.unauthorized_route;
            openIDImplicitFlowConfiguration.log_console_warning_active = this.clientConfiguration.log_console_warning_active;
            openIDImplicitFlowConfiguration.log_console_debug_active = this.clientConfiguration.log_console_debug_active;
            // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
            // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
            openIDImplicitFlowConfiguration.max_id_token_iat_offset_allowed_in_seconds =
                this.clientConfiguration.max_id_token_iat_offset_allowed_in_seconds;

            configuration.FileServer = this.clientConfiguration.apiFileServer;
            configuration.Server = this.clientConfiguration.apiServer;

            const authWellKnownEndpoints = new AuthWellKnownEndpoints();
            authWellKnownEndpoints.setWellKnownEndpoints(this.oidcConfigService.wellKnownEndpoints);

            this.oidcSecurityService.setupModule(openIDImplicitFlowConfiguration, authWellKnownEndpoints);
        });


    }
    configClient() {
        console.log('window.location', window.location);
        console.log('window.location.href', window.location.href);
        console.log('window.location.origin', window.location.origin);
        return this.http.get(`${window.location.origin}/api/ClientAppSettings`);
    }
 }