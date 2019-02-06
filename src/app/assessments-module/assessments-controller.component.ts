import { Component, OnInit, HostListener, Host } from '@angular/core';
import { AssessmentDataService } from '../services/assessment-data.service';
import { AppComponent } from '../app.component';
import { DialogService } from '../services/dialog.service';
import { CanComponentDeactivate } from '../guards/can-deactivate.guard';
import { NavigationStart, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-assessments-controller',
  templateUrl: './assessments-controller.component.html',
  styleUrls: ['./assessments-controller.component.scss']
})
export class AssessmentsControllerComponent
  implements OnInit, CanComponentDeactivate {
  allAssessmentsCompleted: Boolean = false;
  navStart: Observable<NavigationStart>;

  constructor(
    private dataService: AssessmentDataService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.dataService.setIsInAssessment(false);
    if (this.dataService.allAssessmentsCompleted) {
      this.dataService.goTo('done');
    }
    if (this.dataService.doRedirectBackToStart()) {
      this.dataService.router.navigate(['/assessments/']);
    }
  }

  // @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
