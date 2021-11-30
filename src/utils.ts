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
	let copy = note.slice();
	for (let z = 0; z < entriesArray.length; z++) {
		// 	 Identify the keyword to be replaced
		const KW = entriesArray[z];
		const KW_Brackets = "{{" + KW + "}}";
		// 	 replace the keyword in the template
		copy = replaceTemplate(
			copy,
			KW_Brackets,
			`${selectedEntry.fields[KW]}`
		);
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

export const getNameStr = (name: BibTeXParser.Name) => {
	const { firstName, lastName } = name;
	if (!firstName) return lastName;
	if (!lastName) return firstName;
	return lastName + ", " + firstName;
};

export const makeWiki = (str: string) => "[[" + str + "]]";

export function removeQuoteFromStart(quote: string, annotation: string) {
	let copy = annotation.slice();
	while (copy.charAt(0) === quote) copy = copy.substring(1);
	return copy;
}
export function removeQuoteFromEnd(quote: string, annotation: string) {
	let copy = annotation.slice();
	while (copy.charAt(-1) === quote) copy = copy.substring(0, -1);
	return copy;
}
