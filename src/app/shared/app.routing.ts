import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import{ HomeComponent } from '../home/home.component';
import{ ErrorComponent } from '../error/error.component';
import { CompanyListComponent } from "../companies/company-list.component";
import { NgZoneDemo} from '../NgZone/NgZone';
import { CompanyModule } from '../companies/company.module' ;

@NgModule({
    imports: [
        RouterModule.forRoot([
            { path: '', component: HomeComponent },
            {path: './companies' , component: CompanyListComponent},
            {path: './NgZone', component: NgZoneDemo},
            { path: '**' , component: ErrorComponent}
        ]),
        CompanyModule
    ],
    exports: [
        RouterModule
    ]   
})
export class AppRoutingModule {}