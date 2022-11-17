import { Component, AfterViewInit, ViewChild, ElementRef  } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signdictionary',
  templateUrl: './signdictionary.component.html',
  styleUrls: ['./signdictionary.component.scss']
})
export class SDComponent implements AfterViewInit{
  httpClient: HttpClient;
  listOfVideos: string[][] = [];
  availableWords: string[] = [];
  letterGroups: string[][] = [[]];
  dontInclude = this.getDontInclude();
  alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

  constructor(http: HttpClient, private router: Router) {
    this.httpClient = http;
  }

  ngAfterViewInit(): void {
    // Get list of video links
    this.httpClient.get('./assets/videoLinks.txt', { responseType: 'text' })
      .subscribe(vidTextFile => this.getVidList(vidTextFile));
  }

  getVidList(textFile: string){
    // Creates a list of videos from the text file
    const lines = textFile.split('\n');
    for (let i = 0; i <= (lines.length)-3; i++){
      const b = lines[i].split(',');
      b[1] = b[1].replace("\r", "");
      this.listOfVideos.push(b);
      var possibles = b[1].split('_');
      for (let p in possibles){
        if (isNaN(Number(possibles[p]))){
          if(!this.dontInclude.includes(possibles[p])){
            this.availableWords.push(possibles[p].toUpperCase());
          }
        }
      }
    }
    this.availableWords = this.availableWords.sort();
    this.getLetterGroups();
  }

  gotoHome(){
    this.router.navigate(['/home']);  // define your component where you want to go
  }
  gotoAbout(){
    this.router.navigate(['/about']);  // define your component where you want to go
  }
  gotoAcknowledgments(){
    this.router.navigate(['/acknowledgments']);
  }

  getDontInclude(){
    const DI = ['I', 'airplane', 'clothing', 'daddy', 'gran', 'grandfather', 'granny', 'grandmother', 'grandpa', 'hey', 'mummy', 'thanks', 'translation', 'uni'];
    return DI;
  }

  getLetterGroups(){
    var count = 0;
    for (let a in this.availableWords){
      if (this.availableWords[a].charAt(0)!=this.letterGroups[count][0]){
        count +=1;
        this.letterGroups.push([])
      }
      this.letterGroups[count].push(this.availableWords[a]);
    }
    this.letterGroups.shift();
  }
}
