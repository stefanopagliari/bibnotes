

export interface Name {
    /**
     * If the name is a literal (surrounded by braces) it will be in this property, and none of the other properties will be set
     */
    literal?: string
  
    /**
     * Family name
     */
    lastName?: string
  
    /**
     * available when parsing biblatex extended name format
     */
    useprefix?: boolean
  
    /**
     * available when parsing biblatex extended name format
     */
    juniorcomma?: boolean
  
    /**
     * given name. Will include middle names and initials.
     */
    firstName?: string
  
    /**
     * Initials.
     */
    initial?: string
  
    /**
     * things like `Jr.`, `III`, etc
     */
    suffix?: string
  
    /**
     * things like `von`, `van der`, etc
     */
    prefix?: string
  }


// import { Entry } from '@retorquere/bibtex-parser';
// // Also make EntryDataBibLaTeX available to other modules
// export { Entry } from '@retorquere/bibtex-parser';
  
// //   export interface Entry {
// //     /**
// //      * citation key
// //      */
// //     key: string
  
// //     /**
// //      * entry type
// //      */
// //     type: string
  
// //     /**
// //      * entry fields. The keys are always in lowercase
// //      */
// //     fields: { [key: string]: string[] }
  
// //     /**
// //      * authors, editors, by creator type. Name order within the creator-type is retained.
// //      */
// //     creators: { [type: string]: Name[] }
  
// //     /**
// //      * will be set to `true` if sentence casing was applied to the entry
// //      */
// //     sentenceCased?: boolean
// //   }