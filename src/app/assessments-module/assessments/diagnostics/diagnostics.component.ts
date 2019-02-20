import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioRecordingService } from '../../../services/audio-recording.service';

import * as WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-diagnostics',
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.scss']
})
export class DiagnosticsComponent implements OnInit {
  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService
  ) {}
  audio: HTMLAudioElement;
  testedAudio = false;
  testedMic = false;
  playingAudio = false;
  heardOnce = false;
  wavesurfer;
  @ViewChild('wavesurfer') ws: ElementRef;
  @Input() waveColor = '#0F0';
  @Input() progressColor = '#00F';
  @Input() cursorColor = '#CCC';
  progress = 0;
  playing = false;

  ngOnInit(): void {
    // this.audio = new Audio();
    // this.audio.src = '/assets/audio/diagnostics/setup_audio.mp3';
    requestAnimationFrame(() => {
      this.wavesurfer = WaveSurfer.create({
        container: this.ws.nativeElement,
        waveColor: this.waveColor,
        progressColor: this.progressColor,
        cursorColor: this.cursorColor,
        height: '40'
      });
      this.wavesurfer.load('/assets/audio/diagnostics/setup_audio.mp3');
      this.wavesurfer.on('play', () => {
        this.playing = true;
      });
      this.wavesurfer.on('pause', () => {
        this.playing = false;
      });
      this.wavesurfer.on('finish', () => {
        this.playing = false;
        this.wavesurfer.seekTo(0);
        this.progress = 0;
      });
      this.wavesurfer.on('audioprocess', () => {
        this.progress =
          (this.wavesurfer.getCurrentTime() / this.wavesurfer.getDuration()) *
          100;
      });
    });
  }

  setStateAndStart(): void {
    // this.audioRecordingService.startRecording();
  }



  completeAudioTest(): void {
    this.testedAudio = true;
  }

  playPause(): void {
    if (this.wavesurfer && this.wavesurfer.isReady) {
      this.wavesurfer.playPause();
      if (!this.playingAudio) {
        this.playingAudio = true;
      } else {
        this.playingAudio = false;
      }
    }
  }
}
