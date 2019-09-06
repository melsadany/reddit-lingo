import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordassociationPathComponent } from './wordassociationpath.component';

describe('WordassociationComponent', () => {
  let component: WordassociationPathComponent;
  let fixture: ComponentFixture<WordassociationPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WordassociationPathComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordassociationPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
