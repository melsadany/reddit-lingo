import { Component, OnInit } from '@angular/core';
import { AssessmentDataService } from '../services/assessment-data.service';

@Component({
  selector: 'app-assessments-controller',
  templateUrl: './assessments-controller.component.html',
  styleUrls: ['./assessments-controller.component.scss']
})
export class AssessmentsControllerComponent implements OnInit {
  public assessmentData;

  constructor(private dataService: AssessmentDataService) {}

  ngOnInit() {
    if (this.dataService.user_id()) {
      // if the angular cookie has been set
      this.dataService.http
        .get('/api/assessmentsAPI/GetUserAssessment/' + this.dataService.user_id())
        .subscribe(data => {
          this.assessmentData = data;
          console.log(this.assessmentData);
        });
    }
    if (
      !this.dataService.checkCookie('RanCompleted') &&
      !this.dataService.checkCookie('user_id')
    ) {
      this.dataService.setCookie(
        'RanCompleted',
        'false',
        new Date(2019, 1, 1), // TODO: Set initial cookies function
        '/assessments/ran'
      );
      this.dataService.setCookie(
        'user_id',
        Math.floor(Math.random() * 50 + 1).toString(),
        new Date(2019, 1, 1),
        '/assessments'
      );
      console.log(this.dataService.getAllCookies());
      console.log('setting initial cookie');
    } else if (this.dataService.getCookie('RanCompleted') === 'false') {
      console.log('Ran not completed yet');
    } else {
      console.log('Ran completed already');
    }
  }
}
