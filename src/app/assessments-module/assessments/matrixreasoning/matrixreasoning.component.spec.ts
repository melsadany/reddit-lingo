import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixreasoningComponent } from './matrixreasoning.component';

describe('MatrixreasoningComponent', () => {
  let component: MatrixreasoningComponent;
  let fixture: ComponentFixture<MatrixreasoningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatrixreasoningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatrixreasoningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
