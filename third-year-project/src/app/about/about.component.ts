import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent{
  constructor(private router: Router) { }

  gotoHome(){
    this.router.navigate(['/home']);
  }
  gotoSD(){
    this.router.navigate(['/signdictionary']);
  }
  gotoAcknowledgments(){
    this.router.navigate(['/acknowledgments']);
  }
}
