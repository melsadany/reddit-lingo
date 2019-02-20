import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';

import { AppComponent } from './app.component';
import { AdminModule } from './admin/admin.module';

import { AppRoutingModule } from './app-routing/app-routing.module';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { AssessmentsModule } from './assessments-module/assessments-controller.module';
import { AssessmentDataService } from './services/assessment-data.service';
import { DialogService } from './services/dialog.service';
import { StateManagerService } from './services/state-manager.service';
import { AudioRecordingService } from './services/audio-recording.service';
import { AssessmentsControllerComponent } from './assessments-module/assessments-controller.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    AuthModule,
    AdminModule,
    AssessmentsModule,
    AppRoutingModule,
  ],
  providers: [
    CookieService,
    AssessmentDataService,
    DialogService,
    StateManagerService,
    AudioRecordingService,
  ],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
