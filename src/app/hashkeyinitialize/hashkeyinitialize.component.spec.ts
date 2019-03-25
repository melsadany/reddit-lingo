import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HashkeyinitializeComponent } from './hashkeyinitialize.component';

describe('HashkeyinitializeComponent', () => {
  let component: HashkeyinitializeComponent;
  let fixture: ComponentFixture<HashkeyinitializeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HashkeyinitializeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HashkeyinitializeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
