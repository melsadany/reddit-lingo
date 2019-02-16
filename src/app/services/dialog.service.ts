import { Injectable } from '@angular/core';
import { AssessmentDataService } from './assessment-data.service';
import { StateManagerService } from './state-manager.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(
    public stateManager: StateManagerService,
    private dataService: AssessmentDataService
  ) {}

  canRedirect(): boolean {
    if (this.stateManager.isInAssessment) {
      alert(
        'Please complete the current assessment before going to another page.'
      );
      return false;
    } else {
      console.log('Can redirect');
      return true;
    }
  }
}
