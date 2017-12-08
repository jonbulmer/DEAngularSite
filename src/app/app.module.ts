import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './start/app.component';
import { Configuration } from '../app/app.constants';

import { NavComponent } from './shared/navbar.component';
import { LogoComponent } from './shared/logo.component';
import { HomeComponent } from  './home/home.component';
import { ErrorComponent } from './error/error.component';
import { AppRoutingModule } from './shared/app.routing';
import { CompanyListComponent } from './companies/company-list.component';

import { AdminModule } from './admin/admin.module';
import { OidcSecurityService } from '../app/auth/services/oidc.security.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
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
      //  public oidcSecurityService: OidcSecurityService,
        private http: HttpClient,
        configuration: Configuration
    ){
        this.configClient().subscribe((config: any) => {
            this.clientConfiguration = config;
            configuration.FileServer = this.clientConfiguration.apiFileServer;
            configuration.Server = this.clientConfiguration.apiServer;
        });

  
    }
    configClient() {
        console.log('window.location', window.location);
        console.log('window.location.href', window.location.href);
        console.log('window.location.origin', window.location.origin);
        return this.http.get(`${window.location.origin}/api/ClientAppSettings`);
    }
 }