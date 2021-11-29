import MyPlugin from "./main";
import { App, Modal, FuzzySuggestModal, Notice } from "obsidian";
import * as fs from "fs";
import * as BibTeXParser from "@retorquere/bibtex-parser";
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
		const bibtex_Array: string[] = [];
		for (let i = 0; i < number_references; i++) {
			bibtex_Array.push(bibParsed.entries[i].key);
		}
		console.log(
			"This bib file has " +
				bibtex_Array.length +
				" entries: " +
				bibtex_Array
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
		//const selectedCiteKey = bibtex_Array[0]
	}

	onClose() {
		// let { contentEl } = this;
		// contentEl.empty();
	}
}

export interface referenceSelection {
	id: number;
	citeKey: string;
	reference: string;
}

// export class selectEntryFromBib extends SuggestModal<referenceSelection> {
//   plugin: MyPlugin;
//   constructor(app: App, plugin: MyPlugin) {
//     super(app);
//     this.plugin = plugin;

//   }

//   // Returns all available suggestions.
//   getSuggestions(query: string): referenceSelection[] {
//     console.log(this.plugin.settings.bibPath)

//     //read the path of the bib file from the settings
//     const bibPath:string = this.plugin.settings.bibPath;

//     //run function to load the bibfile and return a parsed object
//     const bibParsed = this.plugin.loadLibrarySynch(bibPath)

//     //Check the number of references
//     const number_references:number = bibParsed.entries.length
//     console.log("This bib file has " + number_references + " entries")

//     // Extract the citekeys of all the references and store them in an array
//     const bibtex_Array: referenceSelection[] = [];
//     for (let i = 0; i < number_references; i++) {
//       //const authorList : string[] = []
//       //let authorListString: string
//       const bibtex_Array_Item = {} as referenceSelection;
//       bibtex_Array_Item.citeKey =  bibParsed.entries[i].key;
//       bibtex_Array_Item.id = i;
//       const title = bibParsed.entries[i].fields.title
//    //   let author = ""
//       //if (bibParsed.entries[i].creators.author.length>0) {author = bibParsed.entries[i].creators.author[0].lastName}
//     //   for (let k = 0; k < bibParsed.entries[i].creators.author.length; k++){
//     //     const Author = bibParsed.entries[i].creators.author[k].lastName
//     //     authorList.push(Author);
//     //     authorListString = authorList.join(", ") //concatenate teh array to recreate single string
//     // }
//       bibtex_Array_Item.reference = title + " - " + "citekey: " + bibtex_Array_Item.citeKey
//       bibtex_Array.push(bibtex_Array_Item)
//      }

//      return bibtex_Array.filter((referenceSelected) =>
//      referenceSelected.reference.toLowerCase().includes(query.toLocaleLowerCase())
//      )
//     }

//   // Renders each suggestion item.
//   renderSuggestion(referenceSelected: referenceSelection, el: HTMLElement) {
//     el.createEl("div", { text: referenceSelected.reference });
//   }

//   // Perform action on the selected suggestion.
//    onChooseSuggestion(referenceSelected: referenceSelection, evt: MouseEvent | KeyboardEvent) {
//      new Notice(`Selected ${referenceSelected.citeKey}`);

//       // Load Template
//     const templateOriginal = fs.readFileSync(this.plugin.settings.templatePath, 'utf8')
//     const bibPath:string = this.plugin.settings.bibPath;
//     const bibParsed = this.plugin.loadLibrarySynch(bibPath)
//     const selectedEntry = bibParsed.entries[referenceSelected.id]

//      //run function to process the selected chosenCiteKey from bibParsed using templateOriginal
//       this.plugin.parseTemplateBib(selectedEntry, templateOriginal)
//       console.log("Imported Note " + referenceSelected.citeKey)

//   }

// }

export class fuzzySelectEntryFromBib extends FuzzySuggestModal<referenceSelection> {
	plugin: MyPlugin;
	bibParsed: BibTeXParser.Bibliography;

	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
		this.bibParsed = this.plugin.loadLibrarySynch(
			this.plugin.settings.bibPath
		);
	}

	// Returns all available suggestions.
	getItems(): referenceSelection[] {
		console.log(this.plugin.settings.bibPath);

		//read the path of the bib file from the settings
		// const bibPath: string = this.plugin.settings.bibPath;

		//run function to load the bibfile and return a parsed object
		// const bibParsed = this.plugin.loadLibrarySynch(bibPath);

		//Check the number of references
		const number_references: number = this.bibParsed.entries.length;
		console.log("This bib file has " + number_references + " entries");

		// Extract the citekeys of all the references and store them in an array
		const bibtex_Array: referenceSelection[] = [];
		for (let i = 0; i < number_references; i++) {
			//const authorList : string[] = []
			//let authorListString: string
			const bibtex_Array_Item = {} as referenceSelection;
			bibtex_Array_Item.citeKey = this.bibParsed.entries[i].key;
			bibtex_Array_Item.id = i;
			const title = this.bibParsed.entries[i].fields.title;
			//   let author = ""
			//if (bibParsed.entries[i].creators.author.length>0) {author = bibParsed.entries[i].creators.author[0].lastName}
			//   for (let k = 0; k < bibParsed.entries[i].creators.author.length; k++){
			//     const Author = bibParsed.entries[i].creators.author[k].lastName
			//     authorList.push(Author);
			//     authorListString = authorList.join(", ") //concatenate teh array to recreate single string
			// }
			bibtex_Array_Item.reference =
				title + " - " + "citekey: " + bibtex_Array_Item.citeKey;
			bibtex_Array.push(bibtex_Array_Item);
		}

		return bibtex_Array;
	}

	// Renders each suggestion item.
	getItemText(referenceSelected: referenceSelection) {
		return referenceSelected.reference;
	}

	// Perform action on the selected suggestion.
	onChooseItem(
		referenceSelected: referenceSelection,
		evt: MouseEvent | KeyboardEvent
	) {
		new Notice(`Selected ${referenceSelected.citeKey}`);

		// Load Template
		const { templatePath } = this.plugin.settings;
		if (templatePath === "") {
			new Notice("Please select a template first!");
			return;
		}
		const templateOriginal = fs.readFileSync(
			this.plugin.settings.templatePath,
			"utf8"
		);

		if (!templateOriginal) {
			new Notice("Template not found!");
			return;
		}
		// const bibPath: string = this.plugin.settings.bibPath;
		// const bibParsed = this.plugin.loadLibrarySynch(bibPath);
		const selectedEntry = this.bibParsed.entries[referenceSelected.id];

		//run function to process the selected chosenCiteKey from bibParsed using templateOriginal
		this.plugin.parseTemplateBib(selectedEntry, templateOriginal);
		console.log("Imported Note " + referenceSelected.citeKey);
	}
}
