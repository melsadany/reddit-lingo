import { Component } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { AudioRecordingService } from '../../../services/audio-recording.service';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioAssessment } from '../../../structures/AudioAssessment';
import { AssetsObject } from '../../../structures/AssessmentDataStructures';

@Component({
  selector: 'app-sentencerepetition',
  templateUrl: './sentencerepetition.component.html',
  styleUrls: ['./sentencerepetition.component.scss']
})
export class SentencerepetitionComponent extends AudioAssessment {
  assessmentName = 'sentencerepetition';
  promptNumber = 0;
  playingAudio = false;
  audioDurationMs: number;
  promptStructure: {};

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService,
    public audioRecordingService: AudioRecordingService
  ) {
    super(stateManager, audioRecordingService, dataService);
    this.configureAssessmentSettings();
    this.waitToDeterminePromptsToDo=true;
    this.dataService
      .getAssets('audio', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.promptsLength = value.assetsLength;
        this.promptStructure = value.promptStructure;
        this.determinePromptsToDo();
      });
  }

  setStateAndStart(): void {
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advance();
  }
  public muted;
  public enabled;
  public readyState
  checkTrack(){
    this.muted =this.audioRecordingService.track.muted
    this.enabled = this.audioRecordingService.track.enabled
    this.readyState= this.audioRecordingService.track.readyState
  }
  mute(){
    this.audioRecordingService.muteTrack(false)
  }
  enable(){
    this.audioRecordingService.muteTrack(true)
  }
  check(){
    this.audioRecordingService.checkStatus()
  }
  stop(){
    this.audioRecordingService.stopTrack()
  }
  stopCurrentTrack(){
    this.audioRecordingService.stopCurrentTrack()
  }
  advance(): void {
    this.advanceToNextPrompt(
      () =>
        this.startRecording(this.audioDurationMs, () =>
          this.stopRecording(
            () => (this.stateManager.showInnerAssessmentButton = true)
          )
        ),
      () => this.startAudioForSet()
    );
  }

  startAudioForSet(): Promise<string> {
    const audio = this.setupPrompt();
    audio.play();
    return new Promise(
      (resolve, reject): void => {
        audio.addEventListener('ended', () => {
          this.playingAudio = false;
          resolve('done');
        });
      }
    );
  }

  setupPrompt(): HTMLAudioElement {
    this.stateManager.showInnerAssessmentButton = false;
    const audio = new Audio();
    audio.src = this.promptStructure[this.promptNumber][0];
    this.dataTitle=this.promptStructure[this.promptNumber][0];
    audio.onplaying = (ev: Event): any => (this.playingAudio = true);
    audio.ondurationchange = (en: Event): number =>
      (this.audioDurationMs = audio.duration * 1000 + 3000);
    return audio;
  }
}