import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import { AuthService } from './auth/auth.service';
// import * as schema from './schema/equipment.json'; KRM: Not neccessary
import { AssessmentDataService } from './services/assessment-data.service';
import { UserIdObject } from './structures/useridobject';
import { AssessmentData } from './structures/assessmentdata';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private userSubscription: Subscription;
  private dataSubscription: Subscription;
  public nextUserID: string;
  public assessmentData: AssessmentData;

  constructor(
    private authService: AuthService,
    private router: Router,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private dataService: AssessmentDataService,
    private activatedRoute: ActivatedRoute,
  ) {
    // this.registerSvgIcons();
    this.router = router;
    // this.router.events.subscribe(e => console.log(e));
  }

  public ngOnInit(): void {
    if (!this.dataService.checkCookie('user_id')) {
      this.setCookieAndGetData();
    } else {
      this.getData();
    }
  }

  // logout(): void {
  //   this.authService.signOut();
  //   this.navigate('');
  // } KRM: Not necessary

  navigate(link: any): void {
    this.router.navigate([link]);
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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
        this.dataService.populateCompletionCookies(this.assessmentData);
      });
  }

  // registerSvgIcons(): void {
  //   [
  //     'close',
  //     'add',
  //     'add-blue',
  //     'airplane-front-view',
  //     'air-station',
  //     'balloon',
  //     'boat',
  //     'cargo-ship',
  //     'car',
  //     'catamaran',
  //     'clone',
  //     'convertible',
  //     'delete',
  //     'drone',
  //     'fighter-plane',
  //     'fire-truck',
  //     'horseback-riding',
  //     'motorcycle',
  //     'railcar',
  //     'railroad-train',
  //     'rocket-boot',
  //     'sailing-boat',
  //     'segway',
  //     'shuttle',
  //     'space-shuttle',
  //     'steam-engine',
  //     'suv',
  //     'tour-bus',
  //     'tow-truck',
  //     'transportation',
  //     'trolleybus',
  //     'water-transportation'
  //   ].forEach(icon => {
  //     this.matIconRegistry.addSvgIcon(
  //       icon,
  //       this.domSanitizer.bypassSecurityTrustResourceUrl(
  //         `assets/icons/${icon}.svg`
  //       )
  //     );
  //   });
  // } KRM: Likely not necessary
}
