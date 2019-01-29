import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import {
  AudioRecordingService,
  RecordedAudioOutput
} from '../../../services/audio-recording.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pictureprompt',
  templateUrl: './pictureprompt.component.html',
  styleUrls: ['./pictureprompt.component.scss']
})
export class PicturepromptComponent implements OnInit, OnDestroy {
  imagesLocation = 'assets/img/pictureprompt/';
  imageNames = ['despair.jpg', 'he_texted.jpg', 'joke.jpg', 'antagonism.jpg'];
  promptNumber = 0;
  imagePaths: string[] = [];
  showStartButton = true;
  countingDown = false;
  intervalCountup: NodeJS.Timer;
  intervalCountdown: NodeJS.Timer;
  timeLeft = 3;
  doneCountingDown = false;
  showPromptImage = false;
  startedAssessment = false;
  splashPage = true;
  currentImagePrompt = '';
  isRecording = false;
  doneRecording = false;
  recordeData = [];
  recordedTime;
  recordingNumber = 1;
  failSubscription: Subscription;
  recordingTimeSubscription: Subscription;
  recordedOutputSubscription: Subscription;

  constructor(
    private dataService: AssessmentDataService,
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer
  ) {
    this.failSubscription = this.audioRecordingService
      .recordingFailed()
      .subscribe(() => {
        this.isRecording = false;
      });

    this.recordingTimeSubscription = this.audioRecordingService
      .getRecordedTime()
      .subscribe(time => {
        this.recordedTime = time;
      });

    this.recordedOutputSubscription = this.audioRecordingService
      .getRecordedBlob()
      .subscribe(data => {
        this.handleRecordedOutput(data);
      });
  }

  ngOnInit(): void {
    this.calculateImagePaths();
  }

  ngOnDestroy(): void {
    this.abortRecording();
    this.failSubscription.unsubscribe();
    this.recordingTimeSubscription.unsubscribe();
    this.recordedOutputSubscription.unsubscribe();
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
    if (this.splashPage) {
      this.splashPage = false;
    }
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

  abortRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
      this.doneRecording = true;
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
    if (this.promptNumber >= this.imageNames.length) {
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
        prompt_number: this.recordingNumber, // KRM: this code doesn't get executed until after the promptNumber got incremented already
        recorded_data: currentRecordedBlobAsBase64
      }); // KRM: Adding recording to the array is done in sync. Currently wait for the recording to load.
      // Might be btter to do this async so we don't have the chance of blocking for a short
      // period before moving to the next prompt.
      this.recordingNumber++;
      this.advanceToNextPrompt();
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
