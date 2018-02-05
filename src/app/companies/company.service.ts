import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { ICompany } from './company';
import { HttpErrorResponse } from '@angular/common/http/src/response';

@Injectable() 
export class CompanyService {
    //private _companyUrl = 'src/api/company/company.json';
    private _companyUrl = 'https://diamondedge-api.co.uk/api/companies';
    constructor(private _httpClient: HttpClient) { }

    getCompanies(): Observable<ICompany[]> {
        return this._httpClient.get<ICompany[]>(this._companyUrl, options);  
    };

    getCompany(id: number): Observable<ICompany> {
        return this.getCompanies()
             .map((companies: ICompany[]) => companies.find(c => c.Id === id));
    }

    private handleError(error: HttpErrorResponse) {
       console.error(error); 
       return Observable.throw(json().error || 'Server error')
    }
}