import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordassociationComponent } from './wordassociation.component';

describe('WordassociationComponent', () => {
  let component: WordassociationComponent;
  let fixture: ComponentFixture<WordassociationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordassociationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordassociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
