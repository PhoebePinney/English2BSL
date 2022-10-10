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
  message = '';

  listOfVideos = ['./assets/videos/testVideo2.mp4', './assets/videos/testVideo.mp4'];
  i = 0;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('vidDiv') vidDiv!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    //this.playVid(0, false);
  }

  onButton(userInput: string){
    const checkInput = new RegExp(/[^a-zA-Z0-9\s\.]/);
    if (!checkInput.test(userInput)){
      this.message = '';
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
      this.vidDiv.nativeElement.setAttribute("style", "display:block;")
      this.playVid(0, true);
    } else{
      this.message = 'Invalid input';
      this.output = [];
      this.vidDiv.nativeElement.setAttribute("style", "display:none;")
    }
  }

  playVid(videoNum: number, auto: Boolean) {
    this.videoPlayer.nativeElement.setAttribute("src", this.listOfVideos[videoNum]);
    if (auto){
      this.videoPlayer.nativeElement.autoplay = true;
    } else {
      this.videoPlayer.nativeElement.autoplay = false;
    }
    this.videoPlayer.nativeElement.load();
  }

  endOfVid(): void{
    this.i++;
    if (this.i == this.listOfVideos.length) {
        this.i = 0;
        this.playVid(this.i, false);
    } else {
        this.playVid(this.i, true);
    }
  }
}
