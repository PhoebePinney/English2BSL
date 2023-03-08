  // NATURAL LANGUAGE PROCESSING SERVICE FOR ENGLISH-TO-BSL TRANSLATION

import { Injectable } from '@angular/core';
import { lemmatizer } from "lemmatizer";

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  posTagger = require('wink-pos-tagger');
  pluralize = require('pluralize');
  contractions = require('expand-contractions');
  similarity = require('similarity')
  stringSimilarity = require("string-similarity");
  tagger = this.posTagger();
  stopWords = this.getSW();
  months = this.getMonths();
  temporalWords = this.getTemporalWords();
  orderBSL = this.getBSLOrder();
  keepTogether = this.getKeepTogether();


  constructor() { }

  translate(listOfWords: string[], availableWords: string[], inflections: string[]) {
    var out: any[] = []
    var s = ''
    var temp = []

    for (let w in listOfWords){ // Deal with commas for splitting sentence
      if (listOfWords[w].includes(',')){
        temp.push(listOfWords[w].replace(',',''))
        temp.push(',')
      }
      else{
        temp.push(listOfWords[w]);
      }
    }
    listOfWords = temp;

    for (let w in listOfWords){
      // Deal with the pronoun 'I'
      if (listOfWords[w]=='i'){
        listOfWords[w]='I';
      }
      if (listOfWords[w] != 'I'){ // retain I as a pronoun (capitalised)
        listOfWords[w] = listOfWords[w].toLowerCase(); // set all other words to lowercase
      }
      else{
        listOfWords[w]='I';
      }

      // Format months as the first three letters e.g. October -> OCT
      if (this.months.includes(listOfWords[w])){
        listOfWords[w] = listOfWords[w].substring(0, 3);
      }
        s = s + listOfWords[w] + ' ';
    }

    // Check for suggested spelling mistakes
    var corrections = this.checkForMistakes(listOfWords, availableWords, inflections) // check for spelling errors

    listOfWords = this.getOrder(s.split(' ')); // get order of words
    listOfWords = this.removeStopWords(listOfWords); // remove words not used in BSL
    for (let w in listOfWords){
      if (listOfWords[w]!='I' && listOfWords[w]!=','){
        if (availableWords.includes(listOfWords[w]) || listOfWords[w]==','){ // if available, push whole word
          out.push(listOfWords[w], '*');
        }
        else if (availableWords.includes(lemmatizer(listOfWords[w])) && (lemmatizer(listOfWords[w]).length>1)){ // check if lemmatising makes it available
          out.push(lemmatizer(listOfWords[w]), '*');
        }
        else if (availableWords.includes(this.pluralize.singular(listOfWords[w])) && this.pluralize.singular(listOfWords[w])!='i'){ // check if singularising makes it available
          out.push(this.pluralize.singular(listOfWords[w]), '*');
        }
        else{ // word not in dictionary
          if(!isNaN(+listOfWords[w])){ // if word is a valid number
            var stringToNum = +listOfWords[w] // convert string to number

            var divMil = Math.floor(stringToNum / 1000000) // divide number by a million
            if(divMil>=1000){ // if number is bigger than 999,999,999, just split into digits
              const splitWord = stringToNum.toString().split('');
              for (const l in splitWord){
                out.push(splitWord[l]);
              }
              out.push('*')
            }
            else{ // if number is less than 1 billion
              if (divMil>0){
                if (availableWords.includes(divMil.toString())){ // check if in available words
                  out.push(divMil.toString(), '*')
                }
                else{
                  const splitWord = divMil.toString().split(''); // split remaining into digits
                  for (const l in splitWord){
                    out.push(splitWord[l]);
                  }
                  out.push('*')
                }
                out.push('million', '*')
              }
              var lessThanMil = (stringToNum-(divMil*1000000))
              var div1000 = Math.floor(lessThanMil  / 1000) // divide number by a thousand
              if (div1000>0){
                if (availableWords.includes(div1000.toString())){ // check if in available words
                  out.push(div1000.toString(), '*')
                }
                else{
                  const splitWord = div1000.toString().split(''); // split remaining into digits
                  for (const l in splitWord){
                    out.push(splitWord[l]);
                  }
                  out.push('*')
                }
                out.push('thousand', '*')
              }
              var lessThan1000 = (lessThanMil-(div1000*1000))
              var div100 = Math.floor( lessThan1000 / 100) // divide remaining by 100
              if (div100>0){
                if (availableWords.includes(div100.toString())){ // check if in available words
                  out.push(div100.toString(), '*')
                }
                else{
                  const splitWord = div100.toString().split(''); // split remaining into digits
                  for (const l in splitWord){
                    out.push(splitWord[l]);
                  }
                  out.push('*')
                }
                out.push('hundred', '*')
              }
              var lessThan100 = (lessThan1000 - (div100*100))
              if (lessThan100>0){
                listOfWords[w]=lessThan100.toString()
                if (availableWords.includes(listOfWords[w])){ // check if in available words
                  out.push(listOfWords[w], '*')
                }
                else{
                  const splitWord = listOfWords[w].split(''); // split remaining into digits
                  for (const l in splitWord){
                    out.push(splitWord[l]);
                  }
                  out.push('*')
                }
              }
            }
          }

          // If not a number
          else{
            // Split word into letters
            const splitWord = listOfWords[w].split('');
            for (const l in splitWord){
              out.push(splitWord[l]);
            }
            out.push('*')
          }
        }
      }
    }
    out = this.checkForBigrams(out); // Keep bigrams together
    return [out, corrections]
  }

  checkForMistakes(listOfWords: string[], availableWords: string[], inflections: string[]){
    // Checks for possible spelling mistakes, used the list of available words and their inflections as a dictionary
    var allWords = availableWords.concat(inflections)
    var corrections: any[][] = []
    for (let w in listOfWords){
      if (listOfWords[w]!=','){
        if(listOfWords[w]=='I'){
          corrections.push(['I', 0])
        }
        else if (allWords.includes(listOfWords[w]) ||
        (!isNaN(+listOfWords[w])) ||
        (this.stopWords.includes(listOfWords[w]))){ // not a mistake
          corrections.push([listOfWords[w], 0])
        }
        else{ // Check for spelling mistakes
          // Dice’s coefficient
          var matchesDC = this.stringSimilarity.findBestMatch(listOfWords[w], allWords);

          // Levenshtein distance
          var matchesLD: { [aw: string] : string; } = {};
          for(let a in allWords){
            matchesLD[allWords[a]] = this.similarity(listOfWords[w], allWords[a])
          }
          var bestMatchLD = Object.keys(matchesLD).reduce(function(a, b){ return matchesLD[a] > matchesLD[b] ? a : b })

          // Get best match
          if((matchesDC.bestMatch.rating>=matchesLD[bestMatchLD]) && (matchesDC.bestMatch.rating>0.5)){
            corrections.push([matchesDC.bestMatch.target, 1])
          }
          else if ((matchesDC.bestMatch.rating<matchesLD[bestMatchLD]) && (Number(matchesLD[bestMatchLD])>0.5)){
            corrections.push([bestMatchLD, 1])
          }
          else{
            corrections.push([listOfWords[w], 0])
          }
        }
      }
    }
    return corrections
  }

  getOrder(wordList: string[]){
    // Get BSL word order
    wordList.pop();
    wordList = this.checkForBigrams(wordList);
    var wordListString = "";
    for (let o in wordList){
      wordListString = wordListString + wordList[o] + ' ';
    }
    var taggedSentence = this.tagger.tagSentence(wordListString); // Get POS tags
    var positions = [];
    for (let word in wordList){
      var thisPOS: any = '';
      for (let t in taggedSentence){
        if ((taggedSentence[t].value)==wordList[word]){
          thisPOS = taggedSentence[t].pos;
        }
      }
      // Special cases
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
    return (this.assignPositions(positions));
  }

  checkForBigrams(wordList: string[]){
    // Here, bigrams are two words that should not be split up
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

  assignPositions(positions: any[][]){
    var conjunctions = []; // coordinating conjunctions
    var splitUp: any[][] = [[]]; // sections of the sentence
    var allOrdered: any[] = [];
    var c = 0;
    for (var p = 0; p<=positions.length-1; p++){
      if (positions[p][0]=='and'){ // Split at 'and'
        if(positions[p-1][2]==positions[p+1][2]){
          positions[p][2]='UH'
        }
      }
      if (positions[p][2]=='CC' || positions[p][0]==',' || positions[p][2]=='T'){ // Split at coordinating conjunctions (but keep in sentence)
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

              if(['VBD', 'VBG', 'VBN', 'VBP', 'VBZ', 'VB', 'NN', 'NNP', 'NNS', 'NNPS'].includes(thesePositions[each][2])){ // Special case for verbs and nouns
                if(each>0){
                  if(['PRP', 'PRP$'].includes(thesePositions[each-1][2])){ // Pronouns and possessive pronouns
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
      allOrdered = allOrdered.concat(this.orderFromPositions(thesePositions));
      if (conjunctions.length>0){
        allOrdered.push(conjunctions[0]); // add CCs back into sentence where it was split
        conjunctions.shift();
      }
    }
    return allOrdered;
  }

  orderFromPositions(positions: any[][]){
    // Obtain the order based on the positions
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
    const SW = ['am','as','of','so','also','to','be', 'the', 'away', 'it', 'do', 'did', 'a', 'an', 'some', 'is', 'are', 'he', 'she', 'they', 'and', 'for', 'nor', 'yet', 'him', 'himself', 'herself', 'her', 'his', 'hers', 'would', 'could', 'should', 'we', 'us', 'about'];
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
    const keepTogether = [['something', 'else'], ['anything', 'else'], ['get, into'], ['very', 'much'], ['at', 'all'], ['this','one'], ['try', 'on'], ['get','into'], ['wiped', 'out'], ['nanjing', 'road'], ['right', 'over'], ['peach', 'rose'], ['hello', 'there'], ['hi', 'there'], ['pick', 'up'], ['chinese', 'food'], ['ring', 'up'], ['half', 'past']];
    return keepTogether;
  }


}
