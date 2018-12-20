import { Component, OnInit, OnDestroy } from "@angular/core";
import { AudioRecordingService } from "../audio-recording.service";
import { AssessmentDataService } from "../assessment-data.service";
import { DomSanitizer } from "@angular/platform-browser";
import { Ran } from "../../../server/models/ran.model";
import { Observable } from "rxjs";

@Component({
  selector: "app-ran",
  templateUrl: "./ran.component.html",
  styleUrls: ["./ran.component.scss"]
})
export class RanComponent implements OnDestroy {
  isRecording: boolean = false;
  recordedTime;
  recordedBlob;
  recordedBlobAsBase64: ArrayBuffer | String;
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

  constructor(
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer,
    private dataService: AssessmentDataService
  ) {
    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isRecording = false;
    });

    this.audioRecordingService.getRecordedTime().subscribe(time => {
      this.recordedTime = time;
    });

    this.audioRecordingService.getRecordedBlob().subscribe(data => {
      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(data.blob)
      );
    });
    this.audioRecordingService.getRecordedBlob().subscribe(data => {
      this.recordedBlob = data.blob;
    })
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
      let reader = new FileReader();
      reader.readAsDataURL(this.recordedBlob);
      reader.onloadend = () => {
        this.recordedBlobAsBase64 = reader.result;
        this.postRanToMongo({
          user_id: "fake_user_bob",
          wav_base64: this.recordedBlobAsBase64,
          google_speech_to_text: "Fake speech to text"
        }).subscribe();
      };
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

  postRanToMongo(ranObject: Ran): Observable<Ran> {
    console.log(ranObject);
    return this.dataService.http.post("/api/ran/SaveRan", ranObject, {
      responseType: "text"
    });
  }
}
