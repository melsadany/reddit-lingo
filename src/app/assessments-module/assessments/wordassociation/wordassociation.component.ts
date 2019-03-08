import { Component } from '@angular/core';
import { SelectionAssessment } from '../../../structures/SelectionAssessment';
import { StateManagerService } from '../../../services/state-manager.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-wordassociation',
  templateUrl: './wordassociation.component.html',
  styleUrls: ['./wordassociation.component.scss']
})
export class WordassociationComponent extends SelectionAssessment {
  constructor(
    stateManager: StateManagerService,
    dialogService: DialogService,
    dataService: AssessmentDataService
  ) {
    super(stateManager, dialogService, dataService);
    this.selectedWords = this.stateManager.assessments.wordassociation.selected_words;
  }

  assessmentName = 'wordassociation';
  showWords = false;
  selectedWords;
  startWords = [
    'hello',
    'barn',
    'car',
    'hawkeyes',
    'seven',
    'rainbow',
    'explosion'
  ];
  wordsSack = [
    'combative',
    'woebegone',
    'hilarious',
    'three',
    'annoying',
    'curl',
    'whisper',
    'gullible',
    'base',
    'taste',
    'man',
    'property',
    'playground',
    'birds',
    'tawdry',
    'crayon',
    'discovery',
    'release',
    'aromatic',
    'upbeat',
    'swim',
    'brown',
    'mist',
    'public'
  ];
  promptsLength = this.startWords.length;
  currentPromptWords = [];
  currentPromptMatrix = [];

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.selectedWords.push(this.startWords.pop());
    this.setupPrompt();
    this.advance();
  }

  getRandomIndex(): number {
    return Math.floor(Math.random() * this.wordsSack.length);
  }

  addUniqueRandomWordToPrompt(): void {
    let index = this.getRandomIndex();
    let word = this.wordsSack[index];
    while (this.currentPromptWords.includes(word)) {
      index = this.getRandomIndex();
      word = this.wordsSack[index];
    }
    this.currentPromptWords.push(word);
  }

  buildPrompt(): void {
    this.currentPromptWords = [];
    for (let i = 0; i < 9; i++) {
      this.addUniqueRandomWordToPrompt();
    }
  }

  makeMatrix(): void {
    this.currentPromptMatrix = [];
    for (let i = 0; i < 3; i++) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        row.push(this.currentPromptWords.pop());
      }
      this.currentPromptMatrix.push(row);
    }
  }

  setupPrompt(): void {
    this.buildPrompt();
    this.makeMatrix();
  }

  advance(): void {
    this.advanceToNextPrompt(() => (this.showWords = true));
  }

  clickWord(word: string): void {
    this.selectedWords.push(word);
    this.sendWordSelectionAndAdvance(
      this.selectedWords,
      () => (this.showWords = false),
      () => this.advanceToNextPrompt(() => (this.showWords = true))
    );
  }
}
