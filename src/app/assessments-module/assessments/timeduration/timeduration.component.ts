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
  holdingDown = false;
  currentTimeHeld;
  currentPrompt = 0;
  canPress = false;
  durations = [5, 1.5, 0.5, 11, 5, 1, 7, 0.75];
  displayPercentage = 100;
  animationDuration;
  heldData = [];
  displaySubtitle = 'Wait';
  canAnimate = true;
  outerStrokeColor = '#78C000';
  innerStrokeColor = '#C7E596';
  startTime;
  constructor(
    private stateManager: StateManagerService,
    private dataService: AssessmentDataService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void { }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.startDisplayedCountdownTimer();
  }

  ngOnDestroy(): void {}

  startDisplayedCountdownTimer(): void {
    this.countingDown = true;
    this.intervalCountdown = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 3;
        this.countingDown = false;
        this.doneCountingDown = true;
        this.showAnimation = true;
        this.displayAnimation(this.durations[this.currentPrompt]);
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  startTimer(): void {
    if (this.canPress && !this.holdingDown) {
      this.startTime = Date.now();
      this.holdingDown = true;
      this.outerStrokeColor = '#4286f4';
      this.innerStrokeColor = '#4286f4';
      this.displaySubtitle = 'Holding';
      this.timerInterval = setInterval(() => {
        if (!this.holdingDown) {
          clearInterval(this.timerInterval);
        }
      }, 1); // KRM: Counting time button held in miliseconds
    }
  }

  pauseTimer(): void {
    if (this.holdingDown) {
      this.canAnimate = true;
      this.holdingDown = false;
      this.outerStrokeColor = '#78C000';
      this.innerStrokeColor = '#C7E596';
      this.displaySubtitle = 'Wait';
      this.canPress = false;
      this.showAnimation = false;
      this.currentTimeHeld = (Date.now() - this.startTime) / 1000; // KRM: Store in seconds with 3 decimal points
      this.currentPrompt++;
      this.heldData.push({
        prompt_number: this.currentPrompt, // KRM: Notice that we will nicely post
        time_held: this.currentTimeHeld // the number 1 here in currentPrompt since its initial value is 0
      }); // and we increment it first right before the push.
      this.currentTimeHeld = 0;
      if (this.currentPrompt < 8) {
        this.startDisplayedCountdownTimer();
      } else {
        this.finishAssessment();
      }
    }
  }

  displayAnimation(animationLength: number): void {
    this.animationDuration = this.durations[this.currentPrompt] * 1000; // KRM: Duration from s -> ms
    setTimeout(() => {
      this.canPress = true;
      this.displaySubtitle = 'Press';
      this.canAnimate = false;
    }, this.animationDuration);
  }

  finishAssessment(): void {
    this.dataService
      .postAssessmentDataToMongo(
        {
          assess_name: 'timeduration',
          data: { held_data: this.heldData },
          completed: true
        },
        {
          assess_name: 'timeduration',
          data: {
            text: 'None'
          }
        }
      )
      .subscribe();
    this.stateManager.finishThisAssessmentAndAdvance('timeduration');
  }
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
