import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { By} from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CompanyService } from './company.service'; 
import { Comp } from './comp';

import { CompanyListComponent } from './company-list.component';
import { CompanyFakeService } from './company-fake.service';

describe('CompanyListComponent (inline template)', () => {

    let comp: CompanyListComponent;
    let fixture: ComponentFixture<CompanyListComponent>;
    let de: DebugElement;
    let el: HTMLElement;



    beforeEach(async() => {
   
        TestBed.configureTestingModule({
            declarations: [CompanyListComponent],
            providers: [
                { provide: CompanyService, useClass: CompanyFakeService },
                MockBackend
              ],            
            schemas: [ NO_ERRORS_SCHEMA ]
        });

        fixture = TestBed.createComponent(CompanyListComponent);

        comp = fixture.componentInstance;

        de = fixture.debugElement.query(By.css('h1'));
        el = de.nativeElement;
    });

    it('should display pageTitle', () => {
        fixture.detectChanges();
        expect(el.textContent).toContain(comp.pageTitle);
    }); 
});