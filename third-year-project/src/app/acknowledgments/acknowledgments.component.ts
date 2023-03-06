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
    this.router.navigate(['/home']);
  }
  gotoAbout(){
    this.router.navigate(['/about']);
  }
  gotoSD(){
    this.router.navigate(['/signdictionary']);
  }
}
