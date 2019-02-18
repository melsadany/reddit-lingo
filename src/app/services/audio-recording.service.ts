import { Injectable, NgZone } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import * as MediaRecorder from 'audio-recorder-polyfill';

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
  private iOSRecorder;
  private interval: NodeJS.Timeout;
  private startTime: moment.MomentInput;
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();
  private _currentlyRecording = false;
  public mediaRecorder = MediaRecorder;

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
    if (this.recorder) {
      return;
    }

    this._recordingTime.next('00:00');
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        if (MediaRecorder.notSupported) {
          this.iOSRecorder = new MediaRecorder(stream);
          this.iOSRecorder.start();
          console.log('using iOS recorder');
        } else {
          console.log('using RTCRecorder');
          this.stream = stream;
          this.record();
          this.setCurrentlyRecording(true);
        }
      })
      .catch(error => {
        this._recordingFailed.next();
      });
  }

  abortRecording(): void {
    this.stopMedia();
  }

  private record(): void {
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/webm'
    });

    this.recorder.record();
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
      this.setCurrentlyRecording(false);
      this.recorder.stop(
        (blob: Blob) => {
          if (this.startTime) {
            const wavName = encodeURIComponent(
              'audio_' + new Date().getTime() + '.wav'
            );
            this.stopMedia();
            this._recorded.next({ blob: blob, user_id: wavName });
          }
        },
        () => {
          this.stopMedia();
          this._recordingFailed.next();
        }
      );
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
  }
}
