import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
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
    constructor(private _http: Http) { }

    getCompanies(): Observable<ICompany[]> {
        return this._http.get(this._companyUrl)
        .map((response: Response) => <ICompany[]> response.json())
        .do(data => console.log('All: ' + JSON.stringify(data) ))
        .catch(this.handleError);  
    };

    getCompany(id: number): Observable<ICompany> {
        return this.getCompanies()
             .map((companies: ICompany[]) => companies.find(c => c.Id === id));
    }

    private handleError(error: Response) {
       console.error(error); 
       return Observable.throw(error.json().error || 'Server error')
    }
}