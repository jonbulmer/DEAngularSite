import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { ICompany } from './company';

@Injectable() 
export class CompanyService {
    //private _companyUrl = 'src/api/company/company.json';
    private _companyUrl = 'https://diamondedge-api.co.uk/api/companies';
    constructor(private _http: HttpClient) { }

    getCompanies(): Observable<ICompany[]> {
        return this._http.get<ICompany[]>(this._companyUrl)
        .do(data => console.log('All: ' + JSON.stringify(data)))
        .catch(this.handleError);
    };

    getCompany(id: number): Observable<ICompany> {
        return this.getCompanies()
             .map((companies: ICompany[]) => companies.find(c => c.Id === id));
    }

    private handleError(err: HttpErrorResponse) {
        let errorMessage = '';
        if (err.error instanceof Error) {
            errorMessage = `An error occurred: ${err.error.message}`;
        } else {
            errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
        }
        console.error(errorMessage);
        return Observable.throw(errorMessage);
    }
}
