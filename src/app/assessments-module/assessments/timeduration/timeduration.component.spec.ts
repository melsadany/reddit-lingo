import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimedurationComponent } from './timeduration.component';

describe('TimedurationComponent', () => {
  let component: TimedurationComponent;
  let fixture: ComponentFixture<TimedurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimedurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimedurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
