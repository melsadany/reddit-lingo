import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentsDoneComponent } from './assessments-done.component';

describe('AssessmentsDoneComponent', () => {
  let component: AssessmentsDoneComponent;
  let fixture: ComponentFixture<AssessmentsDoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentsDoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentsDoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
