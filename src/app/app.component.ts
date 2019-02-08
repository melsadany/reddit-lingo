import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AssessmentDataService } from './services/assessment-data.service';
import { UserIdObject } from './structures/useridobject';
import { AssessmentData } from './structures/assessmentdata';
import { StateManagerService } from './services/state-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private dataSubscription: Subscription;
  public nextUserID: string;
  public assessmentData: AssessmentData;

  constructor(
    private dataService: AssessmentDataService,
    private stateService: StateManagerService
  ) {
    // this.router.events.subscribe(e => console.log(e));
  }

  public ngOnInit(): void {
    if (!this.dataService.checkCookie('user_id')) {
      this.setCookieAndGetData();
    } else {
      this.getData();
    }
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  setCookieAndGetData(): void {
    this.dataService.getNextUserID().subscribe((value: UserIdObject) => {
      this.nextUserID = value.nextID.toString();
      this.dataService.setCookie('user_id', this.nextUserID, 200);
      this.getData();
    });
  }

  getData(): void {
    // get the data from the current user
    this.dataSubscription = this.dataService
      .getUserAssessmentDataFromMongo(this.dataService.getCookie('user_id'))
      .subscribe((data: AssessmentData) => {
        this.assessmentData = data;
        // console.log(JSON.stringify(this.assessmentData)); KRM: For debugging
        this.stateService.initializeState(this.assessmentData);
      });
  }
}
