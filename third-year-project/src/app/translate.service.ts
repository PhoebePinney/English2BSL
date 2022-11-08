import { Injectable } from '@angular/core';
import {lemmatizer} from "lemmatizer";

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  posTagger = require( 'wink-pos-tagger' );
  tagger = this.posTagger();
  stopWords = this.getSW();

  constructor() { }

  in(listOfWords: string[], availableWords: string[]) {
    var out: string[] = []; // temp
    var s = '';
    for (let w in listOfWords){
      if (listOfWords[w] != 'I'){ // retain I as a possesive pronoun
        listOfWords[w] = listOfWords[w].toLowerCase(); // set to lowercase
      }
      if (listOfWords[w]!="pleased" && listOfWords[w]!="please" && listOfWords[w]!="one"){
        var lemma = lemmatizer(listOfWords[w]); // lemmatise
      }
      else{
        lemma = listOfWords[w];
      }
      if (!this.stopWords.includes(lemma)){ // remove stopwords
        s = s + lemma + ' ';
      }

    }
    listOfWords = this.getOrder(s.split(' '));
    for (let w in listOfWords){
      if (availableWords.includes(listOfWords[w])){ // if available, push whole word
        out.push(listOfWords[w]);
      }
      else{ // else split into letters and push letters
        const splitWord = listOfWords[w].split('');
        for (const l in splitWord){
          out.push(splitWord[l]);
        }
      }
    }
    return out;
  }

  getOrder(wordList: string[]){
    wordList.pop();
    var availablePositions = [...Array(wordList.length).keys()];
    var positions :{ [word: string] : number} = {}; // words' positions in sentence
    var pos :{ [word: string] : string } = {}; // pos tags of each word
    for (let word in wordList){
      positions[wordList[word]] = -1;
      if (wordList[word].length > 0){
        var tagged = this.tagger.tagSentence(wordList[word]);
        pos[wordList[word]] = tagged[0].pos;
      }
    }
    console.log(pos);
    for (let p in pos){
      if (pos[p]=="UH"){
        positions[p]=0;
        availablePositions.shift();
      }
      else if (pos[p]=="WDT"||pos[p]=="WP"||pos[p]=="WP$"||pos[p]=="WRB"){
        positions[p]=wordList.length-1;
        availablePositions.pop();
      }
      else{
        positions[p]=availablePositions[0];
        availablePositions.shift();

      }
    }
    var ordered = [];
    var order = [...Array(wordList.length).keys()];
    for (var o in order){
      for (var key in positions){
        if (positions[key]==order[o]){
          ordered.push(key);
        }
      }
    }
    return ordered;
  }

  getSW(){
    const SW = ['be', 'the', 'away', 'it', 'do'];
    return SW;
  }


}
