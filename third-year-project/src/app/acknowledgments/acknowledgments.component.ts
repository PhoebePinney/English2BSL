import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acknowledgments',
  templateUrl: './acknowledgments.component.html',
  styleUrls: ['./acknowledgments.component.scss']
})
export class AcknowledgmentsComponent{
  constructor(private router: Router) { }

  gotoHome(){
    this.router.navigate(['/home']);  // define your component where you want to go
  }
  gotoAbout(){
    this.router.navigate(['/about']);
  }
  gotoSD(){
    this.router.navigate(['/signdictionary']);  // define your component where you want to go
  }
}
