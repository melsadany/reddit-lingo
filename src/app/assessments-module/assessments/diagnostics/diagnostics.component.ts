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

import WaveSurfer from 'wavesurfer.js';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { HashKeyAssessmentData, AssessmentData } from '../../../structures/AssessmentDataStructures';
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
    public audioRecordingService: AudioRecordingService
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
  private _isRecording: boolean;
  private _recordedTime: string;
  // private _audio: HTMLAudioElement;
  private _testedAudio = false;
  private _testedMic = false;
  private _playingAudio = false;
  private _heardOnce = false;
  private _wavesurfer: any;
  private _textOnTestAudioButton = 'Listen to the audio track';
  private _progress = 0;
  private _playing = false;
  private _cantHear = false;
  private _intervalCountup: NodeJS.Timeout;
  private _showWaveForm = false;
  private _cantHearMic = false;
  private _hasRecordedTest = false;
  private _date= new Date();
  @ViewChild('wavesurfer') ws: ElementRef;
  @Input() waveColor = '#ff1e7f';
  @Input() progressColor = '#00F';
  @Input() cursorColor = '#CCC';

  public get date(): Date{
    return this._date
  }
  public get isRecording(): boolean {
    return this._isRecording;
  }
  public set isRecording(value: boolean) {
    this._isRecording = value;
  }
  public get recordedTime(): string {
    return this._recordedTime;
  }
  public set recordedTime(value: string) {
    this._recordedTime = value;
  }
  // public get audio(): HTMLAudioElement {
  //   return this._audio;
  // }
  // public set audio(value: HTMLAudioElement) {
  //   this._audio = value;
  // }
  public get testedAudio(): boolean {
    return this._testedAudio;
  }
  public set testedAudio(value: boolean) {
    this._testedAudio = value;
  }
  public get testedMic(): boolean {
    return this._testedMic;
  }
  public set testedMic(value: boolean) {
    this._testedMic = value;
  }
  public get playingAudio(): boolean {
    return this._playingAudio;
  }
  public set playingAudio(value: boolean) {
    this._playingAudio = value;
  }
  public get heardOnce(): boolean {
    return this._heardOnce;
  }
  public set heardOnce(value: boolean) {
    this._heardOnce = value;
  }
  public get wavesurfer(): any {
    return this._wavesurfer;
  }
  public set wavesurfer(value: any) {
    this._wavesurfer = value;
  }
  public get textOnTestAudioButton(): string {
    return this._textOnTestAudioButton;
  }
  public set textOnTestAudioButton(value: string) {
    this._textOnTestAudioButton = value;
  }
  public get progress(): number {
    return this._progress;
  }
  public set progress(value: number) {
    this._progress = value;
  }
  public get playing(): boolean {
    return this._playing;
  }
  public set playing(value: boolean) {
    this._playing = value;
  }
  public get cantHear(): boolean {
    return this._cantHear;
  }
  public set cantHear(value: boolean) {
    this._cantHear = value;
  }
  public get intervalCountup(): NodeJS.Timeout {
    return this._intervalCountup;
  }
  public set intervalCountup(value: NodeJS.Timeout) {
    this._intervalCountup = value;
  }
  public get showWaveForm(): boolean {
    return this._showWaveForm;
  }
  public set showWaveForm(value: boolean) {
    this._showWaveForm = value;
  }
  public get cantHearMic(): boolean {
    return this._cantHearMic;
  }
  public set cantHearMic(value: boolean) {
    this._cantHearMic = value;
  }
  public get hasRecordedTest(): boolean {
    return this._hasRecordedTest;
  }
  public set hasRecordedTest(value: boolean) {
    this._hasRecordedTest = value;
  }

  ngOnInit(dataBlob?: any): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted('diagnostics');
    this.stateManager.isInAssessment = true;
    requestAnimationFrame(() => {
      if (!this.testedAudio) {
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
      } else {
        this.wavesurfer = WaveSurfer.create({
          container: this.ws.nativeElement,
          waveColor: this.waveColor,
          progressColor: this.progressColor,
          cursorColor: this.cursorColor,
          height: 128,
          autoCenter: true,
          hideScrollbar: true
        });
      }

      if (!this.testedAudio) {
        this.wavesurfer.load(
          '/assets/in_use/audio/diagnostics/setup_audio.mp3'
        );
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
        this.wavesurfer.seekTo(0);
        this.progress = 0;
        this.wavesurfer.playPause();
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
    this.doneRecording = false;
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

  //this creates the files in the directory of the server since this assessment is finished
  didRecordCorrectly(): void {
    const startTime =this.dataService.returnTime(this.date)
   
    console.log(startTime)

    if (this.playingAudio) {
      this.playPause();
    }
    if(this.stateManager.hasDoneDiagnostics){
      this.stateManager.finishThisAssessmentAndAdvance('diagnostics');
      return;
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
    //create file now we know they've done something (diagnostics)
  
      let hash_key = this.dataService.getHashKeyCookie()
      let user_id = this.dataService.getUserIdCookie()
      if (hash_key && user_id){
        this.dataService
        .sendHashKeyToServer(hash_key,user_id,startTime)
        .subscribe((data: HashKeyAssessmentData) => { 
      
          this.dataService
          .postAssessmentDataToFileSystem(assessmentData, assessmentGoogleData,true).subscribe(newdata => {  
          if (this.stateManager.isSingleAssessment) {
            this.stateManager.initializeSingleAssessmentState(<AssessmentData> newdata);
          } else {
            const initializeData: unknown = newdata;
            this.stateManager.initializeState(<AssessmentData>initializeData);
          } 
            this.stateManager.finishThisAssessmentAndAdvance('diagnostics');});
          // KRM: The big difference between SingleAssessmentData and AssessmentData is the user_id vs the hask_key fields.
          // The methods initializeState and initializeSingleAssessmentState don't actually utilize those fields with their
          // respective types, so they could essentially be the same type if not for the differently named field, which is pretty
          // important elsewhere. Therefore I just cast the data object accordingly to pass it in the regular intializeState method
          // when we want hash_key users to take the full assessments.
        });
      }
      else {
        
        this.dataService.getUserAssessmentDataFromFileSystem(user_id,startTime).subscribe(() => {
          this.dataService
          .postAssessmentDataToFileSystem(assessmentData, assessmentGoogleData,true).subscribe(  newdata => {
            this.stateManager.initializeState(<AssessmentData> newdata);
            this.stateManager.finishThisAssessmentAndAdvance('diagnostics');});
          
          
        })
        }
       
  }
}
