import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateManagerService } from '../services/state-manager.service';
import { AssessmentDataService } from '../services/assessment-data.service';
import { SingleAssessmentData } from '../structures/assessmentdata';

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
    this.stateManager.hashKey = userHashKey;
    // if (
    //   this.dataService.checkHashKeyCooke() ||
    //   this.dataService.getHashKeyCookie() !== userHashKey
    // ) {
    // }
    this.dataService
      .sendHashKeyToServer(userHashKey)
      .subscribe((data: SingleAssessmentData) => {
        console.log('Single assessment data', data);
        this.dataService.initializeHashKeyData(userHashKey);
        this.stateManager.initializeSingleAssessmentState(data);
      });
    this.routerServie.navigate(['home']);
  }

  ngOnInit(): void {}
}
