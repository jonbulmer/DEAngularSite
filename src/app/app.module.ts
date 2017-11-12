import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './start/app.component';
import { Configuration } from '../app/app.constants';

import { NavComponent } from './shared/navbar.component';
import { LogoComponent } from './shared/logo.component';
import { HomeComponent } from  './home/home.component';
import { ErrorComponent } from './error/error.component';
import { AppRoutingModule } from './shared/app.routing';
import { CompanyListComponent } from './companies/company-list.component';

import { AdminModule } from './admin/admin.module';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
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
        Configuration
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {


    clientConfiguration: any;

    constructor(
        configuration: Configuration
    ){
    }    
 }