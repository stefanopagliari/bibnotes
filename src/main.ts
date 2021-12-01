// Import BibTexParser to parse bib
import * as BibTeXParser from "@retorquere/bibtex-parser";
//Import from types
import { Entry } from "@retorquere/bibtex-parser";
// Import fs to import bib file
import * as fs from "fs";
import { info, setLevel } from "loglevel";
import { normalizePath, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	HTML_TAG_REG,
	PAGE_NUM_REG,
	TEMPLATE_BRACKET_REG,
	TEMPLATE_REG,
	ZOTFILE_REG,
} from "./constants";
//Import modals from /modal.ts
import { fuzzySelectEntryFromBib, importAllBib } from "./modal";
//Import sample settings from /settings.ts
import { SettingTab } from "./settings";
import { AnnotationTypes, MyPluginSettings } from "./types";
import {
	buildInTextCite,
	getNameStr,
	makeWiki,
	removeQuoteFromEnd,
	removeQuoteFromStart,
	replaceAllTemplates,
	replaceTemplate,
} from "./utils";

export { Entry } from "@retorquere/bibtex-parser";

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
	/**
	 * Load the file at `filepath`, parse it using BibTexParser, and return the parsed data.
	 * @param  {string} filepath
	 */
	loadLibrarySynch(filepath: string) {
		console.log("Loading library at " + filepath);

		// Read the bib/Json file
		const bibAll = fs.readFileSync(filepath);

		// Parse the bib file using BibTexParser
		const bibParsed = BibTeXParser.parse(bibAll.toString().substring(0));

		//Check the number of references
		console.log("Bib file has " + bibParsed.entries.length + " entries");
		return bibParsed;
	}

	replaceCreatorsTemplates(selectedEntry: Entry, template: string) {
		let copy = template.slice();
		["author", "editor"].forEach((creator) => {
			const creators = selectedEntry.creators[creator];
			if (!creators) return;
			const creatorList = creators.map(getNameStr);
			const creatorListBracket = creatorList.map(makeWiki);

			copy = replaceTemplate(
				copy,
				`{{${creator}}}`,
				creatorList.join("; ")
			);
			copy = replaceTemplate(
				copy,
				makeWiki(`{{${creator}}}`),
				creatorListBracket.join("; ")
			);
		});
		return copy;
	}

	replaceMissingFields(template: string) {
		const { missingfield } = this.settings;
		let copy = template.slice();
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
		return copy;
	}

	removeFakeNewlines(note: string) {
		let annotationsNoFakeNewLine = replaceTemplate(
			note,
			"\n\n",
			"REALNEWLINE"
		);
		annotationsNoFakeNewLine = replaceTemplate(
			annotationsNoFakeNewLine,
			"\n",
			""
		);
		annotationsNoFakeNewLine = replaceTemplate(
			annotationsNoFakeNewLine,
			"REALNEWLINE",
			"\n"
		);
		return annotationsNoFakeNewLine;
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

	/**
	 * Check if the annotations have been extracted via Zotero Native Reader or Zotfile
	 **/
	getZoteroRegex(selectedEntry: Entry) {
		const NumAuthors = selectedEntry.creators.author[0].lastName.length 
			let AuthorKeyNew:string = undefined
			if (NumAuthors == 1){AuthorKeyNew = selectedEntry.creators.author[0].lastName
			} else if (NumAuthors == 2) {AuthorKeyNew =
				selectedEntry.creators.author[0].lastName +
				" and " + selectedEntry.creators.author[1].lastName
			} else if (NumAuthors>2) {AuthorKeyNew = selectedEntry.creators.author[0].lastName + " et al."}
			console.log (AuthorKeyNew)
		const ZOTERO_REG = new RegExp("\\(" + AuthorKeyNew + ", \\d+, p. \\d+\\)")
		return ZOTERO_REG
	}

	getFormattingType(currLine: string, selectedEntry: Entry) {
		const ZOTERO_REG = this.getZoteroRegex(selectedEntry)
		if (ZOTERO_REG.test(currLine)) {
			return "Zotero";
		} else if (ZOTFILE_REG.test(currLine)) {
			return "Zotfile";
		} else {
			return null;
		}
	}

	getAnnotationType(
		annotationCommentFirstWord: string,
		annotationCommentAll: string,
		currRow: string,
		authorMatchString: string
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

		let annotationType: AnnotationTypes = "noKey";
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
		} else if (currRow.startsWith(authorMatchString)) {
			annotationType = "typeComment";
		}
		return annotationType;
	}

	handleFormattingType(
		selectedEntry: Entry,
		authorMatch: string,
		formattingType: string
	) {
		let authorMatchString, pageNumberKey, pageNumberPDF, pdfID;
		if (formattingType === "Zotero") {
			//extract the zotero ID of the PDF from the URI
			const URI = selectedEntry.fields.uri;
			const URIStr = URI.toString();
			// Not being used?
			const pdfID = URIStr.substring(URIStr.length - 8);

			// Find the page number exported by Zotero
			authorMatchString = authorMatch.toLocaleString();
			const pageNumberExported = PAGE_NUM_REG.exec(authorMatchString);

			//  Find the publication page number in the Metadata
			const pageNumberMetadata = selectedEntry.fields.pages + "";
			console.log(pageNumberMetadata);
			let pageNumberMetadataStart = parseInt(
				pageNumberMetadata.split("–")[0],
				10
			); //find the initial page in the metadata
			if (isNaN(pageNumberMetadataStart)) {
				pageNumberMetadataStart = 1;
			}
			let pageNumberMetadataEnd = parseInt(
				pageNumberMetadata.split("–")[1],
				10
			); // find the final page in the metadata
			if (isNaN(pageNumberMetadataEnd)) {
				pageNumberMetadataEnd = 1000000000;
			}
			//console.log(pageNumberMetadataEnd);
			//  check if the number exported by Zotero falls within the page range in the metadata
			const pageNumberExportedCorrected = parseInt(
				pageNumberExported + "",
				10
			);
			//console.log(pageNumberExportedCorrected);

			const pageNumberExportedCorrectedCheck =
				pageNumberExportedCorrected >= pageNumberMetadataStart &&
				pageNumberExportedCorrected <= pageNumberMetadataEnd;

			//  if the pagenumber exported by Zotero is journal one, then identify the PDF page number
			if (pageNumberExportedCorrectedCheck) {
				pageNumberKey = pageNumberExportedCorrected;
				pageNumberPDF =
					pageNumberExportedCorrected - pageNumberMetadataStart + 1;
			}
			// if the pagenumber exported by Zotero is  the PDF page, correct the journal page number
			else {
				pageNumberKey =
					pageNumberExportedCorrected + pageNumberMetadataStart - 1;
				pageNumberPDF = pageNumberExportedCorrected;

				// authorMatchStringAdjusted = authorMatchString.replace(", p. " + pageNumberExportedCorrected , ", p. " + pageNumberKey) //replace the page number to indicate the number in the actual publication rather than the pdf page
			}

			return { authorMatchString, pageNumberKey, pageNumberPDF, pdfID };
		} else {
			//extract the zotero ID of the PDF from the URI
			const URI = selectedEntry.fields.uri;
			pdfID = URI.toString().substring(URI.toString().length - 8);

			// Find the page number exported by Zotero
			authorMatchString = authorMatch.toLocaleString();
			const pageNumberExported = PAGE_NUM_REG.exec(authorMatchString);

			console.log({ pageNumberExported });
			pageNumberPDF = parseInt(pageNumberExported);

			//  Find the publication page number in the Metadata
			const pageNumberMetadata = selectedEntry.fields.pages + "";
			let pageNumberMetadataStart = parseInt(
				pageNumberMetadata.split("–")[0],
				10
			); //find the initial page in the metadata
			if (isNaN(pageNumberMetadataStart)) {
				pageNumberMetadataStart = 1;
			}

			//Derive the page in the journal article by adding the page of the pdf to the page number in the metadata
			pageNumberKey = pageNumberPDF + pageNumberMetadataStart - 1;

			// authorMatchStringAdjusted = authorMatchString.replace(", p. " + pageNumberExportedCorrected , ", p. " + pageNumberKey) //replace the page number to indicate the number in the actual publication rather than the pdf page
			return { authorMatchString, pageNumberKey, pageNumberPDF, pdfID };
		}
	}

	exportNote(selectedEntry: Entry, exportPath: string, template: string) {
		const exportName: string = selectedEntry.key;
		const exportPathFull: string = exportPath + "/" + exportName + ".md";
		const normalised = normalizePath(exportPathFull);
		console.log({ normalised, exportPathFull });
		fs.writeFile(normalised, template, function (err) {
			if (err) console.log(err);
		});
	}

	parseTemplateBib(selectedEntry: Entry, templateOriginal: string) {
		const {
			exportMetadata,
			exportAnnotations,
			isDoubleSpaced,
			exportPath,
		} = this.settings;

		// Create Note from Template
		// If setting exportMetadata is false, then replace Template with simply the title
		let template = exportMetadata ? templateOriginal : "# {{title}}";

		// Replace creators templates with actual creators
		template = this.replaceCreatorsTemplates(selectedEntry, template);

		// Create an array with all the fields
		const entriesArray: string[] = Object.keys(selectedEntry.fields);

		template = replaceAllTemplates(entriesArray, template, selectedEntry);

		// replace the citekey
		template = replaceTemplate(template, "{{citekey}}", selectedEntry.key);

		// replace the item type
		template = replaceTemplate(
			template,
			"{{itemtype}}",
			selectedEntry.type
		);

		template = this.replaceMissingFields(template);
		// EXPORT ANNOTATION
		//Check the settings whether to export annotations and whether the selected source has notes
		if (!(exportAnnotations && entriesArray.includes("note"))) {
			this.exportNote(selectedEntry, exportPath, template);
			return;
		}
		const { note } = selectedEntry.fields;

		const annotationsCleaned = this.removeFakeNewlines(note[0])
			.replace(
				/(&lt;([^>]+)>)/gi,
				"")		
				// // Replace backticks
			.replace(
				/`/g, "'"
				);
				

		// Set an array that collect the keywords from the highlight
		const keywordArray: string[] = [];

		// Set an array that collect the number of the rows to be removed
		const indexRowsToBeRemoved: number[] = [];

		//split the original annotation in separate rows
		let lines = annotationsCleaned
			.split(/\r?\n/)
			// Remove empty lines
			.filter((a) => a !== "");
		// Remove first row
		lines.splice(0, 1);

		// Identify the key with the author name, year, and page number added by Zotero at the end of each  highlighted sentence. This does not work with notes extracted from Zotfile

		const {
			commentFormatAfter,
			commentFormatBefore,
			commentPrepend,
			highlightFormatAfter,
			highlightFormatBefore,
			highlightPrepend,
		} = this.createFormatting();

		// LOOP EACH ROW (ELEMENT OF THE ARRAY)

		//for (let i = 0; i < end; i++) {
		for (let i = 0; i < lines.length; i++) {

			console.log(
				"-----------------------------\nENTRY: " +
					selectedEntry.key +
					" - Row Num: " +
					i
			);
			console.log(lines[i])
			let currRow = lines[i];
			let nextRow = lines[i + 1];

			console.log("ORIGINAL NOTE: " + currRow);

			//Check if the annotations have been extracted via Zotero Native Reader or Zotfile
			const formattingType = this.getFormattingType(currRow, selectedEntry);
			console.log("AnnotationType: " + formattingType);

			//if the annotation is from Zotfile then merge the comment in the next row to the related highlight. This is to address the way zotfile export comments to highlights as independent entries while Zotero exports them on the same row as the highlight they are related to
			if (formattingType === "Zotfile" && nextRow.slice(0, 3) === "<i>") {
				nextRow = nextRow.replace("<i>", "");
				nextRow = nextRow.replace("</i>", "");
				nextRow = nextRow.replace(ZOTFILE_REG, "");
				currRow = currRow + " " + nextRow;
				indexRowsToBeRemoved.push(i + 1);
			}
			// if the row has been flagged as "toberemoved", skip
			if (indexRowsToBeRemoved.includes(i)) continue;

			//Remove HTML Tags
			currRow = currRow.replace(HTML_TAG_REG, ""); 

		

			
 


			//Identify the author/year/page expression created by the Zotero reader


			
			const ZOTERO_REG = this.getZoteroRegex(selectedEntry)
			//Find the index with the starting point of the text within brackets following the character where the highlight/comment ends
			const authorMatch =
				formattingType === "Zotero"
					? ZOTERO_REG.exec(currRow)
					: ZOTFILE_REG.exec(currRow);
			console.log("authorMatch: "+ authorMatch)
			//console.log({ currRow }); 

			// const match = currRow.match(ZOTERO_REG);
			// const firstIndex = currRow.indexOf(match[0]);
			// console.log ("firstIndex = " + firstIndex)
			// const lastIndex  = currRow.lastIndexOf(match[match.length-1]);
			// console.log ("lastIndex = " + lastIndex)
 



			//Turn the index into a string
			const authorMatchString = authorMatch + "";

			//  Find the index with the end point of the text within brackets following the character where the highlight/comment
			const authorMatchEnd = authorMatch.index + authorMatch[0].length;
			console.log("authorMatch.index : "+ authorMatch.index); 
			//extract the comment to the annotation found after the authorKey (authordatepage)
			const annotationCommentAll = currRow
				.substring(authorMatchEnd + 1)
				.trim();

			//Extract the first word in the comment added to the annotation
			const spaceIndex = annotationCommentAll.indexOf(" ");
			const annotationCommentFirstWord = annotationCommentAll.substring(
				0,
				spaceIndex
			);

			//  Identify what type of formatting needs to be applied to this row based on the first word
			const annotationType = this.getAnnotationType(
				annotationCommentFirstWord,
				annotationCommentAll,
				currRow,
				authorMatchString
			);
			console.log("TYPE: " + annotationType);
			console.log("COMMENT ALL: " + annotationCommentAll);

			// Extract the highlighted text and store it in variable annotationHighlight
			console.log(authorMatch.index - 1)
			let annotationHighlight = currRow
				.substring(0, authorMatch.index - 1)
				.trim();

			//console.log("annotationHighlight before removal quotation marks: "+ annotationHighlight);

			// Remove quotation marks from annotationHighlight
			["“", '"', "`", "'"].forEach(
				(quote) =>
					(annotationHighlight = removeQuoteFromStart(
						quote,
						annotationHighlight
					))
			);
			//console.log("annotationHighlight after removeQuoteFromStart: "+ annotationHighlight);
			["”", '"', "`", "'"].forEach(
				(quote) =>
					(annotationHighlight = removeQuoteFromEnd(
						quote,
						annotationHighlight
					))
			);
			//console.log("annotationHighlight after removeQuoteFromEnd: "+ annotationHighlight);


			console.log("HIGHLIGHT: " + annotationHighlight);

			// FORMATTING HIGHLIGHT
			//   add the markdown formatting for the highlight (e.g. bold, italic, highlight)
			// set the markdown formatting  for the highlighted text (e.g. bold, italic, highlight)
			const annotationHighlightFormatted =
				highlightFormatBefore +
				annotationHighlight +
				highlightFormatAfter;

			// FORMATTING COMMENT
			// Extract the comment without the initial key and store it in var annotationCommentNoKey
			// console.log("annotationCommentAll: "+ annotationCommentAll)
			// console.log("Indexof blank: " + annotationCommentAll.indexOf(" "))
			// console.log("annotationCommentAll.length: " + annotationCommentAll.length)
			// console.log("annotationCommentAll.substring: " + annotationCommentAll.substring(annotationCommentAll.indexOf(" ") + 1, annotationCommentAll.length
			// ))

			let firstBlank = annotationCommentAll.indexOf(" ")
			if (firstBlank == -1){firstBlank = annotationCommentAll.length}
			const annotationCommentNoKey: string =
				annotationType === "noKey" || annotationType === "typeComment"
					? annotationCommentAll
					: annotationCommentAll
							.substring(
								firstBlank,
								annotationCommentAll.length
							)
							.trim();
			console.log("annotationCommentNoKey: "+ annotationCommentNoKey)
			// CORRECT THE PAGE NUMBER
			const {pageNumberKey, pageNumberPDF, pdfID } =
				this.handleFormattingType(
					selectedEntry,
					authorMatch,
					formattingType
				);

			const authorKey = buildInTextCite(selectedEntry, pageNumberKey);
			//console.log(authorKey); 

			//Create a correct author/year/page key that includes a link to the Zotero Reader
			const keyAdjusted: string =
				" [" +
				authorKey +
				"]" +
				"(zotero://open-pdf/library/items/" +
				pdfID +
				"?page=" +
				pageNumberPDF +
				")"; //created a corrected citation that includes the proper page number and the link to the relevant page in Zotero
			//console.log("REFERENCE: " + keyAdjusted);

			//  create a link to the pdf without citing the author/year
			const keyAdjustedNoReference: string =
				" [" +
				"]" +
				"(zotero://open-pdf/library/items/" +
				pdfID +
				"?page=" +
				pageNumberPDF +
				")";

			// Replace the page number exported by Zotero with the corrected page number including the link
			currRow = replaceTemplate(currRow, authorMatchString, keyAdjusted);

			// MERGE HIGHLIGHT WITH THE PREVIOUS ONE ABOVE
			if (annotationType === "typeMergeAbove") {
				//annotationsArray[index] = annotationsArray[index].replace(this.settings.keyMergeAbove, ""); //remove the keyMergeAbove from the beginning

				// annotationsArray[index] = annotationsArray[index].replace(this.settings.keyMergeAbove, ""); //remove the keyMergeAbove from the beginning

				lines[i - 1] =
					lines[i - 1] +
					" ... " +
					annotationHighlightFormatted +
					keyAdjusted;

				//Add the highlighted text to the previous one
				indexRowsToBeRemoved.push(i);
			}

			//PREPEND COMMENT TO THE HIGHLIGHTED SENTENCE
			if (annotationType === "typeCommentPrepend") {
				//add the comment before the highlight
				currRow =
					highlightPrepend +
					commentFormatBefore +
					annotationCommentNoKey.trim() +
					commentFormatAfter +
					": " +
					annotationHighlightFormatted +
					keyAdjusted;
				//console.log("OUTPUT: " + currRow);
			}

			//FORMAT THE HEADERS
			//  Transform header in H1/H2/H3/H4/H5/H6 Level
			if (/typeH\d/.test(annotationType)) {
				const lastChar = annotationType[annotationType.length - 1];
				console.log("lastChar : "+ lastChar)
				const level = parseInt(lastChar);
				console.log("level : "+level)
				const hashes = "#".repeat(level);
				console.log("annotationHighlight = "+ annotationHighlight)
				console.log("annotationCommentNoKey = "+ annotationCommentNoKey)
				lines[i] =
					`\n${hashes} ` +
					annotationHighlight +
					annotationCommentNoKey.trim();
				console.log("AFTER HEADER TRANSFORMATION: "+ lines[i])	
			}
			// 	//Add empty row before the headline
			// 	annotationsArray.splice(i, 0, "");
			

			//FORMAT KEYWORDS
			// Add highlighted expression to KW
			if (annotationType === "typeKeyword") {
				keywordArray.push(annotationHighlight);
				indexRowsToBeRemoved.push(i);
			}

			//FORMAT HIGHLIGHTED SENTENCES WITHOUT ANY COMMENT
			// if (annotationType ===  "noKey"){
			// 	annotationsArray[index] = annotationHighlightFormatted + keyAdjusted;
			// 	if (annotationCommentAll != "") {
			// 		annotationsArray[index] = annotationsArray[index]  + commentFormat + annotationCommentAll.trim() + commentFormat}
			// }

			// FORMAT HIGHLIGHTED SENTENCES
			if (annotationType === "noKey") {
				lines[i] =
					highlightPrepend +
					annotationHighlightFormatted +
					keyAdjusted;
				
			}

			//FORMAT THE COMMENTS ADDED OUTSIDE OF ANY ANNOTATION
			if (annotationType === "typeComment") {
				lines[i] =
					commentPrepend +
					commentFormatBefore +
					annotationCommentNoKey.trim() +
					commentFormatAfter +
					keyAdjustedNoReference;
			}

			// Replace backticks with single quote
			lines[i] = replaceTemplate(lines[i], "`", "'");
			lines[i] = lines[i].replace(HTML_TAG_REG, "");
			lines[i] = replaceTemplate(lines[i], "/<i/>", "");

			// Correct encoding issues
			lines[i] = replaceTemplate(lines[i], "&amp;", "&");
		}
		// //PERFORM THE FOLLOWING OPERATIONS ON THE WHOLE ARRAY

		//  Trim the white space at the beginning and end of each row
		lines = lines.map((el) => el.trim());

		//  Remove the rows with the keywords and other rows to be removed
		if (indexRowsToBeRemoved.length) {
			for (
				let index = indexRowsToBeRemoved.length - 1;
				index >= 0;
				index--
			) {
				lines.splice(indexRowsToBeRemoved[index], 1);
			}
		}

		// // Add empty row in between rows if selected in the settings
		if (isDoubleSpaced) {
			for (let index = lines.length - 1; index >= 0; index--) {
				lines.splice(index, 0, "");
			}
		}
		// }

		// Turn the annotations in a string including newline symbols
		const annotationsArrayJoined = lines.join("\n");

		// Merge the annotations to the metadata
		template = template + "\n" + annotationsArrayJoined; //paste the annotations

		// }

		// EXPORT NOTE
		this.exportNote(selectedEntry, exportPath, template);
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

function escapeRegExp(stringAdd: string) {
	return stringAdd.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

// Call this something else
function replaceAll(stringAdd: string, find: string, replace: string) {
	return stringAdd.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

function buildAuthorKey(authors: BibTeXParser.Name[]) {
	if (authors.length == 1) return authors[0].lastName;
	else if (authors.length == 2) {
		return authors[0].lastName + " and " + authors[1].lastName;
	} else if (authors.length > 2) {
		return authors[0].lastName + " et al.";
	} else return null;
}

// function buildInTextCite(entry: BibTeXParser.Entry, pageNumberKey: number) {
// 	let inTextCite = "";
// 	const authors = entry.creators.author;
// 	inTextCite += buildAuthorKey(authors);

// 	const { year } = entry.fields;
// 	inTextCite += ", " + year;

// 	if (pageNumberKey) inTextCite += ": " + pageNumberKey;

// 	return "(" + inTextCite + ")";
// }