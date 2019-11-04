import { Component, OnInit } from '@angular/core';
import { StateManagerService } from '../../services/state-manager.service';
import { AssessmentDataService } from '../../services/assessment-data.service';

@Component({
  selector: 'app-assessments-done',
  templateUrl: './assessments-done.component.html',
  styleUrls: ['./assessments-done.component.scss']
})
export class AssessmentsDoneComponent implements OnInit {
  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService
  ) {
    this.stateManager.showOutsideAssessmentButton = false;
  }

  ngOnInit(): void {
    console.log ("after..and this.state.assignemntID = ",this.stateManager.MTurkAssignmentId)
    console.log("from asssessment-done component.. the getURlParam func ID =",this.stateManager.getUrlParameter('assignment_id'
    ));
    this.dataService.deleteHashKeyCookie();
    this.dataService.deleteUserIdCookie();
    this.dataService.deleteAssignmentId();

  }
}
