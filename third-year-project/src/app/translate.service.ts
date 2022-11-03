import { Injectable } from '@angular/core';

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
      if (!this.stopWords.includes(listOfWords[w])){
        s = s + listOfWords[w] + ' ';
      }
    }
    var tagged = this.tagger.tagSentence(s)
    var pos = [];
    for (let i = 0; i <= (tagged.length)-1; i++){
      pos.push(tagged[i].value);
    }
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

  getSW(){
    const SW = ['is', 'the']
    return SW
  }


}
