import { Component } from '@angular/core';
import { SelectionAssessment } from '../../../structures/SelectionAssessment';
import { StateManagerService } from '../../../services/state-manager.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import * as data from '../../../../assets/in_use/data/wordassociation/wordmappings.json';

@Component({
  selector: 'app-wordassociation',
  templateUrl: './wordassociation.component.html',
  styleUrls: ['./wordassociation.component.scss']
})
export class WordassociationComponent extends SelectionAssessment {
  assessmentName = 'wordassociation';
  wordAssociationsObject: Object = data['words'];
  wordAssociationPromptKeysList = Object.keys(data['words']);
  wordSackThisPrompt = this.wordAssociationsObject[this.promptNumber];
  promptsLength = this.wordAssociationPromptKeysList.length;
  showWords = false;
  spanNumber = 12;
  selectedWordsThisPrompt: string[];
  currentPromptMatrix: string[][];
  useSpecificStartWord: boolean = this.stateManager.appConfig['appConfig']['assessmentsConfig'][
    'wordassociation'
  ]['chooseStartWord'];
  startWord: string;
  showRunningChoices: boolean;
  constructor(
    stateManager: StateManagerService,
    dataService: AssessmentDataService
  ) {
    super(stateManager, dataService);
    this.configureAssessmentSettings();
    if (this.useSpecificStartWord) {
      this.startWord = this.stateManager.appConfig['appConfig']['assessmentsConfig'][
        'wordassociation'
      ]['startWord'];
    } else {
      this.startWord = Object.keys(this.wordSackThisPrompt)[0];
      // KRM: Always pick the first word out of the object if a specific one is not given in the
      // assessment config json
    }
    if (this.stateManager.appConfig['appConfig']['assessmentsConfig'][
      'wordassociation'
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
    const nextAssociationWord = this.selectedWordsThisPrompt.slice(-1)[0];
    const currentWordsForPrompt: string[] = Object.assign(
      [],
      this.wordAssociationsObject[this.promptNumber][nextAssociationWord]
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
    this.selectedWordsThisPrompt.push(word);
    this.spanNumber = Math.ceil(12 / this.selectedWordsThisPrompt.length);
    if (this.selectedWordsThisPrompt.length === 6) {
      // KRM: You get 5 selections per question
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
    this.wordSackThisPrompt = this.wordAssociationPromptKeysList[this.promptNumber];
    this.selectedWordsThisPrompt = [];
    this.selectedWordsThisPrompt.push(this.startWord);
    this.spanNumber = Math.ceil(12 / this.selectedWordsThisPrompt.length);
    this.makeMatrix();
  }
}
