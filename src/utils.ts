import { App, normalizePath } from "obsidian";
import { 
	//Reference,
	Creator,
	CreatorArray,
	Reference,
	AnnotationElements,
		} from "./types"

import {
	TEMPLATE_BRACKET_REG,
	TEMPLATE_REG,
	} from "./constants";


export function replaceAllTemplates(
	entriesArray: string[],
	note: string,
	selectedEntry: Reference
) {
	let copy = note.slice();
	for (let z = 0; z < entriesArray.length; z++) {
		// 	 Identify the keyword to be replaced
		const KW = entriesArray[z];
		const KW_Brackets = "{{" + KW + "}}";
		// 	 replace the keyword in the template
		copy = replaceTemplate(
			copy,
			KW_Brackets,
			`${selectedEntry[KW]}`
		);
	}
	return copy;
}

export function escapeRegExp(stringAdd: string) {
	return stringAdd.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function replaceTemplate(
	stringAdd: string,
	find: string,
	replace: string
) {
	return stringAdd.replace(new RegExp(escapeRegExp(find), "g"), replace);
}


export const makeWiki = (str: string) => "[[" + str + "]]";

export 	const createAuthorKey = (creators: CreatorArray) => {
	const authorKey: string[] = []
	let authorKeyFixed = ""
	for (let creatorindex = 0; creatorindex < creators.length ; creatorindex++) {
	const creator:Creator = creators[creatorindex]; //select the author
	if (creator.creatorType === "author"){
		if(creator.hasOwnProperty('name')){
			//authorList.push(creator.name)
			authorKey.push(creator.name)
			} else   
		if (creator.hasOwnProperty('lastName')&& creator.hasOwnProperty('firstName')){
			//authorList.push(creator.lastName + ", " + creator.firstName)
			authorKey.push(creator.lastName)
			} else 
		if (creator.hasOwnProperty('lastName')&& !creator.hasOwnProperty('firstName')){
			//authorList.push(creator.lastName)
			authorKey.push(creator.lastName)
			} else 
		if (!creator.hasOwnProperty('lastName')&& creator.hasOwnProperty('firstName')){
			//authorList.push(creator.firstName)
			authorKey.push(creator.firstName)
			}} else 
	if (creator.creatorType === "editor"){
		if(creator.hasOwnProperty('name')){
			//editorList.push(creator.name)
			authorKey.push(creator.name)
			} else 
		if (creator.hasOwnProperty('lastName')&& creator.hasOwnProperty('firstName')){
			//editorList.push(creator.lastName + ", " + creator.firstName)
			authorKey.push(creator.lastName)
			} else 
		if (creator.hasOwnProperty('lastName')&& !creator.hasOwnProperty('firstName')){
			//editorList.push(creator.lastName)
			authorKey.push(creator.lastName)
			} else 
		if (!creator.hasOwnProperty('lastName')&& creator.hasOwnProperty('firstName')){
			//editorList.push(creator.firstName)
			authorKey.push(creator.firstName)
			}}
	}
	
	//Adjust the authorKey depending on the number of authors
	if (authorKey.length==1){authorKeyFixed = authorKey[0]}
	if (authorKey.length==2){authorKeyFixed = authorKey[0] + " and " +authorKey[1]}
	if (authorKey.length>2){authorKeyFixed = authorKey[0] + " et al."}
	return authorKeyFixed;
	}

export function removeQuoteFromStart(quote: string, annotation: string) {
	let copy = annotation.slice();
	while (copy.charAt(0) === quote) copy = copy.substring(1);
	return copy;
}
export function removeQuoteFromEnd(quote: string, annotation: string) {
	let copy = annotation.slice();
	while (copy[copy.length - 1] === quote) copy = copy.substring(0, copy.length-1);
	return copy;
}

export function orderByDateModified( a:Reference, b:Reference ) {
	if ( a.dateModified > b.dateModified ){
		return -1;
	}
	if ( a.dateModified < b.dateModified ){
		return 1;
	}
	return 0;
  }

  //Function that create an array with the creators of a given type (e.g. author, editor)
  export const createCreatorList = (creators: CreatorArray, typeCreator: string, note:string) => {
	const creatorList: string[] = []
	for (let creatorindex = 0; creatorindex < creators.length ; creatorindex++) {
	const creator:Creator = creators[creatorindex]; //select the author
	if (creator.creatorType === typeCreator){
		if(creator.hasOwnProperty('name')){
			creatorList.push(creator.name)
			} else   
		if (creator.hasOwnProperty('lastName')&& creator.hasOwnProperty('firstName')){
			creatorList.push(creator.lastName + ", " + creator.firstName)
			} else 
		if (creator.hasOwnProperty('lastName')&& !creator.hasOwnProperty('firstName')){
			creatorList.push(creator.lastName)
			} else 
		if (!creator.hasOwnProperty('lastName')&& creator.hasOwnProperty('firstName')){
			creatorList.push(creator.firstName)
			}} 
	}
	
	const creatorListBracket = creatorList.map(makeWiki);
	if (creatorList.length == 0){return note} else {
		note = replaceTemplate(
			note,
				`[[{{${typeCreator}}}]]`,
				creatorListBracket.join("; ")
			);
			note = replaceTemplate(
				note,
				`{{${typeCreator}}}`,
				creatorList.join("; ")
			);
		return note
		}
		
	}



export function createTagList(tagList: string[], note:string){
	if (tagList.length == 0){return note} else {
		const tagListBraket = 	tagList.map(makeWiki);
		note = replaceTemplate(
			note,
				`[[{{keywords}}]]`,
				String(tagListBraket.join("; "))
			);
		note = replaceTemplate(
				note,
				`{{keywords}}`,
				String(tagList.join("; "))
			);
		return note
		}

}


//function to replace the missing fields in the template
export function replaceMissingFields(note: string, missingfield: string) {
		let copy = note.slice();
		if (missingfield === "Replace with NA") {
			copy = copy.replace(TEMPLATE_BRACKET_REG, "*NA*").trim();
			copy = copy.replace(TEMPLATE_REG, "*NA*").trim();
		} else if (missingfield === "Remove (entire row)") {
			//console.log("Trying to remove all rows with missing field");
			const lines = copy.split(/\r?\n/);
			// 	run function to determine where we still have double curly brackets
			for (let j = 0; j < lines.length; j++) {
				if (lines[j].match(TEMPLATE_REG)) {
					lines.splice(j, 1);
					j--;
				}
			}
			copy = lines.join("\n");
		}

		//Remove empty sections when there is no data
		copy = copy.replace("```ad-quote\n" + "title: Abstract\n"  +"```\n","")	
		copy = copy.replace("```ad-abstract\n" + "title: Files and Links\n"  +"```\n","")	
		copy = copy.replace("```ad-note\n" + "title: Tags and Collections\n"  +"```\n","")	

		//Remove empty sections when there is no data
		copy = copy.replace("## Abstract\n" + "\n"+ "## Files and Links\n","## Files and Links\n")	
		copy = copy.replace("## Files and Links\n"+"\n"+"## Tags and Collections\n", "## Tags and Collections\n")	
		copy = copy.replace("## Tags and Collections\n"+"\n", "\n")	

		//console.log(copy)
		return copy;
	}	

export function createLocalFileLink(reference: Reference)  {
		//if there is no attachment, return placeholder
		if(reference.attachments.length ==0) return "{{localFile}}"; 
		const filesList: string[] = []
		for (let attachmentindex = 0; attachmentindex < reference.attachments.length ; attachmentindex++) {
			if(reference.attachments[attachmentindex].itemType !== "attachment") continue
			const selectedfile:string = "[" +
				reference.attachments[attachmentindex].title +
				"](file:/" +
				reference.attachments[attachmentindex].path +
				")"; //select the author
			filesList.push(selectedfile)
		}
		//turn the array into a string
		const filesListString = filesList.join("; ")
		return filesListString
	
	}
 

export function createNoteTitle(selectedEntry: Reference, exportTitle: string, exportPath: string) {
	//Replace the placeholders
	exportTitle = exportTitle.replace("{{citeKey}}", selectedEntry.citationKey)
	exportTitle = exportTitle.replace("{{citationKey}}", selectedEntry.citationKey)
	exportTitle = exportTitle.replace("{{citationkey}}", selectedEntry.citationKey)
	exportTitle = exportTitle.replace("{{citekey}}", selectedEntry.citationKey)

	exportTitle = exportTitle.replace("{{title}}", selectedEntry.title)

	exportTitle = exportTitle.replace("{{author}}", selectedEntry.authorKey)
	exportTitle = exportTitle.replace("{{authors}}", selectedEntry.authorKey)

	exportTitle = exportTitle.replace("{{year}}", selectedEntry.year)
	exportTitle = exportTitle.replace("{{date}}", selectedEntry.year)

	//Remove special characters from the name of the file
	exportTitle = exportTitle.replace(/[/\\?%*:|"<>]/g, "")  

	//Get the path of the vault
	const vaultPath = this.app.vault.adapter.getBasePath()
		
	//Create the full path
	const exportPathFull: string = normalizePath(vaultPath + "/" + exportPath + "/" + exportTitle + ".md");

	return exportPathFull
	
}

export function compareNewOldNotes(existingNoteNote:String, noteElements: AnnotationElements[]){
	

	//Find the position of the line breaks in the old note
	const newLineRegex = RegExp (/\n/gm)
	const positionNewLine: number[] = []
	let match = undefined
	while(match = newLineRegex.exec(existingNoteNote)){
		positionNewLine.push(match.index); 
	}
	//Sort the array numerically

	//Create an array to record where in the old note the matches with the new note are found
	const positionOldNote: number[] = [0] 


	noteElements = noteElements.filter(x => x !== undefined);

	//loop through each of the lines extracted in the note
	for (let indexLines = 0; indexLines < noteElements.length ; indexLines++) {
		//console.log("indexLines :" + indexLines)
		// console.log(noteElements[indexLines].rowEdited)
		let segmentWhole = ""
		let segmentFirstHalf = ""
		let segmentSecondHalf = ""
		let segmentFirstQuarter = ""
		let segmentSecondQuarter = ""
		let segmentThirdQuarter = ""
		let segmentFourthQuarter = ""
		//Create an array to record where in the old note the matches with the new note are found
		const positionArray: number[] = [-1]
		
		
		//Calculate the length of the highlighted text
		if(noteElements[indexLines]== undefined){continue}
		
		
		const lengthExistingLineHighlight = noteElements[indexLines].highlightText.length
		//Calculate the length of the comment text
		const lengthExistingLineComment = noteElements[indexLines].commentText.length		
		//If the line is empty, then skip this iteration			
		if(lengthExistingLineHighlight === 0 && lengthExistingLineComment === 0) { continue; }


		//CHECK THE PRESENCE OF THE HIGHLIGHTED TEXT IN THE EXISTING ONE

		//Check if the entire line (or part of the line for longer lines) are found in the existing note
		if(lengthExistingLineHighlight>1 && lengthExistingLineHighlight<30){
			segmentWhole = noteElements[indexLines].highlightText
			positionArray.push(existingNoteNote.indexOf(segmentWhole))
			}
		else if(lengthExistingLineHighlight>=30 && lengthExistingLineHighlight<150){
			segmentFirstHalf = noteElements[indexLines].highlightText.substring(0, lengthExistingLineHighlight/2)
			positionArray.push(existingNoteNote.indexOf(segmentFirstHalf))
			
			segmentSecondHalf = noteElements[indexLines].highlightText.substring((lengthExistingLineHighlight/2)+1, lengthExistingLineHighlight)
			positionArray.push(existingNoteNote.indexOf(segmentSecondHalf))}

		else if(lengthExistingLineHighlight>=150){
			segmentFirstQuarter = noteElements[indexLines].highlightText.substring(0, lengthExistingLineHighlight/4)
			positionArray.push(existingNoteNote.indexOf(segmentFirstQuarter))
			
			segmentSecondQuarter = noteElements[indexLines].highlightText.substring((lengthExistingLineHighlight/4)+1, lengthExistingLineHighlight/2)
			positionArray.push(existingNoteNote.indexOf(segmentSecondQuarter))
			
			segmentThirdQuarter = noteElements[indexLines].highlightText.substring((lengthExistingLineHighlight/2)+1, 3*lengthExistingLineHighlight/4)
			positionArray.push(existingNoteNote.indexOf(segmentThirdQuarter))

			segmentFourthQuarter = noteElements[indexLines].highlightText.substring((3*lengthExistingLineHighlight/4)+1, lengthExistingLineHighlight)
			positionArray.push(existingNoteNote.indexOf(segmentFourthQuarter))
		}
		
		// console.log("positionArray: "+ positionArray)
		// console.log("Max positionArray: "+ Math.max(...positionArray))

		

		//CHECK THE PRESENCE OF THE COMMENT TEXT IN THE EXISTING ONE
		if(Math.max(...positionArray)=== -1 && lengthExistingLineComment>1){
			if(lengthExistingLineComment>1 && lengthExistingLineComment<30){
				segmentWhole = noteElements[indexLines].highlightText
				positionArray.push(existingNoteNote.indexOf(segmentWhole))
				}
			else if(lengthExistingLineComment>=30 && lengthExistingLineComment<150){
				segmentFirstHalf = noteElements[indexLines].highlightText.substring(0, lengthExistingLineComment/2)
				positionArray.push(existingNoteNote.indexOf(segmentFirstHalf))
				segmentSecondHalf = noteElements[indexLines].highlightText.substring((lengthExistingLineComment/2)+1, lengthExistingLineComment)
				positionArray.push(existingNoteNote.indexOf(segmentSecondHalf))}
			else if(lengthExistingLineComment>=150){
				segmentFirstQuarter = noteElements[indexLines].highlightText.substring(0, lengthExistingLineComment/4)
				positionArray.push(existingNoteNote.indexOf(segmentFirstQuarter))
				segmentSecondQuarter = noteElements[indexLines].highlightText.substring((lengthExistingLineComment/4)+1, lengthExistingLineComment/2)
				positionArray.push(existingNoteNote.indexOf(segmentSecondQuarter))
				segmentThirdQuarter = noteElements[indexLines].highlightText.substring((lengthExistingLineComment/2)+1, 3*lengthExistingLineComment/4)
				positionArray.push(existingNoteNote.indexOf(segmentThirdQuarter))
				segmentFourthQuarter = noteElements[indexLines].highlightText.substring((3*lengthExistingLineComment/4)+1, lengthExistingLineComment)
				positionArray.push(existingNoteNote.indexOf(segmentFourthQuarter))}
			}

		// if a match if found with the old note, set foundOld to TRUE
		if(Math.max(...positionArray)> -1){
			noteElements[indexLines].foundOld = true

			//record the position of the found line in the old note
			const positionOldNoteMax = Math.max(...positionArray)
			positionOldNote.push(positionOldNoteMax)
		}
		// if a match if not found with the old note, set foundOld to FALSE and set positionOld to the position in the old note where the line break is found
		if(Math.max(...positionArray)=== -1){

			noteElements[indexLines].foundOld = false
			const positionOldNoteMax = Math.max(...positionOldNote)

			//Find the index in positionNewLine that comes after the selected number and store it in the element
			noteElements[indexLines].positionOld = positionNewLine.filter(pos => pos >positionOldNoteMax)[0]
		}
		console.log(indexLines)
		console.log(noteElements[indexLines])
	}
	console.log(noteElements)
	return noteElements
	
}
 

// export function getFormattingType(currLine: string, selectedEntry: Entry) {
// 	const ZOTERO_REG = this.getZoteroRegex(selectedEntry)
// 	if (ZOTERO_REG.test(currLine)) {
// 		return "Zotero";
// 	} else if (ZOTFILE_REG.test(currLine)) {
// 		return "Zotfile";
// 	} else {
// 		return null;
// 	}
// }


// export function getZoteroRegex(selectedEntry: Entry) {
// 	const NumAuthors = selectedEntry.creators.author.length //check the number of authors
// 	let AuthorKeyNew:string = undefined
// 	if (NumAuthors == 1){AuthorKeyNew = selectedEntry.creators.author[0].lastName
// 		} else if (NumAuthors == 2) {AuthorKeyNew =
// 			selectedEntry.creators.author[0].lastName +
// 			" and " + selectedEntry.creators.author[1].lastName
// 		} else if (NumAuthors>2) {AuthorKeyNew = selectedEntry.creators.author[0].lastName + " et al."}
// 	const ZOTERO_REG = new RegExp("\\(" + AuthorKeyNew + ", \\d+, p. \\d+\\)")
// 	return ZOTERO_REG 
// }


export function replaceTagList(selectedEntry:Reference, arrayExtractedKeywords:string[], metadata:string){
	// Copy the keywords extracted by Zotero and store them in an array
	selectedEntry.zoteroTags = []; 
	if(selectedEntry.tags.length>0){
		for (let indexTag = 0; indexTag < selectedEntry.tags.length; indexTag++) {
			selectedEntry.zoteroTags.push(selectedEntry.tags[indexTag].tag)
		}}
	
	//Add to the array the tags extracted by the text
	selectedEntry.zoteroTags = selectedEntry.zoteroTags.concat(arrayExtractedKeywords)

	//Sort the tags in alphabetical order	
	selectedEntry.zoteroTags = selectedEntry.zoteroTags.sort()
	//console.log("Tags = " + selectedEntry.zoteroTags)
	metadata = createTagList(selectedEntry.zoteroTags, metadata)

	if(selectedEntry.zoteroTags.length==0){
		metadata = metadata.replace("# Tags\n", "");
		metadata = metadata.replace("## Tags\n", "");
		metadata = metadata.replace("### Tags\n", "");
	}
	return metadata
} 

 
export function addNewAnnotationToOldAnnotation (existingAnnotation:string, noteElements:AnnotationElements[], doubleSpaceAdd: string ){
	for (let indexNoteElements = noteElements.length-1; indexNoteElements >=0; indexNoteElements--) {		
		if(noteElements[indexNoteElements].foundOld == false){
			const positionReplacement = noteElements[indexNoteElements].positionOld
			const textReplacement = noteElements[indexNoteElements].rowEdited
			//console.log("textReplacement :"+ textReplacement)
			//console.log("positionReplacement :"+ positionReplacement)
			if (textReplacement.length <= 0) {continue}
			//add the text replacement in the position
			// Paste the missing list in the right position
			existingAnnotation = existingAnnotation.slice(0, positionReplacement) + doubleSpaceAdd + "\n" + textReplacement + "\n" + existingAnnotation.slice(positionReplacement)

			// console.log("extractedAnnotations at 354 in the loop iteration"+ indexNoteElements + ": " + extractedAnnotationsTemp) 
		}}
	return existingAnnotation
}

export function openSelectedNote(selectedEntry:Reference, exportTitle:string, exportPath:string){

	const noteTitleFull = createNoteTitle(selectedEntry, exportTitle, exportPath);
	
	//remove from the path of the note to be exported the path of the vault
	const noteTitleShort = noteTitleFull.replace(normalizePath(this.app.vault.adapter.getBasePath())+"/", "")

	//Find the TFile
	const myFile = this.app.vault.getAbstractFileByPath(noteTitleShort)
	
	//Open the Note ina new leaf
	this.app.workspace.getUnpinnedLeaf().openFile(myFile);

}

