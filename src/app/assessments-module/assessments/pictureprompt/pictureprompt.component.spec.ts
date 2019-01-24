import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PicturepromptComponent } from './pictureprompt.component';

describe('PicturepromptComponent', () => {
  let component: PicturepromptComponent;
  let fixture: ComponentFixture<PicturepromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PicturepromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PicturepromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
