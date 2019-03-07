import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import {
  AudioRecordingService,
} from '../../../services/audio-recording.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioAssessment } from '../../../structures/AudioAssessment';

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

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService,
    public audioRecordingService: AudioRecordingService,
    public dialogService: DialogService
  ) {
    super(stateManager, audioRecordingService, dataService, dialogService);
  }

  audioFilesLocation = 'assets/audio/sentencerepetition/';
  audioFileNumbersToPlay: string[] = [
    '1',
    '2',
    '8',
    '11',
    '15',
    '19',
    '23',
    '24',
    '25',
    '27'
  ];
  filePathsToPlay = [];
  promptsLength = this.audioFileNumbersToPlay.length;

  // ngOnInit(): void {
  //   this.stateManager.sendToCurrentIfAlreadyCompleted('sentencerepetition');
  //   this.promptNumber = this.stateManager.assessments['sentencerepetition'][
  //     'prompt_number'
  //   ];
  // }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.calculateFilePaths();
    this.advance();
  }

  calculateFilePaths(): void {
    for (const fileNumber of this.audioFileNumbersToPlay) {
      this.filePathsToPlay.push(`${this.audioFilesLocation}${fileNumber}.mp3`);
    }
  }

  advance(): void {
    this.advanceToNextPrompt(
      () =>
        this.startRecording(5000, () =>
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
    audio.src = this.filePathsToPlay[this.promptNumber];
    audio.onplaying = (ev: Event): any => (this.playingAudio = true);
    return audio;
  }
}
