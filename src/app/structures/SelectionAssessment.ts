import { BaseAssessment } from './BaseAssessment';
import { StateManagerService } from '../services/state-manager.service';
import { DialogService } from '../services/dialog.service';
import { AssessmentDataService } from '../services/assessment-data.service';
import { OnInit, OnDestroy } from '@angular/core';

export class SelectionAssessment extends BaseAssessment
  implements OnInit, OnDestroy {
  private _selectionData = [];
  private _lastPrompt = false;
  private _promptsLength: number;
  private _promptNumber = 0;

  public get promptNumber(): number {
    return this._promptNumber;
  }
  public set promptNumber(value: number) {
    this._promptNumber = value;
  }
  public get selectionData(): Array<Object> {
    return this._selectionData;
  }
  public set selectionData(value: Array<Object>) {
    this._selectionData = value;
  }
  public get lastPrompt(): boolean {
    return this._lastPrompt;
  }
  public set lastPrompt(value: boolean) {
    this._lastPrompt = value;
  }
  public get promptsLength(): number {
    return this._promptsLength;
  }
  public set promptsLength(value: number) {
    this._promptsLength = value;
  }

  constructor(
    public stateManager: StateManagerService,
    public dialogService: DialogService,
    public dataService: AssessmentDataService
  ) {
    super(stateManager, dialogService);
  }

  ngOnInit(): void {
    // window.addEventListener('beforeunload', e => {
    //   const confirmationMessage = 'o/';
    //   console.log('cond');
    //   e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
    //   return confirmationMessage; // Gecko, WebKit, Chrome <34
    // });
    this.stateManager.sendToCurrentIfAlreadyCompleted(this.assessmentName);
    this.promptNumber = this.stateManager.assessments[this.assessmentName][
      'prompt_number'
    ];
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalCountdown);
  }

  sendImageSelectionAndAdvance(
    image: string,
    intermediateFunction: Function,
    advanceCallBack: Function
  ): void {
    this.selectionData.push({
      prompt_number: this.promptNumber,
      image_selected: image.split('/').slice(-1)[0]
    });
    this.pushSelectionData();
    this.promptNumber++;
    intermediateFunction();
    if (this.lastPrompt) {
      this.stateManager.showInnerAssessmentButton = true;
    } else {
      advanceCallBack();
    }
  }

  sendWordSelectionAndAdvance(
    words: string | string[],
    intermediateFunction: Function,
    advanceCallBack: Function
  ): void {
    this.selectionData.push({
      prompt_number: this.promptNumber,
      words_selected: words
    });
    this.pushSelectionData();
    this.promptNumber++;
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
    if (this.promptNumber === 0) {
      this.dataService
        .postAssessmentDataToFileSystem(assessmentData, assessmentGoogleData)
        .subscribe();
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
    if (this.promptNumber < this.promptsLength) {
      if (this.promptNumber + 1 === this.promptsLength) {
        this.lastPrompt = true;
        this.stateManager.textOnInnerAssessmentButton =
          'FINISH ASSESSMENT AND ADVANCE';
      }
      if (beforeAdvanceCall) {
        // KRM: This call must return a promise
        beforeAdvanceCall().then(() => {
          this.startDisplayedCountdownTimer(() => afterAdvanceCallBack());
        });
      } else {
        this.startDisplayedCountdownTimer(() => afterAdvanceCallBack());
      }
    } else {
      this.finishAssessment();
    }
  }

  selectSingleWordInPrompt(word: string, afterCallBack: Function): void {
    afterCallBack();
  }
}
