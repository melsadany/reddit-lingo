import { Injectable, NgZone } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
declare var MediaRecorder: any;
export interface RecordedAudioOutput {
  blob: Blob;
  user_id: string;
}

@Injectable()
export class AudioRecordingService {
  private stream: MediaStream;
  private recorder: {
    record: () => void;
    stop: (arg0: (blob: any) => void, arg1: () => void) => void;
  };
  private interval: NodeJS.Timeout;
  private startTime: moment.MomentInput;
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();
  private _currentlyRecording = false;
  public debugError = false;
  private chunks;
  private mediaRecorder;
  private audioContext: AudioContext = new (window['AudioContext'] ||
    window['webkitAudioContext'])();
  private audioNode;
  private audioInput;

  constructor() {
    if (this.audioContext.createScriptProcessor) {
      this.audioNode = this.audioContext.createScriptProcessor(4096, 1, 1);
    } else {
      console.log('WebAudio not supported');
    }
    this.audioNode.connect(this.audioContext.destination);
    navigator.mediaDevices
      .getUserMedia({
        audio: true
      })
      .then(stream => (this.stream = stream))
      .catch(error => console.log(error));
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
    // if (this.recorder) {
    //   return;
    // }

    this._recordingTime.next('00:00');
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        this.stream = stream;
        this.record();
        this.setCurrentlyRecording(true);
      })
      .catch(error => {
        console.log(error);
        this.debugError = true;
        this._recordingFailed.next();
      });
  }

  abortRecording(): void {
    this.stopMedia();
  }

  private record(): void {
    // this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
    //   type: 'audio',
    //   mimeType: 'audio/webm'
    // });
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.start();
    console.log(this.mediaRecorder.state);
    this.mediaRecorder.ondataavailable = (e): any => this.chunks.push(e.data);

    // this.recorder.record();
    // this.startTime = moment();
    // this.interval = setInterval(() => {
    //   const currentTime = moment();
    //   const diffTime = moment.duration(currentTime.diff(this.startTime));
    //   const time =
    //     this.toString(diffTime.minutes()) +
    //     ':' +
    //     this.toString(diffTime.seconds());
    //   this._recordingTime.next(time);
    // }, 1000);
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
    // if (this.recorder) {
    //   this.setCurrentlyRecording(false);
    //   this.recorder.stop(
    //     (blob: Blob) => {
    //       if (this.startTime) {
    //         const wavName = encodeURIComponent(
    //           'audio_' + new Date().getTime() + '.wav'
    //         );
    //         this.stopMedia();
    //         this._recorded.next({ blob: blob, user_id: wavName });
    //       }
    //     },
    //     () => {
    //       this.stopMedia();
    //       this._recordingFailed.next();
    //     }
    //   );
    // }
    this.mediaRecorder.stop();
    console.log(this.mediaRecorder.state);
    console.log(this.chunks);
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
  }
}
