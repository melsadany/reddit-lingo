import { BaseAssessment } from './BaseAssessment';
import { StateManagerService } from '../services/state-manager.service';
import { AssessmentDataService } from '../services/assessment-data.service';
import { OnDestroy } from '@angular/core';
import { PairSelection } from '../assessments-module/assessments/wordassociationpair/wordassociationpair.component';

export class SelectionAssessment extends BaseAssessment implements OnDestroy {
  private _selectionData = [];
  private _timeToSelect = 0;

  public get timeToSelect(): number {
    return this._timeToSelect;
  }
  public set timeToSelect(value: number) {
    this._timeToSelect = value;
  }
  public get selectionData(): Array<Object> {
    return this._selectionData;
  }
  public set selectionData(value: Array<Object>) {
    this._selectionData = value;
  }

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService
  ) {
    super(stateManager, dataService);
  }

  ngOnDestroy(): void {
    if (!this.stateManager.finishedInstruction && !this.stateManager.audioInstructionPlayer.paused) {
      console.log('Audio pausing');
      this.stateManager.audioInstructionPlayer.pause();
    }
    clearInterval(this.intervalCountdown);
  }

  sendImageSelectionAndAdvance(
    image: string,
    intermediateFunction: Function,
    advanceCallBack: Function
  ): void {
    this.fixDataTitle()
    const pushObject = {
      prompt_number: this.promptNumber,
      image_selected: image.split('/').slice(-1)[0],
      wait_time: this.lastPromptWaitTime,
      dataGiven: this.dataTitle ? this.dataTitle : null
    };
    if (this.assessmentName === 'matrixreasoning' || this.assessmentName === 'listeningcomprehension') {
      pushObject['time_to_select'] = this.timeToSelect / 1000;
      this.timeToSelect = 0;
    }

    this.selectionData.push(pushObject);
    this.pushSelectionData();
    this.determineNextPromptNumber(this.promptNumber);
    intermediateFunction();
    if (this.lastPrompt) {
      this.stateManager.showInnerAssessmentButton = true;
    } else {
      advanceCallBack();
    }
  }

  sendWordSelectionAndAdvance(
    words: string | string[] | PairSelection[],
    intermediateFunction: Function,
    advanceCallBack: Function
  ): void {
    this.fixDataTitle()
    this.selectionData.push({
      prompt_number: this.promptNumber,
      words_selected: words,
      wait_time: this.lastPromptWaitTime,
      dataGiven: this.dataTitle ? this.dataTitle : null
    });
    this.pushSelectionData();
    this.determineNextPromptNumber(this.promptNumber);
    intermediateFunction();
    if (this.lastPrompt) {
      this.stateManager.showInnerAssessmentButton = true;
    } else {
      advanceCallBack();
    }
  }

  pushSelectionData(): void {
    const assessmentData = {
      assess_name: this.assessmentName,
      data: { selection_data: this.selectionData },
      completed: this.lastPrompt
    };
    const assessmentGoogleData = {
      assess_name: this.assessmentName,
      data: { text: 'None' }
    };
    if (this.firstPrompt) {
      this.dataService
        .postAssessmentDataToFileSystem(assessmentData, assessmentGoogleData)
        .subscribe();
        this.firstPrompt=false;
    } else {
      this.dataService
        .postSingleAudioDataToMongo(assessmentData, assessmentGoogleData)
        .subscribe();
    }
    this.selectionData = [];
  }

  advanceToNextPrompt(
    afterAdvanceCallBack: Function,
    beforeAdvanceCall?: Function
  ): void {
    let countdownFunction: Function;
    if (this.useCountdownNumber) {
      countdownFunction = (arg): void => this.startDisplayedCountdownTimer(arg);
    } else if (this.useCountdownBar) {
      countdownFunction = (arg): void => this.showProgressBar(arg);
    } else if (this.useCountdownCircle) {
      countdownFunction = (arg): void => this.showProgressCircle(arg);
    }
    if (this.promptsToDo.length>0) {
      if (this.promptsToDo.length==1 || this.finishEarly) {
        this.lastPrompt = true;
        this.stateManager.textOnInnerAssessmentButton =
          'FINISH ASSESSMENT AND ADVANCE';
      }
      if (this.stateManager.appConfig['appConfig']['assessmentsConfig'][this.assessmentName]['hideInstructionsOnAssessmentStart']) {
        this.stateManager.showStartParagraph = false;
      }
      if (beforeAdvanceCall) {
        // KRM: This call must return a promise
        beforeAdvanceCall().then(() => {
          countdownFunction(() => afterAdvanceCallBack());
        });
      } else {
        countdownFunction(() => afterAdvanceCallBack());
      }
    } else {
      this.finishAssessment();
    }
  }

  selectSingleWordInPrompt(word: string, afterCallBack: Function): void {
    afterCallBack();
  }
}
