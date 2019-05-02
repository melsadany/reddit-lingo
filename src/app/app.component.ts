import { Component, OnInit } from '@angular/core';
import { StateManagerService } from './services/state-manager.service';
import { AssessmentDataService } from './services/assessment-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private stateManager: StateManagerService, private dataService: AssessmentDataService) { }

  public ngOnInit(): void {
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
    this.stateManager.isInAssessment = false;
    if (this.stateManager.finishedAllAssessments) {
      this.stateManager.navigateTo('done');
    }
  }
}
