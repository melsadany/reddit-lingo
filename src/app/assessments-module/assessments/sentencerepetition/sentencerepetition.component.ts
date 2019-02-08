import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import {
  AudioRecordingService,
  RecordedAudioOutput
} from '../../../services/audio-recording.service';
import { Subscription } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';

@Component({
  selector: 'app-sentencerepetition',
  templateUrl: './sentencerepetition.component.html',
  styleUrls: ['./sentencerepetition.component.scss']
})
export class SentencerepetitionComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  failSubscription: Subscription;
  isRecording = false;
  recordingTimeSubscription: Subscription;
  recordedTime: string;
  recordedOutputSubscription: Subscription;
  recordedData = [];
  recordingNumber = 1;
  promptNumber = 0;
  textOnButton = 'Start Assessment';
  showStartButton = true;
  startedAssessment = false;
  countingDown = false;
  splashPage = true;
  intervalCountdown: NodeJS.Timeout;
  timeLeft = 3;
  doneCountingDown = false;
  showRecordingIcon = false;
  intervalCountup: NodeJS.Timeout;
  doneRecording = false;

  constructor(
    private dataService: AssessmentDataService,
    private audioRecordingService: AudioRecordingService,
    private dialogService: DialogService
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

  audioFilesLocation = 'assets/audio/sentencerepetition/';
  audioFileNumbersToPlay: string[] = [
    '1',
    '2',
    '8',
    '11',
    '15',
    '19',
    '23',
    '24',
    '25',
    '27'
  ];
  filePathsToPlay = [];

  ngOnInit(): void {
    this.calculateFilePaths();
  }

  ngOnDestroy(): void {
    this.abortRecording();
    this.failSubscription.unsubscribe();
    this.recordingTimeSubscription.unsubscribe();
    this.recordedOutputSubscription.unsubscribe();
    this.dataService.goTo('');
  }

  calculateFilePaths(): void {
    for (const fileNumber of this.audioFileNumbersToPlay) {
      this.filePathsToPlay.push(`${this.audioFilesLocation}${fileNumber}.mp3`);
    }
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
      console.log(this.recordedData);
    };
  }

  startDisplayedCountdownTimer(): void {
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
      }, 5000);
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

  startAudioForSet(): void {
    if (!this.startedAssessment) {
      this.startedAssessment = true;
      this.dataService.setIsInAssessment(true);
    }
    this.showStartButton = false;
    if (this.promptNumber < this.filePathsToPlay.length) {
      this.splashPage = true;
      const audio = new Audio();
      audio.src = this.filePathsToPlay[this.promptNumber];
      audio.addEventListener('ended', () =>
        this.startDisplayedCountdownTimer()
      );
      audio.play();
    } else {
      this.finishAssessment();
    }
  }

  finishAssessment(): void {
    this.dataService
      .postAssessmentDataToMongo(
        {
          assess_name: 'sentencerepetition',
          data: { recorded_data: this.recordedData },
          completed: true
        },
        {
          assess_name: 'sentencerepetition',
          data: { text: 'None' }
        }
      )
      .subscribe();
    this.dataService.setCookie('sentencerepetition', 'completed', 200);
    this.dataService.setIsInAssessment(false);
  }
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
