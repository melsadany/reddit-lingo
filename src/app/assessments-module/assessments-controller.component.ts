import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AssessmentDataService } from '../services/assessment-data.service';
import { StateManagerService } from '../services/state-manager.service';
import { AudioRecordingService } from '../services/audio-recording.service';
@Component({
  selector: 'app-assessments-controller',
  templateUrl: './assessments-controller.component.html',
  styleUrls: ['./assessments-controller.component.scss']
})
export class AssessmentsControllerComponent implements OnInit {
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  constructor(
    private dataService: AssessmentDataService,
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService
  ) {}

  ngOnInit(): void {
    if (!this.stateManager.startedByHandFromHome) {
      console.log('Going home');
      this.stateManager.goHome();
    }
  }

  public getCanvasElement(): ElementRef {
    console.log('getting canvas');
    return this.canvas;
  }
}
