import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateManagerService } from '../services/state-manager.service';
import { AssessmentDataService } from '../services/assessment-data.service';
import { SingleAssessmentData } from '../structures/AssessmentDataStructures';

@Component({
  selector: 'app-hashkeyinitialize',
  templateUrl: './hashkeyinitialize.component.html',
  styleUrls: ['./hashkeyinitialize.component.scss']
})
export class HashkeyinitializeComponent implements OnInit {
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
        .subscribe((data: SingleAssessmentData) => {
          console.log('Single assessment data', data);
          this.dataService.initializeHashKeyData(userHashKey);
          this.stateManager.initializeSingleAssessmentState(data);
        });
      this.routerServie.navigate(['home']);
    } else {
      console.log('Invalid hash key');
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

  ngOnInit(): void {}
}
