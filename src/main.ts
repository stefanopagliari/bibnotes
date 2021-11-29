// Import BibTexParser to parse bib
import * as BibTeXParser from "@retorquere/bibtex-parser";
//Import from types
import { Entry } from "@retorquere/bibtex-parser";
// Import fs to import bib file
import * as fs from "fs";
import { normalizePath, Notice, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	HeaderLevels,
	HTML_TAG_REG,
	PAGE_NUM_REG,
	TEMPLATE_BRACKET_REG,
	TEMPLATE_REG,
} from "./constants";
//Import modals from /modal.ts
import { fuzzySelectEntryFromBib, importAllBib } from "./modal";
//Import sample settings from /settings.ts
import { SettingTab } from "./settings";
import { AnnotationTypes, MyPluginSettings } from "./types";
import { buildInTextCite, replaceTemplate, replaceAllTemplates } from "./utils";

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

	parseTemplateBib(selectedEntry: Entry, templateOriginal: string) {

		console.log("-----------------------------");
		console.log("ENTRY: " + selectedEntry.key);
		const {
			exportMetadata,
			missingfield,
			exportAnnotations,
			isHighlightItalic,
			isHighlightBold,
			isHighlightHighlighted,
			isHighlightBullet,
			isHighlightBlockquote,
			isHighlightQuote,
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
			keyMergeAbove,
			keyCommentPrepend,
			keyH1,
			keyH2,
			keyH3,
			keyH4,
			keyH5,
			keyH6,
			keyKeyword,
			isDoubleSpaced,
			exportPath,
		} = this.settings;

		//Create Note from Template
		let note = templateOriginal;

		// If setting exportMetadata is false, then replace Template with simply the title
		if (!exportMetadata) {
			note = "# {{title}}";
		}

		const authors = selectedEntry.creators.author;
		const editors = selectedEntry.creators.editor;
		["author", "editor"].forEach((creator) => {
			const creators = selectedEntry.creators[creator];
			const creatorList = creators.map((creator) => {
				const { firstName, lastName } = creator;
				if (!firstName) return lastName;
				if (!lastName) return firstName;
				return lastName + ", " + firstName;
			});
			const creatorListBracket = creatorList.map(
				(creator) => "[[" + creator + "]]"
			);

			const creatorListStr = creatorList.join("; ");
			const creatorListBracketStr = creatorListBracket.join("; ");

			note = replaceTemplate(
				note,
				`[[{{${creator}}}]]`,
				creatorListBracketStr
			);
			note = replaceTemplate(note, `{{${creator}}}`, creatorListStr);
		});

		// Create an array with all the fields
		const entriesArray: string[] = Object.keys(selectedEntry.fields);

		note = replaceAllTemplates(entriesArray, note, selectedEntry);

		// replace the citekey
		note = replaceTemplate(note, "{{citekey}}", selectedEntry.key);

		// replace the item type
		note = replaceTemplate(note, "{{itemtype}}", selectedEntry.type);

		//console.log(missingfield);
		// Replace elements that missing with NA if option is selected in the settings
		if (missingfield === "Replace with NA") {
			note = note.replace(TEMPLATE_BRACKET_REG, "*NA*").trim();
			note = note.replace(TEMPLATE_REG, "*NA*").trim();
		}

		// Remove fields (entire line) that are missing is the option is selected in settings

		if (missingfield == "Remove (entire row)") {
			//console.log("Trying to remove all rows with missing field");
			const templateArray = note.split(/\r?\n/); //split the template in rows
			// 	run function to determine where we still have double curly brackets
			for (let j = 0; j < templateArray.length; j++) {
				if (templateArray[j].match(TEMPLATE_REG)) {
					templateArray.splice(j, 1);
					j--;
				}
			}
			note = templateArray.join("\n"); //concatenate the array to recreate single string
		}

		// EXPORT ANNOTATION
		//Check the settings whether to export annotations and whether the selected source has notes

		if (exportAnnotations && entriesArray.includes("note")) {
			// if (exportAnnotations == true){

			//store the annotation in a element called annotationsOriginal
			const annotationsOriginal = selectedEntry.fields.note;

			let annotationsNoFakeNewLine = replaceTemplate(
				annotationsOriginal[0],
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

			const annotationsOriginalNoTags = annotationsNoFakeNewLine.replace(
				/(&lt;([^>]+)>)/gi,
				""
			);

			// Set an array that collect the keywords from the highlight
			const keywordArray: string[] = [];

			// Set an array that collect the number of the rows to be removed
			const indexRowsToBeRemoved: number[] = [];

			//split the original annotation in separate rows

			let annotationsArray = annotationsOriginalNoTags
				.split(/\r?\n/)
				// Remove empty lines
				.filter((a) => a)
				// Remove first row
				.splice(0, 1);

			// Identify the key with the author name, year, and page number added by Zotero at the end of each  highlighted sentence. This does not work with notes extracted from Zotfile
			const authorKeyZotero = new RegExp(
				"\\(" + authors[0].lastName + ".*, p. \\d+\\)"
			);

			const authorKeyZotfile = new RegExp(
				"\\(zotero://open-pdf/library/items/\\w+\\?page=\\d+\\)"
			);

			//Set the formatting variables based on the highlightsettings
			const highlightItalic = isHighlightItalic ? "*" : "";
			const highlightBold = isHighlightBold ? "**" : "";
			const highlightHighlighted = isHighlightHighlighted ? "==" : "";
			const highlightBullet = isHighlightBullet ? "- " : "";
			const highlightBlockquote = isHighlightBlockquote ? "> " : "";
			const highlightQuoteOpen = isHighlightQuote ? "“" : "";
			const highlightQuoteClose = isHighlightQuote ? "”" : "";

			//Create formatting to be added before and after highlights
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
				highlightBullet +
				highlightBlockquote +
				highlightCustomTextBefore;

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
				commentHighlighted +
				commentBold +
				commentItalic +
				commentQuoteOpen;

			const commentFormatAfter =
				commentQuoteClose +
				commentItalic +
				commentBold +
				commentHighlighted +
				commentCustomTextAfter;

			const commentPrepend =
				commentBullet +
				commentBlockquote +
				" " +
				commentCustomTextBefore;

			// LOOP EACH ROW (ELEMENT OF THE ARRAY)
			for (let i = 0; i < annotationsArray.length; i++) {
				// console.log("-----------------------------");
				// console.log("ENTRY: " + selectedEntry.key + " - Row Num: " + i);


				let currRow = annotationsArray[i];
				let nextRow = annotationsArray[i + 1];

				console.log("ORIGINAL NOTE: " + currRow);

				//Check if the annotations have been extracted via Zotero Native Reader or Zotfile
				let FormattingType: string = undefined;
				if (authorKeyZotero.exec(currRow)) {
					FormattingType = "Zotero";
				} else if (authorKeyZotfile.exec(currRow)) {
					FormattingType = "Zotfile";
				} else {

					continue;
				}
				console.log("AnnotationType: " + FormattingType);

				//if the annotation is from Zotfile then merge the comment in the next row to the related highlight. This is to address the way zotfile export comments to highlights as independent entries while Zotero exports them on the same row as the highlight they are related to
				if (
					FormattingType === "Zotfile" &&
					nextRow.slice(0, 3) === "<i>"
				) {
					nextRow = nextRow.replace("<i>", "");
					nextRow = nextRow.replace("</i>", "");
					nextRow = nextRow.replace(authorKeyZotfile, "");
					currRow = currRow + " " + nextRow;
					indexRowsToBeRemoved.push(i + 1);
				}
				// if the row has been flagged as "toberemoved", skip
				if (indexRowsToBeRemoved.includes(i)) continue;

				//Remove HTML Tags
				currRow = currRow.replace(HTML_TAG_REG, "");

				//Find the index with the starting point of the text within brackets following the character where the highlight/comment
				let authorMatch =
					FormattingType === "Zotero"
						? authorKeyZotero.exec(currRow)
						: authorKeyZotfile.exec(currRow);

				//Turn the index into a string
				let authorMatchString = authorMatch + "";

				//  Find the index with the end point of the text within brackets following the character where the highlight/comment
				const authorMatchEnd =
					authorMatch.index + authorMatch[0].length;
				//(authorMatchEnd);

				//extract the comment to the annotation found after the authorKey (authordatepage)
				let annotationCommentAll = currRow
					.substring(authorMatchEnd + 1)
					// remove white spaces
					.trim();

				//Extract the first word in the comment added to the annotation
				const spaceIndex = annotationCommentAll.indexOf(" ");
				const annotationCommentFirstWord =
					annotationCommentAll.substring(0, spaceIndex);

				//  Identify what type of formatting needs to be applied to this row based on the first word
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
				//console.log("TYPE: " + annotationType);
				//console.log("COMMENT: " + annotationCommentAll);

				// Extract the highlighted text and store it in variable annotationHighlight
				let annotationHighlight = currRow
					.substring(0, authorMatch.index - 1)
					.trim(); //extract the comment to the annotation

				// Remove quotation marks from annotationHighlight

				const removeQuotes = (highlight: string, quote: string) => {
					const startReg = `$${quote}`;
					const endReg = `${quote}^`;
					highlight.replaceAll(startReg, "");
					highlight.replaceAll(endReg, "");
					return highlight;
				};

				//console.log(annotationHighlight.charAt(0));
				["“", '"', "`", "”", '"', "`"].forEach(
					(quote) =>
						(annotationHighlight = removeQuotes(
							annotationHighlight,
							quote
						))
				);
				// while (annotationHighlight.charAt(0) == "“") {
				// 	annotationHighlight = annotationHighlight.substring(1);
				// }
				// while (annotationHighlight.charAt(0) == '"') {
				// 	annotationHighlight = annotationHighlight.substring(1);
				// }
				// while (annotationHighlight.charAt(0) == "`") {
				// 	annotationHighlight = annotationHighlight.substring(1);
				// }
				// while (
				// 	annotationHighlight.charAt(
				// 		annotationHighlight.length - 1
				// 	) === "”"
				// ) {
				// 	annotationHighlight = annotationHighlight.substring(
				// 		0,
				// 		annotationHighlight.length - 1
				// 	);
				// }
				// while (
				// 	annotationHighlight.charAt(
				// 		annotationHighlight.length - 1
				// 	) === '"'
				// ) {
				// 	annotationHighlight = annotationHighlight.substring(
				// 		0,
				// 		annotationHighlight.length - 1
				// 	);
				// }
				// while (
				// 	annotationHighlight.charAt(
				// 		annotationHighlight.length - 1
				// 	) === "`"
				// ) {
				// 	annotationHighlight = annotationHighlight.substring(
				// 		0,
				// 		annotationHighlight.length - 1
				// 	);
				// }

				//console.log("HIGHLIGHT: " + annotationHighlight);

				// FORMATTING HIGHLIGHT
				//   add the markdown formatting for the highlight (e.g. bold, italic, highlight)
				// set the markdown formatting  for the highlighted text (e.g. bold, italic, highlight)
				const annotationHighlightFormatted =
					highlightFormatBefore +
					annotationHighlight +
					highlightFormatAfter;

				// FORMATTING COMMENT
				// Extract the comment without the initial key and store it in var annotationCommentNoKey
				let annotationCommentNoKey: string = undefined;
				if (annotationType === "noKey") {
					annotationCommentNoKey = annotationCommentAll;
				} else if (annotationType === "typeComment") {
					annotationCommentNoKey = annotationCommentAll;
				} else {
					annotationCommentAll = annotationCommentAll + " ";
					annotationCommentNoKey = annotationCommentAll.substring(
						annotationCommentAll.indexOf(" ") + 1,
						annotationCommentAll.length
					);
					annotationCommentNoKey = annotationCommentNoKey.trim();
				}

				// CORRECT THE PAGE NUMBER
				let pageNumberKey = undefined;
				let pageNumberPDF = undefined;
				let pdfID = undefined;
				//let authorMatchStringAdjusted = undefined

				if (FormattingType === "Zotero") {
					//extract the zotero ID of the PDF from the URI
					const URI = selectedEntry.fields.uri;
					const URIStr = URI.toString();
					// Not being used?
					const pdfID = URIStr.substring(URIStr.length - 8);

					// Find the page number exported by Zotero
					authorMatchString = authorMatch.toLocaleString();
					const pageNumberExported =
						PAGE_NUM_REG.exec(authorMatchString);

					//  Find the publication page number in the Metadata
					const pageNumberMetadata = selectedEntry.fields.pages + "";
					//console.log(pageNumberMetadata);
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
						pageNumberExportedCorrected >=
							pageNumberMetadataStart &&
						pageNumberExportedCorrected <= pageNumberMetadataEnd;

					//  if the pagenumber exported by Zotero is journal one, then identify the PDF page number
					if (pageNumberExportedCorrectedCheck) {
						pageNumberKey = pageNumberExportedCorrected;
						pageNumberPDF =
							pageNumberExportedCorrected -
							pageNumberMetadataStart +
							1;
					}
					// if the pagenumber exported by Zotero is  the PDF page, correct the journal page number
					else {
						pageNumberKey =
							pageNumberExportedCorrected +
							pageNumberMetadataStart -
							1;
						pageNumberPDF = pageNumberExportedCorrected;

						// authorMatchStringAdjusted = authorMatchString.replace(", p. " + pageNumberExportedCorrected , ", p. " + pageNumberKey) //replace the page number to indicate the number in the actual publication rather than the pdf page
					}
				}
				if (FormattingType === "Zotfile") {
					//extract the zotero ID of the PDF from the URI
					const URI = selectedEntry.fields.uri;
					pdfID = URI.toString().substring(URI.toString().length - 8);

					// Find the page number exported by Zotero
					authorMatchString = authorMatch.toLocaleString();
					const pageNumberExported =
						PAGE_NUM_REG.exec(authorMatchString);

					//console.log({ pageNumberExported });
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
				}


				const authorKey = buildInTextCite(selectedEntry, pageNumberKey);



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
				currRow = replaceTemplate(
					currRow,
					authorMatchString,
					keyAdjusted
				);

				// MERGE HIGHLIGHT WITH THE PREVIOUS ONE ABOVE
				if (annotationType === "typeMergeAbove") {
					//annotationsArray[index] = annotationsArray[index].replace(this.settings.keyMergeAbove, ""); //remove the keyMergeAbove from the beginning

					// annotationsArray[index] = annotationsArray[index].replace(this.settings.keyMergeAbove, ""); //remove the keyMergeAbove from the beginning

					annotationsArray[i - 1] =
						annotationsArray[i - 1] +
						" ... " +
						annotationHighlightFormatted +
						keyAdjusted;

					//Add the highlighted text to the previous one
					indexRowsToBeRemoved.push(i);
					//console.log("To be removed = TRUE")
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

				}

				//FORMAT THE HEADERS

				function formatHeader(level: HeaderLevels) {
					const hashes = "#".repeat(level); 
					currRow =
						`\n${hashes} ` +
						annotationHighlight +
						annotationCommentNoKey.trim();
					//Add empty row before the headline
					annotationsArray.splice(i, 0, "");
				}

				// annotationType.charAt(-1);

				//  Transform header in H1/H2/H3/H4/H5/H6 Level
				if (/typeH\d/.test(annotationType)) {
					const level = parseInt(annotationType.charAt(-1));
					formatHeader(level);
				}
				// 	//Add empty row before the headline
				// 	annotationsArray.splice(i, 0, "");
				// }

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
					currRow =
						highlightPrepend +
						annotationHighlightFormatted +
						keyAdjusted;
				}

				//FORMAT THE COMMENTS ADDED OUTSIDE OF ANY ANNOTATION
				if (annotationType === "typeComment") {
					currRow =
						commentPrepend +
						commentFormatBefore +
						annotationCommentNoKey.trim() +
						commentFormatAfter +
						keyAdjustedNoReference;
				}

				// Replace backticks with single quote
				currRow = replaceTemplate(currRow, "`", "'");
				currRow = currRow.replace(HTML_TAG_REG, "");
				currRow = replaceTemplate(currRow, "/<i/>", "");

				// Correct encoding issues
				currRow = replaceTemplate(currRow, "&amp;", "&");
			}
			// //PERFORM THE FOLLOWING OPERATIONS ON THE WHOLE ARRAY

			//  Trim the white space at the beginning and end of each row
			annotationsArray = annotationsArray.map((el) => el.trim());

			//  Remove the rows with the keywords and other rows to be removed
			if (indexRowsToBeRemoved.length) {
				for (
					let index = indexRowsToBeRemoved.length - 1;
					index >= 0;
					index--
				) {
					annotationsArray.splice(indexRowsToBeRemoved[index], 1);
				}
			}

			// // Add empty row in between rows if selected in the settings
			if (isDoubleSpaced) {
				for (
					let index = annotationsArray.length - 1;
					index >= 0;
					index--
				) {
					annotationsArray.splice(index, 0, "");
				}
			}
			// }

			// Turn the annotations in a string including newline symbols
			const annotationsArrayJoined = annotationsArray.join("\n");

			// Merge the annotations to the metadata
			note = note + "\n" + annotationsArrayJoined; //paste the annotations

			// }
		}

		// EXPORT NOTE
		const exportName: string = selectedEntry.key;
		const exportPathFull: string = exportPath + "/" + exportName + ".md";
		const normalised = normalizePath(exportPathFull);
		console.log({ normalised, exportPathFull });
		fs.writeFile(normalised, note, function (err) {
			if (err) console.log(err);
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
		return (
			authors[0].lastName + " and " + authors[1].lastName
		);
	} else if (authors.length > 2) {
		return authors[0].lastName + " et al.";
	} else return null;
}


function buildInTextCite(
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

