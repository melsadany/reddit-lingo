import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssessmentsControllerComponent } from './assessments-controller.component';
import { RanComponent } from './assessments/ran/ran.component';
import { ListeningcomprehensionComponent } from './assessments/listeningcomprehension/listeningcomprehension.component';
import { AssessmentsDoneComponent } from './assessments-done/assessments-done.component';
import { CanDeactivateGuard } from '../guards/can-deactivate.guard';
import { PrescreenerquestionsComponent } from './assessments/prescreenerquestions/prescreenerquestions.component';
import { PicturepromptComponent } from './assessments/pictureprompt/pictureprompt.component';
import { TimedurationComponent } from './assessments/timeduration/timeduration.component';
import { SyncvoiceComponent } from './assessments/syncvoice/syncvoice.component';
import { MatrixreasoningComponent } from './assessments/matrixreasoning/matrixreasoning.component';
import { SentencerepetitionComponent } from './assessments/sentencerepetition/sentencerepetition.component';
import { WordfindingComponent } from './assessments/wordfinding/wordfinding.component';
import { PostscreenerquestionsComponent } from './assessments/postscreenerquestions/postscreenerquestions.component';

const routes: Routes = [
  {
    path: 'assessments',
    component: AssessmentsControllerComponent,
    canDeactivate: [CanDeactivateGuard],
    children: [
      {
        path: 'timeduration',
        component: TimedurationComponent,
      },
      {
        path: 'ran',
        component: RanComponent,
      },
      {
        path: 'pictureprompt',
        component: PicturepromptComponent,
      },
      {
        path: 'listeningcomprehension',
        component: ListeningcomprehensionComponent,
      },
      {
        path: 'postscreenerquestions',
        component: PostscreenerquestionsComponent,
      },
      {
        path: 'prescreenerquestions',
        component: PrescreenerquestionsComponent,
      },
      {
        path: 'syncvoice',
        component: SyncvoiceComponent,
      },
      {
        path: 'matrixreasoning',
        component: MatrixreasoningComponent,
      },
      {
        path: 'sentencerepetition',
        component: SentencerepetitionComponent,
      },
      {
        path: 'wordfinding',
        component: WordfindingComponent,
      },
      {
        path: 'done',
        component: AssessmentsDoneComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class AssessmentsControllerRoutingModule {}
