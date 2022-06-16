import { normalizePath } from "obsidian";
//import { App, normalizePath } from "obsidian";
import {
	//Reference,
	Creator,
	CreatorArray,
	Reference,
} from "./types";

import path from "path";

import { TEMPLATE_BRACKET_REG, TEMPLATE_REG } from "./constants";

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
			`${selectedEntry[KW as keyof Reference]}`
		); // fixed the type
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
export const makeQuotes = (str: string) => '"' + str + '"';
export const makeTags = (str: string) => "#" + str;

export const createAuthorKey = (creators: CreatorArray) => {
	const authorKey: string[] = [];
	let authorKeyFixed = "";
	for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
		const creator: Creator = creators[creatorindex]; //select the author
		if (creator.creatorType === "author") {
			if (creator.hasOwnProperty("name")) {
				//authorList.push(creator.name)
				authorKey.push(creator.name);
			} else if (
				creator.hasOwnProperty("lastName") &&
				creator.hasOwnProperty("firstName")
			) {
				//authorList.push(creator.lastName + ", " + creator.firstName)
				authorKey.push(creator.lastName);
			} else if (
				creator.hasOwnProperty("lastName") &&
				!creator.hasOwnProperty("firstName")
			) {
				//authorList.push(creator.lastName)
				authorKey.push(creator.lastName);
			} else if (
				!creator.hasOwnProperty("lastName") &&
				creator.hasOwnProperty("firstName")
			) {
				//authorList.push(creator.firstName)
				authorKey.push(creator.firstName);
			}
		} else if (creator.creatorType === "editor") {
			if (creator.hasOwnProperty("name")) {
				//editorList.push(creator.name)
				authorKey.push(creator.name);
			} else if (
				creator.hasOwnProperty("lastName") &&
				creator.hasOwnProperty("firstName")
			) {
				//editorList.push(creator.lastName + ", " + creator.firstName)
				authorKey.push(creator.lastName);
			} else if (
				creator.hasOwnProperty("lastName") &&
				!creator.hasOwnProperty("firstName")
			) {
				//editorList.push(creator.lastName)
				authorKey.push(creator.lastName);
			} else if (
				!creator.hasOwnProperty("lastName") &&
				creator.hasOwnProperty("firstName")
			) {
				//editorList.push(creator.firstName)
				authorKey.push(creator.firstName);
			}
		}
	}

	//Adjust the authorKey depending on the number of authors
	if (authorKey.length == 1) {
		authorKeyFixed = authorKey[0];
	}
	if (authorKey.length == 2) {
		authorKeyFixed = authorKey[0] + " and " + authorKey[1];
	}
	if (authorKey.length > 2) {
		authorKeyFixed = authorKey[0] + " et al.";
	}
	return authorKeyFixed;
};

export function removeQuoteFromStart(quote: string, annotation: string) {
	let copy = annotation.slice();
	while (copy.charAt(0) === quote) copy = copy.substring(1);
	return copy;
}
export function removeQuoteFromEnd(quote: string, annotation: string) {
	let copy = annotation.slice();
	while (copy[copy.length - 1] === quote)
		copy = copy.substring(0, copy.length - 1);
	return copy;
}

export function orderByDateModified(a: Reference, b: Reference) {
	if (a.dateModified > b.dateModified) {
		return -1;
	}
	if (a.dateModified < b.dateModified) {
		return 1;
	}
	return 0;
}

