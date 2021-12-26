// Import BibTexParser to parse bib
import * as BibTeXParser from "@retorquere/bibtex-parser";
//Import from types
import { Entry } from "@retorquere/bibtex-parser";
// Import fs to import bib file
import * as fs from "fs";
//import { info, setLevel } from "loglevel";
import { Plugin, Notice } from "obsidian";
import {
	DEFAULT_SETTINGS,
	HTML_TAG_REG,
	PAGE_NUM_REG,
	ZOTFILE_REG,
} from "./constants";

//Import modals from /modal.ts
import {
	fuzzySelectEntryFromJson,
	updateLibrary 
} from "./modal";

//Import sample settings from /settings.ts
import { SettingTab } from "./settings";
import {AnnotationTypes, 
		AnnotationElements,
		MyPluginSettings,
		Reference,
		Collection
	} from "./types";

import {
	addNewAnnotationToOldAnnotation,
	compareNewOldNotes,
	createLocalFileLink,
	createCreatorList,
	createNoteTitle,
	//getZoteroRegex,
	//getFormattingType,
	//handleFormattingType,
	//removeFakeNewlines,
	//oadLibrarySynch,
	makeWiki, 
	removeQuoteFromEnd,
	removeQuoteFromStart,
	replaceAllTemplates, 
	replaceMissingFields,
	replaceTagList,
	replaceTemplate,
	
} from "./utils"; 

