import { Component, OnInit, HostListener } from '@angular/core';
import { AssessmentDataService } from '../services/assessment-data.service';
import { DialogService } from '../services/dialog.service';
import { CanComponentDeactivate } from '../guards/can-deactivate.guard';
import { StateManagerService } from '../services/state-manager.service';


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
    private dialogService: DialogService,
    public stateManager: StateManagerService
  ) {}

  ngOnInit(): void {
    this.stateManager.isInAssessment = false;
    if (this.stateManager.finishedAllAssessments) {
      this.stateManager.navigateTo('done');
    }
  }

  // @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
