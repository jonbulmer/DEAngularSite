import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ICompany } from './company';
import { CompanyService } from './company.service';

@Component({
    templateUrl: './company-detail.component.html'
})

export class CompanyDetailComponent implements OnInit, OnDestroy {
    pageTitle: string = 'Company Detail';
    company: ICompany;
    errorMessage: string;
    private sub: Subscription;
    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _companyService: CompanyService) { }

    ngOnInit(): void {
        this.sub = this._route.params.subscribe(
            params => {
                let id = +params['id'];
                this.getCompany(id);
            });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    getCompany(id: number) {
        this._companyService.getCompany(id).subscribe(
            company => this.company = company,
            error => this.errorMessage = <any>error); 
    }

}