import { Component, OnInit } from '@angular/core';
import { AssessmentDataService } from '../services/assessment-data.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-assessments-controller',
  templateUrl: './assessments-controller.component.html',
  styleUrls: ['./assessments-controller.component.scss']
})
export class AssessmentsControllerComponent implements OnInit {
  public assessmentData;

  constructor(private dataService: AssessmentDataService, rootComponent: AppComponent) {
    this.assessmentData = rootComponent.assessmentData;
  }

  ngOnInit() {
  }
}
