import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncvoiceComponent } from './syncvoice.component';

describe('SyncvoiceComponent', () => {
  let component: SyncvoiceComponent;
  let fixture: ComponentFixture<SyncvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
