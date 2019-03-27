import { Component, OnInit, OnDestroy } from '@angular/core';
// import { StateManagerService } from './services/state-manager.service';
// import { ActivatedRoute } from '@angular/router';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor() {}

  public ngOnInit(): void {
    if (navigator.userAgent.match('CriOS')) {
      alert('On chrome on IOS');
    }
  }

  ngOnDestroy(): void {}
}
