import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentsControllerComponent } from './assessments-controller.component';

describe('AssessmentsControllerComponent', () => {
  let component: AssessmentsControllerComponent;
  let fixture: ComponentFixture<AssessmentsControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssessmentsControllerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentsControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
