import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AssessmentsControllerComponent } from './assessments-controller.component';

import { AssessmentsControllerRoutingModule } from './assessments-controller-routing.module';
import { RanComponent } from './assessments/ran/ran.component';
import { AudioRecordingService } from '../services/audio-recording.service';
import { AuthHeaderInterceptor } from '../interceptors/header.interceptor';
import { CatchErrorInterceptor } from '../interceptors/http-error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AssessmentsDoneComponent } from './assessments-done/assessments-done.component';
import { ListeningcomprehensionComponent } from './assessments/listening_comprehension/listeningcomprehension.component';
import { PrescreenerquestionsComponent } from './assessments/prescreenerquestions/prescreenerquestions.component';
import {
  MatDatepickerModule,
  MatFormFieldModule,
  MatNativeDateModule,
  MatInputModule,
  MatSelectModule,
  MatCheckboxModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    AssessmentsControllerRoutingModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  declarations: [
    AssessmentsControllerComponent,
    RanComponent,
    AssessmentsDoneComponent,
    ListeningcomprehensionComponent,
    PrescreenerquestionsComponent
  ],
  providers: [
    AudioRecordingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHeaderInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CatchErrorInterceptor,
      multi: true
    }
  ]
})
export class AssessmentsModule {}
