import { Component, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '../translate.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit{
  availableWords: string[] = [];
  listOfWords: string[] = [];
  output: string[] = [];
  message = '';
  char = 0;
  listOfVideos: string[][] = [];
  playlist: string[] = [];
  i = 0;
  go = true;
  @ViewChild('box') box!: ElementRef;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('videoPlayer2') videoPlayer2!: ElementRef;
  @ViewChild('vidDiv') vidDiv!: ElementRef;
  @ViewChild('replayDiv') replayDiv!: ElementRef;
  httpClient: HttpClient;
  translate: TranslateService;

  constructor(http: HttpClient, translate: TranslateService) {
    this.httpClient = http;
    this.translate = translate;
  }

  ngAfterViewInit(): void {
    // Get list of video links
    this.httpClient.get('./assets/videoLinks.txt', { responseType: 'text' })
      .subscribe(vidTextFile => this.getVidList(vidTextFile));
    // Get list of available words
    this.httpClient.get('./assets/availableWords.txt', { responseType: 'text' })
      .subscribe(wordsTextFile => this.getAvailableWords(wordsTextFile));
  }

  getVidList(textFile: string){
    // Creates a list of videos from the text file
    const lines = textFile.split('\n');
    for (let i = 0; i <= (lines.length)-3; i++){
      const b = lines[i].split(',');
      b[1] = b[1].replace("\r", "");
      this.listOfVideos.push(b);
    }
  }

  getAvailableWords(textFile: string){
    // Creates a list of available words from the text file
    let lines = textFile.split('\n');
    for (const l in lines){
      lines[l] = lines[l].replace('\r','');
    }
    const pop = lines.pop();
    for (const l in lines){
      this.availableWords.push(lines[l]);
    }
  }

  updateChar(){
    var inputValue = this.box.nativeElement.value;
    this.char = inputValue.length;
  }

  onButton(userInput: string){
    // When button pressed
    this.replayDiv.nativeElement.classList.add("beNone");
    this.output = []; // List of words to be output
    this.playlist = []; // List of videos to be shown
    this.message = ' ';
    this.i = 0;

    // Check if input is valid
    userInput = userInput.replace("'", '');
    const checkInput = new RegExp(/[^a-zA-Z0-9\s\.]/);
    if (!checkInput.test(userInput)){
      this.listOfWords = userInput.split(' '); // List of words the user entered
      var filtered = this.listOfWords.filter(function(value, index, arr){ return value != "";}); // remove blank tokens
      if (filtered.length ==0){ // if no words input
        this.message = 'Please input a word or phase';
        return;
      }
      this.output = this.translate.in(filtered, this.availableWords) // return translated list of words

      for (const word in this.output){
        for (const link in this.listOfVideos){
          const possible = this.listOfVideos[link][1].split('_'); // all words for that video link
          for (const p in possible){
            if (this.output[word]===possible[p]){
              this.playlist.push(this.listOfVideos[link][0]); // push link to playlist
            }
          }
        }
      }
      // Show video div and play first vid in playlist
      // this.vidDiv.nativeElement.setAttribute("style", "display:block;")
      this.playVid();

    } else{
      this.message = 'Invalid input';
      this.output = [];
    }
  }

  playVid() {
    this.i = 0;
    this.videoPlayer.nativeElement.classList.remove("beNone");
    this.videoPlayer2.nativeElement.classList.add("beNone");
    this.videoPlayer.nativeElement.setAttribute("src", this.playlist[this.i]);
    this.videoPlayer2.nativeElement.setAttribute("src", this.playlist[this.i+1]);
    this.videoPlayer.nativeElement.load();
    this.videoPlayer2.nativeElement.load();
    this.videoPlayer.nativeElement.play();
  }

  endOfVid(): void{
    // Once video ended
    this.i ++;
    if(this.i + 1 > this.playlist.length){
      this.replayDiv.nativeElement.classList.remove("beNone");
      return
    }
    const inRange = this.i + 1 < this.playlist.length
    this.videoPlayer2.nativeElement.classList.toggle("beNone");
    this.videoPlayer.nativeElement.classList.toggle("beNone");
    if (this.i % 2 != 0){
      this.videoPlayer2.nativeElement.play();
      inRange && this.videoPlayer.nativeElement.setAttribute("src", this.playlist[this.i+1]);
      inRange && this.videoPlayer.nativeElement.load();
    }
    else{
      this.videoPlayer.nativeElement.play();
      inRange && this.videoPlayer2.nativeElement.setAttribute("src", this.playlist[this.i+1]);
      inRange && this.videoPlayer2.nativeElement.load();
    }
  }

  // Hello my name is Phoebe
  // Welcome to my BSL translation app
  // I hope you like it!
}
