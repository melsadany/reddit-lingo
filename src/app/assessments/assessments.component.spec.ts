import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, OnDestroy } from '@angular/core';
import { AudioRecordingService } from '../audio-recording.service';
import { AssessmentsComponent } from './assessments.component';

describe('AssessmentsComponent', () => {
  let component: AssessmentsComponent;
  let fixture: ComponentFixture<AssessmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
