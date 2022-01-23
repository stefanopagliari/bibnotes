import MyPlugin from "./main";
import * as fs from "fs";
import { App, Modal, FuzzySuggestModal, Notice, Platform } from "obsidian";

// both were not used
// import { Debugout } from "debugout.js";
// const bugout = new Debugout({ realTimeLoggingOn: true });

import { Reference, AnnotationElements } from "./types";

import {
	createAuthorKey,
	createNoteTitle,
	openSelectedNote,
	orderByDateModified,
} from "./utils";

// wasn't used
// import { toEditorSettings } from "typescript";

export class fuzzySelectEntryFromJson extends FuzzySuggestModal<Reference> {
	plugin: MyPlugin;
	template: string;
	selectArray: Reference[];
	allCitationKeys: string[];
	data: {
		collections: Record<string, never>;
		config: Record<string, never>;
		items: Reference[];
		version: string;
		__proto__: Record<string, never>;
	};
	keyWordArray: string[];
	noteElements: AnnotationElements[];

	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
	}
	// Function used to move the cursor in the search bar when the modal is launched
	focusInput() {
		//@ts-ignore
		document.getElementsByClassName("prompt-input")[0].focus();
	}
	async onOpen() {
		if (Platform.isDesktopApp) {
			this.focusInput();
		}

		//Load the Json file

		//Create the full path

		//const data = require(this.app.vault.adapter.getBasePath() + "/" + this.plugin.settings.bibPath)
		const rawdata = fs.readFileSync(
			this.app.vault.adapter.getBasePath() +
				"/" +
				this.plugin.settings.bibPath
		);
		const data = JSON.parse(rawdata.toString()); // rawdata is a buffer, convert to string

		//const checkAdmonition  = this.app.plugins.getPlugin("obsidian-admonition")._loaded

		const bibtexArray: Reference[] = [];
		for (let index = 0; index < data.items.length; index++) {
			// console.log(index)
			const selectedEntry: Reference = data.items[index];
			const bibtexArrayItem = {} as Reference;

			//Extract the citation key. If the citationkey does not exist skip

			if (selectedEntry.hasOwnProperty("citationKey") == false) continue;
			bibtexArrayItem.citationKey = selectedEntry.citationKey;
			// console.log(bibtexArrayItem.citationKey)

			//Extract the title key
			bibtexArrayItem.title = selectedEntry.title;
			// console.log(bibtexArrayItem.title)

			// Extract the date
			bibtexArrayItem.date = selectedEntry.date;
			if (selectedEntry.hasOwnProperty("date")) {
				selectedEntry.year = selectedEntry.date.match(/\d\d\d\d/gm)[0];
				bibtexArrayItem.date = selectedEntry.year;
			}
			// console.log(bibtexArrayItem.date)

			//Extract the author
			bibtexArrayItem.authorKey = createAuthorKey(selectedEntry.creators);
			// console.log(bibtexArrayItem.authorKey)

			//Extract the date the entri was modified
			bibtexArrayItem.dateModified = selectedEntry.dateModified;
			// console.log(bibtexArrayItem.dateModified)

			//Create the reference
			bibtexArrayItem.inlineReference =
				bibtexArrayItem.authorKey +
				", (" +
				bibtexArrayItem.date +
				"), " +
				"'" +
				bibtexArrayItem.title +
				"'" +
				"\n" +
				bibtexArrayItem.citationKey;

			// console.log(bibtexArrayItem.reference)
			bibtexArray.push(bibtexArrayItem);
		}
		// Order the suggestions from the one modified most recently
		bibtexArray.sort(orderByDateModified);

		//Export all citationKeys
		this.allCitationKeys = bibtexArray.map((a) => a.citationKey);

		//Create a new entry to download the entire library and add it at the beginning of the array
		const selectLibrary: Reference = {
			inlineReference: "Entire Library: " + this.plugin.settings.bibPath,
			citationKey: "Entire Library",
			authorKey: "",
			id: 0,
			year: "",
			itemType: "",
			date: "",
			dateModified: "",
			itemKey: "",
			title: "",
			creators: [],
			// added the missing properties
			itemID: 0,
			file: "",
			localLibrary: "",
			select: "",
			attachments: [],
			notes: [],
			tags: [],
			zoteroTags: [],
		};
		bibtexArray.unshift(selectLibrary);
		// 	]

		//console.log(bibtexArray.citeKey)
		this.selectArray = bibtexArray;
		await this.updateSuggestions();
		this.data = data;
	}
	// Returns all available suggestions.
	getItems(): Reference[] {
		return this.selectArray;
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
		//Create an array where you store the citekey to be processed
		let citeKeyToBeProcessed: string[] = [];

		//If the entire library has been selected, then add all the
		if (referenceSelected.citationKey === "Entire Library") {
			console.log("all library selected");
			citeKeyToBeProcessed = citeKeyToBeProcessed.concat(
				this.allCitationKeys
			);
		} else {
			citeKeyToBeProcessed.push(referenceSelected.citationKey);
		}

		// Loop to process the selected note
		for (
			let indexNoteToBeProcessed = 0;
			indexNoteToBeProcessed < citeKeyToBeProcessed.length;
			indexNoteToBeProcessed++
		) {
			//Find the index of the reference selected
			const indexSelectedReference = this.data.items.findIndex(
				(item: { citationKey: string }) =>
					item.citationKey ===
					citeKeyToBeProcessed[indexNoteToBeProcessed]
			);

			//Selected Reference
			const selectedEntry: Reference =
				this.data.items[indexSelectedReference];

			//Create and export Note for select reference
			this.plugin.createNote(selectedEntry, this.data);

			//if the note is the last one to be processed, then open it
			if (indexNoteToBeProcessed == citeKeyToBeProcessed.length - 1) {
				openSelectedNote(
					selectedEntry,
					this.plugin.settings.exportTitle,
					this.plugin.settings.exportPath
				);
			}
		}
	}
}

