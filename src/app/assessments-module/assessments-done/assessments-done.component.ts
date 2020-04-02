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
    const user_id= this.dataService.getUserIdCookie();
    this.dataService.sendEndTime(this.dataService.getUserIdCookie()).subscribe();

    if (!this.stateManager.MTurkAssignmentId){this.stateManager.MTurkAssignmentId=this.dataService.getAssignmentId();}
    
   // console.log ("after..and this.state.assignemntID = ",this.stateManager.MTurkAssignmentId)
    this.dataService.deleteHashKeyCookie();
    this.dataService.deleteUserIdCookie();
    this.dataService.deleteAssignmentId();

    if (this.stateManager.endUrl && !this.stateManager.completedAssessmentsAlready){
      window.location.replace(this.stateManager.endUrl+user_id)
    }
  }
}
