import { Injectable } from '@angular/core';
import { MockBackend} from '@angular/http/testing';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { ICompany } from './company';

@Injectable() 
export class CompanyFakeService {
    private _companyUrl = 'src/api/company/company.json';
    constructor(private _http: MockBackend) { }

    getCompanies(): Observable<ICompany[]> {
        return this._http.get(this._companyUrl)
        .map((response: Response) => <ICompany[]> response.json())
        .do(data => console.log('All: ' + JSON.stringify(data) ))
        .catch(this.handleError);  
    };


    private handleError(error: Response) {
       console.error(error); 
       return Observable.throw(error.json().error || 'Server error')
    }
}
