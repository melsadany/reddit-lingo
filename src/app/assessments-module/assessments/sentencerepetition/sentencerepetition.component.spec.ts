import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentencerepetitionComponent } from './sentencerepetition.component';

describe('SentencerepetitionComponent', () => {
  let component: SentencerepetitionComponent;
  let fixture: ComponentFixture<SentencerepetitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentencerepetitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentencerepetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
