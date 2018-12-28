import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssessmentsControllerComponent } from './assessments-controller.component';
import { RanComponent } from './assessments/ran/ran.component';

const routes: Routes = [
  {
    path: 'assessments',
    component: AssessmentsControllerComponent,
    children: [
      {
        path: 'ran',
        component: RanComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentsControllerRoutingModule {}
