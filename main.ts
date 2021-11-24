import {Plugin} from 'obsidian';

//Import sample settings from /settings.ts
import {SettingTab} from "./settings";

//Import modals from /modal.ts
import { importAllBib } from "./modal";
// import { selectEntryFromBib } from "./modal";
import { fuzzySelectEntryFromBib } from "./modal";



// Import BibTexParser to parse bib
import * as BibTeXParser from '@retorquere/bibtex-parser';
// Import fs to import bib file
import * as fs  from 'fs';

//Import from types
import { Entry } from '@retorquere/bibtex-parser';
export { Entry } from '@retorquere/bibtex-parser';
 



//Settings Interface
interface MyPluginSettings {
	bibPath: string;
	exportMetadata: boolean;
	exportAnnotations: boolean;
	templatePath: string;
	exportPath: string;
	missingfield: string;
	keyMergeAbove: string;
	keyCommentPrepend:string;
	keyH1: string;
	keyH2: string;
	keyH3: string;
	keyH4: string;
	keyH5: string;
	keyH6: string;
	keyKeyword: string;
	highlightStart: string;
	commentStart: string;
	highlightItalic: boolean;
	highlightBold: boolean;
	highlightHighlighted: boolean;
	highlightBullet: boolean;
	highlightBlockquote: boolean;
	highlightQuote: boolean;
	highlightCustomTextBefore: string;
	highlightCustomTextAfter: string;
	commentItalic: boolean;
	commentBold: boolean;
	commentHighlighted: boolean;
	commentBullet: boolean;
	commentBlockquote: boolean;
	commentQuote: boolean;
	commentCustomTextBefore: string;
	commentCustomTextAfter: string;
	doubleSpaced: boolean
}


