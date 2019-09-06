import { Component } from '@angular/core';
import { SelectionAssessment } from '../../../structures/SelectionAssessment';
import { StateManagerService } from '../../../services/state-manager.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import * as data from '../../../../assets/in_use/data/wordassociationpath/wordmappings.json';

@Component({
  selector: 'app-wordassociationpath',
  templateUrl: './wordassociationpath.component.html',
  styleUrls: ['./wordassociationpath.component.scss']
})
export class WordassociationPathComponent extends SelectionAssessment {
  assessmentName = 'wordassociationpath';
 
  wordAssociationsObject: Object = data['words'];
  wordAssociationPromptKeysList = Object.keys(data['words']);
  wordSackThisPrompt = this.wordAssociationsObject[this.promptNumber];
  promptsLength = this.wordAssociationPromptKeysList.length;
  showWords = false;
  spanNumber = 12;
  wordCount=0;
  wordGraphList: [];
  selectedWordsThisPrompt: string[];
  currentPromptMatrix: string[][];
  useSpecificStartWord: boolean = this.stateManager.appConfig['appConfig']['assessmentsConfig'][
    'wordassociationpath'
  ]['useSpecificStartWord'];
  startWord: string;
  showRunningChoices = false;
  constructor(
    stateManager: StateManagerService,
    dataService: AssessmentDataService
  ) {
    super(stateManager, dataService);
    this.configureAssessmentSettings();
    if (this.useSpecificStartWord) {
      this.startWord = this.stateManager.appConfig['appConfig']['assessmentsConfig'][
        'wordassociationpath'
      ]['startWord'];
    } else {
      this.startWord = Object.keys(this.wordSackThisPrompt)[0];
      // KRM: Always pick the first word out of the object for this prompt
      // if a specific one is not given in the assessment config json
    }
    if (this.stateManager.appConfig['appConfig']['assessmentsConfig'][
      'wordassociationpath'
    ]['showRunningChoices']) {
      this.showRunningChoices = true;
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
    return Math.floor(Math.random() * Object.keys(this.wordSackThisPrompt).length);
  }

  makeMatrix(): void {
    this.currentPromptMatrix = [];
    const currentWordsForPrompt: string[] = Object.assign(
      [],
      this.wordGraphList
    );
    for (let i = 0; i < 3; i++) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        const nextElement = currentWordsForPrompt.pop();
        if (nextElement !== undefined) {
          row.push(nextElement);
        }
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
    this.selectedWordsThisPrompt.push(word);
    console.log(this.selectedWordsThisPrompt);
    this.spanNumber = Math.ceil(12 / this.selectedWordsThisPrompt.length);
    
    if (this.selectedWordsThisPrompt.length === this.wordCount) {
      // KRM: You get 9 selections per question.
      // The first element of the array is always the start word.
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
      const deleteIndex = this.wordGraphList.indexOf(<never>word, 0);
      this.wordGraphList.splice(deleteIndex, 1);
      this.makeMatrix();
    }
  }

  handleNewPrompt(): void {
    this.wordSackThisPrompt = this.wordAssociationsObject[this.promptNumber];
    this.startWord = Object.keys(this.wordSackThisPrompt)[0];
    this.wordCount= Object.keys(this.wordSackThisPrompt).length;
    this.selectedWordsThisPrompt = [];
    this.selectedWordsThisPrompt.push(this.startWord);
    this.wordGraphList = this.wordAssociationsObject[this.promptNumber][this.startWord];
    this.spanNumber = Math.ceil(12 / this.selectedWordsThisPrompt.length);
    this.makeMatrix();
  }
}
