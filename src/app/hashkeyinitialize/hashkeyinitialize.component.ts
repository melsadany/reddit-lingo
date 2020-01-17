import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateManagerService } from '../services/state-manager.service';
import { AssessmentDataService } from '../services/assessment-data.service';
import { SingleAssessmentData, AssessmentData } from '../structures/AssessmentDataStructures';

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
    // if they are returning, they continue, else, they get served diagnostics before getting a file created.
    if (this.validHashKey(userHashKey)) {
      this.stateManager.hashKey = userHashKey;
      let userIdPromise = this.dataService.initializeHashKeyData(userHashKey);
      userIdPromise.then( (userId:string) => {
        
        this.dataService
        .checkUserExist(userId) //.sendHashKeyToServer(userHashKey,useId)
        .subscribe((data: AssessmentData | boolean) => {
          //adds diagnostics to list of assessments to take since asssessment list will be empty since they don't have a file yet
          this.stateManager.serveDiagnostics();
          if (data==false){
          }
          else {
            this.stateManager.hasDoneDiagnostics=true;
            if (this.stateManager.isSingleAssessment) {
              this.stateManager.initializeSingleAssessmentState(<AssessmentData> data);
            } else {
              const initializeData: unknown = data;
              this.stateManager.initializeState(<AssessmentData>initializeData);
            } 
          }
          // KRM: The big difference between SingleAssessmentData and AssessmentData is the user_id vs the hask_key fields.
          // The methods initializeState and initializeSingleAssessmentState don't actually utilize those fields with their
          // respective types, so they could essentially be the same type if not for the differently named field, which is pretty
          // important elsewhere. Therefore I just cast the data object accordingly to pass it in the regular intializeState method
          // when we want hash_key users to take the full assessments.
        });
      this.routerServie.navigate(['home']);
      } 
      );
    } 
    else {
      //show the haskeyinitialize.component.html error page
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
  

    if (hashKey.length==12 && hashKey.slice(4).match(/^\w+$/gmi) && this.stateManager.hashKeyFirstFourMap(hashKey) !== 'home'){
      this.stateManager.isSingleAssessment=true;
  
      return true
    }
   
    return true
  }
}
