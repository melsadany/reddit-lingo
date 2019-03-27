import { Component, OnInit } from '@angular/core';
import { StateManagerService } from '../services/state-manager.service';
import { AssessmentDataService } from '../services/assessment-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(
    public stateManager: StateManagerService,
    private dataService: AssessmentDataService
  ) {}

  ngOnInit(): void {
    if (this.stateManager.hashKey && this.dataService.checkHashKeyCooke()) {
      console.log('Single assessment set');
    } else if (
      !this.stateManager.hashKey &&
      !this.dataService.checkHashKeyCooke()
    ) {
      console.log('No hash key provided. Using user_id for full assessment');
      this.dataService.initializeData();
    } else if (
      !this.stateManager.hashKey &&
      this.dataService.checkHashKeyCooke()
    ) {
      console.log(
        'Hash key in cookie, using the cookie for single user assessment'
      );
      this.stateManager.goToHashKeyInitializer(
        this.dataService.getHashKeyCookie()
      );
    }
  }
}
