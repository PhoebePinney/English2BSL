import { Component, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';

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

  listOfVideos: string[][] = [];
  playlist: string[] = [];
  i = 0;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('vidDiv') vidDiv!: ElementRef;
  httpClient: HttpClient;

  constructor(private renderer: Renderer2, http: HttpClient) {
    this.httpClient = http;
  }

  ngAfterViewInit(): void {
    this.httpClient.get('./assets/videoLinks.txt', { responseType: 'text' })
      .subscribe(vidTextFile => this.getVidList(vidTextFile));
    this.httpClient.get('./assets/availableWords.txt', { responseType: 'text' })
      .subscribe(wordsTextFile => this.getAvailableWords(wordsTextFile));
  }

  getVidList(textFile: string){
    const lines = textFile.split('\n');
    for (let i = 0; i <= (lines.length)-3; i++){
      const b = lines[i].split(',');
      b[1] = b[1].replace("\r", "");
      this.listOfVideos.push(b);
    }
  }

  getAvailableWords(textFile: string){
    let lines = textFile.split('\n');
    for (const l in lines){
      lines[l] = lines[l].replace('\r','');
    }
    const pop = lines.pop();
    for (const l in lines){
      this.availableWords.push(lines[l]);
    }
  }

  onButton(userInput: string){
    this.output = [];
    this.playlist = [];
    this.message = '';
    this.i = 0;
    const checkInput = new RegExp(/[^a-zA-Z0-9\s\.]/);
    if (!checkInput.test(userInput)){
      if (userInput === ''){
        this.message = 'Please input a word or phase';
        return;
      }
      this.listOfWords = userInput.split(' ');
      var out: string[] = [];
      for (let w in this.listOfWords){
        this.listOfWords[w] = this.listOfWords[w].toLowerCase();
        if (this.availableWords.includes(this.listOfWords[w])){
          out.push(this.listOfWords[w]);
        }
        else{
          const splitWord = this.listOfWords[w].split('');
          for (const l in splitWord){
            out.push(splitWord[l]);
          }
        }
      }
      this.output = out;
      for (const word in this.output){
        for (const link in this.listOfVideos){
          const possible = this.listOfVideos[link][1].split('_');
          for (const p in possible){
            if (this.output[word]===possible[p]){
              this.playlist.push(this.listOfVideos[link][0]);
            }
          }
        }
      }
      this.vidDiv.nativeElement.setAttribute("style", "display:block;")
      this.playVid(0, true);
    } else{
      this.message = 'Invalid input';
      this.output = [];
      this.vidDiv.nativeElement.setAttribute("style", "display:none;")
    }
  }

  playVid(videoNum: number, auto: Boolean) {
    this.videoPlayer.nativeElement.setAttribute("src", this.playlist[videoNum]);
    if (auto){
      this.videoPlayer.nativeElement.autoplay = true;
    } else {
      this.videoPlayer.nativeElement.autoplay = false;
    }
    this.videoPlayer.nativeElement.load();
  }

  endOfVid(): void{
    this.i++;
    if (this.i == this.playlist.length) {
        this.i = 0;
        this.playVid(this.i, false);
    } else {
        this.playVid(this.i, true);
    }
  }

  // Hello my name is Phoebe
  // Welcome to my BSL translation app
  // I hope you like it!
}
