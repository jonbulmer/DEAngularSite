import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { OidcSecurityService } from '../../../auth/services/oidc.security.service';


export class DataEventRecordsCreateComponent implements OnInit, OnDestroy {
    ngOnInit() {

    }

    ngOnDestroy(): void {
        this.isAuthorizedSubscription.unsubscribe();
    }    

}