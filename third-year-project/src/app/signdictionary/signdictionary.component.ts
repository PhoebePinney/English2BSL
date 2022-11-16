import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signdictionary',
  templateUrl: './signdictionary.component.html',
  styleUrls: ['./signdictionary.component.scss']
})
export class SDComponent{
  constructor(private router: Router) { }

  gotoHome(){
    this.router.navigate(['/home']);  // define your component where you want to go
  }
  gotoAbout(){
    this.router.navigate(['/about']);  // define your component where you want to go
  }
  gotoAcknowledgments(){
    this.router.navigate(['/acknowledgments']);
  }
}
