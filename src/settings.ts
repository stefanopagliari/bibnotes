import MyPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class SettingTab extends PluginSettingTab {
	plugin: MyPlugin;
	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl, plugin } = this;
		const { settings } = plugin;

		containerEl.empty();

		containerEl.createEl('h1', {text: 'LitNotes Formatter (for Zotero) '});
		containerEl.createEl('a', { text: 'Created by Stefano Pagliari', href: 'https://github.com/stefanopagliari/'});
		containerEl.createEl('h2', {text: 'Import Library'});
		

		const importLibrary: HTMLDetailsElement =
		containerEl.createEl("details");
		importLibrary.setAttribute("open", "");
		importLibrary.createEl("summary", {text: "" });

		new Setting(importLibrary)
			.setName("Bibtex File")
			.setDesc("Add Path to the *BetterBibTex Json* file to be imported")
			.addText((text) =>
				text
					.setPlaceholder("/path/to/BetterBibTex.json")
					.setValue(settings.bibPath)
					.onChange(async (value) => {
						console.log("Path Bib: " + value);
						settings.bibPath = value;
						await plugin.saveSettings();
					})
			);
		

		
		containerEl.createEl('h2', {text: 'Export Notes'});

		const settingsExport: HTMLDetailsElement =
		containerEl.createEl("details");
		settingsExport.setAttribute("open", "");
		settingsExport.createEl("summary", {text: "" });
//			containerEl.createEl('h3', {text: 'Export Notes'});

		new Setting(settingsExport)
			.setName("Export Path")
			.setDesc("Add the relative path to the folder inside your vault where the notes will be exported")
			.addText((text) =>
				text
					.setPlaceholder("/relativepath/to/Folder/Note/intheVault")
					.setValue(settings.exportPath)
					.onChange(async (value) => {
						settings.exportPath = value;
						await plugin.saveSettings(); 
					})
			);

		new Setting(settingsExport)
		.setName("Note Title")
		.setDesc("Select the format of the title of the note. Possible values include: {{citeKey}}, {{title}}, {{author}}, {{year}}")
		.addText((text) =>
			text
				.setPlaceholder("{{citeKey}}")
				.setValue(settings.exportTitle)
				.onChange(async (value) => {
					settings.exportTitle = value;
					await plugin.saveSettings();
				})
		);	
		new Setting(settingsExport)
			.setName("Extract Metadata")
			.setDesc(
				'Select "Yes" to extract the metadata at the beginning of the note, "No" to extract only the title and the author/s'
			)
			.addToggle((text) =>
				text
					.setValue(settings.exportMetadata)
					.onChange(async (value) => {
						settings.exportMetadata = value;
						await plugin.saveSettings();
						this.display();
					})
			);
		


