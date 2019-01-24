import { Component, OnInit } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import {
  AudioRecordingService,
  RecordedAudioOutput
} from '../../../services/audio-recording.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-pictureprompt',
  templateUrl: './pictureprompt.component.html',
  styleUrls: ['./pictureprompt.component.scss']
})
export class PicturepromptComponent implements OnInit {
  imagesLocation = 'assets/img/pictureprompt/';
  imageNames = ['despair.jpg', 'he_texted.jpg', 'joke.jpg', 'antagonism.jpg'];
  promptNumber = 1;
  imagePaths: string[] = [];
  showStartButton = true;
  countingDown = false;
  intervalCountdown: NodeJS.Timeout;
  timeLeft = 3;
  doneCountingDown = false;
  showPromptImage = false;
  startedAssessment = false;
  splashPage = true;
  currentImagePrompt = '';
  isRecording = false;
  intervalCountup: NodeJS.Timer;
  doneRecording = false;
  recordeData = [];
  recordedTime;

  constructor(
    private dataService: AssessmentDataService,
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer
  ) {
    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isRecording = false;
    });

    this.audioRecordingService.getRecordedTime().subscribe(time => {
      this.recordedTime = time;
    });

    this.audioRecordingService.getRecordedBlob().subscribe(data => {
      this.handleRecordedOutput(data);
    });
  }

  ngOnInit(): void {
    this.calculateImagePaths();
  }

  calculateImagePaths(): void {
    for (let i = 0; i < this.imageNames.length; i++) {
      this.imagePaths.push(
        `${this.imagesLocation}${i + 1}/${this.imageNames[i]}`
      );
    }
  }

  getNextImagePath(): void {
    this.currentImagePrompt = this.imagePaths[this.promptNumber - 1];
  }

  startDisplayedCountdownTimer(): void {
    console.log(this.currentImagePrompt);
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
        this.showPromptImage = true;
        this.startRecording();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  startRecording(): void {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();
      this.intervalCountup = setTimeout(() => {
        this.stopRecording();
      }, 30000);
    }
  }

  stopRecording(): void {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
      this.doneRecording = true;
      this.showPromptImage = false;
      clearTimeout(this.intervalCountup);
    }
  }

  advanceToNextPrompt(): void {
    if (this.promptNumber > this.imageNames.length) {
      this.finishAssessment();
    } else {
      this.promptNumber++;
      this.getNextImagePath();
      this.startDisplayedCountdownTimer();
    }
  }

  handleRecordedOutput(data: RecordedAudioOutput): void {
    // const url = this.sanitizer.bypassSecurityTrustUrl(
    //   URL.createObjectURL(data.blob)
    // );
    const currentBlob = data.blob;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(currentBlob);
    reader.onloadend = (): any => {
      const currentRecordedBlobAsBase64 = reader.result.slice(22);
      this.recordeData.push({
        prompt_number: this.promptNumber,
        recorded_data: currentRecordedBlobAsBase64
      });
    };
  }

  finishAssessment(): void {
    this.dataService
      .postAssessmentDataToMongo(
        {
          assess_name: 'pictureprompt',
          data: { recorded_data: this.recordeData },
          completed: true
        },
        {
          assess_name: 'pictureprompt',
          data: { text: 'Fake speech to text' }
        }
      )
      .subscribe();
    this.dataService.setCookie('pictureprompt', 'completed', 200);
    this.dataService.setIsInAssessment(false);
  }
}
