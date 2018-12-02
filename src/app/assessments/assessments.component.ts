import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioRecordingService } from '../audio-recording.service';
import { AssessmentDataService } from '../assessment-data.service'
import { DomSanitizer } from '@angular/platform-browser';
import { interval } from 'rxjs';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnDestroy {

  isRecording: boolean = false;
  recordedTime;
  blobUrl;
  intervalCountdown;
  intervalCountup;
  splashPage: boolean = true;
  countingDown: boolean = false;
  doneCountingDown: boolean = false;
  showImage: boolean = false;
  doneRecording: boolean = false;
  timeLeft: number = 3;
  startedAssessment: boolean = false;

  constructor(private audioRecordingService: AudioRecordingService, private sanitizer: DomSanitizer, private dataService: AssessmentDataService) {

    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isRecording = false;
    });

    this.audioRecordingService.getRecordedTime().subscribe((time) => {
      this.recordedTime = time;
    });

    this.audioRecordingService.getRecordedBlob().subscribe((data) => {
      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
    });
  }

  startRecording() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();
      this.intervalCountup = setTimeout( () => {
          this.stopRecording();
        }, 30000);
    }
  }

  abortRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
      this.doneRecording = true;
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
      this.doneRecording = true;
      this.showImage = false;
      clearTimeout(this.intervalCountup);
    }
  }

  clearRecordedData() {
    this.blobUrl = null;
  }

  ngOnDestroy(): void {
    this.abortRecording();
  }

  startDisplayedCountdownTimer() {
    this.startedAssessment = true;
    this.countingDown = true;
    this.splashPage = false;
    this.intervalCountdown = setInterval( () => {
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
    }, 1000)
  }
}
