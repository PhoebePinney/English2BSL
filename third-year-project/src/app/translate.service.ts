import { Injectable } from '@angular/core';
import {lemmatizer} from "lemmatizer";

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  posTagger = require( 'wink-pos-tagger' );
  pluralize = require('pluralize');
  contractions = require('expand-contractions');
  tagger = this.posTagger();
  stopWords = this.getSW();
  months = this.getMonths();
  temporalWords = this.getTemporalWords();
  orderBSL = this.getBSLOrder();
  keepTogether = this.getKeepTogether();


  constructor() { }

  translate(listOfWords: string[], availableWords: string[], testMode=false) {
    var out: string[] = []; // temp
    var s = '';
    var temp = [];
    for (let w in listOfWords){
      if (listOfWords[w].includes(',')){
        temp.push(listOfWords[w].replace(',',''));
        temp.push(',');
      }
      else{
        temp.push(listOfWords[w]);
      }
    }
    listOfWords = temp;
    for (let w in listOfWords){
      if (listOfWords[w]=='i'){
        listOfWords[w]='I';
      }
      if (listOfWords[w] != 'I'){ // retain I as a possesive pronoun
        listOfWords[w] = listOfWords[w].toLowerCase(); // set to lowercase
      }
      else{
        listOfWords[w]='I';
      }
      if (this.months.includes(listOfWords[w])){
        listOfWords[w] = listOfWords[w].substring(0, 3);
      }
      //if (!this.stopWords.includes(listOfWords[w])){ // remove stopwords
        s = s + listOfWords[w] + ' ';
      //}
    }
    listOfWords = this.getOrder(s.split(' '));
    listOfWords = this.removeStopWords(listOfWords);
    for (let w in listOfWords){
      if (listOfWords[w]!='I' && listOfWords[w]!=','){
        if (availableWords.includes(listOfWords[w]) || listOfWords[w]==','){ // if available, push whole word
          out.push(listOfWords[w]);
        }
        else if (availableWords.includes(lemmatizer(listOfWords[w])) && (lemmatizer(listOfWords[w]).length>1)){ // check if lemmatising makes it available
          out.push(lemmatizer(listOfWords[w]));
        }
        else if (availableWords.includes(this.pluralize.singular(listOfWords[w])) && this.pluralize.singular(listOfWords[w])!='i'){ // check if singularising makes it available
          out.push(this.pluralize.singular(listOfWords[w]));
        }
        else{ // else split into letters and push letters
          if (testMode==true){
            out.push(listOfWords[w])
          }
          else{
            const splitWord = listOfWords[w].split('');
            for (const l in splitWord){
              out.push(splitWord[l]);
            }
          }
        }
      }
    }
    out = this.checkForBigrams(out);
    return out;
  }

  getOrder(wordList: string[]){
    wordList.pop();
    wordList = this.checkForBigrams(wordList);
    var wordListString = "";
    for (let o in wordList){
      wordListString = wordListString + wordList[o] + ' ';
    }
    var taggedSentence = this.tagger.tagSentence(wordListString);
    var positions = [];
    for (let word in wordList){
      var thisPOS: any = '';
      for (let t in taggedSentence){
        if ((taggedSentence[t].value)==wordList[word]){
          thisPOS = taggedSentence[t].pos;
        }
      }
      if (wordList[word]=='howmuch'){
        positions.push([wordList[word], -1, 'WRB'])
      }
      else if (wordList[word]=='like'){
        positions.push([wordList[word], -1, 'VB'])
      }
      else if (wordList[word]=='if'){
        positions.push([wordList[word], -1, 'CC'])
      }
      else if (wordList[word]=='for'){
        positions.push([wordList[word], -1, 'CC'])
      }
      else if (wordList[word]=='with'){
        positions.push([wordList[word], -1, 'CC'])
      }
      else if (wordList[word]=='left'){
        positions.push([wordList[word], -1, 'JJ'])
      }
      else if (wordList[word]=='out'){
        positions.push([wordList[word], -1, 'RB'])
      }
      else if (wordList[word]=='go'){
        positions.push([wordList[word], -1, 'VB'])
      }
      // else if (wordList[word]=='that'){
      //   positions.push([wordList[word], -1, 'NN'])
      // }
      else if (this.temporalWords.includes(wordList[word])){
        positions.push([wordList[word], -1, 'T'])
      }
      else{
        if (thisPOS.length<1){
          thisPOS = 'NNP';
        }
        positions.push([wordList[word], -1, thisPOS])
      }
    }
    return (this.assignPositions(wordList, wordListString, positions));
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
          if ((bigrams[b][0]==BTS[bts][0] && bigrams[b][1]==BTS[bts][1]) || (bigrams[b][0]==BTS[bts][1] && bigrams[b][1]==BTS[bts][0])){
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

  removeStopWords(wordList: string[]){
    var cleanList = [];
    for(var w in wordList){
      if(!this.stopWords.includes(wordList[w])){
        cleanList.push(wordList[w])
      }
    }
    return cleanList;
  }

  assignPositions(wordList: string[], wordListString: string, positions: any[][]){
    var conjunctions = []; // coordinating conjunctions
    var splitUp: any[][] = [[]];
    var allOrdered: any[] = [];
    var c = 0;
    for (var p = 0; p<=positions.length-1; p++){
      if (positions[p][0]=='and'){
        if(['NN', 'NNP', 'NNS', 'NNPS'].includes(positions[p-1][2]) && ['NN', 'NNP', 'NNS', 'NNPS'].includes(positions[p+1][2])){
          positions[p][2]='UH'
        }
      }
      if (positions[p][2]=='CC' || positions[p][0]==',' || positions[p][2]=='T'){
        conjunctions.push(positions[p][0]);
        c +=1;
        splitUp.push([]);
      }
      else{
        splitUp[c].push(positions[p][0])
      }
    }
    var next = 0;
    for (let part in splitUp){
      var thesePositions = [];
      for (let p in splitUp[part]){
          thesePositions.push(positions[next])
          next +=1;
      }
      next +=1;
      var availablePositions = [...Array(splitUp[part].length+10).keys()];
      var skipThese: number[] = [];
      for (var tagSet = 0; tagSet <=this.orderBSL.length-1; tagSet++){
        for (var each = 0; each<=thesePositions.length-1; each++){
          if(!skipThese.includes(each)){
            if (this.orderBSL[tagSet].includes(thesePositions[each][2])){
              //console.log(thesePositions[each][0],availablePositions[0])
              thesePositions[each][1]=availablePositions[0];
              availablePositions.shift();

              if(each<thesePositions.length-1){
                for(var kt = 0; kt<=this.keepTogether.length-1; kt++){
                  if (this.keepTogether[kt][0]==thesePositions[each][0] && this.keepTogether[kt][1]==thesePositions[each+1][0]){
                    thesePositions[each+1][1]=availablePositions[0];
                    availablePositions.shift();
                    skipThese.push(each+1)
                  }
                }
              }

              if(['VBD', 'VBG', 'VBN', 'VBP', 'VBZ', 'VB'].includes(thesePositions[each][2])){
                if(each>0){
                  if(['PRP', 'PRP$'].includes(thesePositions[each-1][2])){
                    //console.log(thesePositions[each-1][0],availablePositions[0])
                    thesePositions[each-1][1]=availablePositions[0];
                    availablePositions.shift();
                    skipThese.push(each-1)
                  }
                }
              }
            }
          }
        }
      }
      console.log(thesePositions)
      allOrdered = allOrdered.concat(this.orderFromPositions(thesePositions));
      if (conjunctions.length>0){
        allOrdered.push(conjunctions[0]);
        conjunctions.shift();
      }
    }
    return allOrdered;
  }

  orderFromPositions(positions: any[][]){
    var ordered = [];
    var order = [...Array(positions.length+10).keys()];
    for (var o in order){
      for (let www in positions){
        if (positions[www][1]==order[o]){
          ordered.push(positions[www][0]);
        }
      }
    }
    return ordered;
  }

  getBSLOrder(){
    var order = [['UH'], // interjections
    ['T'], // temporal words
    ['DT'], // determiners
    ['IN'],  //  prepositions
    ['JJ', 'JJR', 'JJS', 'CD', 'PDT', 'PRP$'],  // adjectives, numbers, possessive pronouns
    ['NN', 'NNP', 'NNS', 'NNPS'], // nouns
    ['FW'], // foreign words
    ['VBD', 'VBG', 'VBN', 'VBP', 'VBZ', 'VB', 'RB', 'RBR', 'RBS'], // verbs and adverbs
    ['EX', 'MD'], // adverbs, ex there, modals
    ['PRP'], // pronouns
    ['WDT', 'WP', 'wP$', 'WRB'] // question words
    ];
    return order;

  }

  getBigrams(wordList: string[]){
    var bigrams = [];
    for (let i = 0; i <= (wordList.length); i++){
      bigrams.push([wordList[i],wordList[i+1]])
    }
    return bigrams;
  }

  getBigramsToSigns(){
    var BTS: { [sign: string] : string[]; } = {};
    BTS['nameme'] = ['my', 'name'];
    BTS['dontknow'] = ['not', 'know'];
    BTS['dontlike'] = ['not', 'like'];
    BTS['howmuch'] = ['how', 'much'];
    BTS['howold'] = ['how', 'old'];
    BTS['thankyou'] = ['thank', 'you'];
    BTS['cant']  = ['can', 'not'];
    BTS['me'] = ['I', 'am'];
    return BTS;
  }

  getSW(){
    const SW = ['as','of','so','also','to','be', 'on', 'the', 'away', 'it', 'do', 'did', 'a', 'an', 'some', 'is', 'are', 'he', 'she', 'they', 'and', 'for', 'nor', 'yet', 'him', 'himself', 'herself', 'her', 'his', 'hers', 'would', 'could', 'should', 'we', 'us', 'about'];
    return SW;
  }

  getTemporalWords(){
    const t = ['yesterday', 'tomorrow', 'now', 'today', 'before', 'after'];
    return t;
  }

  getMonths(){
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    return months;
  }

  getKeepTogether(){
    const keepTogether = [['something', 'else'], ['anything', 'else'], ['get, into'], ['very', 'much'], ['at', 'all'], ['this','one'], ['try', 'on'], ['get','into'], ['wiped', 'out'], ['nanjing', 'road'], ['right', 'over'], ['peach', 'rose'], ['hello', 'there'], ['hi', 'there']];
    return keepTogether;
  }


}
