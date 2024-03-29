import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '../translate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit{
  contractions = require('expand-contractions');
  availableWords: string[] = [];
  inflections: string[] = [];
  listOfWords: string[] = [];
  output: any[] = [];
  out: string = ' ';
  message: string = '';
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
  @ViewChild('allSigns') allSigns!: ElementRef;
  @ViewChild('currentSignP') currentSignP!: ElementRef;
  @ViewChild('slow') slow!: ElementRef;
  @ViewChild('normal') normal!: ElementRef;
  @ViewChild('fast') fast!: ElementRef;
  @ViewChild('speedButtons') speedButtons!: ElementRef;
  @ViewChild('loading') loading!: ElementRef;
  httpClient: HttpClient;
  translate: TranslateService;
  currentSign = '';
  testSentences: string[] = [];
  testSentencesTruth: string[] = [];
  corrections: any[][] = [];
  mistakes = 0;
  correctionsString = '';
  wordToNum = require('word-to-numbers');

  constructor(http: HttpClient, translate: TranslateService, private router: Router) {
    this.httpClient = http;
    this.translate = translate;
  }

  gotoAbout(){
    this.router.navigate(['/about']);
  }
  gotoSD(){
    this.router.navigate(['/signdictionary']);
  }
  gotoAcknowledgments(){
    this.router.navigate(['/acknowledgments']);
  }

  ngAfterViewInit(): void {
    // Get list of video links
    this.httpClient.get('./assets/videoLinks.txt', { responseType: 'text' })
      .subscribe(vidTextFile => this.getVidList(vidTextFile));
    // Get list of available words
    this.httpClient.get('./assets/availableWords.txt', { responseType: 'text' })
      .subscribe(wordsTextFile => this.getAvailableWords(wordsTextFile));
    // Get list of inflections
    this.httpClient.get('./assets/inflections.txt', { responseType: 'text' })
      .subscribe(wordsTextFile => this.getInflections(wordsTextFile));

    // TESTING
    this.httpClient.get('./assets/testData.txt', { responseType: 'text' })
      .subscribe(testData => this.getTestData(testData));
    this.httpClient.get('./assets/testDataTruth.txt', { responseType: 'text' })
      .subscribe(testDataTruth => this.getTestDataTruth(testDataTruth));
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

  getInflections(textFile: string){
    // Creates a list of inflections of available words from the text file
    let lines = textFile.split('\n');
    for (const l in lines){
      lines[l] = lines[l].replace('\r','');
    }
    const pop = lines.pop();
    for (const l in lines){
      this.inflections.push(lines[l]);
    }
  }

  getTestData(textFile: string){
    // Creates a list of sentences from the testData text file
    let lines = textFile.split('\n');
    for (const l in lines){
      lines[l] = lines[l].replace('\r','');
    }
    const pop = lines.pop();
    for (const l in lines){
      this.testSentences.push(lines[l]);
    }
  }

  getTestDataTruth(textFile: string){
    // Creates a list of sentences from the testData text file
    let lines = textFile.split('\n');
    for (const l in lines){
      lines[l] = lines[l].replace('\r','');
    }
    const pop = lines.pop();
    for (const l in lines){
      this.testSentencesTruth.push(lines[l]);
    }
  }

  updateChar(){
    // Updates the character counter in input box
    var inputValue = this.box.nativeElement.value;
    this.char = inputValue.length;
  }

  runTest(){
    // RUN TEST
    var correct = [];
    var correctNum = 0;
    var incorrect = [];
    for (let i = 0; i < 150; i++){
      console.log(i)
      var sentence = this.contractions.expand(this.testSentences[i]); // expand contractions
      sentence = sentence.replace(/[\.-\/#!$%\^&\*;:{}=\-_`~()'@\+\?><\[\]\+]/g, '');
      var sentenceWords: string[] = sentence.split(' '); // List of words the user entered
      var filteredSentence = sentenceWords.filter(function(value, index, arr){ return value != "";})
      var output = this.translate.translate(filteredSentence, this.availableWords, this.inflections)
      var outputString = '';
      for (let w in output){
        outputString = outputString + output[w] + ' '
      }
      outputString = outputString.slice(0, -1);
      console.log(sentence)
      console.log("given---", outputString)
      console.log("true---", this.testSentencesTruth[i])
      if (outputString==this.testSentencesTruth[i]){
        correct.push(outputString);
        correctNum +=1;
      }
      else{
        incorrect.push([outputString,this.testSentencesTruth[i]]);
      }
    }
    console.log(correctNum, correctNum/150)
    console.log(incorrect)
  }

  onButton(userInput: string){ // When 'translate' button pressed
    //this.runTest(); // RUN TESTS

    // Reset some values
    this.replayDiv.nativeElement.classList.add("beNone");
    this.allSigns.nativeElement.classList.remove("fade");
    this.allSigns.nativeElement.classList.remove("beNone");
    this.currentSignP.nativeElement.classList.remove("beNone");
    this.vidDiv.nativeElement.classList.remove("moveToMiddle");
    this.speedButtons.nativeElement.classList.add("moveOver");
    this.loading.nativeElement.classList.remove("beNone");
    this.output = []; // List of words to be output
    this.playlist = []; // List of videos to be shown
    this.corrections = []; // Suggested spelling corrections
    this.mistakes = 0; // Number of suggested spelling mistakes
    this.message = ' '; // Sometimes shows error message
    this.i = 0;
    this.out = '';
    this.correctionsString = ''; // The outputted suggestions

    // Check if input is valid
    userInput = this.contractions.expand(userInput); // expand contractions
    if (userInput.includes('of the clock')){ // Deal with 'o'clock' contraction - special case
      userInput = userInput.replace('of the clock', 'oclock')
    }
    userInput = userInput.replace(/[\.-\/#!$%\^&\*;:{}=\-_`~()'@\+\?><\[\]\+]/g, ''); // Remove punctuation apart from commas
    var re1 = new RegExp(/^\d\S*$/g);
    var re2 = new RegExp(/\d,\d/g)
    if (!re1.test(userInput) && !re2.test(userInput)) { // prevent bugs in wordToNum library
      userInput = String(this.wordToNum(userInput)) // convert words to numbers
    }
    this.listOfWords = userInput.split(' '); // List of words the user entered
    var filtered = this.listOfWords.filter(function(value, index, arr){ return value != "";}); // remove blank tokens
    if (filtered.length == 0){ // if no words input
      this.message = 'Invalid phrase'; // Error message
      this.vidDiv.nativeElement.classList.add("moveToMiddle");
      this.speedButtons.nativeElement.classList.remove("moveOver");
      this.allSigns.nativeElement.classList.add("beNone");
      this.currentSignP.nativeElement.classList.add("beNone");
      this.videoPlayer.nativeElement.setAttribute("src", "");
      this.videoPlayer2.nativeElement.setAttribute("src", "");
      this.loading.nativeElement.classList.add("beNone");
      this.loading.nativeElement.classList.add("beNone");
      return;
    }

    // TRANSLATE (if valid input)
    let r = this.translate.translate(filtered, this.availableWords, this.inflections) // return translated list of words
    this.output = r[0]
    this.corrections = r[1]

    // Output suggested spelling corrections
    for(let c in this.corrections){
      if(this.corrections[c][1]==1){
        this.mistakes +=1
      }
      this.correctionsString = this.correctionsString + this.corrections[c][0] + ' '
    }

    // Error message
    if (this.output.length < 1){
      this.message = 'Invalid phrase';
      this.vidDiv.nativeElement.classList.add("moveToMiddle");
      this.speedButtons.nativeElement.classList.remove("moveOver");
      this.allSigns.nativeElement.classList.add("beNone");
      this.currentSignP.nativeElement.classList.add("beNone");
      this.videoPlayer.nativeElement.setAttribute("src", "");
      this.videoPlayer2.nativeElement.setAttribute("src", "");
      this.loading.nativeElement.classList.add("beNone");
      return;
    }

    // Display video translation
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
    var output = '';
    for (let o in this.output){
      if (this.output[o].length<2){
        this.output[o] = this.output[o].toUpperCase(); // set letters to upper case
      }
      // Special cases
      if (this.output[o]=='nameme'){
        this.output[o] = 'name (my)';
      }
      else if (this.output[o]=='thankyou'){
        this.output[o] = 'thank you';
      }
      else if (this.output[o]=='dontknow'){
        this.output[o] = "don't know";
      }
      else if (this.output[o]=='dontlike'){
        this.output[o] = "don't like";
      }
      else if (this.output[o]=='howmuch'){
        this.output[o] = "how much";
      }
      else if (this.output[o]=='howold'){
        this.output[o] = "how old";
      }
      else if (this.output[o]=='cant'){
        this.output[o] = "can't";
      }
      else if (this.output[o]=='oclock'){
        this.output[o] = "o'clock";
      }
      output = output + ' ' + this.output[o];
    }
    this.output = this.output.filter(function(e) { return e !== '*' })
    output = output.replace(/[*]/g, ' - ')
    output = output.slice(0, -2);
    this.out = '[ '+output+']';
    this.playVid(); // Start showing video playlist
  }

  playVid() {
    // Plays videos in playlist
    this.i = 0;
    this.currentSign=this.output[this.i];
    this.videoPlayer.nativeElement.classList.remove("beNone");
    this.videoPlayer2.nativeElement.classList.add("beNone");
    this.videoPlayer.nativeElement.setAttribute("src", this.playlist[this.i]);
    this.videoPlayer2.nativeElement.setAttribute("src", this.playlist[this.i+1]);
    this.videoPlayer.nativeElement.load();
    this.videoPlayer2.nativeElement.load();
    this.videoPlayer.nativeElement.play();
  }

  setSlow(){
    // When slow speed selected
    this.videoPlayer.nativeElement.playbackRate = 0.5;
    this.videoPlayer2.nativeElement.playbackRate = 0.5;
    this.videoPlayer.nativeElement.defaultPlaybackRate = 0.5;
    this.videoPlayer2.nativeElement.defaultPlaybackRate = 0.5;
    this.slow.nativeElement.classList.add("selectedSpeed");
    this.normal.nativeElement.classList.remove("selectedSpeed");
    this.fast.nativeElement.classList.remove("selectedSpeed");
  }

  setNormal(){
    // When normal speed selected
    this.videoPlayer.nativeElement.playbackRate = 1.0;
    this.videoPlayer2.nativeElement.playbackRate = 1.0;
    this.videoPlayer.nativeElement.defaultPlaybackRate = 1.0;
    this.videoPlayer2.nativeElement.defaultPlaybackRate = 1.0;
    this.normal.nativeElement.classList.add("selectedSpeed");
    this.slow.nativeElement.classList.remove("selectedSpeed");
    this.fast.nativeElement.classList.remove("selectedSpeed");

  }

  setFast(){
    // When fast speed selected
    this.videoPlayer.nativeElement.playbackRate = 2.0;
    this.videoPlayer2.nativeElement.playbackRate = 2.0;
    this.videoPlayer.nativeElement.defaultPlaybackRate = 2.0;
    this.videoPlayer2.nativeElement.defaultPlaybackRate = 2.0;
    this.fast.nativeElement.classList.add("selectedSpeed");
    this.normal.nativeElement.classList.remove("selectedSpeed");
    this.slow.nativeElement.classList.remove("selectedSpeed");

  }

  endOfVid(): void{
    // Once video ended
    this.i ++;
    this.currentSign=this.output[this.i];
    if(this.i + 1 > this.playlist.length){
      this.replayDiv.nativeElement.classList.remove("beNone");
      this.loading.nativeElement.classList.add("beNone");
      this.allSigns.nativeElement.classList.add("fade");
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
