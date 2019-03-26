import { Component, OnInit } from '@angular/core';
import { StateManagerService } from '../services/state-manager.service';
import { AssessmentDataService } from '../services/assessment-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  single: boolean;
  mobile: boolean;

  constructor(
    public stateManager: StateManagerService,
    private dataService: AssessmentDataService
  ) {}

  ngOnInit(): void {
    if (!this.stateManager.hashKey) {
      console.log('No hash key provided. Using user_id');
      this.dataService.initializeData();
    }
  }
}
