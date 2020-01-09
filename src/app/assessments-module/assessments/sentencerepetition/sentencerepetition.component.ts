import {
  Component,
  ViewChild,
  Input,
  ElementRef,
} from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { AudioRecordingService } from '../../../services/audio-recording.service';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioAssessment } from '../../../structures/AudioAssessment';
import { AssetsObject } from '../../../structures/AssessmentDataStructures';
import WaveSurfer from 'wavesurfer.js';
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
  wavesurfer: any;
  playing=false;
  progress =0;
  showWave=false;
  createWaveOnce=false;
  textOnTestAudioButton="play/pause"
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
  @ViewChild('wavesurfer') ws: ElementRef;
  @Input() waveColor = '#ff1e7f';
  @Input() progressColor = '#00F';
  @Input() cursorColor = '#CCC';
  setStateAndStart(): void {
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advance();
  }
  loadWave(dataBlob: any): void {
    this.createWaveOnce=true;
    console.log("loading wave")
    //this.stateManager.sendToCurrentIfAlreadyCompleted('diagnostics');
    this.stateManager.isInAssessment = true;
    requestAnimationFrame(() => {
     
        this.wavesurfer = WaveSurfer.create({
          container: this.ws.nativeElement,
          waveColor: this.waveColor,
          progressColor: this.progressColor,
          cursorColor: this.cursorColor,
          height: 128,
          autoCenter: true,
          hideScrollbar: true,
        });
        console.log(this.wavesurfer)
        console.log(dataBlob)
        this.wavesurfer.loadBlob(dataBlob.blob);
  
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
    this.showWave = true;
  }
  playPause(): void {
    if (this.wavesurfer && this.wavesurfer.isReady) {
      this.wavesurfer.playPause();
      if (!this.playingAudio) {
        this.playingAudio = true;
       // this.heardOnce = true;
      } else {
        this.playingAudio = false;
      }
    }
  } 
  advance(): void {
    this.advanceToNextPrompt(
      () =>
        this.startRecording(this.audioDurationMs, 
            () => {this.stateManager.showInnerAssessmentButton = true;
              ;this.audioRecordingService.getRecordedBlob().subscribe(data => {
                console.log("loading wave now")
                if(!this.createWaveOnce){this.loadWave(data);}});
                this.createWaveOnce=false;
            }
          
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
  startRecordingNow(): void {
    console.log("pushed start recording button")
    this.showStartRecord=false;
    console.log("isRecording= ",this.isRecording)
    console.log(this.audioDurationMs," (lenght in ms)")
    if (!this.isRecording) {
      //this.showWaveForm = false;
      //this.isRecording = true;
      //this.audioRecordingService.startRecording();

      this.startRecording(this.audioDurationMs, 
            () => {console.log("in stoprecording callback");(this.stateManager.showInnerAssessmentButton = true)
            ;this.audioRecordingService.getRecordedBlob().subscribe(data => {
          console.log("loading wave now")
          if(!this.createWaveOnce){this.loadWave(data);}
      });this.createWaveOnce=false;}
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
