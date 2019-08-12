import { Component, OnInit } from '@angular/core';
import { StateManagerService } from '../services/state-manager.service';
import { AssessmentDataService } from '../services/assessment-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // KRM: Need this injection for the template
  constructor(public stateManager: StateManagerService, public dataService: AssessmentDataService) {
    if (this.stateManager.MTurkEnabled) {
      this.dataService.getMTurkAssignment(this.stateManager.MTurkAssignmentId).subscribe(data => {
        console.log(data);
      });
    }
  }


  ngOnInit(): void {

  }
}


