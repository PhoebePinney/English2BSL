# THIS CODE WAS USED TO GENERATE THE LIST OF INFLECTIONS FOR THE AVAILABLE WORDS

import lemminflect
from lemminflect import getAllInflections

def getInflections(word):
  inflectionsList = []
  inflections = getAllInflections(word)
  for each in inflections:
    for i in inflections[each]:
      if (i not in inflectionsList) and (i!=word):
        inflectionsList.append(i)
  return inflectionsList

allInflections = []
with open('src/assets/availableWords.txt') as f:
    lines = f.readlines()
    # print(lines)
    for l in lines:
      for i in getInflections(l.strip()):
        if (i not in allInflections) and (len(i)>1):
          allInflections.append(i)
for a in allInflections:
  print(a)
