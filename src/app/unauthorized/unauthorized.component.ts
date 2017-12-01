import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'unauthorized',
    templateUrl: 'unauthorized.component.html'
})

export class unauthorizedComponent implements OnInit {

    public message: string;
    public values: any[];

    constructor() {
        this.message = 'UnauthorizedComponent constuctor';
    }

    ngOnInit() {
    }
}