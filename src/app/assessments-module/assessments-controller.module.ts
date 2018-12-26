import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";

import { AssessmentsControllerComponent } from "./assessments-controller.component";

import { AssessmentsControllerRoutingModule } from "./assessments-controller-routing.module";
import { RanComponent } from "./assessments/ran/ran.component";
import { AudioRecordingService } from "../audio-recording.service";
import { AssessmentDataService } from "../assessment-data.service";
import { AssessmentsService } from "../assessments.service";
import { AuthHeaderInterceptor } from "../interceptors/header.interceptor";
import { CatchErrorInterceptor } from "../interceptors/http-error.interceptor";
import { HTTP_INTERCEPTORS } from "@angular/common/http";

@NgModule({
  imports: [CommonModule, BrowserModule, AssessmentsControllerRoutingModule],
  declarations: [AssessmentsControllerComponent, RanComponent],
  providers: [
    AudioRecordingService,
    AssessmentDataService,
    AssessmentsService,
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
