import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssessmentsControllerComponent } from './assessments-controller.component';
import { RanComponent } from './assessments/ran/ran.component';
import { ListeningcomprehensionComponent } from './assessments/listening_comprehension/listeningcomprehension.component';
import { AssessmentsDoneComponent } from './assessments-done/assessments-done.component';
import { CanDeactivateGuard } from '../guards/can-deactivate.guard';
import { PrescreenerquestionsComponent } from './assessments/prescreenerquestions/prescreenerquestions.component';

const routes: Routes = [
  {
    path: 'assessments',
    component: AssessmentsControllerComponent,
    canDeactivate: [CanDeactivateGuard],
    children: [
      {
        path: 'ran',
        component: RanComponent,
        canDeactivate: [CanDeactivateGuard]
      },
      {
        path: 'listeningcomprehension',
        component: ListeningcomprehensionComponent,
        canDeactivate: [CanDeactivateGuard]
      },
      {
        path: 'done',
        component: AssessmentsDoneComponent,
        canDeactivate: [CanDeactivateGuard]
      },
      {
        path: 'prescreenerquestions',
        component: PrescreenerquestionsComponent,
        canDeactivate: [CanDeactivateGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateGuard]
})
export class AssessmentsControllerRoutingModule {}
