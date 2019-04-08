/// <reference types="@types/dom-mediacapture-record" />

import { Injectable } from '@angular/core';
import RecordRTC from 'recordrtc';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { StateManagerService } from './state-manager.service';
import { Stream } from 'stream';

export interface RecordedAudioOutput {
  blob: Blob;
  user_id: string;
}

@Injectable()
export class AudioRecordingService {
  private stream: MediaStream;
  public inMicrophoneError = false;
  // private recorder: {
  //   record: () => void;
  //   stop: (arg0: (blob: any) => void, arg1: () => void) => void;
  // };
  private recorder;
  private interval: NodeJS.Timeout;
  private startTime: moment.MomentInput;
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();
  private _currentlyRecording = false;
  private _gettingMicErrorText: string;

  private _kalebRecorder: KalebRecorder;

  constructor(private stateManager: StateManagerService) {
    this._kalebRecorder = new KalebRecorder(1024);
    this._kalebRecorder.stopRecording();
    // this._kalebRecorder.start();
  }

  public get gettingMicErrorText(): string {
    return this._gettingMicErrorText;
  }
  public set gettingMicErrorText(value: string) {
    this._gettingMicErrorText = value;
  }

  captureStream(): void {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(s => {
        if (this.inMicrophoneError) {
          this.inMicrophoneError = false;
        }
        this.stream = s;
        this.record();
      })
      .catch(error => {
        alert(error);
        this._recordingFailed.next();
      });
  }

  isCurrentlyRecording(): Boolean {
    return this._currentlyRecording;
  }

  setCurrentlyRecording(set: boolean): void {
    if (set === this._currentlyRecording) {
      console.log('error, already set to this value');
    }
    this._currentlyRecording = set;
  }

  getRecordedBlob(): Observable<RecordedAudioOutput> {
    return this._recorded.asObservable();
  }

  getRecordedTime(): Observable<string> {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }

  startRecording(): void {
    this._recordingTime.next('00:00');
    if (this.recorder) {
      return;
    } else if (!this.stream) {
      this.captureStream();
    } else {
      this.record();
    }
  }

  abortRecording(): void {
    this.setCurrentlyRecording(false);
    this.stopMedia();
  }

  private record(): void {
    const options = {
      type: 'audio',
      mimeType: 'audio/webm'
    };
    this.setCurrentlyRecording(true);

    if (this.stateManager.inMobileBrowser) {
      this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, options);
    } else {
      this.recorder = new RecordRTC(this.stream, options);
    }

    if (this.stateManager.inMobileBrowser) {
      this.recorder.record();
    } else {
      this.recorder.startRecording();
    }
    this.startTime = moment();
    this.interval = setInterval(() => {
      const currentTime = moment();
      const diffTime = moment.duration(currentTime.diff(this.startTime));
      const time =
        this.toString(diffTime.minutes()) +
        ':' +
        this.toString(diffTime.seconds());
      this._recordingTime.next(time);
    }, 1000);
  }

  private toString(value: string | number): string | number {
    let val = value;
    if (!value) {
      val = '00';
    }
    if (value < 10) {
      val = '0' + value;
    }
    return val;
  }

  stopRecording(): void {
    if (this.recorder) {
      if (RecordRTC.Storage.AudioContextConstructor) {
        alert('AudioContextConstructor');
      }
      this.setCurrentlyRecording(false);
      if (this.stateManager.inMobileBrowser) {
        this.recorder.stop(
          // (blob: Blob) => {
          (blob: Blob) => {
            const currentBlob = blob;
            if (this.startTime) {
              const wavName = encodeURIComponent(
                'audio_' + new Date().getTime() + '.wav'
              );
              this.stopMedia();
              this._recorded.next({
                blob: currentBlob,
                user_id: wavName
              });
            }
          },
          () => {
            this.stopMedia();
            this._recordingFailed.next();
          }
        );
      } else {
        this.recorder.stopRecording(
          // (blob: Blob) => {
          () => {
            const currentBlob = this.recorder.getBlob();
            if (this.startTime) {
              const wavName = encodeURIComponent(
                'audio_' + new Date().getTime() + '.wav'
              );
              this.stopMedia();
              this._recorded.next({
                blob: currentBlob,
                user_id: wavName
              });
            }
          },
          () => {
            this.stopMedia();
            this._recordingFailed.next();
          }
        );
      }
    }
  }

  private stopMedia(): void {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream
          .getAudioTracks()
          .forEach((track: { stop: () => void }) => track.stop());
        this.stream = null;
      }
    }
    // this.stream.getAudioTracks().forEach(track => console.log(track));
  }

  private handleMicError(error: Error): void {
    this.inMicrophoneError = true;
    switch (error.name) {
      case 'NotAllowedError':
        this.gettingMicErrorText =
          'You did not give the browser access to your microphone when it asked for it. \
          In your browser options, you will need to manually give the website access to \
          your microphone. You may need to try refreshing your browser page after making changes ';
        break;
      case 'AbortError':
        this.gettingMicErrorText = 'Abort error';
        break;
      case 'NotFoundError':
        this.gettingMicErrorText = 'Not found error';
        break;
      case 'NotReadableError':
        this.gettingMicErrorText = 'Not readable error';
        break;
      case 'OverconstrainedError':
        this.gettingMicErrorText = 'Overconstrained error';
        break;
      case 'SecurityError':
        this.gettingMicErrorText = 'Security error';
        break;
      default:
        this.gettingMicErrorText = 'Unknown error';
        break;
    }
  }
}

declare var webkitAudioContext: any;

export class KalebRecorder {
  audioCtx: any;
  audioNode: any;
  recordedData = [];
  audioInput: any;
  stream: any;
  recording = false;
  constructor(bufferSize: number) {
    this.audioCtx = new (AudioContext || webkitAudioContext)();
    if (this.audioCtx.createJavaScriptNode) {
      this.audioNode = this.audioCtx.createJavaScriptNode(bufferSize, 1, 1);
    } else if (this.audioCtx.createScriptProcessor) {
      this.audioNode = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);
    } else {
      throw 'WebAudio not supported!';
    }
    this.audioNode.connect(this.audioCtx.destination);
  }

  start(): void {
    this.recordedData = [];
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(this.onMicrophoneGet)
      .catch(this.onMicrophoneError);
  }
  onMicrophoneGet(stream: any): void {
    this.stream = stream;
    this.audioInput = this.audioCtx.createMediaStreamSource(stream);
    this.audioInput.connect(this.audioNode);
    this.audioNode.onaudioprocess = this.onAudioProcess;
    this.recording = true;
  }
  onMicrophoneError(error: any): void {
    console.log(error);
    alert('Unable to access microphone');
  }
  onAudioProcess(event: any): void {
    if (!this.recording) {
      return;
    } else {
      this.recordedData.push(
        new Float32Array(event.inputBuffer.getChannelData[0])
      );
    }
  }
  stopRecording(): void {
    this.recording = false;
    this.stream.getTracks.forEach(track => {
      track.stop();
    });
    this.audioNode.disconnect();
    this.audioInput.disconnect();
  }
}
