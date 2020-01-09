import { Injectable } from '@angular/core';
import RecordRTC from '../dev/recordrtc/';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';

import { __core_private_testing_placeholder__ } from '@angular/core/testing';


export interface RecordedAudioOutput {
  blob: Blob;
  user_id: string;
}
export interface RecorderType {
  record: () => void;
  stop: (arg0: (blob: any) => void, arg1: () => void) => void;
  destroy: () => void;
}

@Injectable()
export class AudioRecordingService {
  private _stream: MediaStream;
  private _inMicrophoneError = false;
  private _recorder: RecorderType;
  private _startTime: moment.MomentInput;
  private _interval: NodeJS.Timeout;
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();
  private _currentlyRecording = false;
  private _gettingMicErrorText: string;
  private firstClick=false;
  public secondRecorder: RecorderType;
  public secondStream: MediaStream;
  usedFirstRecorder = false;
  deviceId;
  public get inMicrophoneError(): boolean {
    return this._inMicrophoneError;
  }
  public set recorder(value: RecorderType) {
    this._recorder = value;
  }
  public get recorder(): RecorderType {
    return this._recorder;
  }
  public set stream(value: MediaStream) {
    this._stream = value;
  }
  public set inMicrophoneError(value: boolean) {
    this._inMicrophoneError = value;
  }
  public get stream(): MediaStream {
    return this._stream;
  }
  public get interval(): NodeJS.Timeout {
    return this._interval;
  }
  public set interval(value: NodeJS.Timeout) {
    this._interval = value;
  }
  public get startTime(): moment.MomentInput {
    return this._startTime;
  }
  public set startTime(value: moment.MomentInput) {
    this._startTime = value;
  }
  public get gettingMicErrorText(): string {
    return this._gettingMicErrorText;
  }
  public set gettingMicErrorText(value: string) {
    this._gettingMicErrorText = value;
  }

  /**
   * Uses navigator.mediaDevices to capture the microphone from the user in browser
   */
  captureStream(): void {
    console.log('capturing stream - ',!this.stream)
    console.log("DEVICE ID= ", this.deviceId)
    //if(!this.stream){
      
      
      navigator.mediaDevices
        .getUserMedia(this.deviceId ? {audio : {deviceId: {exact: this.deviceId}}} : {audio: true})
        .then(s => {
          if (this.inMicrophoneError) {
            this.inMicrophoneError = false;
          }
          this.stream = s;
          this.deviceId = this.stream.getAudioTracks()[0].getSettings().deviceId;
          //this.secondStream = s.clone()
          this.firstClick=true;
          this.record();
          return;
          
        })
        .catch(error => {
          alert(error);
          this.handleMicError(error);
          this._recordingFailed.next();
          return;
        });
        return;
    //}
    console.log('recording')
    this.record();
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
    console.log("streams:")
    console.log(this.stream)
    console.log(this.secondStream) 
     this.captureStream()
     return
    if (this.recorder) {
      return;
    }  //else if (this.secondStream){this.record();}
      else //if (!this.stream)  {
      
   return;

   /* 
    } else {
      this.record();
    }  */
  }

  abortRecording(): void {
    this.setCurrentlyRecording(false);
    this.stopMedia();
  }

  /**
   * Starts the recording of the user's microphone
   */
  private record(): void {
    const config = {
      type: 'audio',
      mimeType: 'audio/webm',
      recorderType: 'StereoAudioRecorder',
      sampleRate: 44100,
      checkForInactiveTracks: true,
      bufferSize: 4096,
      numberOfAudioChannels: 2
    };
    console.log("in record function in audio-recording-service.ts")
    this.setCurrentlyRecording(true);
    if(this.recorder){
      this.recorder.destroy();
      this.recorder=null;
    }
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, config);
    if (this.secondRecorder){
      console.log("using second Recorder");
      this.secondRecorder.record();
    } else{
      console.log("using first recorder")
      this.recorder.record(); 
      //this.secondRecorder = new RecordRTC.StereoAudioRecorder(this.secondStream, config);
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

  /**
   * Stop recording the user's microphone
   */
  stopRecording(): void {
    console.log("STOP recording function in audio-recording service")
   /* var currentRecorder;
    if (this.usedFirstRecorder){console.log("stopping second recorder!!");
      currentRecorder=this.secondRecorder}
    else{console.log("stopping first recorder");currentRecorder=this.recorder;this.usedFirstRecorder=true;}
    */
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
            console.log("this._recorded: ");console.log(this._recorded.asObservable());
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
    console.log(this.recorder,"- this.recorder")
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
    }
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
