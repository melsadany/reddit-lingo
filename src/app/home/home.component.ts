import { Component, OnInit } from '@angular/core';
import { StateManagerService } from '../services/state-manager.service';
import { AssessmentDataService } from '../services/assessment-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
<<<<<<< src/app/home/home.component.ts
export class HomeComponent implements OnInit {
  constructor(public stateManager: StateManagerService, public dataService: AssessmentDataService) { 
    // if (this.stateManager.MTurkEnabled) {
    //   this.dataService.getMTurkAssignment(this.stateManager.MTurkAssignmentId).subscribe(data => {
    //     console.log(data);
    //   });
    // }

  }
  // KRM: Need this injection for the template

  ngOnInit(): void {
    if (this.stateManager.hashKey && this.dataService.checkHashKeyCooke()) {
      console.log('hk set');
    } else if (
      !this.stateManager.hashKey &&
      !this.dataService.checkHashKeyCooke()
    ) {
      console.log('no hk');
      this.dataService.initializeData();
    } else if (
      !this.stateManager.hashKey &&
      this.dataService.checkHashKeyCooke()
    ) {
      console.log('hk cached');
      this.stateManager.goToHashKeyInitializer(
        this.dataService.getHashKeyCookie()
      );
    }

=======
export class HomeComponent {
  // KRM: Need this injection for the template
  constructor(public stateManager: StateManagerService, public dataService: AssessmentDataService) {
    // if (this.stateManager.MTurkEnabled) {
    //   this.dataService.getMTurkAssignment(this.stateManager.MTurkAssignmentId).subscribe(data => {
    //     console.log(data);
    //   });
    // }
>>>>>>> src/app/home/home.component.ts
  }
}


