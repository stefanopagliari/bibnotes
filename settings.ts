import MyPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class SettingTab extends PluginSettingTab {
    plugin: MyPlugin;
	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		const settingHeader = containerEl.createEl("div")
        settingHeader.createEl("div", { text: "Settings for the plugin" });
        settingHeader.createEl("small", { text: "- - - -" });
         

		new Setting(containerEl)
			.setName('Bibtex File')
			.setDesc('Add Path to the bibtex (*.bib) to be imported')
			.addText(text => text
				.setPlaceholder('/path/to/Zotero_export.bib')
				.setValue(this.plugin.settings.bibPath)
				.onChange(async (value) => {
					console.log('Path Bib: ' + value);
					this.plugin.settings.bibPath = value;
					await this.plugin.saveSettings();
				}));



		
		new Setting(containerEl)
			.setName('Export Path')
			.setDesc('Add Path to the folder where the notes will be exported')
			.addText(text => text
				.setPlaceholder('/path/to/Folder/Note/')
				.setValue(this.plugin.settings.exportPath)
			.onChange(async (value) => {
				console.log('Export Path Template: ' + value);
				this.plugin.settings.exportPath = value;
				await this.plugin.saveSettings();
			}));
		new Setting(containerEl)
			.setName('Extract Metadata')
			.setDesc('Select "Yes" to extract the metadata at the beginning of the note, "No" to extract only the title and the author/s')
			.addToggle(text => text
				.setValue(this.plugin.settings.exportMetadata)
				.onChange(async (value) => {
					this.plugin.settings.exportMetadata = value;
					await this.plugin.saveSettings();
					this.display()
				}));
		new Setting(containerEl)
			.setName('Extract Annotations')
			.addToggle(text => text
				.setValue(this.plugin.settings.exportAnnotations)
				.onChange(async (value) => {
					this.plugin.settings.exportAnnotations = value;
					await this.plugin.saveSettings();
					this.display()
				}));		



		
			

	if (this.plugin.settings.exportMetadata == true){
		const settingsTemplate: HTMLDetailsElement = containerEl.createEl("details");
		settingsTemplate.createEl("summary", { text: "Template" });

		new Setting(settingsTemplate)
		.setName('Note Template')
		.setDesc('Add Path to the template (*.md) to use in importing the note')
		.addText(text => text
			.setPlaceholder('/path/to/Template.md')
			.setValue(this.plugin.settings.templatePath)
			.onChange(async (value) => {
				console.log('Path Template: ' + value);
				this.plugin.settings.templatePath = value;
				this.display();
				await this.plugin.saveSettings();
			}));
		new Setting(settingsTemplate)
		.setName("Missing Fields")
		.setDesc("Fields that are present in the template but missing from the selected field.")
		.addDropdown((d) => {
			d.addOption("Leave placeholder", "Leave placeholder");
			d.addOption("Replace with NA", "Replace with NA");
			d.addOption("Remove (entire row)", "Remove (entire row)");
			d.setValue(this.plugin.settings.missingfield);
			d.onChange(async (v: "Leave placeholder" | "Replace with NA" | "Remove (entire row)") => {
				this.plugin.settings.missingfield = v;
				await this.plugin.saveSettings();
			});
			});			
		}	
				
				

		if (this.plugin.settings.exportAnnotations == true){
		const settingsHighlights: HTMLDetailsElement = containerEl.createEl("details");

		settingsHighlights.createEl("summary", { text: "Highlights" });
			new Setting(settingsHighlights)
			.setName('Double Spaced')
			.setDesc('Set toggle to on to add an empty space between different highlights')
			.addToggle(text => text
				.setValue(this.plugin.settings.doubleSpaced)
				.onChange(async (value) => {
					this.plugin.settings.doubleSpaced = value;
					await this.plugin.saveSettings();
					this.display()
				}));
			
			new Setting(settingsHighlights)
			.setName("Quotation Marks")
			.addToggle(text => text
				.setValue(this.plugin.settings.highlightQuote)
				.onChange(async (value) => {
					this.plugin.settings.highlightQuote = value;
					await this.plugin.saveSettings();
					this.display()
				}));
			new Setting(settingsHighlights)
			.setName("Bold")
			.addToggle(text => text
				.setValue(this.plugin.settings.highlightBold)
				.onChange(async (value) => {
					this.plugin.settings.highlightBold = value;
					await this.plugin.saveSettings();
					this.display()
				}));
			new Setting(settingsHighlights)
				.setName("Italic")
				.addToggle(text => text
					.setValue(this.plugin.settings.highlightItalic)
					.onChange(async (value) => {
						this.plugin.settings.highlightItalic = value;
						await this.plugin.saveSettings();
						this.display()
					}));

			new Setting(settingsHighlights)
				.setName("Highlighted")
				.addToggle(text => text
					.setValue(this.plugin.settings.highlightHighlighted)
					.onChange(async (value) => {
						this.plugin.settings.highlightHighlighted = value;
						await this.plugin.saveSettings();
						this.display()
					}));	
			new Setting(settingsHighlights)
			.setName("Bullet Points")
			.addToggle(text => text
				.setValue(this.plugin.settings.highlightBullet)
				.onChange(async (value) => {
					this.plugin.settings.highlightBullet = value;
					await this.plugin.saveSettings();
					this.display()
				}));
			
			new Setting(settingsHighlights)
			.setName("Blockquote")
			.addToggle(text => text
				.setValue(this.plugin.settings.highlightBlockquote)
				.onChange(async (value) => {
					this.plugin.settings.highlightBlockquote = value;
					await this.plugin.saveSettings();
					this.display();
				}));

			new Setting(settingsHighlights)
				.setName('Custom text before all highlights')
				.addText(text => text
					.setValue(this.plugin.settings.highlightCustomTextBefore)
					.onChange(async (value) => {
						console.log('highlightCustomTextBefore: ' + value);
						this.plugin.settings.highlightCustomTextBefore = value;
						await this.plugin.saveSettings();
					}));		
			
			new Setting(settingsHighlights)
			.setName('Custom text after all highlights')
			.addText(text => text
				.setValue(this.plugin.settings.highlightCustomTextAfter)
				.onChange(async (value) => {
					console.log('highlightCustomTextAfter: ' + value);
					this.plugin.settings.highlightCustomTextAfter = value;
					await this.plugin.saveSettings();
				}));	
				
		} 
		if (this.plugin.settings.exportAnnotations == true){
					const settingsComments: HTMLDetailsElement = containerEl.createEl("details");
		settingsComments.createEl("summary", { text: "Comments" });
		
		new Setting(settingsComments)
		.setName("Quotation Marks")
		.addToggle(text => text
			.setValue(this.plugin.settings.commentQuote)
			.onChange(async (value) => {
				this.plugin.settings.commentQuote = value;
				await this.plugin.saveSettings();
				this.display()
			}));

		new Setting(settingsComments)
		.setName("Bold")
		.addToggle(text => text
			.setValue(this.plugin.settings.commentBold)
			.onChange(async (value) => {
				this.plugin.settings.commentBold = value;
				await this.plugin.saveSettings();
				this.display()
			}));
		new Setting(settingsComments)
			.setName("Italic")
			.addToggle(text => text
				.setValue(this.plugin.settings.commentItalic)
				.onChange(async (value) => {
					this.plugin.settings.commentItalic = value;
					await this.plugin.saveSettings();
					this.display()
				}));

		new Setting(settingsComments)
			.setName("Highlighted")
			.addToggle(text => text
				.setValue(this.plugin.settings.commentHighlighted)
				.onChange(async (value) => {
					this.plugin.settings.commentHighlighted = value;
					await this.plugin.saveSettings();
					this.display()
				}));	
		new Setting(settingsComments)
		.setName("Bullet Points")
		.addToggle(text => text
			.setValue(this.plugin.settings.commentBullet)
			.onChange(async (value) => {
				this.plugin.settings.commentBullet = value;
				await this.plugin.saveSettings();
				this.display()
			}));
		
		new Setting(settingsComments)
		.setName("Blockquote")
		.addToggle(text => text
			.setValue(this.plugin.settings.highlightBlockquote)
			.onChange(async (value) => {
				this.plugin.settings.highlightBlockquote = value;
				await this.plugin.saveSettings();
				this.display()
			}));
		
			new Setting(settingsComments)
			.setName('Custom text before all comments')
			.addText(text => text
				.setValue(this.plugin.settings.commentCustomTextBefore)
				.onChange(async (value) => {
					console.log('commentCustomTextBefore: ' + value);
					this.plugin.settings.commentCustomTextBefore = value;
					await this.plugin.saveSettings();
				}));		
		
		new Setting(settingsComments)
		.setName('Custom text after all comments')
		.addText(text => text
			.setValue(this.plugin.settings.commentCustomTextAfter)
			.onChange(async (value) => {
				console.log('commentCustomTextAfter: ' + value);
				this.plugin.settings.commentCustomTextAfter = value;
				await this.plugin.saveSettings();
			}));	
	
	if (this.plugin.settings.exportAnnotations == true){
		const settingsAdvanced: HTMLDetailsElement = containerEl.createEl("details");
		settingsAdvanced.createEl("summary", { text: "Transformations" });
		new Setting(settingsAdvanced)
		.setDesc('Add a single character (e.g. #) or a single word (e.g. todo). When this character/word is found at the beginning of a comment, the text of the comment or the highlighted text will be transformed')
		new Setting(settingsAdvanced)
		.setName('Heading Level 1')
		//.setDesc('The comment and/or the highlight will be transformed into a level 1 heading')
		.addText(text => text
			// .setPlaceholder('#')
			.setValue(this.plugin.settings.keyH1)
			.onChange(async (value) => {
				console.log('H1: ' + value);
				//check if the value added is already assigned. If it is warn; otherwise save it 
				if(Object.values(this.plugin.settings).indexOf(value)>-1){
					alert("This value is already assigned to a different transformation. Chose a different value")
				} else {
					this.plugin.settings.keyH1 = value;
					await this.plugin.saveSettings();
				}
				
			}));

		new Setting(settingsAdvanced)
			.setName('Heading Level 2')
			//.setDesc('The comment and/or the highlight will be transformed into a level 1 heading')
			.addText(text => text
				// .setPlaceholder('##')
				.setValue(this.plugin.settings.keyH2)
				.onChange(async (value) => {
					console.log('H2: ' + value);
				//check if the value added is already assigned. If it is warn; otherwise save it 
				if(Object.values(this.plugin.settings).indexOf(value)>-1){
					alert("This value is already assigned to a different transformation. Chose a different value")
				} else {
					this.plugin.settings.keyH2 = value;
					await this.plugin.saveSettings();
				}
				}));
		new Setting(settingsAdvanced)
			.setName('Heading Level 3')
			//.setDesc('Add a single character or word (e.g. ###). When this character/word is found at the beginning of a comment to a highlight, the highlight will be transformed into a level 1 heading')
			.addText(text => text
				.setPlaceholder('###')
				.setValue(this.plugin.settings.keyH3)
				.onChange(async (value) => {
					console.log('H3: ' + value);
					//check if the value added is already assigned. If it is warn; otherwise save it 
					if(Object.values(this.plugin.settings).indexOf(value)>-1){
						alert("This value is already assigned to a different transformation. Chose a different value")
					} else {
						this.plugin.settings.keyH3 = value;
						await this.plugin.saveSettings();
					}
				}));
		new Setting(settingsAdvanced)
			.setName('Heading Level 4')
			//.setDesc('Add a single character or word (e.g. ####). When this character/word is found at the beginning of a comment to a highlight, the highlight will be transformed into a level 1 heading')
			.addText(text => text
				// .setPlaceholder('####')
				.setValue(this.plugin.settings.keyH4)
				.onChange(async (value) => {
					console.log('H4: ' + value);
				//check if the value added is already assigned. If it is warn; otherwise save it 
				if(Object.values(this.plugin.settings).indexOf(value)>-1){
					alert("This value is already assigned to a different transformation. Chose a different value")
				} else {
					this.plugin.settings.keyH4 = value;
					await this.plugin.saveSettings();
				}
				}));		
		new Setting(settingsAdvanced)
			.setName('Heading Level 5')
		//	.setDesc('Add a single character or word (e.g. ####). When this character/word is found at the beginning of a comment to a highlight, the highlight will be transformed into a level 1 heading')
			.addText(text => text
				// .setPlaceholder('#####')
				.setValue(this.plugin.settings.keyH5)
				.onChange(async (value) => {
					console.log('H5: ' + value);
					//check if the value added is already assigned. If it is warn; otherwise save it 
					if(Object.values(this.plugin.settings).indexOf(value)>-1){
						alert("This value is already assigned to a different transformation. Chose a different value")
					} else {
						this.plugin.settings.keyH5 = value;
						await this.plugin.saveSettings();
				}
				}));	


		new Setting(settingsAdvanced)
				.setName('Heading Level 6')
		//		.setDesc('Add a single character or word (e.g. ####). When this character/word is found at the beginning of a comment to a highlight, the highlight will be transformed into a level 1 heading')
				.addText(text => text
					// .setPlaceholder('######')
					.setValue(this.plugin.settings.keyH6)
					.onChange(async (value) => {
						console.log('H6: ' + value);
						//check if the value added is already assigned. If it is warn; otherwise save it 
						if(Object.values(this.plugin.settings).indexOf(value)>-1){
							alert("This value is already assigned to a different transformation. Chose a different value")
						} else {
							this.plugin.settings.keyH6 = value;
							await this.plugin.saveSettings();
				}
			}));	

		new Setting(settingsAdvanced)
			.setName('Append highlight to the end of the previous one')
			//.setDesc('Add a single character or word (e.g. +). When this character/word is found at the beginning of a comment to a highlight, the highlight will be attached at the end of the previous one. THis can be used to combine two sentences found respectively at the end of a page and at the beginning of the next one')
			.addText(text => text
				// .setPlaceholder('+')
				.setValue(this.plugin.settings.keyMergeAbove)
				.onChange(async (value) => {
					console.log('MergeAbove: ' + value);
					//check if the value added is already assigned. If it is warn; otherwise save it 
					if(Object.values(this.plugin.settings).indexOf(value)>-1){
						alert("This value is already assigned to a different transformation. Chose a different value")
					} else {
						this.plugin.settings.keyMergeAbove = value;
						await this.plugin.saveSettings();
				}
		}));		

		new Setting(settingsAdvanced)
		.setName('Place comment before the highlight')
		//.setDesc('Add a single character or word (e.g. +). When this character/word is found at the beginning of a comment to a highlight, the highlight will be attached at the end of the previous one. THis can be used to combine two sentences found respectively at the end of a page and at the beginning of the next one')
		.addText(text => text
			// .setPlaceholder('%')
			.setValue(this.plugin.settings.keyCommentPrepend)
			.onChange(async (value) => {
				console.log('CommentPrepend: ' + value);
				//check if the value added is already assigned. If it is warn; otherwise save it 
				if(Object.values(this.plugin.settings).indexOf(value)>-1){
					alert("This value is already assigned to a different transformation. Chose a different value")
				} else {
					this.plugin.settings.keyCommentPrepend = value;
					await this.plugin.saveSettings();
				}
	}));	
				
		}
	} 
				
	}
}

 