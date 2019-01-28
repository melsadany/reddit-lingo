import { Component, OnInit } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';

@Component({
  selector: 'app-timeduration',
  templateUrl: './timeduration.component.html',
  styleUrls: ['./timeduration.component.scss']
})
export class TimedurationComponent implements OnInit {
  startedAssessment = false;
  countingDown = false;
  splashPage = true;
  intervalCountdown: NodeJS.Timer;
  timeLeft = 3;
  doneCountingDown = false;
  showAnimation = false;
  timerInterval: NodeJS.Timer;
  animationInterval: NodeJS.Timer;
  holdingDown = false;
  currentTimeHeld = 0;
  currentPrompt = 0;
  canPress = false;
  durations = [5, 1.5, 0.5, 11, 5, 1, 7, 0.75];
  currentPercentage = 0;
  i = 0;

  constructor(private dataService: AssessmentDataService) {}

  ngOnInit(): void {}

  startDisplayedCountdownTimer(): void {
    this.startedAssessment = true;
    this.countingDown = true;
    this.splashPage = false;
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
    if (this.canPress) {
      this.currentTimeHeld = 0;
      if (!this.holdingDown) {
        this.holdingDown = true;
        this.timerInterval = setInterval(() => {
          if (!this.holdingDown) {
            clearInterval(this.timerInterval);
          } else {
            this.currentTimeHeld++;
          }
        }, 1); // KRM: Counting time button held in miliseconds
      }
    }
  }

  pauseTimer(): void {
    if (this.holdingDown) {
      this.holdingDown = false;
      this.canPress = false;
      this.showAnimation = false;
      this.startDisplayedCountdownTimer();
    }
  }

  displayAnimation(animationLength: number): void {
    // console.log(animationLength);
    // let timeInMs = animationLength * 10 ;
    // const addPerCheck = 100 / timeInMs;
    // console.log(addPerCheck);
    // this.animationInterval = setInterval(() => {
    //   if (timeInMs <= 0) {
    //     this.canPress = true;
    //     console.log('can press');
    //     clearInterval(this.animationInterval);
    //     // KRM: DO other stuff
    //   } else {
    //     console.log(timeInMs);
    //     this.currentPercentage ++;
    //     timeInMs--;
    //   }
    // }, 100);
    this.currentPercentage = 100;
  }

}
