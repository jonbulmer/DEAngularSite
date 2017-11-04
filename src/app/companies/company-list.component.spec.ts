import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By} from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CompanyListComponent } from './company-list.component';

describe('CompanyListComponent (inline tmplate)', () => {

    let comp: CompanyListComponent;
    let fixture: ComponentFixture<CompanyListComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    beforeEach(async() => {
        TestBed.configureTestingModule({
            declarations: [CompanyListComponent],
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