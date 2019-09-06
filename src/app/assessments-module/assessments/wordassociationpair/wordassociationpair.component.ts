import { Component } from '@angular/core';
import { SelectionAssessment } from '../../../structures/SelectionAssessment';
import { StateManagerService } from '../../../services/state-manager.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import * as data from '../../../../assets/in_use/data/wordassociationpair/wordmappings.json';

export interface PairSelection {
  start_word: string;
  paired_word: string;
}
@Component({
  selector: 'app-wordassociationpair',
  templateUrl: './wordassociationpair.component.html',
  styleUrls: ['./wordassociationpair.component.scss']
})
export class WordassociationPairComponent extends SelectionAssessment {
  assessmentName = 'wordassociationpair';
  wordAssociationsPrompts: Object = data['words'];
  promptsLength = Object.keys(data['words']).length;
  pairingsLengthThisPrompt: number;
  showWords = false;
  selectedPairingsThisPrompt: PairSelection[];
  currentPromptMatrix: string[][];
  startWordsThisPrompt: string[];
  startWord: string;
  useSpecificStartWord: boolean = this.stateManager.appConfig['appConfig']['assessmentsConfig'][
    'wordassociationpair'
  ]['useSpecificStartWord'];
  constructor(
    stateManager: StateManagerService,
    dataService: AssessmentDataService
  ) {
    super(stateManager, dataService);
    this.configureAssessmentSettings();
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.stateManager.showStartParagraph = false;
    this.showExample = false;
    this.advance();
  }

  makeMatrix(): void {
    this.currentPromptMatrix = [];
    const currentWordsForPrompt: string[] = Object.assign(
      [],
      this.wordAssociationsPrompts[this.promptNumber][this.startWord]
    );
    for (let i = 0; i < 3; i++) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        row.push(currentWordsForPrompt.pop());
      }
      this.currentPromptMatrix.push(row);
    }
  }

  advance(): void {
    this.advanceToNextPrompt(
      () => (this.showWords = true),
      () => {
        return new Promise(
          (resolve, reject): void => {
            this.handleNewPrompt();
            resolve('done');
          }
        );
      }
    );
  }

  clickWord(word: string): void {
    this.selectedPairingsThisPrompt.push({
      start_word: this.startWord,
      paired_word: word
    });
    if (this.selectedPairingsThisPrompt.length === this.pairingsLengthThisPrompt) {
      this.sendWordSelectionAndAdvance(
        this.selectedPairingsThisPrompt,
        () => (this.showWords = false),
        () =>
          this.advanceToNextPrompt(
            () => (this.showWords = true),
            () => {
              return new Promise(
                (resolve, reject): void => {
                  this.handleNewPrompt();
                  resolve('done');
                }
              );
            }
          )
      );
    } else {
      this.setNextStartWord();
      this.makeMatrix();
    }
  }

  handleNewPrompt(): void {
    this.startWordsThisPrompt = Object.keys(this.wordAssociationsPrompts[this.promptNumber]);
    this.pairingsLengthThisPrompt = this.startWordsThisPrompt.length;
    this.selectedPairingsThisPrompt = [];
    if (this.useSpecificStartWord) {
      this.startWord = this.stateManager.appConfig['appConfig']['assessmentsConfig'][
        'wordassociationpair'
      ]['startWord'];
      const deleteIndex = this.startWordsThisPrompt.indexOf(this.startWord);
      this.startWordsThisPrompt.splice(deleteIndex, 1);
    } else {
      this.startWord = this.startWordsThisPrompt[0];
      this.startWordsThisPrompt.splice(0, 1);
      // KRM: Always pick the first word out of the object for this prompt
      // if a specific one is not given in the assessment config json
    } // this.selectedPairingsThisPrompt.push();
    this.makeMatrix();
  }

  setNextStartWord(): void {
    this.startWord = this.startWordsThisPrompt[0];
    this.startWordsThisPrompt.splice(0, 1);
  }
}
