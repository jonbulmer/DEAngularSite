import {Component, OnInit } from '@angular/core';
import { ICompany } from './company';
import { CompanyService } from './company.service'; 


@Component({
    templateUrl: './company-list.component.html',
    styleUrls: ['./company-list.component.css']
})

export class CompanyListComponent implements OnInit {
    pageTitle: string = 'Companies List';
    listFilter: string;
    errorMessage: string;
    companies: ICompany[];
    constructor(private _companyService: CompanyService) {  }
    
    ngOnInit(): void {
        this._companyService.getCompanies()
                .subscribe(companies => this.companies = companies,
                           error => this.errorMessage = <any>error);
    }
}