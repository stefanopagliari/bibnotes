import * as BibTeXParser from "@retorquere/bibtex-parser";

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
	selectedEntry: BibTeXParser.Entry
) {
	for (let z = 0; z < entriesArray.length; z++) {
		// 	 Identify the keyword to be replaced
		const KW = entriesArray[z];
		const KW_Brackets = "{{" + entriesArray[z] + "}}";
		// 	 replace the keyword in the template
		note = replaceTemplate(
			note,
			KW_Brackets,
			`${selectedEntry.fields[KW]}`
		);
	}
	return note;
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
