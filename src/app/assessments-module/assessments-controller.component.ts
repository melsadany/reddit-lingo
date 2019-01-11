import { Component, OnInit } from '@angular/core';
import { AssessmentDataService } from '../services/assessment-data.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-assessments-controller',
  templateUrl: './assessments-controller.component.html',
  styleUrls: ['./assessments-controller.component.scss']
})
export class AssessmentsControllerComponent implements OnInit {
  allAssessmentsCompleted: Boolean = false;

  constructor(
    private dataService: AssessmentDataService,
    private appComponent: AppComponent
  ) {}

  ngOnInit(): void {}

}
