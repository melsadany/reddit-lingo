import { Injectable } from '@angular/core';
import RecordRTC from '../dev/recordrtc';
import moment from 'moment';
import { Observable, Subject,BehaviorSubject } from 'rxjs';
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
  private _deviceId: string;

  public get deviceId(): string{
    return this._deviceId;
  }
  public set deviceId(value: string) {
    this._deviceId = value;
  }
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
  public muted: boolean;
  public active: boolean;
  public readyState: string;
  public enabled: boolean;
  public captures=0;
  public track:MediaStreamTrack;
  public blobSize;
  public openWindow =  new BehaviorSubject(false)
  public openNow=this.openWindow.asObservable()

  public enableTracks(){
    if(this.stream){
      this.stream.getAudioTracks().forEach(track => track.enabled=true)
    }
  }

  /**
   * Uses navigator.mediaDevices to capture the microphone from the user in browser
   */
  captureStream(): void {
    this.captures+=1;
    navigator.mediaDevices
      .getUserMedia(this.deviceId ? {audio : {deviceId: {exact: this.deviceId}}} : {audio: true})
      .then(s => {
        if (this.inMicrophoneError) {
          this.inMicrophoneError = false;
        }
        this.stream = s;
        this.deviceId = this.stream.getAudioTracks()[0].getSettings().deviceId;
        this.record();
      })
      .catch(error => {
        alert(error);
        this.handleMicError(error);
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
  public checkStatus() : string | boolean{

    try{
    this.active=this.stream.active
    this.muted=this.stream.getAudioTracks()[0] ? this.stream.getAudioTracks()[0].muted : null
    this.readyState=this.stream.getAudioTracks()[0] ? this.stream.getAudioTracks()[0].readyState: "null"
    this.enabled = this.stream.getAudioTracks()[0] ? this.stream.getAudioTracks()[0].enabled : null
    }catch {this.readyState="STREAM IS NULL"}
   
    if (this.stream){ 
      //console.log(this.active,this.muted,this.enabled)
      if (!this.active || this.muted || this.blobSize<45){
        this.openWindow.next(true)
        return "failed"
      }
      else {
        return false
      }
    }
    else return true
  }

  startRecording(newStream?): void {
    this._recordingTime.next('00:00');
    if (this.stream){ 
        if(newStream)this.captureStream()
        else {this.enableTracks();this.record()}
    }
    else this.captureStream()
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
      sampleRate: 48000,
      checkForInactiveTracks: true,
      bufferSize: 4096,
      numberOfAudioChannels: 1
    };
    this.setCurrentlyRecording(true);
    if(this.recorder){
      try{ this.recorder.destroy();}
      catch{console.log("Error: couldn't destroy recorder.")}
     
      this.recorder=null;
    }
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, config);
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

  /**
   * Stop recording the user's microphone
   */
  stopRecording(): void {
    if (this.recorder) {
      this.setCurrentlyRecording(false);
      this.recorder.stop(
        (blob: Blob) => {
          this.blobSize= blob.size
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
      //this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
    }
    if(this.stream){ 
      this.stream.getAudioTracks().forEach(track => track.enabled=false)
    }
    if(this.recorder){
      try{ this.recorder.destroy();}
      catch{console.log("Error: couldn't destroy recorder.")}
     
      this.recorder=null;
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
