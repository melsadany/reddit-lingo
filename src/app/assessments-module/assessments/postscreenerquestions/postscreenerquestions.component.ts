import { Component, OnInit } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-prescreenerquestions',
  templateUrl: './prescreenerquestions.component.html',
  styleUrls: ['./prescreenerquestions.component.scss']
})
export class PostscreenerquestionsComponent implements OnInit {
  dataForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    cityOfBirth: ['', Validators.required],
    stateOfBirth: ['', Validators.required],
    iaSchoolOption: ['', Validators.required]
  });

  iaSchoolOption = [
    'Elementary school (all or partial)',
    'Middle school/Jr. High (all or partial)',
    'High school(all or partial)'
  ];

  constructor(
    private dataService: AssessmentDataService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {}
  postData(): void {
    const data = {
      name: this.dataForm.get('name').value,
      email: this.dataForm.get('email').value,
      cityOfBirth: this.dataForm.get('cityOfBirth').value,
      stateOfBirth: this.dataForm.get('stateOfBirth').value,
      iaSchoolOption: this.dataForm.get('iaSchoolOption').value,
    };
    this.dataService
      .postAssessmentDataToMongo(
        {
          assess_name: 'postscreenerquestions',
          data: { prescreenerQuestions: data },
          completed: true
        },
        {
          assess_name: 'postscreenerquestions',
          data: {
            text: 'None'
          }
        }
      )
      .subscribe(); // KRM: Do this for every assessment
    this.dataService.setIsInAssessment(false);
    this.dataService.setCookie('postscreenerquestions', 'completed', 200);
    this.dataService.nextAssessment();
  }
}
