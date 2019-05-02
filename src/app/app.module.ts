import {
  BrowserModule,
  HammerGestureConfig,
  HAMMER_GESTURE_CONFIG
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing/app-routing.module';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { AssessmentsModule } from './assessments-module/assessments-controller.module';
import { AssessmentDataService } from './services/assessment-data.service';
import { StateManagerService } from './services/state-manager.service';
import { AudioRecordingService } from './services/audio-recording.service';
import { HashkeyinitializeComponent } from './hashkeyinitialize/hashkeyinitialize.component';

export class HammerJSConfig extends HammerGestureConfig {
  overrides = <any>{
    // Set override settings for hammerjs configuration
    press: { time: 3 } // In MS
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    HashkeyinitializeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    AssessmentsModule,
    AppRoutingModule
  ],
  providers: [
    CookieService,
    AssessmentDataService,
    StateManagerService,
    AudioRecordingService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerJSConfig
    }
  ],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
