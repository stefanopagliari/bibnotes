import { MyPluginSettings } from "./types";

export const HTML_TAG_REG = new RegExp(/<\/?[^>]+(>|$)/g);
export const PAGE_NUM_REG = new RegExp(/([0-9]+)\)/);

export const ZOTFILE_REG = new RegExp(
	"\\(zotero://open-pdf/library/items/\\w+\\?page=\\d+\\)"
);

export const templateSimple = "# {{title}}\n" +
"\n" + 
"## Metadata\n" +
"- **CiteKey**: {{citekey}}\n " +
"- **Type**: {{itemType}}\n " +
"- **Title**: {{title}}, \n " +
"- **Author**:: [[{{author}}]];  \n"+
"- **Editor**:: [[{{editor}}]];  \n"+
"- **Translator**: {{translator}}\n"+
"- **Publisher**: {{publisher}},\n"+
"- **Location**: {{place}},\n"+
"- **Series**: {{volume}},\n"+
"- **Journal**: {{publicationTitle}}, \n"+
"- **Volume**: {{volume}},\n"+
"- **Issue**: {{issue}}\n"+
"- **Pages**: {{pages}}\n"+
"- **Year**: {{year}} \n"+
"- **Date Added**: {{dateAdded}}\n"+
"- **Date Modified**: {{dateModified}}\n"+
"- **DOI**: {{DOI}}\n"+
"- **ISSN**: {{ISBN}}\n"+
"- **ISBN**: {{ISBN}}\n"+
"\n"+
"## Abstract" +
"{{abstractNote}}" +
"\n"+
"## Files and Links\n"+
"- **Url**: {{url}}\n"+
"- **Uri**: {{uri}}\n"+
"- **Eprint**: {{eprint}}\n"+
"- **File**: {{file}}\n"+
"- **Local Library**: {{localLibrary}}\n"+
"\n"+
"## Tags\n"+
"* Keywords: {{keywords}}\n "

export const DEFAULT_SETTINGS: MyPluginSettings = {
	bibPath: "default",
	exportMetadata: true,
	exportAnnotations: true,
	templateContent: templateSimple,
	templatePath: "",
	templateType: "",
	exportPath: "default",
	exportTitle: "{{citeKey}}",
	missingfield: "Leave placeholder",
	keyMergeAbove: "+",
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
	isHighlightItalic: true,
	isHighlightBold: false,
	isHighlightHighlighted: false,
	isHighlightBullet: true,
	isHighlightBlockquote: false,
	isHighlightQuote: true,
	isCommentItalic: false,
	isCommentBold: true,
	isCommentHighlighted: false,
	isCommentBullet: false,
	isCommentBlockquote: true,
	isCommentQuote: false,
	isDoubleSpaced: true,
	highlightCustomTextBefore: "",
	highlightCustomTextAfter: "",
	commentCustomTextBefore: "",
	commentCustomTextAfter: "",
};

export enum HeaderLevels {
	"typeH1" = 1,
	"typeH2" = 2,
	"typeH3" = 3,
	"typeH4" = 4,
	"typeH5" = 5,
	"typeH6" = 6,
}

export const TEMPLATE_REG = /\{\{[^}]+\}\}/g;
export const TEMPLATE_BRACKET_REG = /\[\[\{\{[^}]+\}\}\]\]/g;


