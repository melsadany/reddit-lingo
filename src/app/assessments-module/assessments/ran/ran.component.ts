import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AudioRecordingService,
  RecordedAudioOutput
} from '../../../services/audio-recording.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AssessmentModel } from '../../../../../server/models/assessment.model';
import { Observable } from 'rxjs';
import { Assessment } from '../../../structures/assessment';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-ran',
  templateUrl: './ran.component.html',
  styleUrls: ['./ran.component.scss']
})
export class RanComponent implements OnInit, OnDestroy, Assessment {
  name = 'RanAssessment';
  description = 'Ran test componenet';
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
  ranAssessment;

  constructor(
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer,
    private dataService: AssessmentDataService,
    private cookieService: CookieService
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
    this.dataService = dataService;
  }

  startRecording() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();
      this.intervalCountup = setTimeout(() => {
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

  ngOnInit(): void {
    if (this.dataService.checkIfAssessmentCompleted('ran')) {
      this.assessmentAlreadyCompleted = true;
    }
  }

  startDisplayedCountdownTimer() {
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

  handleRecordedOutput(data: RecordedAudioOutput) {
    this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(
      URL.createObjectURL(data.blob)
    );
    this.recordedBlob = data.blob;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(this.recordedBlob);
    reader.onloadend = () => {
      this.recordedBlobAsBase64 = reader.result.slice(22);
      this.dataService
        .postAssessmentDataToMongo({
          user_id: this.cookieService.get('user_id'),
          assessments: [
            {
              assess_name: 'ran',
              data: { recorded_data: this.recordedBlobAsBase64 },
              completed: true
            }
          ],
          google_speech_to_text_assess: [
            {
              assess_name: 'ran',
              data: {
                text: 'Fake speech to text'
              }
            }
          ]
        })
        .subscribe(product => console.log(product)); // KRM: Subscription likely not needed here, debugging only right now
    };
    // KRM: Each assessment will handle the structure of its assessment data before posting it to mongo
  }

  //   postRanToMongo(assessments: AssessmentModel): Observable<AssessmentModel> {
  //     return this.dataService.http.post(
  //       '/api/assessmentsAPI/SaveAssessments',
  //       assessments,
  //       {
  //         responseType: 'text'
  //       }
  //     );
  //   }
}

// TODO: Assessments Data Service posting to mongo or updating from what's been done so far
