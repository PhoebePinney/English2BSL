import { Component, ViewChild, ElementRef, AfterViewInit, Renderer2} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit{
  availableWords = ['Hello', 'my', 'name', 'is'];
  listOfWords: string[] = [];
  output: string[] = [];

  listOfVideos = ['./assets/testVideo2.mp4', './assets/testVideo.mp4'];
  i = 0;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.playVid(0);
  }

  onButton(userInput: string){
    this.listOfWords = userInput.split(' ');
    var out: string[] = [];
    for (const w in this.listOfWords){
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
  }

  playVid(videoNum: number) {
    this.videoPlayer.nativeElement.setAttribute("src", this.listOfVideos[videoNum]);
    this.videoPlayer.nativeElement.autoplay = true;
    this.videoPlayer.nativeElement.load();
  }

  endOfVid(): void{
    this.i++;
    if (this.i == this.listOfVideos.length) {
        this.i = 0;
        this.playVid(this.i);
    } else {
        this.playVid(this.i);
    }
  }
}