if (settings.exportMetadata) {

			new Setting(settingsExport)
				.setName("Select Template")
				.setDesc(
					"Select one of the default templates or provide a custom one."
				)
				.addDropdown((d) => {
					d.addOption("Plain", "Plain");
					d.addOption("Admonition", "Admonition");
					d.addOption("Custom", "Custom Template");
					//d.addOption("Import from Note", "Import from Note");
					d.setValue(settings.templateType);
					d.onChange(
						async (
							v:
								| "Plain"
								| "Admonition"
								| "Custom"
								//| "Import from Note"
 						) => {
 							settings.templateType = v;
 							await plugin.saveSettings();
							this.display();

						}
						);
					}
				);
		if (settings.templateType==="Custom") {
			new Setting(settingsExport)
				.setName('Custom Template')
				.addTextArea((text) =>
					text
					.setValue(settings.templateContent)
					.onChange(async (value) => {
						settings.templateContent = value;
						await plugin.saveSettings();
						//this.display();
						}
					)
			
				);
				}
			 
					
			new Setting(settingsExport)
				.setName("Missing Fields")
				.setDesc(
					"Fields that are present in the template but missing from the selected field."
				)
				.addDropdown((d) => {
					d.addOption("Leave placeholder", "Leave placeholder");
					d.addOption("Replace with NA", "Replace with NA");
					d.addOption("Remove (entire row)", "Remove (entire row)");
					d.setValue(settings.missingfield);
					d.onChange(
						async (
							v:
								| "Leave placeholder"
								| "Replace with NA"
								| "Remove (entire row)"
						) => {
							settings.missingfield = v;
							await plugin.saveSettings();
						}
					);
				});

		}

		containerEl.createEl('h2', {text: 'Format Annotations'});

		new Setting(containerEl)
		.setName("Extract Annotations")
		.addToggle((text) =>
			text
				.setValue(settings.exportAnnotations)
				.onChange(async (value) => {
					settings.exportAnnotations = value;
					await plugin.saveSettings();
					this.display();
				})
		);

		if (settings.exportAnnotations) {
			const settingsHighlights: HTMLDetailsElement =
				containerEl.createEl("details");

			settingsHighlights.createEl("summary", { text: "Highlights" });
			new Setting(containerEl)
				.setName("Double Spaced")
				.setDesc(
					"Set toggle to on to add an empty space between different highlights"
				)
				.addToggle((text) =>
					text
						.setValue(settings.isDoubleSpaced)
						.onChange(async (value) => {
							settings.isDoubleSpaced = value;
							await plugin.saveSettings();
							this.display();
						})
				);

			new Setting(settingsHighlights)
				.setName("Quotation Marks")
				.addToggle((text) =>
					text 
						.setValue(settings.isHighlightQuote)
						.onChange(async (value) => {
							settings.isHighlightQuote = value;
							await plugin.saveSettings();
							this.display();
						})
				);
			new Setting(settingsHighlights).setName("Bold").addToggle((text) =>
				text
					.setValue(settings.isHighlightBold)
					.onChange(async (value) => {
						settings.isHighlightBold = value;
						await plugin.saveSettings();
						this.display();
					})
			);
			new Setting(settingsHighlights)
				.setName("Italic")
				.addToggle((text) =>
					text
						.setValue(settings.isHighlightItalic)
						.onChange(async (value) => {
							settings.isHighlightItalic = value;
							await plugin.saveSettings();
							this.display();
						})
				);

			new Setting(settingsHighlights)
				.setName("Highlighted")
				.addToggle((text) =>
					text
						.setValue(settings.isHighlightHighlighted)
						.onChange(async (value) => {
							settings.isHighlightHighlighted = value;
							await plugin.saveSettings();
							this.display();
						})
				);
			new Setting(settingsHighlights)
				.setName("Bullet Points")
				.addToggle((text) =>
					text
						.setValue(settings.isHighlightBullet)
						.onChange(async (value) => {
							settings.isHighlightBullet = value;
							await plugin.saveSettings();
							this.display();
						})
				);

			new Setting(settingsHighlights)
				.setName("Blockquote")
				.addToggle((text) =>
					text
						.setValue(settings.isHighlightBlockquote)
						.onChange(async (value) => {
							settings.isHighlightBlockquote = value;
							await plugin.saveSettings();
							this.display();
						})
				);

			new Setting(settingsHighlights)
				.setName("Custom text before all highlights")
				.addText((text) =>
					text
						.setValue(settings.highlightCustomTextBefore)
						.onChange(async (value) => {
							console.log("highlightCustomTextBefore: " + value);
							settings.highlightCustomTextBefore = value;
							await plugin.saveSettings();
						})
				);

			new Setting(settingsHighlights)
				.setName("Custom text after all highlights")
				.addText((text) =>
					text
						.setValue(settings.highlightCustomTextAfter)
						.onChange(async (value) => {
							console.log("highlightCustomTextAfter: " + value);
							settings.highlightCustomTextAfter = value;
							await plugin.saveSettings();
						})
				);
		}
		if (settings.exportAnnotations) {
			const settingsComments: HTMLDetailsElement =
				containerEl.createEl("details");
			settingsComments.createEl("summary", { text: "Comments" });

			new Setting(settingsComments)
				.setName("Quotation Marks")
				.addToggle((text) =>
					text
						.setValue(settings.isCommentQuote)
						.onChange(async (value) => {
							settings.isCommentQuote = value;
							await plugin.saveSettings();
							this.display();
						})
				);

			new Setting(settingsComments).setName("Bold").addToggle((text) =>
				text
					.setValue(settings.isCommentBold)
					.onChange(async (value) => {
						settings.isCommentBold = value;
						await plugin.saveSettings();
						this.display();
					})
			);
			new Setting(settingsComments).setName("Italic").addToggle((text) =>
				text
					.setValue(settings.isCommentItalic)
					.onChange(async (value) => {
						settings.isCommentItalic = value;
						await plugin.saveSettings();
						this.display();
					})
			);

			new Setting(settingsComments)
				.setName("Highlighted")
				.addToggle((text) =>
					text
						.setValue(settings.isCommentHighlighted)
						.onChange(async (value) => {
							settings.isCommentHighlighted = value;
							await plugin.saveSettings();
							this.display();
						})
				);
			new Setting(settingsComments)
				.setName("Bullet Points")
				.addToggle((text) =>
					text
						.setValue(settings.isCommentBullet)
						.onChange(async (value) => {
							settings.isCommentBullet = value;
							await plugin.saveSettings();
							this.display();
						})
				);

			new Setting(settingsComments)
				.setName("Blockquote")
				.addToggle((text) =>
					text
						.setValue(settings.isHighlightBlockquote)
						.onChange(async (value) => {
							settings.isHighlightBlockquote = value;
							await plugin.saveSettings();
							this.display();
						})
				);

			new Setting(settingsComments)
				.setName("Custom text before all comments")
				.addText((text) =>
					text
						.setValue(settings.commentCustomTextBefore)
						.onChange(async (value) => {
							console.log("commentCustomTextBefore: " + value);
							settings.commentCustomTextBefore = value;
							await plugin.saveSettings();
						})
				);

			new Setting(settingsComments)
				.setName("Custom text after all comments")
				.addText((text) =>
					text
						.setValue(settings.commentCustomTextAfter)
						.onChange(async (value) => {
							console.log("commentCustomTextAfter: " + value);
							settings.commentCustomTextAfter = value;
							await plugin.saveSettings();
						})
				);

			if (settings.exportAnnotations) {
				const settingsAdvanced: HTMLDetailsElement =
					containerEl.createEl("details");
				settingsAdvanced.createEl("summary", {
					text: "Transformations",
				});
				new Setting(settingsAdvanced).setDesc(
					"Add a single character (e.g. #) or a single word (e.g. todo). When this character/word is found at the beginning of a comment, the text of the comment or the highlighted text will be transformed"
				);
				new Setting(settingsAdvanced)
					.setName("Heading Level 1")
					//.setDesc('The comment and/or the highlight will be transformed into a level 1 heading')
					.addText((text) =>
						text
							// .setPlaceholder('#')
							.setValue(settings.keyH1)
							.onChange(async (value) => {
								console.log("H1: " + value);
								//check if the value added is already assigned. If it is warn; otherwise save it
								if (
									Object.values(settings).indexOf(value) > -1
								) {
									alert(
										"This value is already assigned to a different transformation. Chose a different value"
									);
								} else {
									settings.keyH1 = value;
									await plugin.saveSettings();
								}
							})
					);

				new Setting(settingsAdvanced)
					.setName("Heading Level 2")
					//.setDesc('The comment and/or the highlight will be transformed into a level 1 heading')
					.addText((text) =>
						text
							// .setPlaceholder('##')
							.setValue(settings.keyH2)
							.onChange(async (value) => {
								console.log("H2: " + value);
								//check if the value added is already assigned. If it is warn; otherwise save it
								if (
									Object.values(settings).indexOf(value) > -1
								) {
									alert(
										"This value is already assigned to a different transformation. Chose a different value"
									);
								} else {
									settings.keyH2 = value;
									await plugin.saveSettings();
								}
							})
					);
				new Setting(settingsAdvanced)
					.setName("Heading Level 3")
					//.setDesc('Add a single character or word (e.g. ###). When this character/word is found at the beginning of a comment to a highlight, the highlight will be transformed into a level 1 heading')
					.addText((text) =>
						text
							.setPlaceholder("###")
							.setValue(settings.keyH3)
							.onChange(async (value) => {
								console.log("H3: " + value);
								//check if the value added is already assigned. If it is warn; otherwise save it
								if (
									Object.values(settings).indexOf(value) > -1
								) {
									alert(
										"This value is already assigned to a different transformation. Chose a different value"
									);
								} else {
									settings.keyH3 = value;
									await plugin.saveSettings();
								}
							})
					);
				new Setting(settingsAdvanced)
					.setName("Heading Level 4")
					//.setDesc('Add a single character or word (e.g. ####). When this character/word is found at the beginning of a comment to a highlight, the highlight will be transformed into a level 1 heading')
					.addText((text) =>
						text
							// .setPlaceholder('####')
							.setValue(settings.keyH4)
							.onChange(async (value) => {
								console.log("H4: " + value);
								//check if the value added is already assigned. If it is warn; otherwise save it
								if (
									Object.values(settings).indexOf(value) > -1
								) {
									alert(
										"This value is already assigned to a different transformation. Chose a different value"
									);
								} else {
									settings.keyH4 = value;
									await plugin.saveSettings();
								}
							})
					);
				new Setting(settingsAdvanced)
					.setName("Heading Level 5")
					//	.setDesc('Add a single character or word (e.g. ####). When this character/word is found at the beginning of a comment to a highlight, the highlight will be transformed into a level 1 heading')
					.addText((text) =>
						text
							// .setPlaceholder('#####')
							.setValue(settings.keyH5)
							.onChange(async (value) => {
								console.log("H5: " + value);
								//check if the value added is already assigned. If it is warn; otherwise save it
								if (
									Object.values(settings).indexOf(value) > -1
								) {
									alert(
										"This value is already assigned to a different transformation. Chose a different value"
									);
								} else {
									settings.keyH5 = value;
									await plugin.saveSettings();
								}
							})
					);

				new Setting(settingsAdvanced)
					.setName("Heading Level 6")
					//		.setDesc('Add a single character or word (e.g. ####). When this character/word is found at the beginning of a comment to a highlight, the highlight will be transformed into a level 1 heading')
					.addText((text) =>
						text
							// .setPlaceholder('######')
							.setValue(settings.keyH6)
							.onChange(async (value) => {
								console.log("H6: " + value);
								//check if the value added is already assigned. If it is warn; otherwise save it
								if (
									Object.values(settings).indexOf(value) > -1
								) {
									alert(
										"This value is already assigned to a different transformation. Chose a different value"
									);
								} else {
									settings.keyH6 = value;
									await plugin.saveSettings();
								}
							})
					);

				new Setting(settingsAdvanced)
					.setName("Append highlight to the end of the previous one")
					//.setDesc('Add a single character or word (e.g. +). When this character/word is found at the beginning of a comment to a highlight, the highlight will be attached at the end of the previous one. THis can be used to combine two sentences found respectively at the end of a page and at the beginning of the next one')
					.addText((text) =>
						text
							// .setPlaceholder('+')
							.setValue(settings.keyMergeAbove)
							.onChange(async (value) => {
								console.log("MergeAbove: " + value);
								//check if the value added is already assigned. If it is warn; otherwise save it
								if (
									Object.values(settings).indexOf(value) > -1
								) {
									alert(
										"This value is already assigned to a different transformation. Chose a different value"
									);
								} else {
									settings.keyMergeAbove = value;
									await plugin.saveSettings();
								}
							})
					);

				new Setting(settingsAdvanced)
					.setName("Place comment before the highlight")
					//.setDesc('Add a single character or word (e.g. +). When this character/word is found at the beginning of a comment to a highlight, the highlight will be attached at the end of the previous one. THis can be used to combine two sentences found respectively at the end of a page and at the beginning of the next one')
					.addText((text) =>
						text
							// .setPlaceholder('%')
							.setValue(settings.keyCommentPrepend)
							.onChange(async (value) => {
								console.log("CommentPrepend: " + value);
								//check if the value added is already assigned. If it is warn; otherwise save it
								if (
									Object.values(settings).indexOf(value) > -1
								) {
									alert(
										"This value is already assigned to a different transformation. Chose a different value"
									);
								} else {
									settings.keyCommentPrepend = value;
									await plugin.saveSettings();
								}
							})
					);

				new Setting(settingsAdvanced)
					.setName("Transform the highlight/comment into a task")
					.addText((text) =>
						text
							// .setPlaceholder('%')
							.setValue(settings.keyTask)
							.onChange(async (value) => {
								//check if the value added is already assigned. If it is warn; otherwise save it
								if (
									Object.values(settings).indexOf(value) > -1
								) {
									alert(
										"This value is already assigned to a different transformation. Chose a different value"
									);
								} else {
									settings.keyTask = value;
									await plugin.saveSettings();
								}
							})
					);	
			
				const settingsColour: HTMLDetailsElement =
					containerEl.createEl("details");
					//settingsColour.setAttribute("open", "");
					settingsColour.createEl("summary", {
					text: "Colour",
				});
				settingsColour.createEl('h6', {text: 'Select the transformation to be done to the highlights of different colour by adding one of the following options: {{highlight}} preceded or followed by custom text; "H1" (transform into Level 1 Header); "H2" (transform into Level 2 Header); "H3" (transform into Level 3 Header); "H4" (transform into Level 4 Header); "H5" (transform into Level 5 Header); "H6" (transform into Level 6 Header); "AddToAbove" (append the highlight to the previous one); "Keyword" (add the text to the list of keywords); "Todo" (transform the text of the highlight and associated comment into a task)'});
				
 
				new Setting(settingsColour) 
				.setName("Yellow")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourYellowText)
					.onChange(async (value) => {
						settings.colourYellowText = value;
						await plugin.saveSettings();
					})
					); 

				new Setting(settingsColour) 
				.setName("Red")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourRedText)
					.onChange(async (value) => {
						settings.colourRedText = value;
						await plugin.saveSettings();

					})); 

				new Setting(settingsColour) 
				.setName("Green")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourGreenText)
					.onChange(async (value) => {
						settings.colourGreenText = value;
						await plugin.saveSettings();
					})); 
				new Setting(settingsColour) 
				.setName("Blue")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourBlueText)
					.onChange(async (value) => {
						settings.colourBlueText = value;
						await plugin.saveSettings();
					})); 
				
				new Setting(settingsColour) 
				.setName("Purple")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourPurpleText)
					.onChange(async (value) => {
						settings.colourPurpleText = value;
						await plugin.saveSettings();
					})); 

				new Setting(settingsColour) 
				.setName("Black")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourBlackText)
					.onChange(async (value) => {
						settings.colourBlackText = value;
						await plugin.saveSettings();
					})); 

				new Setting(settingsColour) 
				.setName("White")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourWhiteText)
					.onChange(async (value) => {
						settings.colourWhiteText = value;
						await plugin.saveSettings();
					})); 					

				new Setting(settingsColour) 
				.setName("Gray")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourGrayText)
					.onChange(async (value) => {
						settings.colourGrayText = value;
						await plugin.saveSettings();
					})); 	
					
				new Setting(settingsColour) 
				.setName("Orange")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourOrangeText)
					.onChange(async (value) => {
						settings.colourOrangeText = value;
						await plugin.saveSettings();
					})); 


				new Setting(settingsColour) 
				.setName("Cyan")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourCyanText)
					.onChange(async (value) => {
						settings.colourCyanText = value;
						await plugin.saveSettings();
					})); 	
					
				new Setting(settingsColour) 
				.setName("Magenta")
				.setDesc("")
				.addText((text) =>
				text
					.setValue(settings.colourMagentaText)
					.onChange(async (value) => {
						settings.colourMagentaText = value;
						await plugin.saveSettings();
					})); 		
 
			}
		}
	}
}