export function formatCreatorsName(creator: Creator, nameCustom: string) {
	// when the creator only has a name (no first or last name) this works just fine
	if (creator.hasOwnProperty("name")) {
		nameCustom = creator.name;
		nameCustom = nameCustom.trim();
		return nameCustom;
	} else if (
		creator.hasOwnProperty("lastName") &&
		creator.hasOwnProperty("firstName")
	) {
		nameCustom = nameCustom.replace("{{lastName}}", creator.lastName);
		nameCustom = nameCustom.replace("{{firstName}}", creator.firstName);
		nameCustom = nameCustom.trim();
		return nameCustom;
	} else if (
		creator.hasOwnProperty("lastName") &&
		!creator.hasOwnProperty("firstName")
	) {
		nameCustom = nameCustom.replace("{{lastName}}", creator.lastName);
		nameCustom = nameCustom.replace("; {{firstName}}", creator.firstName);
		nameCustom = nameCustom.replace(", {{firstName}}", creator.firstName);
		nameCustom = nameCustom.replace("{{firstName}}", "");
		nameCustom = nameCustom.trim();
		return nameCustom;
	} else if (
		!creator.hasOwnProperty("lastName") &&
		creator.hasOwnProperty("firstName")
	) {
		nameCustom = nameCustom.replace("; {{lastName}}", creator.firstName);
		nameCustom = nameCustom.replace(", {{lastName}}", creator.firstName);
		nameCustom = nameCustom.replace("{{lastName}}", "");
		nameCustom = nameCustom.replace("{{firstName}}", creator.firstName);
		nameCustom = nameCustom.trim();
		return nameCustom;
	}
}

//Function that create an array with the creators of a given type (e.g. author, editor)
export const createCreatorList = (
	creators: CreatorArray,
	typeCreator: string,
	note: string,
	divider: string,
	nameFormat: string
) => {
	const creatorList: string[] = [];
	for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
		const creator: Creator = creators[creatorindex]; //select the author
		if (creator.creatorType === typeCreator) {
			creatorList.push(formatCreatorsName(creator, nameFormat));
		}
	}

	// console.log(creatorList);

	const creatorListBracket = creatorList.map(makeWiki);

	const creatorListQuotes = creatorList.map(makeQuotes);

	//add a space after the divided if it is not present
	if (divider.slice(-1) !== " ") {
		divider = divider + " ";
	}

	if (creatorList.length == 0) {
		return note;
	} else {
		note = replaceTemplate(
			note,
			`[[{{${typeCreator}}}]]`,
			creatorListBracket.join(divider)
		);
		note = replaceTemplate(
			note,
			`"{{${typeCreator}}}"`,
			creatorListQuotes.join(divider)
		);
		note = replaceTemplate(
			note,
			`{{${typeCreator}}}`,
			creatorList.join(divider)
		);

		return note;
	}
};

export const createCreatorAllList = (
	creators: CreatorArray,
	note: string,
	divider: string,
	nameFormat: string
) => {
	const creatorList: string[] = [];
	for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
		const creator: Creator = creators[creatorindex]; //select the author
		creatorList.push(formatCreatorsName(creator, nameFormat));
	}

	const creatorListBracket = creatorList.map(makeWiki);
	const creatorListQuotes = creatorList.map(makeQuotes);

	//add a space after the divided if it is not present
	if (divider.slice(-1) !== " ") {
		divider = divider + " ";
	}

	if (creatorList.length == 0) {
		return note;
	} else {
		note = replaceTemplate(
			note,
			`[[{{creator}}]]`,
			creatorListBracket.join(divider)
		);
		note = replaceTemplate(
			note,
			`"{{creator}}"`,
			creatorListQuotes.join(divider)
		);
		note = replaceTemplate(note, `{{creator}}`, creatorList.join(divider));
		note = replaceTemplate(note, `{{Creator}}`, creatorList.join(divider));


		return note;
	}
};

export function createTagList(tagList: string[], note: string) {
	if (tagList.length == 0) {
		return note;
	} else {
		const tagListBraket = tagList.map(makeWiki);
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
		return note;
	}
}

