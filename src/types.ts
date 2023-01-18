

export interface MyPluginSettings {
	bibPath: string;
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
	commentPrependDefault: boolean;
	// commentPrependDivider: string;
	// commentAppendDivider: string;
	TagBeginningConfig: string;
	TagEndConfig: string;
	TagDividerConfig: string;
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
	isHighlightColoured: boolean;
	isHighlightBullet: boolean;
	isHighlightBlockquote: boolean;
	isHighlightQuote: boolean;
	highlightCustomTextBefore: string;
	highlightCustomTextAfter: string;
	isCommentItalic: boolean;
	isCommentBold: boolean;
	isCommentHighlighted: boolean;
	isCommentColoured: boolean;
	isCommentBullet: boolean;
	isCommentBlockquote: boolean;
	isCommentQuote: boolean;
	commentCustomTextBefore: string;
	commentCustomTextAfter: string;
	isTagItalic: boolean;
	isTagBold: boolean;
	isTagHighlighted: boolean;
	isTagColoured: boolean;
	isTagBullet: boolean;
	isTagBlockquote: boolean;
	isTagQuote: boolean;
	isTagHash: boolean;
	tagCustomTextBefore: string;
	tagCustomTextAfter: string;
	tagCustomTextBeforeFirst: string;
	tagCustomTextAfterLast: string;
	isDoubleSpaced: boolean;
	highlightExportTemplate: string;
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
	colourCustomHexValue: string;
	colourCustomHexText: string;
	multipleFieldsDivider: string;
	nameFormat: string;
	highlightCitationsFormat: string;
	highlightCitationsLink: boolean;
	debugMode: boolean;
	zoteroStoragePathManual: string;
	missingfieldreplacement: string;
}

export interface Reference {
	authorKey: string;
	authorKeyInitials: string;
	authorKeyFullName: string;
	id: number;
	citationKey: string;
	citeKey: string;
	year: string;
	citationInLine: string;
	citationInLineInitials: string;
	citationInLineFullName: string;
	citationShort: string;
	citationFull: string;
	itemType: string;
	inlineReference: string;
	date: string;
	dateModified: string;
	itemKey: string;
	itemID: number;
	title: string;
	publicationTitle: string;
	volume: number;
	issue: number;
	pages: string;
	creators: {
		creatorType: string;
		firstName: string;
		lastName: string;
		name: string;
	}[];
	file: string;
	localLibrary: string;
	localLibraryLink: string;
	select: string;
	attachments: {
		dateAdded: string;
		dateModified: string;
		itemType: string;
		path: string;
		relations: string[];
		tags: string[];
		title: string;
		uri: string;
	}[];
	notes: {
		dateAdded: string;
		dateModified: string;
		itemType: string;
		key: string;
		note: string;
		parentItem: "VMSSFNIR";
		relations: string[];
		tags: string[];
		uri: string;
		version: number;
	}[];
	tags: {
		tag: string;
	}[];
	zoteroTags: string[];
}

export interface AnnotationElements {
	annotationType: string;
	citeKey: string;
	commentText: string;
	commentFormatted: string;
	commentFormattedNoPrepend: string;
	highlightText: string;
	highlightColour: string;
	highlightFormatted: string;
	highlightFormattedNoPrepend: string;
	inlineTagsText: string;
	inlineTagsArray: string[];
	inlineTagsFormatted: string;
	inlineTagsFormattedNoPrepend: string;
	indexNote: number;
	rowOriginal: string;
	rowEdited: string;
	foundOld: boolean;
	positionOld: number;
	extractionSource: string;
	colourTemplate: string;
	colourTemplateFormatted: string;
	colourTemplateNoPrepend: string;
	colourTextBefore: string;
	colourTextAfter: string;
	imagePath: string;
	pagePDF: number;
	pageLabel: number;
	attachmentURI: string;
	zoteroBackLink: string;
	annotationKey: string;
}
[];

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

export type CreatorArray = Array<Creator>;
