import MyPlugin from "./main";
import { App, Modal, FuzzySuggestModal, Notice, Setting } from "obsidian";
import * as fs from "fs";
//import * as BibTeXParser from "@retorquere/bibtex-parser";
//import * as fsp from "fs/promises";
import data from '/Users/stefanopagliari/Desktop/My_Library_json.json';

import { Reference,
		AnnotationElements,
		MyPluginSettings} from "./types";		
		
		
import {
	createAuthorKey,
	createTagList,
	exportNote,
	orderByDateModified,
	replaceMissingFields
	} from "./utils";
import { DEFAULT_SETTINGS } from "./constants";
import { SettingTab } from "./settings";
//const Database = require('better-sqlite3');
//import sqlite3 from 'sqlite3' 
//import Database from 'better-sqlite3';

 

export class importAllBib extends Modal {
	plugin: MyPlugin;
	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		// let { contentEl } = this;
		//read the path of the bib file from the settings
		const bibPath: string = this.plugin.settings.bibPath;

		//run function to load the bibfile and return a parsed object
		const bibParsed = this.plugin.loadLibrarySynch(bibPath);

		//Check the number of references
		const number_references: number = bibParsed.entries.length;
		console.log("This bib file has " + number_references + " entries");

		// Extract the citekeys of all the references and store them in an array
		const bibtexArray: string[] = [];
		for (let i = 0; i < number_references; i++) {
			bibtexArray.push(bibParsed.entries[i].key);
		}
		console.log(
			"This bib file has " +
				bibtexArray.length +
				" entries: " +
				bibtexArray
		);

		// Load Template
		const templateOriginal = fs.readFileSync(
			this.plugin.settings.templatePath,
			"utf8"
		);

		//Loop through all the all the entries in the bib file and process each file
		for (
			let EntryNumber = 0;
			EntryNumber < bibParsed.entries.length;
			EntryNumber++
		) {
			const selectedEntry = bibParsed.entries[EntryNumber];
			//run function to process the selected chosenCiteKey from bibParsed using templateOriginal
			this.plugin.parseTemplateBib(selectedEntry, templateOriginal);
		}
		//const selectedCiteKey = bibtexArray[0]
	}

	onClose() {
		// let { contentEl } = this;
		// contentEl.empty();
	}
}
  
// export class fuzzySelectEntryFromBib extends FuzzySuggestModal<referenceSelection> {
// 	plugin: MyPlugin;
// 	bibParsed: BibTeXParser.Bibliography;
// 	template: string;
// 	selectArray: referenceSelection[]
 

// 	constructor(app: App, plugin: MyPlugin) {
// 		super(app);
// 		this.plugin = plugin;
// 		this.bibParsed = this.plugin.loadLibrarySynch(
// 			this.plugin.settings.bibPath);
// 	}

// 	async onOpen() {
// 		this.template = await fsp.readFile(
// 			this.plugin.settings.templatePath,
// 			"utf8"
// 		);
// 		const number_references: number = this.bibParsed.entries.length;
// 		new Notice(`The imported bib file has ${number_references} entries`);

// 		const bibtexArray: referenceSelection[] = []

// 		for (let i = 0; i < number_references; i++) {

// 			const bibtexArrayItem = {} as referenceSelection;
// 			bibtexArrayItem.citeKey = this.bibParsed.entries[i].key;
// 			bibtexArrayItem.id = i;
// 			const title = this.bibParsed.entries[i].fields.title;

// 			bibtexArrayItem.reference =
// 				title + " - " + "citekey: " + bibtexArrayItem.citeKey;
// 			bibtexArray.push(bibtexArrayItem);
// 		}
// 		this.selectArray = bibtexArray

// 	}
// 	// Returns all available suggestions.
// 	getItems(): referenceSelection[] {
				
// 		return this.selectArray
// 	}

// 	// Renders each suggestion item.
// 	getItemText(referenceSelected: referenceSelection) {
// 		return referenceSelected.reference;
// 	}

// 	// Perform action on the selected suggestion.
// 	async onChooseItem(
// 		referenceSelected: referenceSelection,
// 		evt: MouseEvent | KeyboardEvent
// 	) {
// 		new Notice(`Selected ${referenceSelected.citeKey}`);

// 		// Load Template
// 		const { templatePath } = this.plugin.settings;
// 		if (templatePath === "") {
// 			new Notice("Please select a template first!");
// 			return;
// 		}

// 		// const templateOriginal = fs.readFileSync(
// 		// 	this.plugin.settings.templatePath,
// 		// 	"utf8"
// 		// );

// 		if (!this.template) {
// 			new Notice("Template not found!");
// 			return;
// 		}
// 		// const bibPath: string = this.plugin.settings.bibPath;
// 		// const bibParsed = this.plugin.loadLibrarySynch(bibPath);
// 		const selectedEntry = this.bibParsed.entries[referenceSelected.id];

// 		//run function to process the selected chosenCiteKey from bibParsed using this.template
// 		this.plugin.parseTemplateBib(selectedEntry, this.template);
// 		console.log({ selectedEntry, template: this.template });
// 		console.log("Imported Note " + referenceSelected.citeKey);
// 	}
// }

