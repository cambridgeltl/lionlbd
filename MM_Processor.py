import os
from xml.etree.ElementTree import iterparse
# mmTypesFilePath = "C:\Users\Simon\Documents\metamap\MM_SemanticTypes.txt"
# mmTypesFilter = "C:\Users\Simon\Documents\metamap\MM_SemanticTypesFilter.txt"
mmXMLFile ="C:\Users\Simon\Documents\metamap\cell_only.xml"
OutputPath = "C:\Users\Simon\Documents\metamap\lion_result2\\"
if not os.path.exists(OutputPath):
    print "creating dir :" + OutputPath
    os.makedirs(OutputPath)

#lines = open(mmTypesFilePath).read().splitlines()

def getPositionsAndText(current_phraseText, matchedIndexList, matches_startPositions, matches_lengths,current_offset,CandidateMatched):
    phraseTextSplit = current_phraseText.lower().split(" ")
    postionString = ""
    matchedTextString = ""
    for i in range(0,len(matches_startPositions)):
        try:
            startPosition = matches_startPositions[i]-current_offset
        except IndexError:
            print "postion index failed " + str(i) + " in " + str(matches_startPositions)
        endPositon = startPosition+ matches_lengths[i]
        postionString += str(startPosition)+" "+ str(endPositon) + ";"
    matchedIndexList.sort()
    for index in matchedIndexList:
        print "finding " + str(index) +" " +CandidateMatched + " in " + str(phraseTextSplit)
        try:
            matchedTextString += phraseTextSplit[index-1] + " "
        except IndexError:
            print "ERROR finding " + str(index) +" " +CandidateMatched + " in " + str(phraseTextSplit) + "INSTEAD USING: " + CandidateMatched
            matchedTextString+= CandidateMatched.lower().strip()

    return [postionString.strip(";"), matchedTextString.strip()]

def start():

    context = iterparse(mmXMLFile, events=("start", "end"))
    event, root = context.next()
    current_PMID = -1
    annTxt = ""
    matchedIndexList = []
    matches_startPositions = []
    matches_lengths = []
    current_semtypeList = []

    for event, elem in context:
        if event == "end" and elem.tag == "PMID":
            current_PMID = elem.text
        if event == "end" and elem.tag == "UttNum":
            current_utNum = int(elem.text)

        if event == "end" and elem.tag == "UttStartPos":
            if current_utNum == 1:
                current_offset = int(elem.text)
        if event == "end" and elem.tag == "SemType":
            current_semtypeList.append(elem.text)

        if event == "end" and elem.tag == "PhraseText":
            current_phraseText = elem.text

        if event == "end" and elem.tag == "TextMatchStart":
            matchedIndexList.append(int(elem.text))

        if event == "end" and elem.tag == "CandidateCUI":
            current_candidateCUI = elem.text
            print current_candidateCUI
        if event == "end" and elem.tag == "CandidateMatched":
            CandidateMatched = elem.text

        if event == "end" and elem.tag == "StartPos":
            matches_startPositions.append(int(elem.text))

        if event == "end" and elem.tag == "Length":
            matches_lengths.append(int(elem.text))

        if event == "end" and elem.tag == "Candidate":
                candidateString = ""
                for semtype in current_semtypeList:
                    candidateString += current_candidateCUI + "\t"
                    [postionString, matchedTextString]= getPositionsAndText(current_phraseText,matchedIndexList,matches_startPositions,matches_lengths,current_offset,CandidateMatched)
                    candidateString+= semtype+ " " + postionString + "\t" + matchedTextString + "\n"
                annTxt+=candidateString
                matchedIndexList = []
                matches_startPositions = []
                matches_lengths = []
                current_semtypeList = []

        if event == "end" and elem.tag == "Utterances": #write to file.
            with open(OutputPath+current_PMID+".ann", 'w') as f:
                f.write(annTxt)
                f.close()
            annTxt = ""
            current_PMID = None
            current_utNum = None
            current_offset = None
            root.clear()

start()