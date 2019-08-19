import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateManagerService } from '../services/state-manager.service';
import { AssessmentDataService } from '../services/assessment-data.service';
import { HashKeyAssessmentData, AssessmentData } from '../structures/AssessmentDataStructures';

@Component({
  selector: 'app-hashkeyinitialize',
  templateUrl: './hashkeyinitialize.component.html',
  styleUrls: ['./hashkeyinitialize.component.scss']
})
export class HashkeyinitializeComponent {
  constructor(
    private route: ActivatedRoute,
    private routerServie: Router,
    private stateManager: StateManagerService,
    private dataService: AssessmentDataService
  ) {
    const userHashKey = this.route.snapshot.paramMap.get('hashKey');
    // KRM: Here is where we verify the hash key based on some predetermined parameters.
    if (this.validHashKey(userHashKey)) {
      this.stateManager.hashKey = userHashKey;
      this.dataService
        .sendHashKeyToServer(userHashKey)
        .subscribe((data: HashKeyAssessmentData) => {
          this.dataService.initializeHashKeyData(userHashKey);
          if (this.stateManager.singleAssessmentEnabled) {
            this.stateManager.initializeSingleAssessmentState(data);
          } else {
            const initializeData: unknown = data;
            this.stateManager.initializeState(<AssessmentData>initializeData);
          }
          // KRM: The big difference between SingleAssessmentData and AssessmentData is the user_id vs the hask_key fields.
          // The methods initializeState and initializeSingleAssessmentState don't actually utilize those fields with their
          // respective types, so they could essentially be the same type if not for the differently named field, which is pretty
          // important elsewhere. Therefore I just cast the data object accordingly to pass it in the regular intializeState method
          // when we want hash_key users to take the full assessments.
        });
      this.routerServie.navigate(['home']);
    } else {
      console.log('bad hkey');
      this.routerServie.navigate(['home']);
    }
  }

  // KRM: This is the method that validates the hash key
  // Right now, all it does is make sure that the first four characters
  // map very basically to an assessment name. More interesting hash keys
  // need a more sophisticated parameterization.
  validHashKey(hashKey: string): boolean {
    if (this.stateManager.hashKeyFirstFourMap(hashKey) !== 'home') {
      return true;
    }
    return false;
  }
}
