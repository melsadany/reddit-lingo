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

@NgModule({
  imports: [CommonModule, BrowserModule, AssessmentsControllerRoutingModule],
  declarations: [AssessmentsControllerComponent, RanComponent],
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
