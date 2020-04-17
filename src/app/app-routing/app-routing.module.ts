import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
//import { AboutComponent } from '../about/about.component';
//import { ContactComponent } from '../contact/contact.component';
import { HashkeyinitializeComponent } from '../hashkeyinitialize/hashkeyinitialize.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  /*{
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },*/
  {
    path: ':hashKey',
    component: HashkeyinitializeComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [],
  declarations: []
})
export class AppRoutingModule { }
