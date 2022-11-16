import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { SDComponent } from './signdictionary/signdictionary.component';
import { AcknowledgmentsComponent } from './acknowledgments/acknowledgments.component';

const routes: Routes = [
{ path: '', component:HomeComponent },
{ path: 'home', component:HomeComponent },  // you must add your component here
{ path: 'about', component:AboutComponent },
{ path: 'signdictionary', component:SDComponent },
{ path: 'acknowledgments', component:AcknowledgmentsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
