import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostscreenerquestionsComponent } from './postscreenerquestions.component';

describe('FinalquestionsComponent', () => {
  let component: PostscreenerquestionsComponent;
  let fixture: ComponentFixture<PostscreenerquestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostscreenerquestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostscreenerquestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
