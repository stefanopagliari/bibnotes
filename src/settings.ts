import MyPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { FolderSuggest } from "src/suggesters/FolderSuggester"


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

		containerEl.createEl('h1', {text: 'BibNotes Formatter (for Zotero) '});
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
		.addSearch((cb) => {
			new FolderSuggest(this.app, cb.inputEl);
			cb.setPlaceholder("Example: folder1/folder2")
				.setValue(this.plugin.settings.exportPath)
				.onChange(async (new_folder) => {
					settings.exportPath = new_folder;
					await plugin.saveSettings();
				});
			// @ts-ignore
		})

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
				.addTextArea((text) => {
						text.inputEl.rows = 10;
						// this is not strictly necessary, but it makes it a lot easier to read long lines
						text.inputEl.style.width = "100%";
						text.setValue(settings.templateContent).onChange(
							async (value) => {
								settings.templateContent = value;
								await plugin.saveSettings();
								//this.display();
							}
						);
					});
				}
			
					
			new Setting(settingsExport)
				.setName("Missing Fields")
				.setDesc(
					"Fields that are present in the template but missing from the selected field."
				)
				.addDropdown((d) => {
					d.addOption("Leave placeholder", "Leave placeholder");
					d.addOption("Remove (entire row)", "Remove (entire row)");
					d.addOption("Replace with custom text", "Replace with custom text");
					d.setValue(settings.missingfield);
					d.onChange(
						async (
							v:
								| "Leave placeholder"
								| "Remove (entire row)"
								| "Replace with custom text"
						) => {
							settings.missingfield = v;
							await plugin.saveSettings();
							this.display();
						}
					);
				});
				if (settings.missingfield==="Replace with custom text") {
					new Setting(settingsExport)
					.setName("Replacement for missing fields")
					.addText((text) =>
						text
							.setValue(settings.missingfieldreplacement)
							.onChange(async (value) => {
								settings.missingfieldreplacement = value;
								await plugin.saveSettings();
							})
					);
					}

			new Setting(settingsExport)
			.setName("Multiple Entries Divider")
			.setDesc('Type the character or expression that should separate multiple values when found in the same field (e.g. authors, editors, tags, collections).')
			.addTextArea((text) =>
				text
				.setValue(settings.multipleFieldsDivider)
				.onChange(async (value) => {
					settings.multipleFieldsDivider = value;
					await plugin.saveSettings();
					//this.display();
					}
				)
			)

			new Setting(settingsExport)
			.setName("Format Names")
			.setDesc('Specify how the names of the authors/editors should be exported.')
			.addTextArea((text) =>
				text
				.setValue(settings.nameFormat)
				.onChange(async (value) => {
					settings.nameFormat = value;
					await plugin.saveSettings();
					//this.display();
					}
				)
			)

	

			new Setting(settingsExport)
			.setName("Save Manual Edits")
			.setDesc(
				'Select "Yes" to preserve the manual edits made to the previously extracted note (e.g. block references, comments added manually, fixed typos) when this is updated. Select "No" to overwrite any manual change to the extracted annotation when this is updated.'
			)
			.addDropdown((d) => {
				d.addOption("Save Entire Note", "Save Entire Note");
				d.addOption("Select Section", "Select Section");
				d.addOption("Overwrite Entire Note", "Overwrite Entire Note");
				d.setValue(settings.saveManualEdits);
				d.onChange(
					async (
						v:
							| "Save Entire Note"
							| "Select Section"
							| "Overwrite Entire Note"
					) => {
						settings.saveManualEdits = v;
						await plugin.saveSettings();
						this.display();
					}
				);
			});

			if(settings.saveManualEdits == "Select Section"){
				new Setting(settingsExport)
				.setName("Start - Save Manual Edits")
				.setDesc(
					"Define string (e.g. '## Notes') in the template starting from where updating the note will not overwrite the existing text. If field is left empty, the value will be set to the beginning of the note"
				)
				.addText((text) =>
					text
						.setValue(settings.saveManualEditsStart)
						.onChange(async (value) => {
							settings.saveManualEditsStart = value;
							await plugin.saveSettings();
						})
				); 
			

			if(settings.saveManualEdits){
				new Setting(settingsExport)
				.setName("End - Save Manual Edits")
				.setDesc(
					"Define string (e.g. '## Notes') in the template until where updating the note will not overwrite the existing text. If field is left empty, the value will be set to the end of the note"
				)
				.addText((text) =>
					text
						.setValue(settings.saveManualEditsEnd)
						.onChange(async (value) => {
							settings.saveManualEditsEnd = value;
							await plugin.saveSettings();
						})
				);
			}
		}


		containerEl.createEl('h2', {text: 'Update Library'});
		const settingsUpdate: HTMLDetailsElement =
				containerEl.createEl("details");
				settingsUpdate.setAttribute("open", "");
		new Setting(settingsUpdate)
				.setName("Update Existing/All Notes")
				.setDesc(
					"Select whether to create new notes that are missing from Obsidian but present/modified within Zotero when runing the Update Library command"
				)
				.addDropdown((d) => {
					d.addOption("Only update existing notes", "Only existing notes");
					d.addOption("Create new notes when missing", "Create new notes when missing");
					d.setValue(settings.updateLibrary);
					d.onChange(
						async (
							v:
								| "Only update existing notes"
								| "Create new notes when missing"
						) => {
							settings.updateLibrary = v;
							await plugin.saveSettings();
						}
					);
				});


		containerEl.createEl('h2', {text: 'Format Annotations'});
			
		containerEl.createEl('h3', {text: 'In-text citations'});
		const settingsCitations: HTMLDetailsElement =
				containerEl.createEl("details");
				settingsCitations.setAttribute("open", "");
				settingsCitations.createEl("summary", {text: "" });
		
			new Setting(settingsCitations)
				.setName("End of Highlight Citation Format")
				.setDesc(
					"Select the style of the reference added next to the highlights and figures extracted from the PDF. This feature is for now available only for sources extracted from Zotero"
				)
				.addDropdown((d) => {
					d.addOption("Author, year, page number", "Author, year, page number");
					d.addOption("Only page number", "Only page number");
					d.addOption("Pandoc", "Pandoc");
					d.addOption("Empty", "Empty");
					d.setValue(settings.highlightCitationsFormat);
					d.onChange(
						async (
							v:
								| "Author, year, page number"
								| "Only page number"
								| "Pandoc"	
								| "Empty"
						) => {
							settings.highlightCitationsFormat = v;
							await plugin.saveSettings();
						}
					);
				});
			new Setting(settingsCitations)
				.setName("Create Link to the Highlight Page in the PDF")
				.setDesc(
					"If enabled, a link will be created at the end of the extracted highlights or figures to the original page of the PDF in the Zotero reader"
				)
				.addToggle((text) =>
					text
						.setValue(settings.highlightCitationsLink)
						.onChange(async (value) => {
							settings.highlightCitationsLink = value;
							await plugin.saveSettings();
							this.display();
						})
				);		


		containerEl.createEl('h3', {text: 'Highlights'});
			const settingsHighlights: HTMLDetailsElement =
				containerEl.createEl("details");
				settingsHighlights.setAttribute("open", "");
				settingsHighlights.createEl("summary", {text: "" });


			new Setting(settingsHighlights)
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
				.addTextArea((text) =>
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
				.addTextArea((text) =>
					text
						.setValue(settings.highlightCustomTextAfter)
						.onChange(async (value) => {
							console.log("highlightCustomTextAfter: " + value);
							settings.highlightCustomTextAfter = value;
							await plugin.saveSettings();
						})
				);
		
			containerEl.createEl('h3', {text: 'Comments'});
			const settingsComments: HTMLDetailsElement =
				containerEl.createEl("details");
				settingsComments.setAttribute("open", "");
				settingsComments.createEl("summary", {text: "" });


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
						.setValue(settings.isCommentBlockquote)
						.onChange(async (value) => {
							settings.isCommentBlockquote = value;
							await plugin.saveSettings();
							this.display();
						})
				);

			new Setting(settingsComments)
				.setName("Custom text before all comments")
				.addTextArea((text) =>
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
				.addTextArea((text) =>
					text
						.setValue(settings.commentCustomTextAfter)
						.onChange(async (value) => {
							console.log("commentCustomTextAfter: " + value);
							settings.commentCustomTextAfter = value;
							await plugin.saveSettings();
						})
				);

				containerEl.createEl('h3', {text: 'Additional Transformations'});
				const settingsAdvanced: HTMLDetailsElement =
					containerEl.createEl("details");
					settingsAdvanced.setAttribute("open", "");
					settingsAdvanced.createEl("summary", {text: "" });
	
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
					.setDesc("Text placed between the comment and the related highlight")
					.addText((text) =>
					text
						.setValue(settings.commentPrependDivider)
						.onChange(async (value) => {
							settings.commentPrependDivider = value;
							await plugin.saveSettings();
						})
				);
					new Setting(settingsAdvanced)
					.setDesc("Always place the comment made to an highlight before the text of the highlight")
					.addToggle((text) =>
					text
						.setValue(settings.commentPrependDefault)
						.onChange(async (value) => {
							settings.commentPrependDefault = value;
							await plugin.saveSettings();
							this.display();
						})
					);

					//commentPrependDivider
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
			
			containerEl.createEl('h3', {text: 'Highlight Color'});
			const settingsColour: HTMLDetailsElement =
				containerEl.createEl("details");
				settingsColour.setAttribute("open", "");
				settingsColour.createEl("summary", {text: "" });
				new Setting(settingsColour).setDesc(
					'Select the transformation to be done to the highlights of different colour by adding one of the following options: {{highlight}} preceded or followed by custom text; "H1" (transform into Level 1 Header); "H2" (transform into Level 2 Header); "H3" (transform into Level 3 Header); "H4" (transform into Level 4 Header); "H5" (transform into Level 5 Header); "H6" (transform into Level 6 Header); "AddToAbove" (append the highlight to the previous one); "Keyword" (add the text to the list of keywords); "Todo" (transform the text of the highlight and associated comment into a task)')
 
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
 
			
			containerEl.createEl('h2', {text: 'Import Images'});
		

			const importImages: HTMLDetailsElement =
			containerEl.createEl("details");
			importImages.setAttribute("open", "");
			importImages.createEl("summary", {text: "" });
			
			new Setting(importImages)
				.setName("Import Images")
				.setDesc("This option is available only for notes extracted using the Zotero native PDF reader")
				.addToggle((text) =>
					text
						.setValue(settings.imagesImport)
						.onChange(async (value) => {
							settings.imagesImport = value;
							await plugin.saveSettings();
							this.display();
						})
				);
			new Setting(importImages)
				.setName("Zotero Local Folder")
				.setDesc(`Add the path on your computer where Zotero's data is stored (e.g. "/Users/yourusername/Zotero/storage"). This field is required only when this is different from the folder where the PDF files are stored. To retrieve this information, open Zotero --> Preferences --> Advanced --> Files and Folder, and copy the "data directory location"`)
				.addText((text) =>
				text
					.setValue(settings.zoteroStoragePathManual)
					.onChange(async (value) => {
						settings.zoteroStoragePathManual = value;
						await plugin.saveSettings();
					})); 	 
			

			if(settings.imagesImport){
				new Setting(importImages)
					.setName("Copy the Image into the Obsidian Vault")
					.setDesc("If this option is selected, images selected through the Zotero reader will be copied into the Vault. If this option is not selected, the note will link to the file stored in Zotero/storage")					.addToggle((text) =>
						text
							.setValue(settings.imagesCopy)
							.onChange(async (value) => {
								settings.imagesCopy = value;
								await plugin.saveSettings();
								this.display();
							})
					);
					if(settings.imagesCopy){
						new Setting(importImages)
						.setName("Image Import Path")
						.setDesc("Add the relative path to the folder inside your vault where the image will be copied")
						.addSearch((cb) => {
							new FolderSuggest(this.app, cb.inputEl);
							cb.setPlaceholder("Example: folder1/folder2")
								.setValue(this.plugin.settings.imagesPath)
								.onChange(async (new_folder) => {
									settings.imagesPath = new_folder;
									await plugin.saveSettings();
								});
							})
						}
					
					new Setting(importImages)
						.setName("Position of Comment to an Image")
						//.setDesc("")
						.addDropdown((d) => {
							d.addOption("Above the image", "Above the image");
							d.addOption("Below the image", "Below the image");
							//d.addOption("Import from Note", "Import from Note");
							d.setValue(settings.imagesCommentPosition);
							d.onChange(
								async (
									v:
										| "Above the image"
										| "Below the image"
										//| "Import from Note"
								) => {
								settings.imagesCommentPosition = v;
								await plugin.saveSettings();
									this.display();
								}
								);
							}
						);
					}
				
			containerEl.createEl('h2', {text: 'Debugging'});
		

			const debugSettings: HTMLDetailsElement =
			containerEl.createEl("details");
			debugSettings.setAttribute("open", "");
			debugSettings.createEl("summary", {text: "" });
			
			new Setting(debugSettings)
				.setName("Activate Debug Mode")
				.setDesc("Activating this option will print the console logs of each entry exported in a text file to faciliate debugging.")
				.addToggle((text) =>
					text
						.setValue(settings.debugMode)
						.onChange(async (value) => {
							settings.debugMode = value;
							await plugin.saveSettings();
							this.display();
						})
				);
			
		}
	}

		

