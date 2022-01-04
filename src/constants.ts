import { MyPluginSettings } from "./types";

export const HTML_TAG_REG = new RegExp(/<\/?[^>]+(>|$)/g);
export const PAGE_NUM_REG = new RegExp(/([0-9]+)\)/);

export const ZOTFILE_REG = new RegExp(
	"\\(zotero://open-pdf/library/items/\\w+\\?page=\\d+\\)"
);

export const templatePlain = "# {{title}}\n" +
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
"- **Series**: {{series}}\n"+
"- **Series Number**: {{seriesNumber}}\n"+
"- **Journal**: {{publicationTitle}}, \n"+
"- **Volume**: {{volume}},\n"+
"- **Issue**: {{issue}}\n"+
"- **Pages**: {{pages}}\n"+
"- **Year**: {{year}} \n"+
"- **DOI**: {{DOI}}\n"+
"- **ISSN**: {{ISSN}}\n"+
"- **ISBN**: {{ISBN}}\n"+
"\n"+
"## Abstract\n" +
"{{abstractNote}}" +
"\n"+
"## Files and Links\n"+
"- **Url**: {{url}}\n"+
"- **Uri**: {{uri}}\n"+
"- **Eprint**: {{eprint}}\n"+
"- **File**: {{file}}\n"+
"- **Local Library**: {{localLibrary}}\n"+
"\n"+
"## Tags and Collections\n"+
"- **Keywords**: {{keywords}}\n"+
"- **Collections**: {{collectionsParent}}\n"

export const templateAdmonition = "# {{title}}\n" +
"\n" + 
"``` ad-info\n" +
"title: Metadata\n" +
"- **CiteKey**: {{citekey}}\n" +
"- **Type**: {{itemType}}\n" +
"- **Author**:: [[{{author}}]]\n"+
"- **Editor**:: [[{{editor}}]]\n"+
"- **Translator**: {{translator}}\n"+
"- **Publisher**: {{publisher}}\n"+
"- **Location**: {{place}}\n"+
"- **Series**: {{series}}\n"+
"- **Series Number**: {{seriesNumber}}\n"+
"- **Journal**: {{publicationTitle}}\n"+
"- **Volume**: {{volume}}\n"+
"- **Issue**: {{issue}}\n"+
"- **Pages**: {{pages}}\n"+
"- **Year**: {{year}} \n"+
"- **DOI**: {{DOI}}\n"+
"- **ISSN**: {{ISSN}}\n"+
"- **ISBN**: {{ISBN}}\n"+
"```\n" +
"```ad-quote\n" +
"title: Abstract\n" +
"{{abstractNote}}\n" +
"```\n" +
"```ad-abstract\n" +
"title: Files and Links\n" +
"- **Url**: {{url}}\n"+
"- **Uri**: {{uri}}\n"+
"- **Eprint**: {{eprint}}\n"+
"- **File**: {{file}}\n"+
"- **Local Library**: {{localLibrary}}\n"+
"```\n" +
"```ad-note\n" +
"title: Tags and Collections\n" +
"- **Keywords**: {{keywords}}\n"+
"- **Collections**: {{collectionsParent}}\n"+
"```\n" 

export const DEFAULT_SETTINGS: MyPluginSettings = {
	bibPath: "",
	exportMetadata: true,
	exportAnnotations: true,
	templateContent: templatePlain,
	templatePath: "",
	templateType: "Admonition",
	lastUpdateDate: new Date('1995-12-17T03:24:00'),
	exportPath: "",
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
	colourYellowText: "{{highlight}}",
	colourPurpleText: "{{highlight}}",
	colourRedText: "{{highlight}}",
	colourGreenText: "{{highlight}}",
	colourBlueText: "{{highlight}}",
	colourBlackText: "{{highlight}}",
	colourWhiteText: "{{highlight}}",
	colourGrayText: "{{highlight}}",
	colourOrangeText: "{{highlight}}",
	colourCyanText: "{{highlight}}",
	colourMagentaText: "{{highlight}}",
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


