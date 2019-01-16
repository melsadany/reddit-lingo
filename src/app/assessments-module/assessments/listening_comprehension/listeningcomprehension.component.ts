import { Component, OnInit } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';

@Component({
  selector: 'app-listeningcomprehension',
  templateUrl: './listeningcomprehension.component.html',
  styleUrls: ['./listeningcomprehension.component.scss']
})
export class ListeningcomprehensionComponent implements OnInit {
  assessmentAlreadyCompleted = false;
  splashPage = true;
  startedAssessment = false;
  countingDown = false;
  intervalCountdown: NodeJS.Timeout;
  timeLeft = 3;
  doneCountingDown = false;
  showImage = false;
  imagePaths: [];
  currentQuestionSetNumber = 1;
  imagesLocation = 'assets/img/listeningcomprehension/';

  constructor(private dataService: AssessmentDataService) {}

  ngOnInit(): void {
    if (this.dataService.isAssessmentCompleted('listeningcomprehension')) {
      this.assessmentAlreadyCompleted = true;
    }
    this.calculateImageNames();
  }

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
        this.showImage = true;
        // this.startRecording();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  calculateImageNames(): void {
    this.imagePaths = [];
    this.imagesLocation = `assets/img/listeningcomprehension/${this.currentQuestionSetNumber}/image/`;
    const firstRow: string[] = [];
    const secondRow: string[] = [];
    const thirdRow: string[] = [];
    for (let i = 1; i <= 3; i++) {
      firstRow.push(`${this.imagesLocation}${i}a_q${this.currentQuestionSetNumber}.png`);
    }
    for (let i = 4; i <= 6; i++) {
      secondRow.push(`${this.imagesLocation}${i}a_q${this.currentQuestionSetNumber}.png`);
    }
    for (let i = 7; i <= 9; i++) {
      thirdRow.push(`${this.imagesLocation}${i}a_q${this.currentQuestionSetNumber}.png`);
    }
    this.imagePaths.push(firstRow, secondRow, thirdRow);
    console.log(this.imagePaths);
  }
}
