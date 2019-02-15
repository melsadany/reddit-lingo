import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AudioRecordingService,
  RecordedAudioOutput
} from '../../../services/audio-recording.service';
import { Subscription } from 'rxjs';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';

@Component({
  selector: 'app-wordfinding',
  templateUrl: './wordfinding.component.html',
  styleUrls: ['./wordfinding.component.scss']
})
export class WordfindingComponent
  implements OnInit, OnDestroy, CanComponentDeactivate {
  countingDown = false;
  intervalCountdown: NodeJS.Timeout;
  timeLeft = 3;
  doneCountingDown = false;
  isRecording = false;
  intervalCountup: NodeJS.Timeout;
  doneRecording: boolean;
  recordedData = [];
  promptNumber = 0;
  showLetter = false;
  currentLetter = '';
  failSubscription: Subscription;
  recordingTimeSubscription: Subscription;
  recordedTime: string;
  recordedOutputSubscription: Subscription;
  lastPrompt = false;
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
  constructor(
    private stateManager: StateManagerService,
    private audioRecordingService: AudioRecordingService,
    private dataService: AssessmentDataService,
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

  ngOnInit(): void {
    for (const assessmentRecord of this.stateManager.assessments) {
      if (assessmentRecord['assess_name'] === 'wordfinding') {
        this.promptNumber = assessmentRecord['prompt_number'];
      }
    }
  }

  ngOnDestroy(): void {
    this.abortRecording();
    this.failSubscription.unsubscribe();
    this.recordingTimeSubscription.unsubscribe();
    this.recordedOutputSubscription.unsubscribe();
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.calculateNextLetter();
    this.startDisplayedCountdownTimer();
  }

  startDisplayedCountdownTimer(): void {
    this.countingDown = true;
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
      this.showLetter = false;
      this.stateManager.showInnerAssessmentButton = true;
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
        prompt_number: this.promptNumber,
        recorded_data: currentRecordedBlobAsBase64
      }); // KRM: Adding recording to the array is done in sync. Currently wait for the recording to load.
      // Might be better to do this async so we don't have the chance of blocking for a short
      // period before moving to the next prompt.
      this.pushAudioData();
      this.promptNumber++;
      // this.advanceToNextPrompt();  KRM: For automatic advancement
    };
  }

  advanceToNextPrompt(): void {
    if (this.promptNumber < this.letterData.length) {
      if (this.promptNumber + 1 === this.letterData.length) {
        this.lastPrompt = true;
        this.stateManager.textOnInnerAssessmentButton =
          'FINISH ASSESSMENT AND ADVANCE';
      }
      this.calculateNextLetter();
      this.stateManager.showInnerAssessmentButton = false;
      this.startDisplayedCountdownTimer();
    } else {
      this.finishAssessment();
    }
  }

  pushAudioData(): void {
    const assessmentData = {
      assess_name: 'wordfinding',
      data: { recorded_data: this.recordedData },
      completed: this.lastPrompt
    };
    const assessmentGoogleData = {
      assess_name: 'wordfinding',
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
    this.recordedData = [];
  }

  finishAssessment(): void {
    this.stateManager.finishThisAssessmentAndAdvance('wordfinding');
  }
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
