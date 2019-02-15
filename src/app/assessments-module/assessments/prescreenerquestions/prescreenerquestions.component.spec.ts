import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescreenerquestionsComponent } from './prescreenerquestions.component';

describe('PrescreenerquestionsComponent', () => {
  let component: PrescreenerquestionsComponent;
  let fixture: ComponentFixture<PrescreenerquestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrescreenerquestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescreenerquestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
