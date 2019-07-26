import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordassociationPairComponent } from './wordassociationpair.component';

describe('WordassociationComponent', () => {
  let component: WordassociationPairComponent;
  let fixture: ComponentFixture<WordassociationPairComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WordassociationPairComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordassociationPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
