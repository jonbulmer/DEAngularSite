import { Component } from '@angular/core';

@Component({
    selector: 'navi-bar',
    template:`
              <div class="top-bar">
               <div class="top-bar-title">Diamond Edge Business Solution</div>
                <div>
                 <ul class="menu">
                  <li class="nav-menu"><a href="./companies">Companies</a></li> 
                  <li class="nav-menu"><a href="#">Home</a></li>
                  <li class="nav-menu"><a [routerLink]="['/admin']">Customer Area</a></li>
                 </ul>
                </div>
              </div> 
    `,
    styleUrls: ['./navbar.component.css']
})
export class NavComponent {}