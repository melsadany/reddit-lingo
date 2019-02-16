import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';

@Component({
  selector: 'app-timeduration',
  templateUrl: './timeduration.component.html',
  styleUrls: ['./timeduration.component.scss']
})
export class TimedurationComponent
  implements OnInit, OnDestroy, CanComponentDeactivate {
  countingDown = false;
  intervalCountdown: NodeJS.Timer;
  timeLeft = 3;
  doneCountingDown = false;
  showAnimation = false;
  timerInterval: NodeJS.Timer;
  animationInterval: NodeJS.Timer;
  selecting = false;
  currentTimeSelected;
  promptNumber = 0;
  canSelect = false;
  durations = [5, 1.5, 0.5, 11, 5, 1, 7, 0.75];
  displayPercentage = 100;
  animationDuration;
  selectionData = [];
  displaySubtitle = 'Wait';
  canAnimate = true;
  outerStrokeColor = '#78C000';
  innerStrokeColor = '#C7E596';
  startTime;
  lastPrompt = false;
  constructor(
    public stateManager: StateManagerService,
    private dataService: AssessmentDataService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.stateManager.showOutsideAssessmentButton = false;
    for (const assessmentRecord of this.stateManager.assessments) {
      if (assessmentRecord['assess_name'] === 'timeduration') {
        this.promptNumber = assessmentRecord['prompt_number'];
      }
    }
  }

  setStateAndStart(): void {
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advanceToNextPrompt();
  }

  ngOnDestroy(): void {}

  startDisplayedCountdownTimer(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.countingDown = true;
    this.intervalCountdown = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 3;
        this.countingDown = false;
        this.doneCountingDown = true;
        this.showAnimation = true;
        this.displayAnimation(this.durations[this.promptNumber]);
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
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

  advanceToNextPrompt(): void {
    if (this.promptNumber < 8) {
      if (this.promptNumber + 1 === 8) {
        this.lastPrompt = true;
        this.stateManager.textOnInnerAssessmentButton =
          'FINISH ASSESSMENT AND ADVANCE';
      }
      this.startDisplayedCountdownTimer();
    } else {
      this.finishAssessment();
    }
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
    this.animationDuration = this.durations[this.promptNumber] * 1000; // KRM: Duration from s -> ms
    setTimeout(() => {
      this.canSelect = true;
      this.displaySubtitle = 'Press And Hold Here';
      this.canAnimate = false;
    }, this.animationDuration);
  }

  pushSelectionData(): void {
    const assessmentData = {
      assess_name: 'timeduration',
      data: { selection_data: this.selectionData },
      completed: this.lastPrompt
    };
    const assessmentGoogleData = {
      assess_name: 'timeduration',
      data: { text: 'None' }
    };
    if (this.promptNumber === 0) {
      this.dataService
        .postAssessmentDataToFileSystem(assessmentData, assessmentGoogleData)
        .subscribe();
    } else {
      this.dataService
        .postSingleAudioDataToMongo(assessmentData, assessmentGoogleData)
        .subscribe();
    }
    this.selectionData = [];
  }

  finishAssessment(): void {
    this.stateManager.finishThisAssessmentAndAdvance('timeduration');
  }
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
