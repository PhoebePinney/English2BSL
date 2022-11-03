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
  @ViewChild('box') box!: ElementRef;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('vidDiv') vidDiv!: ElementRef;
  httpClient: HttpClient;
  translate: TranslateService;

  constructor(private renderer: Renderer2, http: HttpClient, translate: TranslateService) {
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

  wordLimit(){
    var j = this.box.nativeElement.value;
    var words = j.split(/\s+/);
    var limit = 3;
    // var numWords = words.length;
    // if(numWords > maxWords){
    //    j.preventDefault();
    // }
    var legal = "";
    for(let i = 0; i < words.length; i++) {
        if(i < limit) {
            legal += words[i] + " ";
        }
        if(i >= limit) {
          this.box.nativeElement.value = legal.trim();
        }
    }
  }

  onButton(userInput: string){
    // When button pressed
    this.output = []; // List of words to be output
    this.playlist = []; // List of videos to be shown
    this.message = '';
    this.i = 0;

    // Check if input is valid
    const checkInput = new RegExp(/[^a-zA-Z0-9\s\.]/);
    if (!checkInput.test(userInput)){
      if (userInput === ''){
        this.message = 'Please input a word or phase';
        return;
      }

      this.listOfWords = userInput.split(' '); // List of words the user entered
      this.output = this.translate.in(this.listOfWords, this.availableWords) // return translated list of words

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
      this.vidDiv.nativeElement.setAttribute("style", "display:block;")
      this.playVid(0, true);

    } else{
      this.message = 'Invalid input';
      this.output = [];
      this.vidDiv.nativeElement.setAttribute("style", "display:none;") // hide video div
    }
  }

  playVid(videoNum: number, auto: Boolean) {
    // Play video in playlist
    this.videoPlayer.nativeElement.setAttribute("src", this.playlist[videoNum]);
    if (auto){
      this.videoPlayer.nativeElement.autoplay = true;
    } else {
      this.videoPlayer.nativeElement.autoplay = false;
    }
    this.videoPlayer.nativeElement.load();
  }

  endOfVid(): void{
    // Once video ended
    this.i++;
    if (this.i == this.playlist.length) { // all videos in playlist show
        this.i = 0;
        this.playVid(this.i, false);
    } else {
        this.playVid(this.i, true); // play next vid
    }
  }

  // Hello my name is Phoebe
  // Welcome to my BSL translation app
  // I hope you like it!
}
