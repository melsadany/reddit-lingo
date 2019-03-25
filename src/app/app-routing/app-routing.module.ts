import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { HomeComponent } from '../home/home.component';
import { AboutComponent } from '../about/about.component';
import { ContactComponent } from '../contact/contact.component';
import { HashkeyinitializeComponent } from '../hashkeyinitialize/hashkeyinitialize.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: ':hashKey',
    component: HashkeyinitializeComponent
  },
  // {
  //   path: 'home',
  //   redirectTo: 'home/',
  //   pathMatch: 'full'
  // },
  // {
  //   path: '',
  //   redirectTo: 'home/:hashkey',
  //   pathMatch: 'full'
  // },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
  declarations: []
})
export class AppRoutingModule {}
