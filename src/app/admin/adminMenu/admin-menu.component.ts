import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl:'./admin-menu.component.html'
})

export class AdminMenuComponent implements OnInit { 
   
    theUser: string;
    
    constructor(private router: Router ){}

    ngOnInit() {
        this.theUser = '';
    }

    logout() {
    }
}