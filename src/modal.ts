import MyPlugin from "./main";
import { App, Modal, FuzzySuggestModal, Notice, Setting } from "obsidian";
import * as fs from "fs";


import { Reference,
		AnnotationElements,
		MyPluginSettings} from "./types";		
		
		
import {
	compareNewOldNotes,
	createAuthorKey,
	createNoteTitle,
	createTagList,
	orderByDateModified,
	replaceMissingFields 
	} from "./utils";
import { DEFAULT_SETTINGS } from "./constants";
import { SettingTab } from "./settings"; 


export class fuzzySelectEntryFromJson extends FuzzySuggestModal<Reference> {
	plugin: MyPlugin;
	template: string;
	selectArray: Reference[]
	allCitationKeys: string[]
	data: {
		collections: {},
		config: {},
		items:{},
		version: {}
		__proto__: Object
	}

	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;

		
	}

	async onOpen() {
 
		//Load the Json file
		const data = require(this.plugin.settings.bibPath)
		

		const bibtexArray: Reference[] = [] 
		for (let index = 0; index < data.items.length; index++) {
			// console.log(index)
			const selectedEntry: Reference = data.items[index]
			const bibtexArrayItem = {} as Reference;

			//Extract the citation key. If the citationkey does not exist skip   

			if(selectedEntry.hasOwnProperty("citationKey")== false) continue
			bibtexArrayItem.citationKey = selectedEntry.citationKey
			// console.log(bibtexArrayItem.citationKey)

		
			//Extract the title key
			bibtexArrayItem.title = selectedEntry.title
			// console.log(bibtexArrayItem.title)

			// Extract the date
			bibtexArrayItem.date = selectedEntry.date
			if (selectedEntry.hasOwnProperty("date")){
				selectedEntry.year = selectedEntry.date.match(/\d\d\d\d/gm)
				bibtexArrayItem.date = selectedEntry.year
			}
			// console.log(bibtexArrayItem.date)

			//Extract the author
			bibtexArrayItem.authorKey = createAuthorKey(selectedEntry.creators)
			// console.log(bibtexArrayItem.authorKey)

			//Extract the date the entri was modified
			bibtexArrayItem.dateModified = selectedEntry.dateModified
			// console.log(bibtexArrayItem.dateModified)
			
			//Create the reference
			bibtexArrayItem.inlineReference = bibtexArrayItem.authorKey +
				", (" + bibtexArrayItem.date + "), " +
				"'" + bibtexArrayItem.title + "'" +
				"\n" + bibtexArrayItem.citationKey
			
				// console.log(bibtexArrayItem.reference)
			bibtexArray.push(bibtexArrayItem);
    }
		// Order the suggestions from the one modified most recently
		bibtexArray.sort(orderByDateModified)

		//Export all citationKeys
		this.allCitationKeys = bibtexArray.map(a => a.citationKey);

		
		//Create a new entry to download the entire library and add it at the beginning of the array
		const selectLibrary:Reference = {
			inlineReference: "Entire Library: "+this.plugin.settings.bibPath,
			citationKey: "Entire Library",
			authorKey: "",
			id: 0,
			year: "",
			itemType: "",
			date: "",
			dateModified: "",
			itemKey: "",
			title: "",
			creators: []
		}
		bibtexArray.unshift(selectLibrary)
		// 	]

		//console.log(bibtexArray.citeKey)
		this.selectArray = bibtexArray 
		await this.updateSuggestions()
		this.data = data

	}
	// Returns all available suggestions.
	getItems(): Reference[] {	
		return this.selectArray
	}

	// Renders each suggestion item.
	getItemText(referenceSelected: Reference) {
		return referenceSelected.inlineReference;
	}
	async updateSuggestions() {
		await super.updateSuggestions();
	}
	// Perform action on the selected suggestion.
	async onChooseItem(
		referenceSelected: Reference,
		evt: MouseEvent | KeyboardEvent
	) {
		new Notice(`Selected ${referenceSelected.citationKey}`); 

		//Load Template
		const templateNote = this.plugin.settings.templateContent;
		
		
		//Find the index of the reference selected
		const indexSelectedReference = this.data.items.findIndex(item => item.citationKey === referenceSelected.citationKey);
		
		//Selected Reference
		const selectedEntry: Reference = this.data.items[indexSelectedReference]
		//console.log(selectedEntry)
		

		//Run function to extract the metadata
		let metadata:string = this.plugin.parseMetadata(selectedEntry, templateNote);
		//console.log("THIS IS THE METADATA " + metadata)
		
		//Define the name and full path of the file to be exported
		const noteTitleFull = createNoteTitle(selectedEntry, this.plugin.settings.exportTitle, this.plugin.settings.exportPath);
		
		
		//Run function to extract the annotation
		let notesArray: string[] = []
		let existingNoteRevised:string = undefined
		let arrayExtractedKeywords: string[] = []
 

		if(this.plugin.settings.exportAnnotations && selectedEntry.notes.length>0){
			//run the function to parse the annotation for each note (there could be more than one)
			let noteElements:AnnotationElements[] = []
			for (let indexNote = 0; indexNote < selectedEntry.notes.length; indexNote++) {
				const noteElementsSingle = this.plugin.parseAnnotationLinesintoElements(selectedEntry, indexNote)
				noteElementsSingle.indexNote = noteElementsSingle
				//concatenate the annotaiton element to the next one
				noteElements = noteElements.concat(noteElementsSingle)
			}

			//Run the function to edit each line
			const resultsLineElements = this.plugin.formatNoteElements(noteElements)
			arrayExtractedKeywords = resultsLineElements.keywordArray

			//Run the function to compare each line with the existing version of the note
			
			let oldFileExists = false;
			let existingNoteNote:string = undefined

			//Check if an old version exists
			if (fs.existsSync(noteTitleFull)) {

				//Import the old version of the note 
				const existingNoteAll = fs.readFileSync(noteTitleFull)
				//Extract only the annotation from the old file
				const positionBeginningOldNotes = existingNoteAll.indexOf("## Extracted Annotations")
				// If there are old notes in the existing file compared the old and new annotations
				if (positionBeginningOldNotes !== -1){
					existingNoteNote = String(existingNoteAll).substring(positionBeginningOldNotes)

					noteElements  = compareNewOldNotes(existingNoteNote, noteElements)

					//console.log("THIS IS THE EXISTING NOTE: " + existingNoteNote)
					let existingNoteRevisedTemp = existingNoteNote
					console.log("Length of noteElements.length: " + noteElements.length)

					//console.log(resultsLineElements.rowEditedArray)
					

					for (let indexNoteElements = noteElements.length-1; indexNoteElements >=0; indexNoteElements--) {		
			
						if(noteElements[indexNoteElements].foundOld == false){
							const positionReplacement = noteElements[indexNoteElements].positionOld
							const textReplacement = noteElements[indexNoteElements].rowEdited
							//console.log("textReplacement :"+ textReplacement)
							if (textReplacement.length <= 0) {continue}
							//add the text replacement in the position
		
							let doubleSpaceAdd = ""
							if(this.plugin.settings.isDoubleSpaced){doubleSpaceAdd = "\n"}

							// Paste the missing list in the right position
							existingNoteRevisedTemp = existingNoteRevisedTemp.slice(0, positionReplacement) + doubleSpaceAdd + "\n" + textReplacement + "\n" + existingNoteRevisedTemp.slice(positionReplacement)

							// console.log("existingNoteRevised at 354 in the loop iteration"+ indexNoteElements + ": " + existingNoteRevisedTemp)
						} 
					}	
					existingNoteRevised = existingNoteRevisedTemp
				} else {
				//If there is an existing file but no annotations (only metadata),  then create the string containing the edited notes 

					const ArrayJoined = resultsLineElements.rowEditedArray.join("\n");
					existingNoteRevised = "\n" + "\n" + "## Extracted Annotations" + "\n" + ArrayJoined
				}
			} else {
				//If there is not an existing file, then create the string containing the edited notes
				// // Turn the annotations in a string including newline symbols
				const ArrayJoined = resultsLineElements.rowEditedArray.join("\n");
				existingNoteRevised = "\n" + "\n" + "## Extracted Annotations" + "\n" + ArrayJoined}
			
		}


		
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

				//delete the missing fields
		const missingFieldSetting = this.plugin.settings.missingfield
		metadata = replaceMissingFields(metadata, missingFieldSetting);


		// Add metadata in front of the annotations
		const finalNote = metadata + 
			"\n" +
			existingNoteRevised
 
	
		//Export the file

		fs.writeFile(noteTitleFull, finalNote, function (err) {
			if (err) console.log(err);
		});
		
	}
}
