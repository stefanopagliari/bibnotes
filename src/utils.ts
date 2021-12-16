import * as BibTeXParser from "@retorquere/bibtex-parser";
import * as fs from "fs";
import { 
	//Reference,
	Creator,
	CreatorArray,
	Reference,
	AnnotationElements
		} from "./types"

import {
		TEMPLATE_BRACKET_REG,
		TEMPLATE_REG,
		} from "./constants";


export function buildAuthorKey(authors: BibTeXParser.Name[]) {
	if (authors.length == 1) return authors[0].lastName;
	else if (authors.length == 2) {
		return authors[0].lastName + " and " + authors[1].lastName;
	} else if (authors.length > 2) {
		return authors[0].lastName + " et al.";
	} else return null;
}

export function buildInTextCite(
	entry: BibTeXParser.Entry,
	pageNumberKey: number
) {
	let inTextCite = "";
	const authors = entry.creators.author;
	inTextCite += buildAuthorKey(authors);

	const { year } = entry.fields;
	inTextCite += ", " + year;

	if (pageNumberKey) inTextCite += ": " + pageNumberKey;

	return "(" + inTextCite + ")";
}

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

export const getNameStr = (name: BibTeXParser.Name) => {
	const { firstName, lastName } = name;
	if (!firstName) return lastName;
	if (!lastName) return firstName;
	return lastName + ", " + firstName;
};

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
		console.log(note)

		let copy = note.slice();
		if (missingfield === "Replace with NA") {
			copy = copy.replace(TEMPLATE_BRACKET_REG, "*NA*").trim();
			copy = copy.replace(TEMPLATE_REG, "*NA*").trim();
		} else if (missingfield === "Remove (entire row)") {
			console.log("Trying to remove all rows with missing field");
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
		console.log(copy)
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

// function escapeRegExp(stringAdd: string) {
// 	return stringAdd.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
// 	}

// // // Call this something else
// function replaceAll(stringAdd: string, find: string, replace: string) {
// return stringAdd.replace(new RegExp(escapeRegExp(find), "g"), replace);
//  } 

export function exportNote(selectedEntry: Reference, exportTitle: string, exportPath: string, note: string) {
	console.log("started the exportNote function")
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
	exportTitle = exportTitle.replace(/[^0-9a-z-A-Z]/g, "")

	const exportPathFull: string = exportPath + "/" + exportTitle + ".md";
	//const normalised = normalizePath(exportPathFull);\
	console.log("started the exportNote function")
	
	fs.writeFile(exportPathFull, note, function (err) {
		if (err) console.log(err);
	});
}