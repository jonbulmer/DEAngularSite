import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule }  from '@angular/platform-browser';

//import { HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './start/app.component';
import { routing } from './app.routes'
import { Configuration } from '../app/app.constants';
import { SecureFileService } from '../app/admin/securefile/SecureFileService';
import { NavComponent } from './shared/navbar.component';
import { LogoComponent } from './shared/logo.component';
import { HomeComponent } from  './home/home.component';
import { ErrorComponent } from './error/error.component';
import { AppRoutingModule } from './shared/app.routing';
import { CompanyListComponent } from './companies/company-list.component';

import { AdminModule } from './admin/admin.module';
import { OidcSecurityService } from '../app/auth/services/oidc.security.service';
import { OpenIDImplicitFlowConfiguration } from './auth/modules/auth.configuration';

import { DataEventRecordsModule } from './dataeventrecords/dataeventrecords.module';


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
        NavComponent,
        LogoComponent,
        HomeComponent,
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
    ){
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

            this.oidcSecurityService.setupModule(openIDImplicitFlowConfiguration);
        });

  
    }
    configClient() {
        console.log('window.location', window.location);
        console.log('window.location.href', window.location.href);
        console.log('window.location.origin', window.location.origin);
        return this.http.get(`${window.location.origin}/api/ClientAppSettings`);
    }
 }