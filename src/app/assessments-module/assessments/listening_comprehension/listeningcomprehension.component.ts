import { Component, OnInit } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';

@Component({
  selector: 'app-listeningcomprehension',
  templateUrl: './listeningcomprehension.component.html',
  styleUrls: ['./listeningcomprehension.component.scss']
})
export class ListeningcomprehensionComponent implements OnInit {
  textOnButton = 'Start Assessment';
  firstSet = true;
  assessmentAlreadyCompleted = false;
  showStartButton = true;
  splashPage = true;
  startedAssessment = false;
  countingDown = false;
  intervalCountdown: NodeJS.Timeout;
  timeLeft = 3;
  doneCountingDown = false;
  showImage = false;
  imagePaths: string[][];
  currentQuestionSetNumber = 1;
  imagesLocation = 'assets/img/listeningcomprehension/';
  audioInstructionsLocation = 'assets/audio/listeningcomprehension/';
  imageSelections = [];

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
    this.imagesLocation = `assets/img/listeningcomprehension/${
      this.currentQuestionSetNumber
    }/image/`;
    const firstRow: string[] = [];
    const secondRow: string[] = [];
    const thirdRow: string[] = [];
    for (let i = 1; i <= 3; i++) {
      firstRow.push(
        `${this.imagesLocation}${i}a_q${this.currentQuestionSetNumber}.png`
      );
    }
    for (let i = 4; i <= 6; i++) {
      secondRow.push(
        `${this.imagesLocation}${i}a_q${this.currentQuestionSetNumber}.png`
      );
    }
    for (let i = 7; i <= 9; i++) {
      thirdRow.push(
        `${this.imagesLocation}${i}a_q${this.currentQuestionSetNumber}.png`
      );
    }
    this.imagePaths.push(firstRow, secondRow, thirdRow);
  }

  selectImage(image: string): void {
    const delimited = image.split('/');
    const image_name = delimited[delimited.length - 1];
    this.imageSelections.push({
      setNumber: this.currentQuestionSetNumber,
      imageSelected: image_name
    });
    this.currentQuestionSetNumber++;
    console.log(this.imageSelections);
    this.showImage = false;
    if (this.currentQuestionSetNumber > 12) {
      this.finishAssessment();
    } else {
      this.nextImageSet();
    }
  }

  nextImageSet(): void {
    this.calculateImageNames();
    if (this.firstSet) {
      this.firstSet = false;
      this.textOnButton = 'Continue to next set';
    }
    this.splashPage = true;
    // this.showStartButton = true;
    this.startAudioInstructionForSet();
  }

  startAudioInstructionForSet(): void {
    const audio = new Audio();
    audio.src = `${this.audioInstructionsLocation}q${
      this.currentQuestionSetNumber
    }.mp3`;
    audio.addEventListener('ended', () => this.startDisplayedCountdownTimer());
    audio.play();
    this.showStartButton = false;
  }

  finishAssessment(): void {
    this.dataService
      .postAssessmentDataToMongo(
        {
          assess_name: 'listeningcomprehension',
          data: { selection_data: this.imageSelections },
          completed: true
        },
        {
          assess_name: 'listeningComprehension',
          data: {
            text: 'Fake speech to text'
          }
        }
      )
      .subscribe();
    this.dataService.setIsInAssessment(false);
    this.dataService.setCookie('listeningcomprehension', 'completed', 200);
  }
}
