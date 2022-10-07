import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent{
  word: string[] = [];
  url = './assets/testVideo.mp4';
  constructor() { }
  onButton(word: string){
    this.word = word.split('');
    this.url = './assets/testVideo2.mp4'
    console.log('yo');
  }
}
