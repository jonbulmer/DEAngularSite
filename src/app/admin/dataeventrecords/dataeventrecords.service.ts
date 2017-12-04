import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../../app.constants';
import { DataEventRecord } from './models/DataEventRecord';

@Injectable()
export class DataEventRecordsService {
    private actionUrl: string;
    private headers: HttpHeaders;

    constructor(private http: HttpClient, _configuration: Configuration) {
        this.actionUrl = `${_configuration.Server}api/DataEventRecords/`;
    }
}