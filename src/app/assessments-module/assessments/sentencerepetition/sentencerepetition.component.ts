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
  showStartRecord=false;

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService,
    public audioRecordingService: AudioRecordingService
  ) {
    super(stateManager, audioRecordingService, dataService);
    this.configureAssessmentSettings();
    this.dataService
      .getAssets('audio', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.promptsLength = value.assetsLength;
        this.promptStructure = value.promptStructure;
      });
  }

  setStateAndStart(): void {
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advance();
  }

  advance(): void {
    this.advanceToNextPrompt(
      () => {
        console.log("show start recording button")
        
      this.showStartRecord = true;
      console.log(this.showStartRecord)
        /*this.startRecording(this.audioDurationMs, () =>
          this.stopRecording(
            () => (this.stateManager.showInnerAssessmentButton = true)
          )
        ),*/},
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
  startRecordingNow(): void {
    console.log("pushed start recording button")
    this.showStartRecord=false;
    console.log("isRecording= ",this.isRecording)
    console.log(this.audioDurationMs," (lenght in ms)")
    if (!this.isRecording) {
      //this.showWaveForm = false;
      //this.isRecording = true;
      //this.audioRecordingService.startRecording();

      this.startRecording(this.audioDurationMs, () =>
          this.stopRecording(
            () => (this.stateManager.showInnerAssessmentButton = true)
          )
        )
    }
  }
  stopRecordingNow(): void {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
      this.doneRecording = true;
      //this.showWaveForm = true;
      clearTimeout(this.intervalCountup);
    }
  }
  setupPrompt(): HTMLAudioElement {
    this.stateManager.showInnerAssessmentButton = false;
    const audio = new Audio();
    audio.src = this.promptStructure[this.promptNumber][0];
    audio.onplaying = (ev: Event): any => (this.playingAudio = true);
    audio.ondurationchange = (en: Event): number =>
      (this.audioDurationMs = audio.duration * 1000 + 3000);
    return audio;
  }
}
