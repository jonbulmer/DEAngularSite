import { NgModule, ModuleWithProviders } from '@angular/core';

import { OidcSecurityService } from '../services/oidc.security.service';
import { AuthConfiguration, DefaultConfiguration } from './auth.configuration';
import { NgModel } from '@angular/forms/src/directives/ng_model';

@NgModule()
export class AuthModule {
    static forRoot(token: Token = {}): ModuleWithProviders {
        return {
            ngModule: AuthModule,
            providers: [
                OidcSecurityService
            ]
        }
    }
}

export interface Type<T> extends Function {
    
        new (...args: any[]): T;
    
    }
    
    export interface Token {
    
        storage?: Type<any>;
    
    }