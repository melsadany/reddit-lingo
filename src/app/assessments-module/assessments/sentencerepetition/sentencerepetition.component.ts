import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { AudioRecordingService } from '../../../services/audio-recording.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioAssessment } from '../../../structures/AudioAssessment';
import { AssetsObject } from '../../../structures/assessmentdata';

@Component({
  selector: 'app-sentencerepetition',
  templateUrl: './sentencerepetition.component.html',
  styleUrls: ['./sentencerepetition.component.scss']
})
export class SentencerepetitionComponent extends AudioAssessment
  implements OnInit, OnDestroy, CanComponentDeactivate {
  assessmentName = 'sentencerepetition';
  promptNumber = 0;
  playingAudio = false;
  audioDurationMs: number;
  // audioFilesLocation =
  //   this.dataService.audioAssetsLocation + 'sentencerepetition/';
  promptStructure: {};
  promptsLength: number;

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService,
    public audioRecordingService: AudioRecordingService,
    public dialogService: DialogService
  ) {
    super(stateManager, audioRecordingService, dataService, dialogService);
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

  // calculateFilePaths(): void {
  //     this.filePathsToPlay =
  //       this.dataService.getFileNamesForCurrentAssessment(
  //         this.assessmentName,
  //         'audio'
  //     );
  //   }
  // }

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
    audio.onplaying = (ev: Event): any => (this.playingAudio = true);
    audio.ondurationchange = (en: Event): number =>
      (this.audioDurationMs = audio.duration * 1000 + 3000);
    return audio;
  }
}
