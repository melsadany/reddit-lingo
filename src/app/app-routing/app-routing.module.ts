import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth-guard.service";
import { HomeComponent } from "../home/home.component";
import { AboutComponent } from "../about/about.component";
import { ContactComponent } from "../contact/contact.component";

const routes: Routes = [
  {
    path: "home",
    redirectTo: 'home/',
    pathMatch: 'full'
  },
  {
    path: "home/:bool",
    component: HomeComponent
  },
  {
    path:"",
    redirectTo: "home/",
    pathMatch: 'full'
  },
  // {
  //   path: "auth",
  //   loadChildren: "app/auth/auth.module#AuthModule"
  // },
  // {
  //   path: "admin",
  //   loadChildren: "app/admin/admin.module#AdminModule"
  // },
  {
    path: "about",
    component: AboutComponent
  },
  {
    path: "contact",
    component: ContactComponent
  },
  {
    path: "**",
    redirectTo: "home/"
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
  declarations: []
})
export class AppRoutingModule {}
