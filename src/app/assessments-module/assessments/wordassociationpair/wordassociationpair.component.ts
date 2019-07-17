import { Component } from '@angular/core';
import { SelectionAssessment } from '../../../structures/SelectionAssessment';
import { StateManagerService } from '../../../services/state-manager.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import * as data from '../../../../assets/in_use/data/wordassociationpair/wordmappings.json';

@Component({
  selector: 'app-wordassociationpair',
  templateUrl: './wordassociationpair.component.html',
  styleUrls: ['./wordassociationpair.component.scss']
})
export class WordassociationPairComponent extends SelectionAssessment {
  assessmentName = 'wordassociationpair';
  wordAssociationsPrompts: Object = data['words'];
  promptsLength = Object.keys(data['words']).length;
  showWords = false;
  spanNumber = 12;
  selectedPairingsThisPrompt: [{}];
  currentPromptMatrix: string[][];
  showRunningChoices = false;
  beginningStartWord: string;
  startWordsThisPrompt: {};
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
    if (this.stateManager.appConfig['appConfig']['assessmentsConfig'][
      'wordassociationpair'
    ]['showRunningChoices']) {
      this.showRunningChoices = true;
    }
    if (this.useSpecificStartWord) {
      this.startWord = this.stateManager.appConfig['appConfig']['assessmentsConfig'][
        'wordassociationpair'
      ]['startWord'];
    } else {
      this.beginningStartWord = Object.keys(this.startWordsThisPrompt)[0];
      // KRM: Always pick the first word out of the object for this prompt
      // if a specific one is not given in the assessment config json
    }
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.stateManager.showStartParagraph = false;
    this.showExample = false;
    this.advance();
  }

  getRandomIndex(): number {
    return Math.floor(Math.random() * Object.keys(this.startWordsThisPrompt).length);
  }

  // getStartWords(): string[] {
  //   const returnList = [];
  //   for (let i = 0; i < this.promptNumbers.length; i++) {
  //     // KRM: Determines number of prompts
  //     const index = this.getRandomIndex();
  //     returnList.push(this.wordSack[index]);
  //   }
  //   return returnList;
  // }

  makeMatrix(): void {
    this.currentPromptMatrix = [];
    const nextAssociationWord = this.selectedPairingsThisPrompt.slice(-1)[0];
    const currentWordsForPrompt: string[] = Object.assign(
      [],
      this.wordAssociationsPrompts[this.promptNumber][nextAssociationWord]
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
      start_word: this.beginningStartWord,
      paired_word: word
    });
    this.spanNumber = Math.ceil(12 / this.selectedWordsThisPrompt.length);
    if (this.selectedWordsThisPrompt.length === 6) {
      // KRM: You get 5 selections
      this.sendWordSelectionAndAdvance(
        this.selectedWordsThisPrompt,
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
      this.makeMatrix();
    }
  }

  handleNewPrompt(): void {
    this.startWordsThisPrompt = this.wordAssociationsPrompts[this.promptNumber];
    this.selectedPairingsThisPrompt = [0];
    this.selectedPairingsThisPrompt.push();
    this.spanNumber = Math.ceil(12 / this.selectedWordsThisPrompt.length);
    this.makeMatrix();
  }
}
