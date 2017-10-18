    import { NgModule } from '@angular/core';
    import { RouterModule } from '@angular/router';
    import { CompanyListComponent } from './company-list.component';
    import { CompanyDetailComponent } from './company-detail.component';
    import { CompanyService } from './company.service';
    //import {};
    //import {};
    //import {};

    @NgModule({
        imports: [
            RouterModule.forChild([
                { path: 'companies', component: CompanyListComponent},
                { path: 'company/:id',
                component: CompanyDetailComponent
                }
        ]),
        ],
        declarations: [
            CompanyDetailComponent
        ],
        providers: [
            CompanyService
        ]})

    export class CompanyModule {}