//function to replace the missing fields in the template
export function replaceMissingFields(
	note: string,
	missingfield: string,
	missingfieldreplacement: string
) {
	let copy = note.slice();
	if (missingfield === "Replace with custom text") {
		copy = copy
			.replace(TEMPLATE_BRACKET_REG, missingfieldreplacement)
			.trim();
		copy = copy.replace(TEMPLATE_REG, missingfieldreplacement).trim();
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
	copy = copy.replace("```ad-quote\n" + "title: Abstract\n" + "```\n", "");
	copy = copy.replace(
		"```ad-abstract\n" + "title: Files and Links\n" + "```\n",
		""
	);
	copy = copy.replace(
		"```ad-note\n" + "title: Tags and Collections\n" + "```\n",
		""
	);

	//Remove empty sections when there is no data
	copy = copy.replace(
		"## Abstract\n" + "\n" + "## Files and Links\n",
		"## Files and Links\n"
	);
	copy = copy.replace(
		"## Files and Links\n" + "\n" + "## Tags and Collections\n",
		"## Tags and Collections\n"
	);
	copy = copy.replace("## Tags and Collections\n" + "\n", "\n");

	//console.log(copy)
	return copy;
}

export function createLocalFileLink(reference: Reference) {
	//if there is no attachment, return placeholder
	if (reference.attachments.length == 0) return "{{localFile}}";
	const filesList: string[] = [];

	for (
		let attachmentindex = 0;
		attachmentindex < reference.attachments.length;
		attachmentindex++
	) {
		if (reference.attachments[attachmentindex].itemType !== "attachment")
			continue;

		//remove white spaces from file name
		if (reference.attachments[attachmentindex].path == undefined) {
			reference.attachments[attachmentindex].path = "";
		}

		const attachmentPathCorrected = reference.attachments[
			attachmentindex
		].path.replaceAll(" ", "%20");

		const selectedfile: string =
			"[" +
			reference.attachments[attachmentindex].title +
			"](file://" + // added an extra "/" to make it work on Linux
			encodeURI(attachmentPathCorrected) +
			")"; //select the author

		filesList.push(selectedfile);
	}
	//turn the array into a string
	const filesListString = filesList.join("; ");
	return filesListString;
}

export function createNoteTitle(
	selectedEntry: Reference,
	exportTitle: string,
	exportPath: string
) {
	//Replace the placeholders
	exportTitle = exportTitle.replace("{{citeKey}}", selectedEntry.citationKey);
	exportTitle = exportTitle.replace(
		"{{citationKey}}",
		selectedEntry.citationKey
	);
	exportTitle = exportTitle.replace(
		"{{citationkey}}",
		selectedEntry.citationKey
	);
	exportTitle = exportTitle.replace("{{citekey}}", selectedEntry.citationKey);

	exportTitle = exportTitle.replace("{{title}}", selectedEntry.title);

	exportTitle = exportTitle.replace("{{author}}", selectedEntry.authorKey);
	exportTitle = exportTitle.replace("{{authors}}", selectedEntry.authorKey);

	exportTitle = exportTitle.replace("{{year}}", selectedEntry.year);
	exportTitle = exportTitle.replace("{{date}}", selectedEntry.year);

	//Remove special characters from the name of the file
	exportTitle = exportTitle.replace(/[/\\?%*:|"<>]/g, "");

	//Get the path of the vault
	const vaultPath = this.app.vault.adapter.getBasePath();

	const exportPathFull = path.normalize(
		vaultPath + "/" + exportPath + "/" + exportTitle + ".md"
	);
	//console.log("exportPathFull: "+ exportPathFull)

	return exportPathFull;
}

export function replaceTagList(
	selectedEntry: Reference,
	arrayExtractedKeywords: string[],
	metadata: string,
	divider: string
) {
	// Copy the keywords extracted by Zotero and store them in an array
	selectedEntry.zoteroTags = [];
	if (selectedEntry.tags.length > 0) {
		for (
			let indexTag = 0;
			indexTag < selectedEntry.tags.length;
			indexTag++
		) {
			selectedEntry.zoteroTags.push(selectedEntry.tags[indexTag].tag);
		}
	}

	//add a space after the divided if it is not present
	if (divider.slice(-1) !== " ") {
		divider = divider + " ";
	}

	//Create three arrays for the tags from the metadata, tags exported from the text and tags combined
	const tagsZotero = selectedEntry.zoteroTags.sort();
	const tagsPDF = arrayExtractedKeywords.sort();
	const tagsCombined = tagsZotero.concat(tagsPDF).sort();

	//metadata = createTagList(selectedEntry.zoteroTags, metadata)

	//Replace in the text the tags extracted by Zotero
	if (tagsZotero.length > 0) {
		const tagsZoteroBracket = tagsZotero.map(makeWiki);
		metadata = replaceTemplate(
			metadata,
			`[[{{keywordsZotero}}]]`,
			String(tagsZoteroBracket.join(divider))
		);
		const tagsZoteroQuotes = tagsZotero.map(makeQuotes);
		metadata = replaceTemplate(
			metadata,
			`"{{keywordsZotero}}"`,
			String(tagsZoteroQuotes.join(divider))
		);
		const tagsZoteroTags = tagsZotero.map(makeTags);
		metadata = replaceTemplate(
			metadata,
			`#{{keywordsZotero}}`,
			String(tagsZoteroTags.join(divider))
		);

		metadata = replaceTemplate(
			metadata,
			`{{keywordsZotero}}`,
			String(tagsZotero.join(divider))
		);
	}

	//Replace in the text the tags extracted from the PDF
	if (tagsPDF.length > 0) {
		const tagsPDFBracket = tagsPDF.map(makeWiki);
		metadata = replaceTemplate(
			metadata,
			`[[{{keywordsPDF}}]]`,
			String(tagsPDFBracket.join(divider))
		);
		const tagsPDFQuotes = tagsPDF.map(makeQuotes);
		metadata = replaceTemplate(
			metadata,
			`"{{keywordsPDF}}"`,
			String(tagsPDFQuotes.join(divider))
		);
		const tagsPDFTags = tagsPDF.map(makeTags);
		metadata = replaceTemplate(
			metadata,
			`#{{keywordsPDF}}`,
			String(tagsPDFTags.join(divider))
		);
		metadata = replaceTemplate(
			metadata,
			`{{keywordsPDF}}`,
			String(tagsPDF.join(divider))
		);
	}

	//Replace in the text the tags extracted from the PDF combined with those extracted from the metadata
	if (tagsCombined.length > 0) {
		const tagsCombinedBracket = tagsCombined.map(makeWiki);
		metadata = replaceTemplate(
			metadata,
			`[[{{keywords}}]]`,
			String(tagsCombinedBracket.join(divider))
		);
		metadata = replaceTemplate(
			metadata,
			`[[{{keywordsAll}}]]`,
			String(tagsCombinedBracket.join(divider))
		);

		const tagsCombinedQuotes = tagsCombined.map(makeQuotes);
		metadata = replaceTemplate(
			metadata,
			`"{{keywordsAll}}"`,
			String(tagsCombinedQuotes.join(divider))
		);

		metadata = replaceTemplate(
			metadata,
			`"{{keywords}}"`,
			String(tagsCombinedQuotes.join(divider))
		);

		const tagsCombinedTags = tagsCombined.map(makeTags);
		metadata = replaceTemplate(
			metadata,
			`#{{keywordsAll}}`,
			String(tagsCombinedTags.join(divider))
		);

		metadata = replaceTemplate(
			metadata,
			`#{{keywords}}`,
			String(tagsCombinedTags.join(divider))
		);
		metadata = replaceTemplate(
			metadata,
			`{{keywordsAll}}`,
			String(tagsCombined.join(divider))
		);

		metadata = replaceTemplate(
			metadata,
			`{{keywords}}`,
			String(tagsCombined.join(divider))
		);
	}

	if (selectedEntry.zoteroTags.length == 0) {
		metadata = metadata.replace("# Tags\n", "");
		metadata = metadata.replace("## Tags\n", "");
		metadata = metadata.replace("### Tags\n", "");
	}
	return metadata;
}

export function openSelectedNote(
	selectedEntry: Reference,
	exportTitle: string,
	exportPath: string
) {
	const noteTitleFull = createNoteTitle(
		selectedEntry,
		exportTitle,
		exportPath
		//this.zoteroBuildWindows
	);

	//remove from the path of the note to be exported the path of the vault
	const noteTitleShort = noteTitleFull.replace(
		normalizePath(this.app.vault.adapter.getBasePath()) + "/",
		""
	);

	//Find the TFile
	const myFile = this.app.vault.getAbstractFileByPath(noteTitleShort);

	//Open the Note ina new leaf
	this.app.workspace.getUnpinnedLeaf().openFile(myFile);
}
