import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';
import { SelectionAssessment } from '../../../structures/SelectionAssessment';

@Component({
  selector: 'app-timeduration',
  templateUrl: './timeduration.component.html',
  styleUrls: ['./timeduration.component.scss']
})
export class TimedurationComponent extends SelectionAssessment
  implements OnInit, OnDestroy, CanComponentDeactivate {
  assessmentName = 'timeduration';
  showAnimation = false;
  timerInterval: NodeJS.Timer;
  animationInterval: NodeJS.Timer;
  selecting = false;
  currentTimeSelected;
  canSelect = false;
  durations = [5, 1.5, 0.5, 11, 5, 1, 7, 0.75];
  promptsLength = this.durations.length;
  displayPercentage = 100;
  animationDuration;
  displaySubtitle = 'Wait';
  canAnimate = true;
  outerStrokeColor = '#78C000';
  innerStrokeColor = '#C7E596';
  startTime;
  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService,
    public dialogService: DialogService
  ) {
    super(stateManager, dialogService, dataService);
  }

  setStateAndStart(): void {
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advance();
  }

  startTimer(): void {
    if (this.canSelect && !this.selecting) {
      this.startTime = Date.now();
      this.selecting = true;
      this.outerStrokeColor = '#4286f4';
      this.innerStrokeColor = '#4286f4';
      this.displaySubtitle = 'Holding. Let go when finished.';
      this.timerInterval = setInterval(() => {
        if (!this.selecting) {
          clearInterval(this.timerInterval);
        }
      }, 1); // KRM: Counting time button held in miliseconds
    }
  }

  advance(): void {
    this.advanceToNextPrompt(
      () => {
        this.showAnimation = true;
        this.displayAnimation(this.durations[this.promptNumber]);
      },
      () => {
        return new Promise(
          (resolve, reject): void => {
            this.stateManager.showInnerAssessmentButton = false;
            resolve('done');
          }
        );
      }
    );
  }

  pauseTimer(): void {
    if (this.selecting) {
      this.selecting = false;
      this.currentTimeSelected = (Date.now() - this.startTime) / 1000; // KRM: Store in seconds with 3 decimal points
      this.selectionData.push({
        prompt_number: this.promptNumber,
        time_held: this.currentTimeSelected
      });
      this.pushSelectionData();
      this.updateCircleState();
      this.promptNumber++;
      this.stateManager.showInnerAssessmentButton = true;
      this.currentTimeSelected = 0;
    }
  }

  updateCircleState(): void {
    this.currentTimeSelected = 0;
    this.canAnimate = true;
    this.outerStrokeColor = '#78C000';
    this.innerStrokeColor = '#C7E596';
    this.displaySubtitle = 'Wait';
    this.canSelect = false;
    this.showAnimation = false;
  }

  displayAnimation(animationLength: number): void {
    this.animationDuration = animationLength * 1000; // KRM: Duration from s -> ms
    setTimeout(() => {
      this.canSelect = true;
      this.displaySubtitle = 'Press And Hold Here';
      this.canAnimate = false;
    }, this.animationDuration);
  }
}
