# BibNotes Formatter (for Zotero)

This plugin generates literaure notes from the source stored in your Zotero library, including both the metadata and the annotations that are stored within Zotero (extracted using the native PDF Reader or the Zotfile plugin). The settings of the plugin provide different tools to customize the format of the literature notes, as well as to perform different transformations to the text of the annotations.

![](/images/ExampleNote.jpg)


## Installation
The plugin is currently not not registered as a standard community plugin for downloading or updating within Obsidian. In order to install, you need to clone or unzip the latest release into your vault's .obsidian/plugins/ directory, then enabled in the Obsidian configuration.

An alternative if you have the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat/) installed: use `stefanopagliari/bibnotes` to add BibNotes Formatter as a Beta plugin, then enable it in the Community plugins tab.

## Importing your Zotero Library into Obsidian
In order to import your references and notes from Zotero, you need to export your library as a "BetterBibTex JSON" format and save this file inside your vualt. To do to follow these steps:
- install within Zotero the plugin ["Better BibTex for Zotero"](https://retorque.re/zotero-better-bibtex/installation/). For more information on how to install the plugin see the instructions on the [website of the plugin](https://retorque.re/zotero-better-bibtex/installation/).
- in the main menu of Zotero go to File > Export Library (to export the entire library). It is also possible to to export a specific collection or group of references by selecting these, right-click, and then selecting "export collection" (in the case of a folder) or "export items" (in the case of a collection of references.
- select the export format "**BetterBibTex Json**". 
- select "Export Notes" if you would like to import into Obsidian the annotation. 
- *(Optional)* select "Keep updated" to automatically update the exported library once an entry is added/deleted/amended
- save the BetterBibTex JSON file in a folder **within** your Obsidian Vault
- in the plugin settings within Obsidian add the relative path within your vault of the library to be imported, as well as the relative path within your vault of the folder where you would like the literature notes to be stored. For instance, add `library.json` if the file (library.json) is in the root folder. Instead, if the file is in a subfolder, specify first the subfolder followed by the name of the file (e.g. 'zotero/library.json' if the json file is located in a subfolder of your vault called 'zotero'.

![](/images/Export_Zotero.jpg)




## Commands
The plugin introduces two commands into Obsidian:
- **Create/Update Literature Note**: when you select this command you will be prompted to chose one of references from the library you have imported. If the reference has not been imported yet in the specified folder, a new note will be generated. If a note already exists, its content will be updated wi

thout over-writing the existing annotation (e.g. comments added manually from within Obsidian and block-references will not be over-written). The first option ("Entire Library") can be selected to create/update all the notes from the imported library.

![](/images/SelectCommandExample.png)

- **Update Library**: when you select this command, the plugin will generate/update all the notes that have been modified from Zotero since the last time the same command was selected. If this is the first time that you select this command, then the plugin will create/update literature notes for all the entries in the imported bibliography.

## Create Literature Notes
By default the plugin will export both the metadata and the notes stored in Zotero for the selected reference. Both can be deselected in the plugin settings. The main configurations related to the format of the notes are the following:
- **Export Path**: in the plugin settings, add the relative folder within your Obsidian vault where the literature notes will be stored. In the field is left empty, the notes will be exported in the main folder. 
- **Note Title**: In the plugin setting you can specify the format of the note title. Possible values include: 
    - {{citeKey}}, 
    - {{title}}, 
    - {{author}},
    - {{year}}
- **Template**: It is possible to select among two existing templates (one presenting the metadata as a simple list and the other wrapping the information into boxes using the Admonition plugin) or to or provide a custom template (see below). 
- **Fields**: It is possible to include in your custom template all the fields found in the Better Bibtex json file, as well as additional ones created by the plugin. These include:
    - {{title}}
    - {{shortTitle}}
    - {{citekey}} 
    - {{itemType}} 
    - {{author}} 
    - {{editor}} 
    - {{creator}}: all the individual listed as creators, including authors, editors, etc...
    - {{translator}}
    - {{publisher}}
    - {{place}}
    - {{series}}
    - {{seriesNumber}}
    - {{publicationTitle}}
    - {{volume}}
    - {{issue}}
    - {{pages}}
    - {{year}}
    - {{dateAdded}}
    - {{dateModified}}
    - {{DOI}}
    - {{ISBN}}
    - {{ISSN}}
    - {{abstractNote}}
    - {{url}}
    - {{uri}}: link to the entry on the Zotero website
    - {{eprint}}
    - {{file}}: local path of the file attached to the entry
    - {{localLibrary}}: link to the entry on the Zotero app
    - {{keywordsZotero}}: tags found in the metadata of the entry
    - {{keywordsPDF}}: tags extracted from the PDF
    - {{keywords}}, {{keywordsAll}}: both tags found in the metadata of the entry and tags extracted from the PDF
    - {{collections}}: collections/folders where the entry is located
    - {{collectionsParent}}: collections/folders where the entry is located, plus the parent folders to these
    - {{PDFNotes}}: all the highlights, comments, and images extracted from the PDF, in the order in which they appear
    - {{Yellow}, {{Red}}, {{Green}}, {{Black}, {{White}}, {{Gray}}, {{Cyan}}, {{Magenta}}, {{Orange}}: all the highlights of a certain colour
    - {{UserNotes}}: notes manually created within Zotero
    - {{Images}}: all the images extracted via the Zotero PDF Reader

- It is also possible to wrap the placeholders into [[ ]] in order to create notes or to preface them with a tag(#). You can also preface a field with :: in order to create Dataview fields.
- **Missing Fields**: Fields that are present in the template but missing in the entry are deleted by default. This can be changed in the settings.

## Basic Formatting
In the settings of the plugin, it is possible to select the formatting of the **highlights** and **comments** extracted from the text. These include:
- **Double Space**
- **Italic**
- **Bold**
- **Quotation Marks**
- **Highlight**
- **Bullet Points**
- **Blockquote**
- **Custom text before or after all highlights**
- **Custom text before or after all comments**


## Additional Highlight Formatting
It is possible to perform additional transformations to designated highlighted sentences. The transformations currently included in the plugin are:
- **Heading**: Turn highlighted text into a heading (Level 1 to 6). 

![](/images/exampleHeading.png)


- **MergeAbove**: Append highlight to the previous one (e.g. to merge paragraph across two pages). 

![](/images/exampleMergeAbove.jpg)


- **Preprend Comment**: Place the text of the comment at the beginning of the highlight (rather than at the end as by default). 

![](/images/exampleCommentPrepend.jpg)


- **Keyword**: Add the highlighted text to the list of keywords listed under the ({{keywords}}) placeholder in the template.

![](/images/exampleKeyword.png)

- **Todo**: Transform the highlight or comments into a task ("- [ ]").
![](/images/exampleToDo.png)

- **Custom Text**: Add custom text before or after a specific highlight

### Keywords
Transformations can be triggered by adding a dedicated "keyword" at the beginning of the comment to the specific highlight. This can be a single character (e.g. #) or a single word (e.g. todo). When this character/word is found at the beginning of a comment, the text of the comment or the highlighted text will be reformatted. The keywords can be defined in the settings of the plugin

### Highlight Colour
In addition to using dedicated keywords at the beginning of a comment, it is possible to apply specific styling or transformations to highlights based on the colour of the highlight. The plugin recognize the highlight colour extracted by:
- **Zotero** native reader (yellow, red, green, blue, purple) 
- **Zotfile** plugin (black, white, gray, red,orange, yellow, green, cyan, blue, magenta). In order to export the highlight colour you will need to activate this function by going to the main menu of Zoter and selecting Preferences --> Advanced --> Config Editor. Search for "extensions.zotfile.pdfExtraction.colorAnnotations" and turn the value to "true". It is also important that the value "extensions.zotfile.pdfExtraction.colorCategories" is restored to the default value.

### Updating Existing Notes
In the case you are updating an existing note, you can decide in the plugin settings whether to
- over-write the existing note completely ("Overwrite Entire Note")
- preserve the existing note and only add new sentences that were not included in the existing note ("Save Entire Note")  
- preserve the existing note and add non-overlapping sentences only in a specific section, while over-writing the rest ("Select Section"). When the "Select Section" is chosen, the plugin will ask for a string identifying the beginning and/or end of the section to be updated (rather than overwritten). If the "start" field is left empty, the existing text will be preserved from to the beginning of the note. If the "end" field is left empty, the existing text will be preserved until  the end of the note. For instance, in order to over-write the metadata but maintain changes made manually to the extracted annotations, the start of the section to be preserved should be set to the unique title used in the template before the metadata (e.g. "## Extracted Annotations").

