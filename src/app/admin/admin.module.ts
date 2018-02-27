import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import {AdminMenuComponent} from './adminMenu/admin-menu.component';
import {AdminComponent} from './admin.component/admin.component';

import { SecureFileService } from '../admin/securefile/SecureFileService';
import { ForbiddenComponent } from '../admin/forbidden/forbidden.component';
import { UnauthorizedComponent } from '../admin/unauthorized/unauthorized.component';
import { SecureFilesComponent } from '../admin/securefile/securefiles.component';
import { Configuration } from '../app.constants';

import { OidcSecurityService } from '../auth/services/oidc.security.service';
import { OpenIDImplicitFlowConfiguration } from '../auth/modules/auth.configuration';
import { OidcDataService } from '../auth/services/oidc-data.service';
import { StateValidationService } from '../auth/services/oidc-security-state-validation.service';

import { DataEventRecordsModule } from '../admin/dataeventrecords/dataeventrecords.module';

import { AuthorizationGuard } from '../auth/authorization.guard';
import { AuthorizationCanGuard } from '../auth/authorization.can.guard';

import { OidcConfigService } from '../auth/services/oidc.security.config.service';
import { AuthWellKnownEndpoints } from '../auth/models/auth.well-known-endpoints';

export function loadConfig(oidcConfigService: OidcConfigService) {
    console.log('APP_INITIALIZER STARTING');
    return () => oidcConfigService.load(`${window.location.origin}/api/ClientAppSettings`);
}


const AdminRoutes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        children: [
            { path: '', component: AdminMenuComponent }
         ]
    },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(AdminRoutes)
    ],
    exports: [
        RouterModule
    ],
    declarations: [
        AdminComponent,
        AdminMenuComponent
    ],
    providers: [
        OidcConfigService,
        OidcSecurityService,
        {
            provide: APP_INITIALIZER,
            useFactory: loadConfig,
            deps: [OidcConfigService],
            multi: true
        },
        OidcSecurityService,
        AuthorizationGuard,
        AuthorizationCanGuard,
        SecureFileService,
        Configuration
    ]
})

export class AdminModule {
    clientConfiguration: any;

    constructor(
        public oidcSecurityService: OidcSecurityService,
        private oidcConfigService: OidcConfigService,
        configuration: Configuration
    ) {
        this.oidcConfigService.onConfigurationLoaded.subscribe(() => {
            console.log('App a STARTING');
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
            
            this.oidcSecurityService.setupModule(openIDImplicitFlowConfiguration, authWellKnownEndpoints);
        });

        //configClient() {
        //    console.log('App STARTING');
        //}        

    }
}