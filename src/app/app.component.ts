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
    if (!this.dataService.checkUserIdCookie()) {
      this.setUserIdCookieAndGetData();
    } else {
      this.getData();
    }
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  setUserIdCookieAndGetData(): void {
    this.dataService.getNextUserID().subscribe((value: UserIdObject) => {
      this.nextUserID = value.nextID.toString();
      this.dataService.setUserIdCookie(this.nextUserID);
      this.getData();
    });
  }

  getData(): void {
    // KRM: Get the data for the current user
    // that has already been put in the database from pervious assessments
    this.dataSubscription = this.dataService
      .getUserAssessmentDataFromMongo(this.dataService.getUserIdCookie())
      .subscribe((data: AssessmentData) => {
        this.assessmentData = data;
        // console.log(JSON.stringify(this.assessmentData));
        // KRM: For debugging
        this.stateService.initializeState(this.assessmentData);
        // KRM: Initialize the current state of the assessments based
        // on the past assessments already completed
      });
  }
}
