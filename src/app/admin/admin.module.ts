import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import {AdminComponent} from './admin.component/admin.component';

const AdminRoutes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        children: [ ]
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
        AdminComponent
    ],
    providers: []
})

export class AdminModule {}