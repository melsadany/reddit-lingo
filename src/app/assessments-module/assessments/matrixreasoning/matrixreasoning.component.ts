import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-matrixreasoning',
  templateUrl: './matrixreasoning.component.html',
  styleUrls: ['./matrixreasoning.component.scss']
})
export class MatrixreasoningComponent implements OnInit {
  imagesLocation = 'assets/img/matrixreasoning/';
  imageTypes = ['frameSets', 'solutionSets'];
  dimensions = {
    frameSets: {
      1: {
        height: 2,
        width: 2,
        images: 4
      },
      2: {
        height: 2,
        width: 2,
        images: 4
      },
      3: {
        height: 2,
        width: 2,
        images: 4
      },
      4: {
        height: 2,
        width: 2,
        images: 4
      },
      5: {
        height: 2,
        width: 2,
        images: 4
      },
      6: {
        height: 7,
        width: 1,
        images: 7
      }
      // 7: {
      //   height: 1,
      //   width: 1,
      //   images: 1
      // }
    },
    solutionSets: {
      1: {
        height: 4,
        width: 1,
        images: 4
      },
      2: {
        height: 4,
        width: 1,
        images: 4
      },
      3: {
        height: 4,
        width: 1,
        images: 4
      },
      4: {
        height: 4,
        width: 1,
        images: 4
      },
      5: {
        height: 4,
        width: 1,
        images: 4
      },
      6: {
        height: 4,
        width: 1,
        images: 4
      }
      // 7: {
      //   height: 4,
      //   width: 1,
      //   images: 4
      // },
    }
  };
  questionNumber = 1;
  imageMatrices = {
    frameSets: {},
    solutionSets: {}
  };

  constructor() {}

  ngOnInit(): void {
    this.calculateFrameSets();
    this.calculateSolutionSets();
    console.log(this.imageMatrices);
  }

  calculateImageNames(): void {
    this.calculateFrameSets();
    this.calculateSolutionSets();
  }

  calculateFrameSets(): void {
    for (let i = 1; i <= 6; i++) {
      // KRM: Question number
      let currentRow: string[] = [];
      let currentMatrix: string[][] = [];
      const questionWidth = this.dimensions['frameSets'][i]['width'];
      for (let j = 1; j <= this.dimensions['frameSets'][i]['images']; j++) {
        // KRM: Image number
        const currentImage = `${this.imagesLocation}${i}/frameSets/${j}q_q${i}`;
        if (currentRow.length < questionWidth) {
          currentRow.push(currentImage);
        } else {
          currentMatrix.push(currentRow);
          currentRow = [currentImage];
        }
      }
      currentMatrix.push(currentRow);
      currentRow = [];
      this.imageMatrices['frameSets'][i] = currentMatrix;
      currentMatrix = [];
    }
  }

  calculateSolutionSets(): void {
    for (let i = 1; i <= 6; i++) {
      // KRM: Question number
      let currentRow: string[] = [];
      let currentMatrix: string[][] = [];
      const questionWidth = this.dimensions['solutionSets'][i]['width'];
      for (let j = 1; j <= this.dimensions['solutionSets'][i]['images']; j++) {
        // KRM: Image number
        const currentImage = `${
          this.imagesLocation
        }${i}/solutionSets/${j}q_q${i}`;
        if (currentRow.length < questionWidth) {
          currentRow.push(currentImage);
        } else {
          currentMatrix.push(currentRow);
          currentRow = [currentImage];
        }
      }
      currentMatrix.push(currentRow);
      currentRow = [];
      this.imageMatrices['solutionSets'][i] = currentMatrix;
      currentMatrix = [];
    }
  }
}