export class fuzzySelectEntryFromJson extends FuzzySuggestModal<Reference> {
	plugin: MyPlugin;
	template: string;
	selectArray: Reference[]
	allCitationKeys: string[]
	
	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
		
	}

	async onOpen() {
		//const data = $.getJSON('url': this.plugin.settings.bibPath);

		//var json = $.getJSON({'url': "http://spoonertuner.com/projects/test/test.json", 'async': false});  


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
		console.log(templateNote) 
		//data.items.citationKey === referenceSelected.citationKey
		
		//Find the index of the reference selected
		const indexSelectedReference = data.items.findIndex(item => item.citationKey === referenceSelected.citationKey);
		
		//Selected Reference
		const selectedEntry: Reference = data.items[indexSelectedReference]
		console.log(selectedEntry)
		

		//Run function to extract the metadata
		let metadata:string = this.plugin.parseMetadata(selectedEntry, templateNote);
		console.log("THIS IS THE METADATA " + metadata)
		// console.log(this.plugin.settings.exportAnnotations)
		// console.log(selectedEntry.notes.length>0)

		//Run function to extract the annotation
		let notesArray: string[] = []
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
			notesArray = resultsLineElements.rowEditedArray
			arrayExtractedKeywords = resultsLineElements.keywordArray
		}
		
		// Copy the keywords extracted by Zotero and store them in an array
		selectedEntry.zoteroTags = []; 
		if(selectedEntry.tags.length>0){
			for (let indexTag = 0; indexTag < selectedEntry.tags.length; indexTag++) {
				console.log(indexTag)
				console.log(selectedEntry.tags[indexTag].tag)
				selectedEntry.zoteroTags.push(selectedEntry.tags[indexTag].tag)
			}}


		//Add to the array the tags extracted by the text
		selectedEntry.zoteroTags = selectedEntry.zoteroTags.concat(arrayExtractedKeywords)
		//Sort the tags in alphabetical order	
		selectedEntry.zoteroTags = selectedEntry.zoteroTags.sort()
		console.log("Tags = " + selectedEntry.zoteroTags)
		metadata = createTagList(selectedEntry.zoteroTags, metadata)
		if(selectedEntry.zoteroTags.length==0){
			metadata = metadata.replace("# Tags\n", "");
			metadata = metadata.replace("## Tags\n", "");
			metadata = metadata.replace("### Tags\n", "");
			
		}

				//delete the missing fields
		const missingFieldSetting = this.plugin.settings.missingfield

	

		metadata = replaceMissingFields(metadata, missingFieldSetting);

		console.log("AAAAAAAAA")

		// Add metadata in front of the annotations
		notesArray.splice(0, 0, "## Extracted Annotations");
		notesArray.splice(0, 0, "\n");
		notesArray.splice(0, 0, "\n");
		notesArray.splice(0, 0, metadata);

		// Turn the annotations in a string including newline symbols
		const ArrayJoined = notesArray.join("\n");
	
		//Export the file
		const exportPath = this.plugin.settings.exportPath
		const exportTitle = this.plugin.settings.exportTitle
		console.log(exportTitle)

		exportNote(selectedEntry, exportTitle, exportPath, ArrayJoined) ;
		
	}
}


// export class selectJSON extends SuggestModal<referenceSelection> {
// 	plugin: MyPlugin;
// 	template: string;
// 	selectArray: referenceSelection[]

// 	async onOpen() {
// 		const bibtexArray: referenceSelection[] = []
// 		for (let index = 0; index < data.items.length; index++) {
// 			const bibtexArrayItem = {} as referenceSelection;
// 			bibtexArrayItem.citeKey = data.items[index].citationKey
// 			bibtexArrayItem.id = index
// 			bibtexArrayItem.title = data.items[index].title
// 			bibtexArrayItem.reference =
// 				bibtexArrayItem.title + 
// 				" - " + 
// 				"citekey: " + 
// 				bibtexArrayItem.citeKey;
// 			//console.log(bibtexArrayItem)
// 			bibtexArray.push(bibtexArrayItem);
// 		}
// 		//console.log(bibtexArray.citeKey)
// 		this.selectArray = bibtexArray
// 	}

// 	// Returns all available suggestions.
// 	getSuggestions(query: string): referenceSelection[] {
// 		return this.selectArray.filter((reference) =>
// 		reference.reference.toLowerCase().includes(query.toLowerCase()))
// 	}

  
// 	// Renders each suggestion item.
// 	renderSuggestion(referenceSelection: referenceSelection, el: HTMLElement) {
// 		el.createEl("div", { text: referenceSelection.reference});
// 	//   el.createEl("small", { text: book.author });
// 	}
  
// 	// Perform action on the selected suggestion.
// 	onChooseSuggestion(referenceSelection: referenceSelection, evt: MouseEvent | KeyboardEvent) {  
// 	//   new Notice(`Selected ${book.title}`);
// 	}
//   }
 
  
