import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeningcomprehensionComponent } from './listeningcomprehension.component';

describe('ListeningcomprehensionComponent', () => {
  let component: ListeningcomprehensionComponent;
  let fixture: ComponentFixture<ListeningcomprehensionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListeningcomprehensionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeningcomprehensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
