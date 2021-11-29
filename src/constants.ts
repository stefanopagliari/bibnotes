import { MyPluginSettings } from "./types";

export const HTML_TAG_REG = new RegExp(/<\/?[^>]+(>|$)/g);
export const PAGE_NUM_REG = new RegExp(/([0-9]+)\)/);

export const DEFAULT_SETTINGS: MyPluginSettings = {
	bibPath: "default",
	exportMetadata: true,
	exportAnnotations: true,
	templateContent: "",
	templatePath: "",
	templateType: "",
	exportPath: "default",
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
