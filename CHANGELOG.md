# Changelog

All notable changes to this project will be documented in this file.  

## [0.8.13] 

### Improvement
- Instead of automatically exporting the extracted annotation at the end of the note, the position in the note can be defined in the template using the placeholder {{PDFNotes}}. This is a breaking change from the previous version. In order to retain the same output as in the previous versions, add "## Extracted Annotations" followed by "{{PDFNotes}}" in the custom template.
- Added capacity to export notes stored within Zotero that have been generated manually rather than exported from the pdf. The position in the text can be defined by adding to the template the placeholder {{UserNotes}}
- Added new setting to decide whether 1) updating an existing note will over-write the existing note completely ("Overwrite Entire Note"), only add non-overlapping sentences ("Save Entire Note"), or adding non-overlapping sentences in a specific section, while over-writing the rest (""Select Section"). The ""Select Section" is chosen, the plugin will ask for a string identifying the beginning and/or end of the section to be updated (rather than overwritten). For instance, a
If the "start" field is left empty, the existing text will be preserved from to the beginning of the note. If the "end" field is left empty, the existing text will be preserved until  the end of the note. For instance, in order to over-write the metadata but maintain changes made manually to the extracted annotations, the start of the section to be preserved should be set to the unique title used in the template before the metadata (e.g. "## Extracted Annotations").
- Added suggester field in the settings to select the folder to export the note (credit to Templater plugin and Periodic Notes Plugin.)
- Added settings to control whether updating an existing slide will overwrite the changes made manually within Obsidian or preserve them (default)

### Debugging
- Fixed bug where the code exporting notes did not allow for underscores and other non-alphanumeric characters in the title of the exported notes
 