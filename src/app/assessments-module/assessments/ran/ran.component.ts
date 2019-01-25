import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import {
  AudioRecordingService,
  RecordedAudioOutput
} from '../../../services/audio-recording.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ran',
  templateUrl: './ran.component.html',
  styleUrls: ['./ran.component.scss']
})
export class RanComponent implements OnInit, OnDestroy {
  isRecording = false;
  recordedTime: string;
  recordedBlob: Blob;
  recordedBlobAsBase64: ArrayBuffer | string;
  blobUrl: SafeUrl;
  intervalCountdown: NodeJS.Timer;
  intervalCountup: NodeJS.Timer;
  splashPage = true;
  countingDown = false;
  doneCountingDown = false;
  showImage = false;
  doneRecording = false;
  timeLeft = 3;
  startedAssessment = false;
  assessmentAlreadyCompleted = false;
  failSubscription: Subscription;
  recordingTimeSubscription: Subscription;
  recordedOutputSubscription: Subscription;

  constructor(
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer,
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
      this.showImage = false;
      clearTimeout(this.intervalCountup);
    }
  }

  clearRecordedData(): void {
    this.blobUrl = null;
  }

  ngOnDestroy(): void {
    this.abortRecording();
    this.failSubscription.unsubscribe();
    this.recordingTimeSubscription.unsubscribe();
    this.recordedOutputSubscription.unsubscribe();
  }

  ngOnInit(): void {
    if (this.dataService.isAssessmentCompleted('ran')) {
      this.assessmentAlreadyCompleted = true;
    }
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
        this.startRecording();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  handleRecordedOutput(data: RecordedAudioOutput): void {
    this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(
      URL.createObjectURL(data.blob)
    );
    this.recordedBlob = data.blob;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(this.recordedBlob);
    reader.onloadend = (): any => {
      this.recordedBlobAsBase64 = reader.result.slice(22);
      this.dataService
        .postAssessmentDataToMongo(
          {
            assess_name: 'ran',
            data: { recorded_data: this.recordedBlobAsBase64 },
            completed: true
          },
          {
            assess_name: 'ran',
            data: {
              text: 'Fake speech to text'
            }
          }
        )
        .subscribe();
    };
    this.dataService.setIsInAssessment(false);
    this.dataService.setCookie('ran', 'completed', 200);

    // KRM: Each assessment will handle the structure of its assessment data before posting it to mongo
  }
}
