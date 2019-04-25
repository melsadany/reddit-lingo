import { Component } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { StateManagerService } from '../../../services/state-manager.service';
import { SelectionAssessment } from '../../../structures/SelectionAssessment';
import { AssetsObject } from '../../../structures/AssessmentDataStructures';

@Component({
  selector: 'app-timeduration',
  templateUrl: './timeduration.component.html',
  styleUrls: ['./timeduration.component.scss']
})
export class TimedurationComponent extends SelectionAssessment {
  assessmentName = 'timeduration';
  showAnimation = false;
  timerInterval: NodeJS.Timer;
  animationInterval: NodeJS.Timer;
  selecting = false;
  currentTimeSelected;
  canSelect = false;
  durations = this.stateManager.appConfig['appConfig']['assessmentsConfig'][
    'timeduration'
  ]['circle_durations'];
  promptsLength = this.durations.length;
  displayPercentage = 100;
  animationDuration;
  displaySubtitle = 'Watch.';
  canAnimate = true;
  outerStrokeColor = '#ff8080';
  innerStrokeColor = '#ffb3b3';
  startTime;
  hammerStage: HTMLElement;
  hammerManager;
  radius: number;
  currentSpace = 4;
  innerStrokeWidth = 4;
  subtitleFontSize: string;
  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService
  ) {
    super(stateManager, dataService);
    this.configureAssessmentSettings();
    if (this.stateManager.inMobileBrowser) {
      this.radius = 150;
      this.subtitleFontSize = '15';
    } else {
      this.radius = 245;
      this.subtitleFontSize = '25';
    }
    // this.dataService
    //   .getAssets('audio', this.assessmentName)
    //   .subscribe((value: AssetsObject) => {
    //     this.audioInstruction = value.audioInstruction;
    //     this.playInstructions();
    //   });
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.showExample = false;
    this.advance();
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
      this.currentSpace = 4;
      this.innerStrokeWidth = 4;
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
      this.advance();
    }
  }

  startTimer(): void {
    if (this.canSelect && !this.selecting) {
      this.currentSpace = 27;
      this.innerStrokeWidth = 24;
      this.startTime = Date.now();
      this.selecting = true;
      this.outerStrokeColor = '#4286f4';
      this.innerStrokeColor = '#4286f4';
      this.displaySubtitle = 'Timing. Tap to stop.';
      this.timerInterval = setInterval(() => {
        if (!this.selecting) {
          clearInterval(this.timerInterval);
        }
      }, 1); // KRM: Counting time button held in miliseconds
    }
  }

  toggle(): void {
    if (this.selecting) {
      this.pauseTimer();
    } else if (!this.selecting) {
      this.startTimer();
    }
  }

  updateCircleState(): void {
    this.currentTimeSelected = 0;
    this.canAnimate = true;
    this.outerStrokeColor = '#ff8080';
    this.innerStrokeColor = '#ffb3b3';
    this.displaySubtitle = 'Watch.';
    this.canSelect = false;
    this.showAnimation = false;
  }

  displayAnimation(animationLength: number): void {
    this.animationDuration = animationLength * 1000; // KRM: Duration from s -> ms
    setTimeout(() => {
      this.outerStrokeColor = '#78C000';
      this.innerStrokeColor = '#C7E596';
      this.canSelect = true;
      this.displaySubtitle = 'Tap to start.';
      this.canAnimate = false;
    }, this.animationDuration);
  }
}
