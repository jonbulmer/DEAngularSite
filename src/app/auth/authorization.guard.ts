import { Injectable } from '@angular/core';
import { Router, CanActivate,  ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { OidcSecurityService } from './services/oidc.security.service';

@Injectable()
export class AuthorizationRouteSnaphot implements CanActivate {

    constructor(
        private router: Router,
        private oidcSecurityService: OidcSecurityService
    ) { }
    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.oidcSecurityService.getIsAuthorized().pipe()
        return false;
    }
}