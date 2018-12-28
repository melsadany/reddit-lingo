import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AssessmentDataService {
  http: HttpClient;

  constructor(private Http: HttpClient) {
    this.http = Http;
  }
}
