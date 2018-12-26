import { Injectable } from '@angular/core';
import { RanComponent } from '../assessments-module/assessments/ran/ran.component';
import { LinkedList } from "../structures/LinkedList";
import { Assessment } from "../structures/assessment";

@Injectable({
  providedIn: 'root'
})
export class AssessmentsService {

  assessments : LinkedList<Assessment>;

  constructor(ranAssessment: RanComponent) {
    this.assessments = new LinkedList<Assessment>(
      ranAssessment
    )
   }

  public getNextAssessment() {
  }
}
