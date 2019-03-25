import { Component, OnInit } from '@angular/core';
import { StateManagerService } from '../../services/state-manager.service';

@Component({
  selector: 'app-assessments-done',
  templateUrl: './assessments-done.component.html',
  styleUrls: ['./assessments-done.component.scss']
})
export class AssessmentsDoneComponent implements OnInit {
  constructor(public stateManager: StateManagerService) {
    this.stateManager.showOutsideAssessmentButton = false;
  }

  ngOnInit(): void {}
}
