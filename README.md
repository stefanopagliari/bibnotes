## BibNotes Formatter

This plugin generates literaure notes from the source stored in Zotero, as well as 

### Importing references from Zotero
In order to import your references and notes from Zotero, you need to:
- install within Zotero the plugin ["Better BibTex for Zotero"](https://retorque.re/zotero-better-bibtex/installation/). For more information on how to install the plugin see the instructions on the [website of the plugin](https://retorque.re/zotero-better-bibtex/installation/).
- export the library you would like to import into Obsidian as a. To do this, follow these steps:
- open Zotero;
- in the main menu go to File > Export Library (to export the entire library). It is also possible to to export a specific collection or group of references by selecting these, right-click, and then selecting "export collection" (in the case of a folder) or "export items" (in the case of a collection of references)
- select the export format "**BetterBibTex Json**". 
- select "Export Notes" if you would like to import into Obsidian the annotation. 
- select "Keep updated" to automatically update the exported library once an entry is added/deleted/amended
- save the BetterBibTex JSON file in a folder **within** your Obsidian Vault
- in the plugin settings within Obsidian add the relative path within your vault of the library to be imported, as well as the relative path within your vault of the folder where you would like the literature notes to be stored.

### Commands
- **Create/Update Literature Note**: when you select this command you will be prompted to chose one of references from the library you have imported. If the reference has not been imported yet in the specified folder, a new note will be generated. If a note already exists, then its content will be updated without over-writing the existing annotation (e.g. comments added manually from within Obsidian and block-references will not be over-written). The first option ("Entire Library") can be selected to create/update all the notes from the imported library.
- **Update Library**: when you select this command, the plugin will generate/update all the notes that have been modified from Zotero since the last time the same command was selected. If this is the first time that you select this command, then the plugin will create/update literature notes for all the entries in the imported bibliography.

### Format of Literature Notes

- **Note Title**: In the plugin setting you can specify the format of the note title. Possible values include: 
    - {{citeKey}}, 
    - {{title}}, 
    - {{author}},
    - {{year}}

### Template

### Annotations Formatting
 
- To export the "Collection" (folder) where a reference is located within Zotero, follow these steps:
    - in the main menu of Zotero, select Zotero > Preferences > BetterBibTex > Export > postscript
    - Add the following script: ```if (Translator.BetterBibLaTeX) {
  var ityear = Zotero.BetterBibTeX.parseDate(item.date).year;
  reference.add({ name: 'zoterolocal', value: 'zotero://select/items/@' + item.citationKey });
  if (item.uri) reference.add({ name: 'zoterouri', value: item.uri });
  if (item.date) reference.add({ name: 'year', value: `${ityear}`});
  if (item.DOI) reference.add({ name: 'doiuri', value: 'https://doi.org/' + item.DOI });

  if (item.collections) reference.add({ name: 'coll', value: item.collections.filter(coll => Translator.collections[coll]).map(coll => Translator.collections[coll].name), sep: ', ' });
  return false // this instructs BBT to not cache the item
}```


### Format 





 