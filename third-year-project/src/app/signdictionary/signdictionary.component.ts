import { Component, AfterViewInit, ViewChild, ElementRef  } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ModalComponent } from '../modal/modal.component';

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
  @ViewChild('modal', { static: false })
  modal: ModalComponent = new ModalComponent;

  constructor(http: HttpClient, private router: Router) {
    this.httpClient = http;
  }

  openModal(word: string) {
    // Show individual sign in modal
    var videoLink = '';
    for (const link in this.listOfVideos){
      const possible = this.listOfVideos[link][1].split('_');
      for (const p in possible){
        if (word.toLowerCase()===possible[p]){
          videoLink = this.listOfVideos[link][0];
        }
      }
    }
    this.modal.open(videoLink, word);
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
    this.router.navigate(['/home']);
  }
  gotoAbout(){
    this.router.navigate(['/about']);
  }
  gotoAcknowledgments(){
    this.router.navigate(['/acknowledgments']);
  }

  getDontInclude(){
    // These are 'duplicate words' that need not be displayed
    const DI = ['mum','dontlike', 'I', 'airplane', 'clothing', 'daddy', 'gran', 'grandfather', 'granny', 'grandmother', 'grandpa', 'hey', 'mummy', 'thanks', 'translation', 'uni', 'ago'];
    return DI;
  }

  getLetterGroups(){
    // Groups of words for each letter of the alphabet
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
