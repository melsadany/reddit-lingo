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
  wordAssociations: Object = data['words'];
  wordSack = Object.keys(data['words']);
  startWords = this.getStartWords();
  promptsLength = this.startWords.length;
  showWords = false;
  spanNumber = 12;
  selectedWordsThisPrompt: string[];
  currentPromptMatrix: string[][];
  constructor(
    stateManager: StateManagerService,
    dataService: AssessmentDataService
  ) {
    super(stateManager, dataService);
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.showExample = false;
    this.advance();
  }

  getRandomIndex(): number {
    return Math.floor(Math.random() * this.wordSack.length);
  }

  getStartWords(): string[] {
    const returnList = [];
    for (let i = 0; i < 5; i++) {
      // KRM: Determines prompt length
      const index = this.getRandomIndex();
      returnList.push(this.wordSack[index]);
    }
    return returnList;
  }

  makeMatrix(): void {
    this.currentPromptMatrix = [];
    const nextAssociationWord = this.selectedWordsThisPrompt.slice(-1)[0];
    const currentWordsForPrompt: string[] = Object.assign(
      [],
      this.wordAssociations[nextAssociationWord]
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
    // this.selectedWordsThisPrompt = [];
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
    console.log(this.spanNumber);
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
    this.selectedWordsThisPrompt = [];
    this.selectedWordsThisPrompt.push(this.startWords[this.promptNumber]);
    this.spanNumber = Math.ceil(12 / this.selectedWordsThisPrompt.length);
    this.makeMatrix();
  }
}
