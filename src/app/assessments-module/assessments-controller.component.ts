import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-assessments-controller',
  templateUrl: './assessments-controller.component.html',
  styleUrls: ['./assessments-controller.component.scss']
})
export class AssessmentsControllerComponent implements OnInit {
  cookieValue = 'UNKNOWN';
  constructor(private cookieService: CookieService) {}

  ngOnInit() {
    console.log(this.cookieService.getAll());
    if (
      !this.cookieService.check('RanCompleted') &&
      !this.cookieService.check('user_id')
    ) {
      this.cookieService.set(
        'RanCompleted',
        'false',
        new Date(2019, 1, 1), // TODO: Set initial cookies function
        '/assessments/ran'
      );
      this.cookieService.set(
        'user_id',
        Math.floor(Math.random() * 50 + 1).toString(),
        new Date(2019, 1, 1),
        '/assessments'
      );
      console.log(this.cookieService.getAll());
      console.log('setting initial cookie');
    } else if (this.cookieService.get('RanCompleted') === 'false') {
      console.log('Ran not completed yet');
    } else {
      console.log('Ran completed already');
    }
  }
}
