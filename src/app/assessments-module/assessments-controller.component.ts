import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { AssessmentDataService } from '../services/assessment-data.service';
import { DialogService } from '../services/dialog.service';
import { CanComponentDeactivate } from '../guards/can-deactivate.guard';
import { StateManagerService } from '../services/state-manager.service';
import { AudioRecordingService } from '../services/audio-recording.service';

@Component({
  selector: 'app-assessments-controller',
  templateUrl: './assessments-controller.component.html',
  styleUrls: ['./assessments-controller.component.scss']
})
export class AssessmentsControllerComponent
  implements OnInit, CanComponentDeactivate, AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef;
  constructor(
    private dataService: AssessmentDataService,
    private dialogService: DialogService,
    public stateManager: StateManagerService,
  ) {}

  ngOnInit(): void {
    this.stateManager.isInAssessment = false;
    if (this.stateManager.finishedAllAssessments) {
      this.stateManager.navigateTo('done');
    }
  }

  ngAfterViewInit(): void {
  }

  public getCanvasElement(): ElementRef {
    console.log('getting canvas');
    return this.canvas;
  }

  // @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
