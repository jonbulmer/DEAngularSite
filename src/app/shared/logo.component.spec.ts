import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By} from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LogoComponent } from './logo.component';

describe('ErrorComponent (inline tmplate)', () => {

    let comp: LogoComponent;
    let fixture: ComponentFixture<LogoComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LogoComponent],
        });

        fixture = TestBed.createComponent(LogoComponent);

        comp = fixture.componentInstance;

        de = fixture.debugElement.query(By.css('h1'));
        el = de.nativeElement;
    });

    it('should display title', () => {
        fixture.detectChanges();
        expect(el.textContent).toContain(comp.title);
    }); 
});