export { Entry } from "@retorquere/bibtex-parser";

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	keyWordArray: string[];
	noteElements: AnnotationElements[];

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		//Add Command to Select a single Entry from Bib file via SQL
		this.addCommand({
			id: "importSelectedJson-modal",
			name: "Create/Update Literature Note",
			callback: () => {
				new fuzzySelectEntryFromJson(this.app, this).open();
			},
		});

		//Add Command to Select a single Entry from Bib file via SQL
		this.addCommand({
			id: "updateLibrary-modal",
			name: "Update Library",
			callback: () => {
				new updateLibrary(this.app, this).open();
			},
		});
		

		
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


	



	createFormatting() {
		const {
			highlightCustomTextAfter,
			highlightCustomTextBefore,
			isCommentItalic,
			isCommentBold,
			isCommentHighlighted,
			isCommentBullet,
			isCommentBlockquote,
			isCommentQuote,
			commentCustomTextAfter,
			commentCustomTextBefore,
			isHighlightItalic,
			isHighlightBold,
			isHighlightHighlighted,
			isHighlightBullet,
			isHighlightBlockquote,
			isHighlightQuote,
		} = this.settings;

		//Set the formatting variables based on the highlightsettings
		const [
			highlightItalic,
			highlightBold,
			highlightHighlighted,
			highlightBullet,
			highlightBlockquote,
			highlightQuoteOpen,
			highlightQuoteClose,
		] = [
			isHighlightItalic ? "*" : "",
			isHighlightBold ? "**" : "",
			isHighlightHighlighted ? "==" : "",
			isHighlightBullet ? "- " : "",
			isHighlightBlockquote ? "> " : "",
			isHighlightQuote ? "“" : "",
			isHighlightQuote ? "”" : "",
		];

		const highlightFormatBefore =
			highlightHighlighted +
			highlightBold +
			highlightItalic +
			highlightQuoteOpen;

		const highlightFormatAfter =
			highlightQuoteClose +
			highlightItalic +
			highlightBold +
			highlightHighlighted +
			" " +
			highlightCustomTextAfter;

		const highlightPrepend =
			highlightBullet + highlightBlockquote + highlightCustomTextBefore;

		//Set the formatting variables based on the comments settings
		const commentItalic = isCommentItalic ? "*" : "";
		const commentBold = isCommentBold ? "**" : "";
		const commentHighlighted = isCommentHighlighted ? "==" : "";
		const commentBullet = isCommentBullet ? "- " : "";
		const commentBlockquote = isCommentBlockquote ? "> " : "";
		const commentQuoteOpen = isCommentQuote ? "“" : "";
		const commentQuoteClose = isCommentQuote ? "”" : "";

		//Create formatting to be added before and after highlights
		const commentFormatBefore =
			commentHighlighted + commentBold + commentItalic + commentQuoteOpen;

		const commentFormatAfter =
			commentQuoteClose +
			commentItalic +
			commentBold +
			commentHighlighted +
			commentCustomTextAfter;

		const commentPrepend =
			commentBullet + commentBlockquote + " " + commentCustomTextBefore;

		return {
			highlightFormatBefore,
			highlightFormatAfter,
			highlightPrepend,
			commentFormatBefore,
			commentFormatAfter,
			commentPrepend,
		};
	}
 



	
 

	parseMetadata(selectedEntry: Reference, templateOriginal: string) {
		const {
			exportMetadata,
		} = this.settings;

		// Create Note from Template
		// If setting exportMetadata is false, then replace Template with simply the title
		const template = exportMetadata ? templateOriginal : "# {{title}}";

		//Create Note
		let note = template

		//Replace the author/s
		note = createCreatorList (selectedEntry.creators, "author", note) 
		//Replace the editor/s
		note = createCreatorList (selectedEntry.creators, "editor", note) 



		

		//Create field year
		if (selectedEntry.hasOwnProperty("date")){
			selectedEntry.year = selectedEntry.date.match(/\d\d\d\d/gm)+""}
		
		//Create field ZoteroLocalLibrary
		if (selectedEntry.hasOwnProperty("select")){
			selectedEntry.localLibrary = "[Zotero](" +
				selectedEntry.select +
				")"}

		//create field file
		//if (selectedEntry.hasOwnProperty("attachment.")){
		selectedEntry.file= createLocalFileLink(selectedEntry)

		// Create an array with all the fields
		const entriesArray: string[] = Object.keys(selectedEntry);
		//replace the single-value placeholders with the value of the field
		note = replaceAllTemplates(entriesArray, note, selectedEntry);
		
		//if the abstract is missing, delete Abstract headings
		if(selectedEntry.hasOwnProperty("abstractNote")===false){
			note = note.replace("# Abstract\n", "");
			note = note.replace("## Abstract\n", "");
			note = note.replace("### Abstract\n", "");
			}



		//remove backticks
		note = note.replace(
			/`/g, "'"
			);
		
		// Return the metadata
		return note

	}
// FUNCTION TO PARSE ANNOTATION
	parseAnnotationLinesintoElements(selectedEntry: Reference, indexNote: number) {
		let note = selectedEntry.notes[indexNote].note
		
		// clean the entire annotation
		note = note
		// 	// .replace(
		// 	// 	// Remove HTML tags
		// 	// 	HTML_TAG_REG,
		// 	// 	"")		
		// 	// 	// // Replace backticks
			.replace(
				/`/g, "'"
				)
				// Correct when zotero exports wrong key (e.g. Author, date, p. p. pagenum)
			.replace(
				/, p. p. /g,
				", p. "
			)
			.trim()

		// Split the annotations into an array where each row is an entry 
		let lines = note.split(/<\/h1>|<\/p>/gm)
		
		const noteElements: AnnotationElements[] = []

		//Loop through the lines
		const lengthLines = Object.keys(lines).length
		for (let indexLines = 0; indexLines < lengthLines; indexLines++) {
			const selectedLineOriginal = unescape(lines[indexLines]);
			//Remove HTML tags
			let selectedLine = String(selectedLineOriginal.replace(/<\/?[^>]+(>|$)/g, ""))
		// 	// Replace backticks with single quote
			selectedLine = replaceTemplate(selectedLine, "`", "'");
			//selectedLine = replaceTemplate(selectedLine, "/<i/>", "");
			// 	// Correct encoding issues
			selectedLine = replaceTemplate(selectedLine, "&amp;", "&");
		
		


			//console.log("Line n." +indexLines + ": " + selectedLine)

			const lineElements: AnnotationElements = {
				highlightText: "",
				highlightColour: "",
				annotationType: "",
				citeKey: "",
				commentText: "",
				rowOriginal: selectedLine,
				rowEdited: selectedLine,
				indexNote: undefined,
				foundOld: undefined,
				positionOld: undefined
			}

			//Extract the colour of the highlight
			if (/"color":"#......"/gm.test(selectedLineOriginal)){			
				let highlightColour = String(selectedLineOriginal.match(/"color":"#......"/gm))
				if (highlightColour == null){highlightColour = ""}
				highlightColour = highlightColour.replace("color\":","")
				highlightColour = highlightColour.replace("\"","")
				lineElements.highlightColour = highlightColour
			}

			//Extract the citation within bracket
			if (/\(<span class="citation-item">.*<\/span>\)<\/span>/gm.test(selectedLineOriginal)){			

				lineElements.citeKey = String(selectedLineOriginal.match(/\(<span class="citation-item">.*<\/span>\)<\/span>/gm))
				lineElements.citeKey = lineElements.citeKey.replace("(<span class=\"citation-item\">", "")
				lineElements.citeKey = lineElements.citeKey.replace("<\/span>\)<\/span>", "")
				lineElements.citeKey = "("+lineElements.citeKey+")"
			
			}
			//Find the position where the CiteKey begins
			const beginningCiteKey = selectedLine.indexOf(lineElements.citeKey)
			//console.log("beginningCiteKey: " + beginningCiteKey)

			//Find the position where the citekey ends
			const endCiteKey = selectedLine.indexOf(lineElements.citeKey)+lineElements.citeKey.length
			//console.log("endCiteKey: " + endCiteKey)

			//Extract the text of the annotation
			if (endCiteKey!== 0){
				lineElements.highlightText = selectedLine
						.substring(0, beginningCiteKey- 1)
								.trim();
						
				
			// Remove quotation marks from annotationHighlight
			["“", '"', "`", "'"].forEach(
				(quote) =>
				(lineElements.highlightText = removeQuoteFromStart(
					quote,
					lineElements.highlightText
					))
					);
			//console.log("annotationHighlight after removeQuoteFromStart: "+ annotationHighlight);
			["”", '"', "`", "'"].forEach(
				(quote) =>
				(lineElements.highlightText = removeQuoteFromEnd(
					quote,
					lineElements.highlightText
					))
					);
					//console.log("annotationHighlight after removeQuoteFromEnd: "+ annotationHighlight);
			
			} 



			//Extract the comment made to an annotation (after the citeKey)
			if(endCiteKey>0){
				const annotationCommentAll = selectedLine
									.substring(endCiteKey+1)
									.trim();
				//console.log("annotationCommentAll: "+ annotationCommentAll)

				// 	Extract the first word in the comment added to the annotation
				let firstBlank = annotationCommentAll.indexOf(" ");
				//if (firstBlank===-1){firstBlank = annotationCommentAll.length}
				//console.log("firstBlank:  "+ firstBlank)

				const annotationCommentFirstWord = annotationCommentAll.substring(
						0,
						firstBlank
					);
				//console.log("annotationCommentFirstWord : " + annotationCommentFirstWord)
				// Identify what type of annotation is based on the first word
				lineElements.annotationType = this.getAnnotationType(
					annotationCommentFirstWord,
					annotationCommentAll
				);
				//console.log(lineElements.annotationType)
		
				// Extract the comment without the initial key and store it in  
				lineElements.commentText = ""	
				if (firstBlank == -1){firstBlank = annotationCommentAll.length}
				lineElements.commentText =
					lineElements.annotationType === "noKey" || lineElements.annotationType === "typeComment"
						? annotationCommentAll
						: annotationCommentAll
								.substring(
									firstBlank,
									annotationCommentAll.length
								)
								.trim();
				} 
			else {lineElements.rowEdited = selectedLine }
			
		//Add the element to the array containing all the elements
		noteElements.push(lineElements)
		}
	return noteElements


	}

 
	formatNoteElements(noteElements: AnnotationElements[]) {
		const {
			exportAnnotations,
			isDoubleSpaced,
			exportPath,
		} = this.settings;

		const {
			commentFormatAfter,
			commentFormatBefore,
			commentPrepend,
			highlightFormatAfter,
			highlightFormatBefore,
			highlightPrepend,
		} = this.createFormatting();

		//Create an index of rows to be removed
		const indexRowsToBeRemoved: number[] = []
		const keywordArray: string[] = []
		const rowEditedArray: string[] = []
		

		

		//Run a loop, processing each annotation line one at the time
		for (let i = 0; i < noteElements.length; i++) {

			//Select one element to process
			const lineElements = noteElements[i]
			
			// MERGE HIGHLIGHT WITH THE PREVIOUS ONE ABOVE
			if (lineElements.annotationType === "typeMergeAbove") {
				noteElements[i-1].rowEdited =
					noteElements[i-1].rowEdited +
					" ... " +
					highlightFormatBefore + lineElements.highlightText + highlightFormatAfter +
					lineElements.citeKey;
				
				//Add the highlighted text to the previous one
				indexRowsToBeRemoved.push(i);
			}

			//PREPEND COMMENT TO THE HIGHLIGHTED SENTENCE
			if (lineElements.annotationType === "typeCommentPrepend") {
				//add the comment before the highlight
				lineElements.rowEdited =
					highlightPrepend +
					commentFormatBefore + lineElements.commentText + commentFormatAfter +
					": " +
					highlightFormatBefore + lineElements.highlightText + highlightFormatAfter +
					lineElements.citeKey;
			}

			// 	FORMAT THE HEADERS
			//  Transform header in H1/H2/H3/H4/H5/H6 Level
			if (/typeH\d/.test(lineElements.annotationType)) {
				const lastChar = lineElements.annotationType[lineElements.annotationType.length - 1];
				const level = parseInt(lastChar);
				const hashes = "#".repeat(level);
				lineElements.rowEdited =
					`\n${hashes} ` +
					lineElements.highlightText +
					lineElements.commentText;
			}
 

			//FORMAT KEYWORDS
			// Add highlighted expression to KW
			if (lineElements.annotationType === "typeKeyword") {
				keywordArray.push(lineElements.highlightText);
				indexRowsToBeRemoved.push(i);
			}
			
				//FORMAT HIGHLIGHTED SENTENCES WITHOUT ANY COMMENT
			if (lineElements.annotationType ===  "noKey"){
				if(lineElements.highlightText !== ""){
					lineElements.rowEdited = highlightPrepend +
						highlightFormatBefore + lineElements.highlightText + highlightFormatAfter +
						lineElements.citeKey;
					if(lineElements.commentText !== ""){
						lineElements.rowEdited = lineElements.rowEdited + 
						commentFormatBefore + lineElements.commentText + commentFormatAfter
					}
			// 	//FORMAT THE COMMENTS ADDED OUTSIDE OF ANY ANNOTATION

				} else if (lineElements.highlightText === "" && lineElements.commentText !== ""){
					lineElements.rowEdited = 
						commentFormatBefore + lineElements.commentText + commentFormatAfter
				}

			}
			

			// 	//FORMAT THE COMMENTS ADDED OUTSIDE OF ANY ANNOTATION
			if (lineElements.annotationType === "typeComment") {
				lineElements.rowEdited =
					commentPrepend +
					commentFormatBefore +
					lineElements.commentText +
					commentFormatAfter 
				}
		rowEditedArray.push(lineElements.rowEdited)
		}

		// // //PERFORM THE FOLLOWING OPERATIONS ON THE WHOLE ARRAY

		// Remove the rows with the keywords and other rows to be removed
		if (indexRowsToBeRemoved.length) {
			for (
				let index = indexRowsToBeRemoved.length - 1;
				index >= 0;
				index--
			) { 
				//console.log("indexRowsToBeRemoved : "+ index)
				rowEditedArray.splice(indexRowsToBeRemoved[index], 1);
			}
		}

		// Add empty row in between rows if selected in the settings
		if (isDoubleSpaced) {
			for (let index = rowEditedArray.length - 1; index >= 0; index--) {
				//console.log(index + " isDoubleSpaced")
				rowEditedArray.splice(index, 0, "");
			}
		}

		const resultsLineElements = {
			rowEditedArray: rowEditedArray,
			keywordArray: keywordArray
		}
		return resultsLineElements
	}

	getAnnotationType(
		annotationCommentFirstWord: string,
		annotationCommentAll: string,
	) {
		const {
			keyMergeAbove,
			keyCommentPrepend,
			keyH1,
			keyH2,
			keyH3,
			keyH4,
			keyH5,
			keyH6,
			keyKeyword,
		} = this.settings;
	
		let annotationType = "noKey";
		if (
			annotationCommentFirstWord === keyMergeAbove ||
			annotationCommentAll === keyMergeAbove
		) {
			annotationType = "typeMergeAbove";
		} else if (annotationCommentFirstWord === keyCommentPrepend) {
			annotationType = "typeCommentPrepend";
		} else if (annotationCommentFirstWord === keyH1) {
			annotationType = "typeH1";
		} else if (annotationCommentFirstWord === keyH2) {
			annotationType = "typeH2";
		} else if (annotationCommentFirstWord === keyH3) {
			annotationType = "typeH3";
		} else if (annotationCommentFirstWord === keyH4) {
			annotationType = "typeH4";
		} else if (annotationCommentFirstWord === keyH5) {
			annotationType = "typeH5";
		} else if (annotationCommentFirstWord === keyH6) {
			annotationType = "typeH6";
		}
		if (annotationCommentAll === keyH1) {
			annotationType = "typeH1";
		} else if (annotationCommentAll === keyH2) {
			annotationType = "typeH2";
		} else if (annotationCommentAll === keyH3) {
			annotationType = "typeH3";
		} else if (annotationCommentAll === keyH4) {
			annotationType = "typeH4";
		} else if (annotationCommentAll === keyH5) {
			annotationType = "typeH5";
		} else if (annotationCommentAll === keyH6) {
			annotationType = "typeH6";
		} else if (
			annotationCommentAll === keyKeyword ||
			annotationCommentFirstWord === keyKeyword
		) {
			annotationType = "typeKeyword";
		} 
		return annotationType;
	}

	extractAnnotation(selectedEntry:Reference, noteTitleFull:string){
		let extractedAnnotations = ""
		if(this.settings.exportAnnotations && selectedEntry.notes.length>0){

			//run the function to parse the annotation for each note (there could be more than one)
			let noteElements:AnnotationElements[] = []
			for (let indexNote = 0; indexNote < selectedEntry.notes.length; indexNote++) {
				const noteElementsSingle = this.parseAnnotationLinesintoElements(selectedEntry, indexNote)
				//concatenate the annotaiton element to the next one
				noteElements = noteElements.concat(noteElementsSingle)
				this.noteElements = noteElements
				}

			//Run the function to edit each line
			const resultsLineElements = this.formatNoteElements(noteElements)
			this.keyWordArray = resultsLineElements.keywordArray

			//Create the annotation by merging the individial 
			extractedAnnotations = "\n" + "\n" + "## Extracted Annotations" + "\n" + resultsLineElements.rowEditedArray.join("\n");}			

			//Check if an old version exists. If the old version has annotations then add the new annotation to the old annotaiton
			if (fs.existsSync(noteTitleFull)) {
				const existingNoteAll = fs.readFileSync(noteTitleFull)
				const positionBeginningOldNotes = existingNoteAll.indexOf("## Extracted Annotations")
					//if the existing note does not have "## Extracted Annotations""
				if (positionBeginningOldNotes !== -1){
					const existingAnnotation = String(existingNoteAll).substring(positionBeginningOldNotes)
						this.noteElements  = compareNewOldNotes(existingAnnotation, this.noteElements)

						let doubleSpaceAdd = ""
						if(this.settings.isDoubleSpaced){doubleSpaceAdd = "\n"}
						extractedAnnotations = addNewAnnotationToOldAnnotation (existingAnnotation, this.noteElements, doubleSpaceAdd)
					}
				}
		const extractedNote = {
			extractedAnnotations: extractedAnnotations,
			extractedKeywords: this.keyWordArray 

		}
	return(extractedNote)
	}

	parseCollection(selectedEntry: Reference, data:{}, metadata:string){

		//Create object with all the collections
		const exportedCollections:Collection[] = data.collections;
		
		//identify the ID of the item
		const selectedID = selectedEntry.itemID

		//Create empty array to store information about the collections of the item
		let collectionArray: string[] = []

		//Create empty array to store information about the parent of the collections of the item
		const collectionParentCode: string[] = []
		let collectionParentArray: string[] = []
		const collectionParentParent: string[] = []

		
		//identify the number of collections in the data
		const collectionKeys:string[] = Object.keys(exportedCollections)

		//loop through the collections and search for the ID of the selected reference
		for (let indexCollection = 0; indexCollection < collectionKeys.length; indexCollection++) {
			const collectionName = exportedCollections[collectionKeys[indexCollection]].name
			const collectionItem = exportedCollections[collectionKeys[indexCollection]].items
			const collectionParent = exportedCollections[collectionKeys[indexCollection]].parent
			if(collectionItem.includes(selectedID)){
				collectionArray.push(collectionName)
				collectionParentCode.push(collectionParent)
			}
		}
		

		//loop through the collections and search for the name of the parent collection
		if(collectionParentCode.length>0){
			for (let indexCollection = 0; indexCollection < collectionKeys.length; indexCollection++) {
				if(collectionParentCode.includes(exportedCollections[collectionKeys[indexCollection]].key)){
					collectionParentArray.push(exportedCollections[collectionKeys[indexCollection]].name)
				}
			}
		}

		//loop through the collections and search for the name of the grandparent collection
		if(collectionParentParent.length>0){
			for (let indexCollection = 0; indexCollection < collectionKeys.length; indexCollection++) {
				if(collectionParentParent.includes(exportedCollections[collectionKeys[indexCollection]].key)){
					collectionParentArray.push(exportedCollections[collectionKeys[indexCollection]].name)
				}
			}
		}

		//Sort the collections in alphabetical order
		collectionArray = collectionArray.sort()
		collectionParentArray = collectionParentArray.sort()

		
		//console.log("Tags = " + selectedEntry.zoteroTags)
		//metadata = createTagList(selectedEntry.zoteroTags, metadata)
		//Replace the keywords in the metadata
		if (collectionArray.length > 0) {
			const collectionArrayBraket = 	collectionArray.map(makeWiki);
			metadata = replaceTemplate(
				metadata,
					`[[{{collections}}]]`,
					String(collectionArrayBraket.join("; "))
				);
				metadata = replaceTemplate(
					metadata,
					`{{collections}}`,
					String(collectionArray.join("; "))
				);
			}
		if (collectionParentArray.length > 0) {
			const collectionParentArrayBraket = collectionParentArray.map(makeWiki);
				metadata = replaceTemplate(
					metadata,
						`[[{{collectionsParent}}]]`,
						String(collectionParentArrayBraket.join("; "))
					);
					metadata = replaceTemplate(
						metadata,
						`{{collectionsParent}}`,
						String(collectionParentArray.join("; "))
					);
				}
		return metadata
		

	}


	createNote(selectedEntry: Reference, data:{}){
		
		console.log("Bibnotes Importing reference: " + selectedEntry.citationKey)

		//Load Template
		const templateNote = this.settings.templateContent;

		//Create the metadata
		let metadata:string = this.parseMetadata(selectedEntry, templateNote);

		//Extract the list of collections
		metadata = this.parseCollection(selectedEntry, data, metadata);

		
		//Define the name and full path of the file to be exported
		const noteTitleFull = createNoteTitle(selectedEntry, this.settings.exportTitle, this.settings.exportPath);
			
		//Extract the annotation and the keyword from the text
		const resultAnnotations = this.extractAnnotation (selectedEntry, noteTitleFull)
		const extractedAnnotations = resultAnnotations.extractedAnnotations
		let extractedKeywords = resultAnnotations.extractedKeywords
		if(extractedKeywords== undefined){extractedKeywords = []}

		// Join the tags in the metadata with the tags extracted in the text and replace them in the text
		metadata = replaceTagList(selectedEntry, extractedKeywords, metadata)

		//delete the missing fields in the metadata
		const missingFieldSetting = this.settings.missingfield
		metadata = replaceMissingFields(metadata, missingFieldSetting);

		// Add metadata in front of the annotations
		const finalNote = metadata + 
			"\n" +
			extractedAnnotations

		//Export the file
		fs.writeFile(noteTitleFull, finalNote, function (err) {
				if (err) console.log(err);
			});
		new Notice(`Imported ${selectedEntry.citationKey}!`);

	}
					
}	
 
