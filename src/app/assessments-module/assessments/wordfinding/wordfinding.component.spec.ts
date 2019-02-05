import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordfindingComponent } from './wordfinding.component';

describe('WordfindingComponent', () => {
  let component: WordfindingComponent;
  let fixture: ComponentFixture<WordfindingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordfindingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordfindingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
