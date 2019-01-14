import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssessmentsControllerComponent } from './assessments-controller.component';
import { RanComponent } from './assessments/ran/ran.component';
import { AssessmentsDoneComponent } from './assessments-done/assessments-done.component';
import { CanDeactivateGuard } from '../guards/can-deactivate.guard';

const routes: Routes = [
  {
    path: 'assessments',
    component: AssessmentsControllerComponent,
    canDeactivate: [CanDeactivateGuard],
    children: [
      {
        path: 'ran',
        component: RanComponent
      },
      {
        path: 'done',
        component: AssessmentsDoneComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentsControllerRoutingModule {}
