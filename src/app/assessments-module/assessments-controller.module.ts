import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AssessmentsControllerComponent } from './assessments-controller.component';

import { AssessmentsControllerRoutingModule } from './assessments-controller-routing.module';
import { RanComponent } from './assessments/ran/ran.component';
import { CatchErrorInterceptor } from '../interceptors/http-error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AssessmentsDoneComponent } from './assessments-done/assessments-done.component';
import { ListeningcomprehensionComponent } from './assessments/listeningcomprehension/listeningcomprehension.component';
import { PrescreenerquestionsComponent } from './assessments/prescreenerquestions/prescreenerquestions.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatProgressBarModule,
  MatToolbarModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PicturepromptComponent } from './assessments/pictureprompt/pictureprompt.component';
import { TimedurationComponent } from './assessments/timeduration/timeduration.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SyncvoiceComponent } from './assessments/syncvoice/syncvoice.component';
import { MatrixreasoningComponent } from './assessments/matrixreasoning/matrixreasoning.component';
import { SentencerepetitionComponent } from './assessments/sentencerepetition/sentencerepetition.component';
import { WordfindingComponent } from './assessments/wordfinding/wordfinding.component';
import { PostscreenerquestionsComponent } from './assessments/postscreenerquestions/postscreenerquestions.component';
import { DiagnosticsComponent } from './assessments/diagnostics/diagnostics.component';
import { WordassociationPathComponent } from './assessments/wordassociationpath/wordassociationpath.component';
import { WordassociationPairComponent } from './assessments/wordassociationpair/wordassociationpair.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    AssessmentsControllerRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgCircleProgressModule.forRoot()
  ],
  declarations: [
    AssessmentsControllerComponent,
    RanComponent,
    AssessmentsDoneComponent,
    ListeningcomprehensionComponent,
    PrescreenerquestionsComponent,
    PicturepromptComponent,
    TimedurationComponent,
    SyncvoiceComponent,
    MatrixreasoningComponent,
    SentencerepetitionComponent,
    WordfindingComponent,
    PostscreenerquestionsComponent,
    DiagnosticsComponent,
    WordassociationPathComponent,
    WordassociationPairComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CatchErrorInterceptor,
      multi: true
    }
  ]
})
export class AssessmentsModule { }
