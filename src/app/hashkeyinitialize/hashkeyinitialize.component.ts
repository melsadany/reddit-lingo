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
  private validFullScreenerHash= false;
  private validSingleAssesmentHash =false;
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
          if (this.stateManager.singleAssessmentEnabled && this.validSingleAssesmentHash) {
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
    // if it matches 8 or 12 anyletter/anynumbered hash (with no underscores) :BT
    if (hashKey.match( /^[^_]+$/gmi)){
      //don't want first four to be a 4 lettered singleassessment code if it is a full screener hashkey
      if (hashKey.match(/^\w{8}$/gmi)&& this.stateManager.hashKeyFirstFourMap(hashKey) == 'home'){
        this.validFullScreenerHash=true;return true
      }
      if (hashKey.match(/^\w{12}$/gmi)&& this.stateManager.hashKeyFirstFourMap(hashKey) !== 'home' && this.stateManager.singleAssessmentEnabled){
        this.validSingleAssesmentHash =true
        return true
      }
   
    return false;
    }
    return false
  }
}