export class updateLibrary extends Modal {
	plugin: MyPlugin;
	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		console.log("Updating Zotero library");
		//const data = require(this.app.vault.adapter.getBasePath() + "/" + this.plugin.settings.bibPath)

		const rawdata = fs.readFileSync(
			this.app.vault.adapter.getBasePath() +
				"/" +
				this.plugin.settings.bibPath
		);
		const data = JSON.parse(rawdata.toString()); // rawdata is a buffer, converted to string

		const bibtexArray: string[] = [];

		//Check the last time the library was updated
		const lastUpdate = new Date(this.plugin.settings.lastUpdateDate);

		//loop through all the entries in the bibliography to find out which ones have been modified since the last time the library on obsidian was updated.
		for (let index = 0; index < data.items.length; index++) {
			// console.log(index)
			const selectedEntry: Reference = data.items[index];
			const bibtexArrayItem = {} as Reference;

			//Extract the citation key. If the citationkey does not exist skip
			if (selectedEntry.hasOwnProperty("citationKey") == false) continue;
			bibtexArrayItem.citationKey = selectedEntry.citationKey;
			// console.log(bibtexArrayItem.citationKey)

			//Extract the date the entry was modified
			const datemodified = new Date(selectedEntry.dateModified);
			if (datemodified < lastUpdate) continue; //skip if it was modified before the last update
			//console.log(datemodified>lastUpdate)

			//skip if the setting is to update only existing note and th enote is not found at the give folder
			if (
				this.plugin.settings.updateLibrary ===
					"Only update existing notes" &&
				!fs.existsSync(
					createNoteTitle(
						selectedEntry,
						this.plugin.settings.exportTitle,
						this.plugin.settings.exportPath
					)
				)
			)
				continue;

			//Create and export Note for select reference
			this.plugin.createNote(selectedEntry, data);

			bibtexArray.push(selectedEntry.citationKey);
		}

		//Console.log the number of items updated
		new Notice("Updated " + bibtexArray.length + " entries");
		//Update the date when the update was last done
		this.plugin.settings.lastUpdateDate = new Date();
		this.plugin.saveSettings();

		//console.log(this.plugin.settings.lastUpdateDate)
	}

	onClose() {}
}
