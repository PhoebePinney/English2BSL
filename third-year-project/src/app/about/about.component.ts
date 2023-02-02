import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./2about.component.scss']
})
export class AboutComponent{
  constructor(private router: Router) { }

  gotoHome(){
    this.router.navigate(['/home']);  // define your component where you want to go
  }
  gotoSD(){
    this.router.navigate(['/signdictionary']);  // define your component where you want to go
  }
  gotoAcknowledgments(){
    this.router.navigate(['/acknowledgments']);
  }
}
