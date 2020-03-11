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
    this.dataService.deleteHashKeyCookie();
    this.dataService.deleteUserIdCookie();
    if (this.stateManager.endUrl){
      window.location.replace(this.stateManager.endUrl)
    }
  }
}
