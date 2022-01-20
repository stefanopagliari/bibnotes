export interface Name {
	/**
	 * If the name is a literal (surrounded by braces) it will be in this property, and none of the other properties will be set
	 */
	literal?: string;

	/**
	 * Family name
	 */
	lastName?: string;

	/**
	 * available when parsing biblatex extended name format
	 */
	useprefix?: boolean;

	/**
	 * available when parsing biblatex extended name format
	 */
	juniorcomma?: boolean;

	/**
	 * given name. Will include middle names and initials.
	 */
	firstName?: string;

	/**
	 * Initials.
	 */
	initial?: string;

	/**
	 * things like `Jr.`, `III`, etc
	 */
	suffix?: string;

	/**
	 * things like `von`, `van der`, etc
	 */
	prefix?: string;
}

// import { Entry } from '@retorquere/bibtex-parser';
// // Also make EntryDataBibLaTeX available to other modules
// export { Entry } from '@retorquere/bibtex-parser';

// //   export interface Entry {
// //     /**
// //      * citation key
// //      */
// //     key: string

// //     /**
// //      * entry type
// //      */
// //     type: string

// //     /**
// //      * entry fields. The keys are always in lowercase
// //      */
// //     fields: { [key: string]: string[] }

// //     /**
// //      * authors, editors, by creator type. Name order within the creator-type is retained.
// //      */
// //     creators: { [type: string]: Name[] }

// //     /**
// //      * will be set to `true` if sentence casing was applied to the entry
// //      */
// //     sentenceCased?: boolean
// //   }



export interface MyPluginSettings {
	bibPath: string;
	exportMetadata: boolean;
	exportAnnotations: boolean;
	templateContent: string;
	templatePath: string;
	templateType: string;
	exportPath: string;
	exportTitle: string;
	missingfield: string;
	saveManualEdits: string;
	saveManualEditsStart: string;
	saveManualEditsEnd: string;
	imagesImport: boolean;
	imagesCopy: boolean;
	imagesPath: string;
	imagesCommentPosition: string;
	keyMergeAbove: string;
	keyCommentPrepend: string;
	keyH1: string;
	keyH2: string;
	keyH3: string;
	keyH4: string;
	keyH5: string;
	keyH6: string;
	keyKeyword: string;
	keyTask: string;
	lastUpdateDate: Date;
	updateLibrary: string;
	isHighlightItalic: boolean;
	isHighlightBold: boolean;
	isHighlightHighlighted: boolean;
	isHighlightBullet: boolean;
	isHighlightBlockquote: boolean;
	isHighlightQuote: boolean;
	highlightCustomTextBefore: string;
	highlightCustomTextAfter: string;
	isCommentItalic: boolean;
	isCommentBold: boolean;
	isCommentHighlighted: boolean;
	isCommentBullet: boolean;
	isCommentBlockquote: boolean;
	isCommentQuote: boolean;
	commentCustomTextBefore: string;
	commentCustomTextAfter: string;
	isDoubleSpaced: boolean;	
	colourYellowText: string;
	colourPurpleText: string;
	colourRedText: string;
	colourGreenText: string;
	colourBlueText: string; 
	colourBlackText: string; 
	colourWhiteText: string; 
	colourGrayText: string; 
	colourOrangeText: string; 
	colourCyanText: string; 
	colourMagentaText: string; 
	multipleFieldsDivider: string;
	nameFormat: string;
	highlightCitationsFormat: string;
	highlightCitationsLink: boolean;
	debugMode: boolean;
}

export interface Reference {
	authorKey: string;
	id: number;
	citationKey: string;
	year: string;
	itemType: string;
	inlineReference: string;
	date: string;
	dateModified: string;
	itemKey:string;
	itemID: number;
	title: string;
	creators: {
		creatorType: string;
		firstName: string;
		lastName: string;
		name: string;
		}[]
	file: string;
	localLibrary: string;
	select:string;
	attachments:{
		dateAdded: string,
		dateModified: string,
		itemType: string,
		path: string,
		relations: string[],
		tags: string[],
		title: string,
		uri: string,
	}[],
	notes:{
		"dateAdded": string,
		"dateModified": string,
		"itemType": string,
		"key": string,
		"note": string,
		"parentItem": "VMSSFNIR",
        "relations": string[],
        "tags": string[],
        "uri": string,
        "version": number
	}[],
	tags: 
        {
          "tag": string
        }[],
	zoteroTags: string[]
}

export interface AnnotationElements {
	annotationType: string,
	citeKey: string,
	commentText: string,
	highlightText: string,
	highlightColour: string,
	indexNote: number,
	rowOriginal: string,
	rowEdited: string,
	foundOld: boolean,
	positionOld: number,
	extractionSource: string,
	colourTextBefore: string,
	colourTextAfter: string,
	imagePath: string,
	pagePDF: number,
	pageLabel: number,
	attachmentURI: string,
	zoteroBackLink: string,
	}[]



export interface Creator {
    creatorType: string;
    firstName: string;
    lastName: string;
    name: string;
}

export interface Collection {
    collections: string[];
    items: string[];
    key: string;
    name: string;
    parent: string;
}

export type CreatorArray = Array<Creator>