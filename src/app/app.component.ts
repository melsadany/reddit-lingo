import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateManagerService } from './services/state-manager.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private routerServie: Router) {}

  public ngOnInit(): void {
    this.routerServie.navigate(['']);
  }

  ngOnDestroy(): void {}
}
