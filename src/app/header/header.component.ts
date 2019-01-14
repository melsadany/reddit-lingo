import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { AssessmentDataService } from '../services/assessment-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  inAssessment: Boolean = false;
  @Input() user: any = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private dataService: AssessmentDataService
  ) {}

  ngOnInit(): void {}

  logout(): void {
    this.authService.signOut();
    this.navigate('/auth/login');
  }

  navigate(link: any): void {
    this.router.navigate([link]);
  }

  public updateHeader(): Boolean {
    if (this.dataService.isInAssessment()) {
      return true;
    } else {
      return false;
    }
  }
}
