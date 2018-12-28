import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RanComponent } from './ran.component';

describe('RanComponent', () => {
  let component: RanComponent;
  let fixture: ComponentFixture<RanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
