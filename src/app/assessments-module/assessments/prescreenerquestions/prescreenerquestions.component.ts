import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-prescreenerquestions',
  templateUrl: './prescreenerquestions.component.html',
  styleUrls: ['./prescreenerquestions.component.scss']
})
export class PrescreenerquestionsComponent implements OnInit {
  genderOptions = ['Prefer not to say', 'Male', 'Female', 'Other'];
  gender;
  ethnicityOptions = [
    'Prefer not to say',
    'American Indian/Alaska Native',
    'Asian',
    'Hispanic/Latino',
    'Native Hawaiian/Other Pacific Islander',
    'White'
  ];
  ethnicity;
  educationOptions = [
    'Did not graduate High School',
    'High School diploma or equivalent',
    'Some college',
    '2 year college degree',
    '4 year college degree',
    'Graduate college',
    'Post graducate'
  ];
  english = 'Is english your first language?';
  musicAbilityOptions = [
    'I have never had any formal training in any kind of music',
    'I have some musical traning but don\'t routinely play or sing',
    'I can play an instrument, or have formal training in singing',
    'I play or sing professionally / I study music as a major / I teach music'
  ];

  constructor() {}

  ngOnInit(): void {}
}
