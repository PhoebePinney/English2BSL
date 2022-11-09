import { ParseSourceFile } from '@angular/compiler';
import { Injectable } from '@angular/core';
import {lemmatizer} from "lemmatizer";

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  posTagger = require( 'wink-pos-tagger' );
  tagger = this.posTagger();
  stopWords = this.getSW();
  pluralize = require('pluralize');

  constructor() { }

  in(listOfWords: string[], availableWords: string[]) {
    var out: string[] = []; // temp
    var s = '';
    for (let w in listOfWords){
      if (listOfWords[w] != 'I'){ // retain I as a possesive pronoun
        listOfWords[w] = listOfWords[w].toLowerCase(); // set to lowercase
      }
      listOfWords[w] = this.pluralize.singular(listOfWords[w])
      if (!this.stopWords.includes(listOfWords[w])){ // remove stopwords
        s = s + listOfWords[w] + ' ';
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

  getBigrams(wordList: string[]){
    var bigrams = [];
    for (let i = 0; i <= (wordList.length); i++){
      bigrams.push([wordList[i],wordList[i+1]])
    }
    return bigrams;
  }

  checkForBigrams(wordList: string[]){
    var bigrams = this.getBigrams(wordList);
    var BTS = this.getBigramsToSigns();
    wordList = [];
    var skip = false;
    for (var b in bigrams){
      if (!skip){
        var notBoth=false;
        for (var bts in BTS){
          if (bigrams[b][0]==BTS[bts][0] && bigrams[b][1]==BTS[bts][1]){
            wordList.push(bts)
            skip=true;
            notBoth=true;
          }
        }
        if (notBoth==false){
          wordList.push(bigrams[b][0])
        }
      }
      else{
        skip=false;
      }
    }
    wordList.pop();
    return wordList;
  }

  getOrder(wordList: string[]){
    wordList.pop();
    wordList = this.checkForBigrams(wordList);
    var availablePositions = [...Array(wordList.length).keys()];
    var positions = [];
    for (let word in wordList){
      var tagged = this.tagger.tagSentence(wordList[word]);
      if (wordList[word]=='howmuch'){
        positions.push([wordList[word], -1, 'WRB'])
      }
      else{
        positions.push([wordList[word], -1, tagged[0].pos])
      }
    }
    for (let w in positions){
      if (positions[w][2]=="UH"){
        if (availablePositions[0]==0){
          positions[w][1]=0;
          availablePositions.shift();
        }
        else{
          for (let ww in positions){
            positions[ww][1]=positions[ww][1]+1;
            for (let a in availablePositions){
              availablePositions[a]=availablePositions[a]-1;
            }
          }
          positions[w][1]=0;
          availablePositions.shift();
        }
      }
      else if (positions[w][2]=="WDT"||positions[w][2]=="WP"||positions[w][2]=="WP$"||positions[w][2]=="WRB"){
        positions[w][1]=(wordList.length-1);
        availablePositions.pop();
      }
      else{
          positions[w][1]=availablePositions[0];
          availablePositions.shift();
      }
    }
    console.log(positions)
    var ordered = [];
    var order = [...Array(wordList.length).keys()];
    for (var o in order){
      for (let www in positions){
        if (positions[www][1]==order[o]){
          ordered.push(positions[www][0]);
        }
      }
    }
    return ordered;
  }

  getSW(){
    const SW = ['be', 'the', 'away', 'it', 'do', 'a', 'an', 'in', 'some', 'is', 'are', 'him', 'her', 'they'];
    return SW;
  }

  getBigramsToSigns(){
    var BTS: { [sign: string] : string[]; } = {};
    BTS['nameme'] = ['my', 'name'];
    BTS['dontknow'] = ['dont', 'know'];
    BTS['dontlike'] = ['dont', 'like'];
    BTS['howmuch'] = ['how', 'much'];
    BTS['thankyou'] = ['thank', 'you'];
    return BTS;
  }


}
