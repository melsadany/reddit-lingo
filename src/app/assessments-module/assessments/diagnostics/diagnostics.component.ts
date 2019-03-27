import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioRecordingService } from '../../../services/audio-recording.service';

import * as WaveSurfer from 'wavesurfer.js';
import { DomSanitizer } from '@angular/platform-browser';
import { AssessmentDataService } from '../../../services/assessment-data.service';

@Component({
  selector: 'app-diagnostics',
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.scss']
})
export class DiagnosticsComponent implements OnInit, OnDestroy {
  doneRecording: boolean;
  constructor(
    public dataService: AssessmentDataService,
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService,
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
  isRecording;
  recordedTime;
  audio: HTMLAudioElement;
  testedAudio = false;
  testedMic = false;
  playingAudio = false;
  heardOnce = false;
  wavesurfer;
  textOnTestAudioButton = 'Listen to the audio track';
  @ViewChild('wavesurfer') ws: ElementRef;
  @Input() waveColor = '#ff1e7f';
  @Input() progressColor = '#00F';
  @Input() cursorColor = '#CCC';
  progress = 0;
  playing = false;
  cantHear = false;
  intervalCountup;
  blobUrl;
  showWaveForm = false;
  cantHearMic = false;

  ngOnInit(dataBlob?: any): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted('diagnostics');
    this.stateManager.isInAssessment = true;
    requestAnimationFrame(() => {
      this.wavesurfer = WaveSurfer.create({
        container: this.ws.nativeElement,
        waveColor: this.waveColor,
        progressColor: this.progressColor,
        cursorColor: this.cursorColor,
        height: 128,
        autoCenter: true,
        hideScrollbar: true,
        backend: 'MediaElement'
      });
      if (!this.testedAudio) {
        this.wavesurfer.load('/assets/audio/diagnostics/setup_audio.mp3');
      } else {
        this.wavesurfer.loadBlob(dataBlob);
      }
      this.wavesurfer.on('play', () => {
        this.playing = true;
      });
      this.wavesurfer.on('pause', () => {
        this.playing = false;
      });
      this.wavesurfer.on('finish', () => {
        // this.playing = false;
        this.wavesurfer.seekTo(0);
        this.progress = 0;
        this.wavesurfer.playPause();
        // this.playing = true;
      });
      this.wavesurfer.on('audioprocess', () => {
        this.progress =
          (this.wavesurfer.getCurrentTime() / this.wavesurfer.getDuration()) *
          100;
      });
    });
    this.showWaveForm = true;
  }

  handleRecordedOutput(data: any): void {
    this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(
      URL.createObjectURL(data.blob)
    );
    this.ngOnInit(data.blob);
  }

  startRecording(): void {
    if (!this.isRecording) {
      this.showWaveForm = false;
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
      this.showWaveForm = true;
      clearTimeout(this.intervalCountup);
    }
  }

  clearRecordedData(): void {
    this.blobUrl = null;
  }

  ngOnDestroy(): void {
    this.abortRecording();
    clearTimeout(this.intervalCountup);
  }
  completeAudioTest(): void {
    this.textOnTestAudioButton = 'Listen to your microphone recording';
    this.testedAudio = true;
    this.showWaveForm = false;
    if (this.playingAudio) {
      this.playPause();
    }
  }

  waitForTroubleshoot(): void {
    if (this.playingAudio) {
      this.playPause();
    }
    this.cantHear = true;
    this.showWaveForm = false;
  }

  tryAudioAgain(): void {
    this.ngOnInit();
    this.heardOnce = false;
    this.cantHear = false;
  }

  playPause(): void {
    if (this.wavesurfer && this.wavesurfer.isReady) {
      window.alert('Playing');
      this.wavesurfer.playPause();
      if (!this.playingAudio) {
        this.playingAudio = true;
        this.heardOnce = true;
      } else {
        this.playingAudio = false;
      }
    }
  }

  didNotRecordCorrectly(): void {
    this.cantHearMic = true;
    this.showWaveForm = false;
    if (this.playingAudio) {
      this.playPause();
    }
    this.clearRecordedData();
  }

  tryRecordingAgain(): void {
    this.cantHearMic = false;
  }

  didRecordCorrectly(): void {
    if (this.playingAudio) {
      this.playPause();
    }
    const assessmentData = {
      assess_name: 'diagnostics',
      data: { data: 'none' },
      completed: true
    };
    const assessmentGoogleData = {
      assess_name: 'diagnostics',
      data: { data: 'none' }
    };
    this.dataService
      .postAssessmentDataToFileSystem(assessmentData, assessmentGoogleData)
      .subscribe();
    this.stateManager.finishThisAssessmentAndAdvance('diagnostics');
  }
}
