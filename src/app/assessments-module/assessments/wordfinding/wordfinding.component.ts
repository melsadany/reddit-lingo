import { Component, OnInit } from '@angular/core';
import {
  AudioRecordingService,
  RecordedAudioOutput
} from '../../../services/audio-recording.service';
import { Subscription } from 'rxjs';
import { AssessmentDataService } from '../../../services/assessment-data.service';

@Component({
  selector: 'app-wordfinding',
  templateUrl: './wordfinding.component.html',
  styleUrls: ['./wordfinding.component.scss']
})
export class WordfindingComponent implements OnInit {
  startedAssessment = false;
  countingDown = false;
  splashPage = true;
  intervalCountdown: NodeJS.Timeout;
  textOnButton = 'Start Assessment';
  timeLeft = 3;
  doneCountingDown = false;
  isRecording = false;
  showRecordingIcon = false;
  intervalCountup: NodeJS.Timeout;
  doneRecording: boolean;
  recordedData = [];
  recordingNumber = 1;
  promptNumber = 0;
  showLetter = false;
  currentLetter = '';
  letterData = [
    {
      char: 'A',
      chars: ['R', 'D', 'A', 'M', 'B', 'P', 'C', 'S'],
      type: 'Most Frequent'
    },
    {
      char: 'B',
      chars: ['L', 'G', 'I', 'H', 'E', 'F', 'T'],
      type: 'Medium Frequency'
    },
    {
      char: 'C',
      chars: ['K', 'J', 'V', 'U', 'N', 'O', 'W'],
      type: 'Least Frequent'
    }
  ];
  failSubscription: Subscription;
  recordingTimeSubscription: Subscription;
  recordedTime: string;
  recordedOutputSubscription: Subscription;
  showStartButton = true;

  constructor(
    private audioRecordingService: AudioRecordingService,
    private dataService: AssessmentDataService
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

  ngOnInit(): void {}

  startDisplayedCountdownTimer(): void {
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
        this.showLetter = true;
        this.startRecording();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  startRecording(): void {
    if (!this.isRecording) {
      this.isRecording = true;
      this.showRecordingIcon = true;
      this.audioRecordingService.startRecording();
      this.intervalCountup = setTimeout(() => {
        this.stopRecording();
      }, 20000); // KRM: 30 seconds results in too big of a file right now
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
      this.showRecordingIcon = false;
      clearTimeout(this.intervalCountup);
    }
  }

  calculateNextLetter(): void {
    const currentChoices = this.letterData[this.promptNumber]['chars'];
    this.currentLetter =
      currentChoices[Math.floor(Math.random() * currentChoices.length)];
  }

  handleRecordedOutput(data: RecordedAudioOutput): void {
    const currentBlob = data.blob;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(currentBlob);
    reader.onloadend = (): any => {
      const currentRecordedBlobAsBase64 = reader.result.slice(22);
      this.recordedData.push({
        prompt_number: this.recordingNumber,
        recorded_data: currentRecordedBlobAsBase64
      }); // KRM: Adding recording to the array is done in sync. Currently wait for the recording to load.
      // Might be btter to do this async so we don't have the chance of blocking for a short
      // period before moving to the next prompt.
      if (this.promptNumber === 0) {
        this.textOnButton = 'Continue'; // KRM: Update the button after the first press prompt finsihes
      }
      this.recordingNumber++;
      this.promptNumber++;
      this.showStartButton = true;
      // this.advanceToNextPrompt();  KRM: For automatic advancement
      console.log(this.recordedData);
    };
  }

  advanceToNextPrompt(): void {
    this.showStartButton = false;
    if (this.promptNumber < this.letterData.length) {
      this.calculateNextLetter();
      this.startDisplayedCountdownTimer();
    } else {
      this.finishAssessment();
    }
  }

  finishAssessment(): void {
    this.dataService
      .postAssessmentDataToMongo(
        {
          assess_name: 'wordfinding',
          data: { recorded_data: this.recordedData },
          completed: true
        },
        {
          assess_name: 'wordfinding',
          data: { text: 'None' }
        }
      )
      .subscribe();
    this.dataService.setCookie('wordfinding', 'completed', 200);
    this.dataService.setIsInAssessment(false);
  }
}
