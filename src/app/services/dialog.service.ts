import { Injectable } from '@angular/core';
import { AssessmentDataService } from './assessment-data.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dataService: AssessmentDataService) {}

  canRedirect(): boolean {
    if (this.dataService.isInAssessment()) {
      window.alert(
        'Please complete the current assessment before going to another page.'
      );
      return false;
    } else {
      console.log('Can redirect');
      return true;
    }
  }
}
