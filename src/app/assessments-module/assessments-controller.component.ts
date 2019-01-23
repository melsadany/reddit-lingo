import { Component, OnInit, HostListener, Host } from '@angular/core';
import { AssessmentDataService } from '../services/assessment-data.service';
import { AppComponent } from '../app.component';
import { DialogService } from '../services/dialog.service';
import { CanComponentDeactivate } from '../guards/can-deactivate.guard';

@Component({
  selector: 'app-assessments-controller',
  templateUrl: './assessments-controller.component.html',
  styleUrls: ['./assessments-controller.component.scss']
})
export class AssessmentsControllerComponent
  implements OnInit, CanComponentDeactivate {
  allAssessmentsCompleted: Boolean = false;

  constructor(
    private dataService: AssessmentDataService,
    private appComponent: AppComponent,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.dataService.setIsInAssessment(false);
    if (this.dataService.allAssessmentsCompleted) {
      this.dataService.goTo('done');
    }
  }
  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }

  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any): boolean {
  //   // const notifyMessage =
  //   //   'Please complete your current assessment before refreshing the page.';
  //   // $event.returnValue = notifyMessage;
  //   $event.preventDefault();
  //   return false;
  // }
}
