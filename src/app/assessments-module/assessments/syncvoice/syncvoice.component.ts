import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { AudioRecordingService } from '../../../services/audio-recording.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioAssessment } from '../../../structures/AudioAssessment';

@Component({
  selector: 'app-syncvoice',
  templateUrl: './syncvoice.component.html',
  styleUrls: ['./syncvoice.component.scss']
})
export class SyncvoiceComponent extends AudioAssessment {
  assessmentName = 'syncvoice';
  playingAudio = false;
  lalaLocations = 'assets/in_use/audio/syncvoice/';
  audioNames = [
    '1_0_half.mp3',
    '1_1_fivequarters.mp3',
    '1_2_one.mp3',
    '1_3_threequarters.mp3'
  ];
  promptsLength = this.audioNames.length;

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService,
    public audioRecordingService: AudioRecordingService,
    public dialogService: DialogService
  ) {
    super(stateManager, audioRecordingService, dataService, dialogService);
    this.calculateAudioFilePaths();
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advance();
  }

  calculateAudioFilePaths(): void {
    for (let i = 0; i < this.audioNames.length; i++) {
      this.audioNames[i] = this.lalaLocations + this.audioNames[i];
    }
  }

  advance(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.advanceToNextPrompt(
      () => {
        this.startRecording(10000, () => {
          this.stateManager.showInnerAssessmentButton = true;
        });
      },
      () => {
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
    );
  }

  setupPrompt(): HTMLAudioElement {
    const audio = new Audio();
    audio.src = this.audioNames[this.promptNumber];
    audio.onplaying = (ev: Event): any => (this.playingAudio = true);
    return audio;
  }
}