const DEFAULT_SETTINGS: MyPluginSettings = {
	bibPath: 'default',
	exportMetadata: true,
	exportAnnotations: true,
	templatePath: 'default',
	exportPath: 'default',
	missingfield: 'Leave placeholder',
	keyMergeAbove: '+',
	keyCommentPrepend: "%",
	keyH1: "#",
	keyH2: "##",
	keyH3: "###",
	keyH4: "####",
	keyH5: "#####",
	keyH6: "######",
	keyKeyword: "=",
	highlightStart: "Bullet points",
	commentStart: "Blockquotes",
	highlightItalic: true,
	highlightBold: false,
	highlightHighlighted: false,
	highlightBullet: true,
	highlightBlockquote: false,
	highlightQuote: true,
	commentItalic: false,
	commentBold: true,
	commentHighlighted: false,
	commentBullet: false,
	commentBlockquote: true,
	commentQuote: false,
	doubleSpaced: true,
	highlightCustomTextBefore: "",
	highlightCustomTextAfter: "",
	commentCustomTextBefore: "",
	commentCustomTextAfter: ""
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
		
		//Add Command to Import Bib file 
		this.addCommand({
			id: "importAllBib-modal",
			name: "Import Entire Bibliography",
			callback: () => {
			new importAllBib(this.app, this).open();
			},
		});

		//Add Command to Import Bib file 
		// this.addCommand({
		// 	id: "importSelectedBib-modal",
		// 	name: "Select References from Bibliography",
		// 	callback: () => {
		// 	new selectEntryFromBib(this.app, this).open();
		// 	},
		// });

		//Add Command to Import Bib file 
		this.addCommand({
			id: "importSelectedBib-modal",
			name: "Select References from Bibliography (Fuzzy)",
			callback: () => {
			new fuzzySelectEntryFromBib(this.app, this).open();
			},
		});

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	loadLibrarySynch (filepath:string) {
		console.log("Loading library at " + filepath)

		// Read the bib/Json file
		const bibAll = fs.readFileSync(filepath);
	
		// Parse the bib file using BibTexParser
		const bibParsed = BibTeXParser.parse(bibAll.toString().substring(0));
		
		//Check the number of references
		console.log("Bib file has " + bibParsed.entries.length + " entries")
		return bibParsed
	}

	
	parseTemplateBib (selectedEntry: Entry, templateOriginal:string) {

		//Create Note from Template
		let Note = templateOriginal
 
		// If setting exportMetadata is false, then replace Template with simply the title
		if (this.settings.exportMetadata == false){
			Note = "# {{title}}"
		}
		
			

		

		

		//Create the list of authors when there is more than one
		const authorList : string[] = []
		const authorListBracket : string[] = []
		
		if(selectedEntry.creators.hasOwnProperty('author') && selectedEntry.creators.author.length>1){
			for (let k = 0; k < selectedEntry.creators.author.length; k++){
				const Author = selectedEntry.creators.author[k].lastName + ", " + selectedEntry.creators.author[k].firstName;
				authorList.push(Author);
				authorListBracket.push("[[" + Author + "]]");
				const authorListString = authorList.join("; ") //concatenate teh array to recreate single string
				const authorListBracketString = authorListBracket.join(", ")
			
			Note = replaceAll(Note,"[[{{author}}]]", authorListBracketString);
			Note = replaceAll(Note,"{{author}}", authorListString);
		}}
 
		//Create the list of editors when there is more than one
		const editorList : string[] = []
		const editorListBracket : string[] = []
		if(selectedEntry.creators.hasOwnProperty('editor') && selectedEntry.creators.editor.length>1){
			for (let k = 0; k < selectedEntry.creators.editor.length; k++){
				const Editor = selectedEntry.creators.editor[k].lastName + ", " + selectedEntry.creators.editor[k].firstName;
				editorList.push(Editor);
				editorListBracket.push("[[" + Editor + "]]");
				const editorListString = editorList.join("; ") //concatenate teh array to recreate single string
				const editorListBracketString = editorListBracket.join(", ")
			
			Note = replaceAll(Note,"[[{{editor}}]]", editorListBracketString);
			Note = replaceAll(Note,"{{editor}}", editorListString);
		}}
	
		// Create an array with all the fields
		const entriesArray: string[] = [];
		Object.keys(selectedEntry.fields).forEach(key => entriesArray.push(key));

		// loop to replace the values in the template with values in Zotero_Properties
		for (let z = 0; z < entriesArray.length; z++){
			// 	 Identify the keyword to be replaced
				const KW = entriesArray[z]
				const KW_Brackets = "{{" + entriesArray[z] + "}}"
			// 	 replace the keyword in the template
				Note = replaceAll(Note,KW_Brackets, `${selectedEntry.fields[KW]}`)
				
			}
		
		// replace the citekey	
		Note = replaceAll(Note,"{{citekey}}", selectedEntry.key)

		// replace the item type
		Note = replaceAll(Note,"{{itemtype}}", selectedEntry.type)


		console.log(this.settings.missingfield)
		// Replace elements that missing with NA if option is selected in the settings  
		if(this.settings.missingfield == "Replace with NA"){
			Note = Note.replace(/\[\[\{\{[^}]+\}\}\]\]/g, "*NA*").trim();
			Note = Note.replace(/\{\{[^}]+\}\}/g, "*NA*").trim();		}
		
		// Remove fields (entire line) that are missing is the option is selected in settings
		if(this.settings.missingfield == "Remove (entire row)"){
			console.log("Trying to remove all rows with missing field")
			const templateArray = Note.split(/\r?\n/); //split the template in rows
		// 	run function to determine where we still have double curly brackets
			for (let j=0; j<templateArray.length; j++) {
    
        
				if (templateArray[j].match("{{[^}]+}}")) {
					templateArray.splice(j, 1);
				j--;
				} 
			}
			Note = templateArray.join("\n") //concatenate the array to recreate single string
		

		}
 
		// EXPORT ANNOTATION
		//Check the settings whether to export annotations and whether the selected source has notes 
		

		if (this.settings.exportAnnotations == true && entriesArray.includes("note")){
		// if (this.settings.exportAnnotations == true){

		
			//store the annotation in a element called annotationsOriginal
			const annotationsOriginal = selectedEntry.fields.note

			let annotationsNoFakeNewLine = replaceAll(annotationsOriginal[0], "\n\n", "REALNEWLINE");
			annotationsNoFakeNewLine = replaceAll(annotationsNoFakeNewLine, "\n", "");
			annotationsNoFakeNewLine = replaceAll(annotationsNoFakeNewLine, "REALNEWLINE", "\n");


			const annotationsOriginalNoTags = annotationsNoFakeNewLine.replace(/(&lt;([^>]+)>)/gi, "");
		
			
		
		
			// Set an array that collect the keywords from the highlight
			const keywordArray : string[] = [] 
			
			// Set an array that collect the number of the rows to be removed  
			const indexRowsToBeRemoved : number[] = [] 
		
			
			//split the original annotation in separate rows
			
			let annotationsArray = annotationsOriginalNoTags.split(/\r?\n/); 
		
			// remove the empty rows from the array
			annotationsArray = annotationsArray.filter((a) => a);
		


 


	
		
		// Remove the first row (Annotation title)
		annotationsArray.splice(0, 1)

		
		// Identify the key with the author name, year, and page number added by Zotero at the end of each  highlighted sentence. This does not work with notes extracted from Zotfile
		const authorKeyZotero = new RegExp("\\(" + selectedEntry.creators.author[0].lastName + ".*, p. \\d+\\)") 

		const authorKeyZotfile = new RegExp("\\(zotero://open-pdf/library/items/\\w+\\?page=\\d+\\)")
         
		//Set the formatting variables based on the highlightsettings
		let highlightItalic = ""
		if(this.settings.highlightItalic == true){highlightItalic = "*"}
		
		let highlightBold = ""
		if(this.settings.highlightBold == true){highlightBold= "**"}
		
		let highlightHighlighted = ""
		if(this.settings.highlightHighlighted == true){highlightHighlighted= "=="}
		
		let highlightBullet = ""
		if(this.settings.highlightBullet == true){highlightBullet = "- "}

		let highlightBlockquote = ""
		if(this.settings.highlightBlockquote == true){highlightBlockquote = "> "}

		let highlightQuoteOpen = ""
		if(this.settings.highlightQuote == true){highlightQuoteOpen = "“"}

		let highlightQuoteClose = ""
		if(this.settings.highlightQuote == true){highlightQuoteClose = "”"}
 
		//Create formatting to be added before and after highlights
		const highlightFormatBefore =  highlightHighlighted + highlightBold + highlightItalic + highlightQuoteOpen

		const highlightFormatAfter =  highlightQuoteClose + highlightItalic + highlightBold + highlightHighlighted + " " + this.settings.highlightCustomTextAfter

		const highlightPrepend = highlightBullet + highlightBlockquote + this.settings.highlightCustomTextBefore


		//Set the formatting variables based on the comments settings
		let commentItalic = ""
		if(this.settings.commentItalic == true){commentItalic = "*"}
		
		let commentBold = ""
		if(this.settings.commentBold == true){commentBold= "**"}
		
		let commentHighlighted = ""
		if(this.settings.commentHighlighted == true){commentHighlighted= "=="}
		
		let commentBullet = ""
		if(this.settings.commentBullet == true){commentBullet = "- "}

		let commentBlockquote = ""
		if(this.settings.commentBlockquote == true){commentBlockquote = "> "}

		let commentQuoteOpen = ""
		if(this.settings.commentQuote == true){commentQuoteOpen = "“"}

		let commentQuoteClose = ""
		if(this.settings.commentQuote == true){commentQuoteClose = "”"}
 
		//Create formatting to be added before and after highlights
		const commentFormatBefore = commentHighlighted + commentBold + commentItalic + commentQuoteOpen

		const commentFormatAfter =  commentQuoteClose + commentItalic + commentBold + commentHighlighted + this.settings.commentCustomTextAfter

		const commentPrepend = commentBullet + commentBlockquote + " " + this.settings.commentCustomTextBefore




		// LOOP EACH ROW (ELEMENT OF THE ARRAY)
		for (let index = 0; index < annotationsArray.length; index++) {
			console.log("-----------------------------")
			console.log("ENTRY: " + selectedEntry.key + " - Row Num: " + index) 


			
			console.log("ORIGINAL NOTE: " + annotationsArray[index])

            //Check if the annotations have been extracted via Zotero Native Reader or Zotfile
            let AnnotationType:string = undefined
            if(authorKeyZotero.exec(annotationsArray[index])!==null){
                 AnnotationType = "Zotero"}
            if(authorKeyZotfile.exec(annotationsArray[index])!==null){
                 AnnotationType = "Zotfile"}    
            console.log("AnnotationType: " + AnnotationType)
			if (AnnotationType !== "Zotfile" && AnnotationType !== "Zotero") { continue; }

			//if the annotation is from Zotfile then merge the comment in the next row to the related highlight. This is to address the way zotfile export comments to highlights as independent entries while Zotero exports them on the same row as the highlight they are related to
		if(AnnotationType == "Zotfile" && annotationsArray[index+1].slice(0, 3)=="<i>"){
                annotationsArray[index+1] = annotationsArray[index+1].replace("<i>", "");  
				annotationsArray[index+1] = annotationsArray[index+1].replace("</i>", "");  
				annotationsArray[index+1] = annotationsArray[index+1].replace(authorKeyZotfile, "");  
                annotationsArray[index] = annotationsArray[index] + " " + annotationsArray[index+1]
                indexRowsToBeRemoved.push(index+1)

            } 
		// if the row has been flagged as "toberemoved", skip
			if(indexRowsToBeRemoved.includes(index)){ continue; }
			
			//Remote HTML Tags
			annotationsArray[index] = annotationsArray[index].replace(/<\/?[^>]+(>|$)/g, "");


            //Find the index with the starting point of the text within brackets following the character where the highlight/comment  
            let authorMatch = undefined
            if (AnnotationType == "Zotero"){authorMatch = authorKeyZotero.exec(annotationsArray[index])}
            if (AnnotationType == "Zotfile"){authorMatch = authorKeyZotfile.exec(annotationsArray[index]); }

            //Turn the index into a string            
			let authorMatchString = authorMatch + ""; 

			//  Find the index with the end point of the text within brackets following the character where the highlight/comment 
			const authorMatchEnd = authorMatch.index + authorMatch[0].length 
            console.log(authorMatchEnd)
			
			//extract the comment to the annotation found after the authorKey (authordatepage)
			let annotationCommentAll = annotationsArray[index].substr(authorMatchEnd+1) 
			annotationCommentAll = annotationCommentAll.trim() // remove white spaces
			
			//Extract the first word in the comment added to the annotation
			const spaceIndex = annotationCommentAll.indexOf(' ');
			const annotationCommentFirstWord = annotationCommentAll.substr(0, spaceIndex);


			//  Identify what type of formatting needs to be applied to this row based on the first word
			let annotationType =  "noKey";
			if(annotationCommentFirstWord == this.settings.keyMergeAbove){annotationType = "typeMergeAbove"}
			if(annotationCommentAll == this.settings.keyMergeAbove){annotationType = "typeMergeAbove"}
			if(annotationCommentFirstWord == this.settings.keyCommentPrepend){annotationType = "typeCommentPrepend"}
			if(annotationCommentFirstWord == this.settings.keyH1){annotationType = "typeH1"}
			if(annotationCommentFirstWord == this.settings.keyH2){annotationType = "typeH2"}
			if(annotationCommentFirstWord == this.settings.keyH3){annotationType = "typeH3"}
			if(annotationCommentFirstWord == this.settings.keyH4){annotationType = "typeH4"}
			if(annotationCommentFirstWord == this.settings.keyH5){annotationType = "typeH5"}
			if(annotationCommentFirstWord == this.settings.keyH6){annotationType = "typeH6"}
			if(annotationCommentAll == this.settings.keyH1){annotationType = "typeH1"}
			if(annotationCommentAll == this.settings.keyH2){annotationType = "typeH2"}
			if(annotationCommentAll == this.settings.keyH3){annotationType = "typeH3"}
			if(annotationCommentAll == this.settings.keyH4){annotationType = "typeH4"}
			if(annotationCommentAll == this.settings.keyH5){annotationType = "typeH5"}
			if(annotationCommentAll == this.settings.keyH6){annotationType = "typeH6"}
			if(annotationCommentFirstWord == this.settings.keyKeyword){annotationType = "typeKeyword"}
			if(annotationCommentAll == this.settings.keyKeyword){annotationType = "typeKeyword"}
			if(annotationsArray[index].startsWith(authorMatchString)){annotationType = "typeComment"}
			console.log("TYPE: " + annotationType)
			console.log("COMMENT: " + annotationCommentAll)


			// Extract the highlighted text and store it in variable annotationHighlight
			let annotationHighlight = annotationsArray[index].substr(0, authorMatch.index-1).trim(); //extract the comment to the annotation

			// Remove quotation marks from annotationHighlight
			console.log(annotationHighlight.charAt(0))
			while(annotationHighlight.charAt(0) == '“')
			{annotationHighlight = annotationHighlight.substring(1);}
			while(annotationHighlight.charAt(0) == '"')
			{annotationHighlight = annotationHighlight.substring(1);}
			while(annotationHighlight.charAt(0) == '`')
			{annotationHighlight = annotationHighlight.substring(1);}
			while(annotationHighlight.charAt(annotationHighlight.length-1) === '”')
			{annotationHighlight = annotationHighlight.substring(0, annotationHighlight.length-1);}
			while(annotationHighlight.charAt(annotationHighlight.length-1) === '"')
			{annotationHighlight = annotationHighlight.substring(0, annotationHighlight.length-1);}
			while(annotationHighlight.charAt(annotationHighlight.length-1) === '`')
			{annotationHighlight = annotationHighlight.substring(0, annotationHighlight.length-1);}

			console.log("HIGHLIGHT: " + annotationHighlight)
			
			// FORMATTING HIGHLIGHT
			//   add the markdown formatting for the highlight (e.g. bold, italic, highlight)
			// set the markdown formatting  for the highlighted text (e.g. bold, italic, highlight)
			const annotationHighlightFormatted = highlightFormatBefore + annotationHighlight + highlightFormatAfter

			// FORMATTING COMMENT
			// Extract the comment without the initial key and store it in var annotationCommentNoKey
			let annotationCommentNoKey: string = undefined
			if (annotationType == "noKey"){annotationCommentNoKey=annotationCommentAll} else if 
			(annotationType == "typeComment"){annotationCommentNoKey=annotationCommentAll} else {
				annotationCommentAll = annotationCommentAll + " ";
				annotationCommentNoKey = annotationCommentAll.substr(annotationCommentAll.indexOf(" ") + 1, annotationCommentAll.length);
				annotationCommentNoKey = annotationCommentNoKey.trim()
			}


			// CORRECT THE PAGE NUMBER
			let pageNumberKey = undefined
			let pageNumberPDF = undefined
			let pdfID = undefined
			//let authorMatchStringAdjusted = undefined
			
            if (AnnotationType == "Zotero"){
                //extract the zotero ID of the PDF from the URI
                const URI = selectedEntry.fields.uri;
                const pdfID = URI.toString().substring(URI.toString().length-8); 
                
                // Find the page number exported by Zotero
                const regexPage = new RegExp(/([0-9]+)\)/);
                authorMatchString = authorMatch.toLocaleString()
                const pageNumberExported = regexPage.exec(authorMatchString);
				
				//  Find the publication page number in the Metadata
				const pageNumberMetadata = selectedEntry.fields.pages + "";
                console.log(pageNumberMetadata)
				let pageNumberMetadataStart = parseInt(pageNumberMetadata.split("–")[0],10); //find the initial page in the metadata
				if (isNaN(pageNumberMetadataStart)){pageNumberMetadataStart = 1}
				let pageNumberMetadataEnd = parseInt(pageNumberMetadata.split("–")[1], 10); // find the final page in the metadata
				if (isNaN(pageNumberMetadataEnd)){pageNumberMetadataEnd = 1000000000}
				console.log(pageNumberMetadataEnd)
				//  check if the number exported by Zotero falls within the page range in the metadata
				const pageNumberExportedCorrected = parseInt(pageNumberExported+"", 10);
				console.log(pageNumberExportedCorrected)
				const pageNumberExportedCorrectedCheck = (pageNumberExportedCorrected>=pageNumberMetadataStart && pageNumberExportedCorrected<=pageNumberMetadataEnd)
			
				//  if the pagenumber exported by Zotero is journal one, then identify the PDF page number
				if (pageNumberExportedCorrectedCheck ==true){
					pageNumberKey = pageNumberExportedCorrected;
					pageNumberPDF = pageNumberExportedCorrected - pageNumberMetadataStart + 1}
			// if the pagenumber exported by Zotero is  the PDF page, correct the journal page number 
			else {
				pageNumberKey = pageNumberExportedCorrected + pageNumberMetadataStart-1;
				pageNumberPDF = pageNumberExportedCorrected;

				// authorMatchStringAdjusted = authorMatchString.replace(", p. " + pageNumberExportedCorrected , ", p. " + pageNumberKey) //replace the page number to indicate the number in the actual publication rather than the pdf page
			}

			
            }
			if (AnnotationType == "Zotfile"){
                //extract the zotero ID of the PDF from the URI
                const URI = selectedEntry.fields.uri;
                pdfID = URI.toString().substring(URI.toString().length-8); 
                
                // Find the page number exported by Zotero
                const regexPage = new RegExp(/([0-9]+)\)/);
                authorMatchString = authorMatch.toLocaleString()
                const pageNumberExported = regexPage.exec(authorMatchString);

				pageNumberPDF = parseInt(pageNumberExported)
			
				//  Find the publication page number in the Metadata
				const pageNumberMetadata = selectedEntry.fields.pages + "";
				let pageNumberMetadataStart = parseInt(pageNumberMetadata.split("–")[0],10); //find the initial page in the metadata
				if (isNaN(pageNumberMetadataStart)){pageNumberMetadataStart = 1}
				
				//Derive the page in the journal article by adding the page of the pdf to the page number in the metadata
				pageNumberKey = pageNumberPDF + pageNumberMetadataStart-1;
 
				// authorMatchStringAdjusted = authorMatchString.replace(", p. " + pageNumberExportedCorrected , ", p. " + pageNumberKey) //replace the page number to indicate the number in the actual publication rather than the pdf page
			}

			//Identify Author from the metadata
			let authorKey = undefined
			if(selectedEntry.creators.author.length==1){authorKey = selectedEntry.creators.author[0].lastName}
			if(selectedEntry.creators.author.length==2){authorKey = selectedEntry.creators.author[0].lastName + " and " + selectedEntry.creators.author[1].lastName}
			if(selectedEntry.creators.author.length>2){authorKey = selectedEntry.creators.author[0].lastName + " et al."}
 
			//add the year to the author
			authorKey = authorKey + ", " + selectedEntry.fields.year

			//add the brackets to the page number to the author/year
			if(pageNumberKey != undefined){authorKey = authorKey + ": " + pageNumberKey}


			//add the brackets to the author/year
			authorKey = "(" + authorKey + ")"
			console.log(authorKey)




			
			//Create a correct author/year/page key that includes a link to the Zotero Reader
			const keyAdjusted:string = " [" + authorKey + "]" + "(zotero://open-pdf/library/items/" + pdfID + "?page=" + pageNumberPDF + ")" //created a corrected citation that includes the proper page number and the link to the relevant page in Zotero
			console.log("REFERENCE: " + keyAdjusted)
			
			//  create a link to the pdf without citing the author/year
			const keyAdjustedNoReference:string = " [" + "]" + "(zotero://open-pdf/library/items/" + pdfID + "?page=" + pageNumberPDF + ")"

			// Replace the page number exported by Zotero with the corrected page number including the link
			annotationsArray[index] = replaceAll(annotationsArray[index], authorMatchString , keyAdjusted);
	
	
	
		// MERGE HIGHLIGHT WITH THE PREVIOUS ONE ABOVE
		if(annotationType == "typeMergeAbove"){
			//annotationsArray[index] = annotationsArray[index].replace(this.settings.keyMergeAbove, ""); //remove the keyMergeAbove from the beginning
		
			// annotationsArray[index] = annotationsArray[index].replace(this.settings.keyMergeAbove, ""); //remove the keyMergeAbove from the beginning
		
			annotationsArray[index-1] = annotationsArray[index - 1] + " ... " + annotationHighlightFormatted + keyAdjusted

			//Add the highlighted text to the previous one
			indexRowsToBeRemoved.push(index)
			//console.log("To be removed = TRUE")
		} 
		
		//PREPEND COMMENT TO THE HIGHLIGHTED SENTENCE
		if(annotationType == "typeCommentPrepend"){
			//add the comment before the highlight
			annotationsArray[index] = highlightPrepend + commentFormatBefore + annotationCommentNoKey.trim() + commentFormatAfter + ": " + annotationHighlightFormatted + keyAdjusted
			console.log("OUTPUT: " + annotationsArray[index])
		}

		//FORMAT THE HEADERS
		
		//  Transform header in H1/H2/H3/H4/H5/H6 Level
		if(annotationType == "typeH1"){
			annotationsArray[index] = "\n#" + " "+ annotationHighlight + annotationCommentNoKey.trim()
			//Add empty row before the headline
			annotationsArray.splice(index, 0, "");
		} 
		if(annotationType == "typeH2"){
			annotationsArray[index] = "\n##" + " "+ annotationHighlight + annotationCommentNoKey.trim()
		
			//Add empty row before the headline
			annotationsArray.splice(index, 0, "");

		} 
		if(annotationType == "typeH3"){
			annotationsArray[index] = "\n###" + " "+ annotationHighlight + annotationCommentNoKey.trim()
			//Add empty row before the headline
			annotationsArray.splice(index, 0, "");
		} 
		if(annotationType == "typeH4"){
			annotationsArray[index] = "\n####" + " "+ annotationHighlight + annotationCommentNoKey.trim()
			
			//Add empty row before the headline
			annotationsArray.splice(index, 0, "");
		} 
		if(annotationType == "typeH5"){
			annotationsArray[index] = "\n#####" + " "+ annotationHighlight + annotationCommentNoKey.trim()
			
			//Add empty row before the headline
			annotationsArray.splice(index, 0, "");
		} 
		if(annotationType == "typeH6"){
			annotationsArray[index] = "\n######" + " "+ annotationHighlight + annotationCommentNoKey.trim()
			
			//Add empty row before the headline
			annotationsArray.splice(index, 0, "");
		} 

		//FORMAT KEYWORDS
		// Add highlighted expression to KW
		if(annotationType == "typeKeyword"){
			keywordArray.push(annotationHighlight)
			indexRowsToBeRemoved.push(index)
		} 

		//FORMAT HIGHLIGHTED SENTENCES WITHOUT ANY COMMENT
		// if (annotationType ===  "noKey"){
		// 	annotationsArray[index] = annotationHighlightFormatted + keyAdjusted;
		// 	if (annotationCommentAll != "") {
		// 		annotationsArray[index] = annotationsArray[index]  + commentFormat + annotationCommentAll.trim() + commentFormat}
		// }
		
		// FORMAT HIGHLIGHTED SENTENCES
		if(annotationType ===  "noKey") {
		annotationsArray[index] = highlightPrepend + annotationHighlightFormatted + keyAdjusted
		}  

		//FORMAT THE COMMENTS ADDED OUTSIDE OF ANY ANNOTATION
		if (annotationType === "typeComment"){
			annotationsArray[index] = commentPrepend + commentFormatBefore + annotationCommentNoKey.trim() + commentFormatAfter + keyAdjustedNoReference
		}

		// Replace backticks with single quote
		annotationsArray[index] = replaceAll(annotationsArray[index], "`", "'")
		annotationsArray[index] = annotationsArray[index].replace(/<\/?[^>]+(>|$)/g, "");
		annotationsArray[index] = replaceAll(annotationsArray[index], "/<i/>", "")

		// Correct encoding issues
		annotationsArray[index] = replaceAll(annotationsArray[index], "&amp;", "&")
		

		

		


	}
	// //PERFORM THE FOLLOWING OPERATIONS ON THE WHOLE ARRAY

	//  Trim the white space at the beginning and end of each row
	annotationsArray = annotationsArray.map(el => el.trim());


	//  Remove the rows with the keywords and other rows to be removed
	if (indexRowsToBeRemoved.length > 0) {
	for (let index = indexRowsToBeRemoved.length - 1 ; index >=0; index--) {
		annotationsArray.splice(indexRowsToBeRemoved[index], 1);
	}
	}

	
	
	// // Add empty row in between rows if selected in the settings
	if (this.settings.doubleSpaced == true){
	for (let index = annotationsArray.length - 1 ; index >=0; index--) {
		annotationsArray.splice(index, 0, "");
	}
}
	// }

 
		// Turn the annotations in a string including newline symbols
		const annotationsArrayJoined = annotationsArray.join("\n")
	
		// Merge the annotations to the metadata
		Note = Note + "\n" + annotationsArrayJoined //paste the annotations

		

	// }

		}	
	


		// EXPORT NOTE
		const exportName:string = selectedEntry.key
		const exportPath: string = this.settings.exportPath
		const exportPathFull:string = exportPath + exportName + ".md"
		fs.writeFile(exportPathFull, Note, function (err) {
				if (err) return console.log(err);
			});
	}
	
	
	
	
	// loadLibraryAsynch (filepath:string) {
	// 	console.log("Loading library at " + filepath)

	// 	// Read the bib/Json file
	// 	const bibAll = fs.readFile(filepath);
	// 	  // Unload current library.

	
	// 	// Parse the bib file using BibTexParser
	// 	const bibParsed = BibTeXParser.parse(bibAll.toString().substring(0));
		
	// 	//Check the number of references
	// 	console.log("Bib file has " + bibParsed.entries.length + " entries")
	// 	return bibParsed
	// }

	

	
	

	
	
	
	
	
	
	
	
	
	
 
 

	
	
	
	
	
	
	
	

	
	


// Function to replace all values in the template with the Zotero value
}

function escapeRegExp(stringAdd:string) {
    return stringAdd.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  
function replaceAll(stringAdd:string, find:string, replace:string) {
    return stringAdd.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }


