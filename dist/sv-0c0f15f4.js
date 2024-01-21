const e = {
  strings: {},
  pluralize(a) {
    return a === 1 ? 0 : 1;
  }
};
e.strings = {
  addMore: "Lägg till",
  addMoreFiles: "Lägg till filer",
  addingMoreFiles: "Lägger till fler filer",
  allowAccessDescription: "För att kunna ta bilder eller spela in video behöver du ge sidan behörighet att använda din kamera.",
  allowAccessTitle: "Tillåt användning av kameran",
  authenticateWith: "Anslut till %{pluginName}",
  authenticateWithTitle: "Anslut till %{pluginName} för att välja filer",
  back: "Tillbaka",
  browse: "bläddra",
  browseFiles: "bläddra",
  cancel: "Avbryt",
  cancelUpload: "Avbryt uppladdning",
  chooseFiles: "Välj filer",
  closeModal: "Stäng fönster",
  companionError: "Anslutning till Companion misslyckades",
  complete: "Klart",
  connectedToInternet: "Ansluten till internet",
  copyLink: "Kopiera länk",
  copyLinkToClipboardFallback: "Kopiera länken nedanför",
  copyLinkToClipboardSuccess: "Länken kopierad till urklipp",
  creatingAssembly: "Förbereder uppladdning...",
  creatingAssemblyFailed: "Transloadit: Kunde inte skapa Assembly",
  dashboardTitle: "Filuppladdare",
  dashboardWindowTitle: "Uppladdningsfönster (Tryck på Esc-tangenten för att stänga)",
  dataUploadedOfTotal: "%{complete} av %{total}",
  done: "Klart",
  dropHereOr: "Släpp filer här eller %{browse}",
  dropHint: "Släpp dina filer här",
  dropPasteBoth: "Släpp filer här, klistra in eller %{browse}",
  dropPasteFiles: "Släpp filer här, klistra in eller %{browse}",
  dropPasteFolders: "Släpp filer här, klistra in eller %{browse}",
  dropPasteImportBoth: "Släpp filer här, klistra in, %{browse} eller importera från",
  dropPasteImportFiles: "Släpp filer här, klistra in, %{browse} eller importera från",
  dropPasteImportFolders: "Släpp filer här, klistra in, %{browse} eller importera från",
  editFile: "Redigera fil",
  editing: "Redigerar %{file}",
  emptyFolderAdded: "Inga filer lades till från en tom mapp",
  encoding: "Kodar...",
  enterCorrectUrl: "Ogiltig URL: Kontrollera att adressen du anger är en direktlänk till en fil.",
  enterUrlToImport: "Ange URL för att importera en fil",
  exceedsSize: "Storleken på filen överstiger den tillåtna maxgränsen på %{size}",
  failedToFetch: "Companion kunde inte ladda ner filen, kontrollera att adressen är korrekt",
  failedToUpload: "Kunde inte ladda upp %{file}",
  fileSource: "Källa: %{name}",
  filesUploadedOfTotal: {
    0: "%{complete} av %{smart_count} fil uppladdad",
    1: "%{complete} av %{smart_count} filer uppladdade"
  },
  filter: "Filtrera",
  finishEditingFile: "Avsluta redigering av filen",
  folderAdded: {
    0: "La till %{smart_count} fil från %{folder}",
    1: "La till %{smart_count} filer från %{folder}"
  },
  import: "Importera",
  importFrom: "Importera från %{name}",
  loading: "Laddar...",
  logOut: "Logga ut",
  myDevice: "Min enhet",
  noFilesFound: "Du har inga filer eller mappar här",
  noInternetConnection: "Ingen internetuppkoppling",
  openFolderNamed: "Öppna mappen %{name}",
  pause: "Pausa",
  pauseUpload: "Pausa uppladdning",
  paused: "Pausad",
  poweredBy: "Drivs av %{uppy}",
  processingXFiles: {
    0: "Processerar %{smart_count} fil",
    1: "Processerar %{smart_count} filer"
  },
  removeFile: "Ta bort fil",
  resetFilter: "Nollställ filter",
  resume: "Återuppta",
  resumeUpload: "Återuppta uppladdning",
  retry: "Försök igen",
  retryUpload: "Försök igen",
  saveChanges: "Spara ändringar",
  selectFileNamed: "Välj fil %{name}",
  selectX: {
    0: "Välj %{smart_count}",
    1: "Välj %{smart_count}"
  },
  smile: "Säg omelett!",
  // translates to "Say cheese!" - which works well in this context in Swedish
  startRecording: "Starta inspelning",
  stopRecording: "Avbryt inspelning",
  takePicture: "Ta bild",
  timedOut: "Uppladdningen har stått stilla i %{seconds} sekunder; avbryter.",
  unselectFileNamed: "Avmarkera filen %{name}",
  upload: "Ladda upp",
  uploadComplete: "Uppladdning slutförd",
  uploadFailed: "Uppladdning misslyckad",
  uploadPaused: "Uppladdning pausad",
  uploadXFiles: {
    0: "Ladda upp %{smart_count} fil",
    1: "Ladda upp %{smart_count} filer"
  },
  uploadXNewFiles: {
    0: "Ladda upp %{smart_count} fil",
    1: "Ladda upp %{smart_count} filer"
  },
  uploading: "Laddar upp",
  uploadingXFiles: {
    0: "Ladda upp %{smart_count} fil",
    1: "Ladda upp %{smart_count} filer"
  },
  xFilesSelected: {
    0: "%{smart_count} fil vald",
    1: "%{smart_count} filer valda"
  },
  xMoreFilesAdded: {
    0: "%{smart_count} fil tillagd",
    1: "%{smart_count} filer tillagda"
  },
  xTimeLeft: "%{time} återstår",
  youCanOnlyUploadFileTypes: "Du kan endast ladda upp: %{types}",
  youCanOnlyUploadX: {
    0: "Du kan endast ladda upp %{smart_count} fil",
    1: "Du kan endast ladda upp %{smart_count} filer"
  },
  youHaveToAtLeastSelectX: {
    0: "Du måste välja minst %{smart_count} fil",
    1: "Du måste välja minst %{smart_count} filer"
  }
};
typeof Uppy < "u" && (globalThis.Uppy.locales.sv_SE = e);
const r = e, l = {
  Language: "Språk",
  Create: "Skapa",
  Close: "Stäng",
  Cancel: "Avbryt",
  Save: "Spara",
  Edit: "Redigera",
  Crop: "Beskära",
  "New Folder": "Ny mapp",
  "New File": "Ny fil",
  Rename: "Byt namn",
  Delete: "Radera",
  Upload: "Ladda upp",
  Download: "Ladda ner",
  Archive: "Arkivera",
  Unarchive: "Avarkivera",
  Open: "Öppna",
  "Open containing folder": "Öppna innehållande mapp",
  Refresh: "Uppdatera",
  Preview: "Förhandsgranska",
  "Dark Mode": "Mörkt läge",
  "Toggle Full Screen": "Växla till helskärm",
  "Change View": "Ändra vy",
  Storage: "Lagring",
  "Go up a directory": "Gå upp en katalog",
  "Search anything..": "Sök överallt..",
  Name: "Namn",
  Size: "Storlek",
  Date: "Datum",
  Filepath: "Filväg",
  About: "Om",
  "Folder Name": "Mappnamn",
  "File Name": "Filnamn",
  "Move files": "Flytta filer",
  "Are you sure you want to move these files to?": "Är du säker på att du vill flytta dessa filer?",
  "Yes, Move!": "Ja, flytta!",
  "Delete files": "Radera filer",
  "Yes, Delete!": "Ja, radera!",
  "Upload Files": "Ladda upp filer",
  "No files selected!": "Inga filer valda!",
  "Select Files": "Välj filer",
  "Archive the files": "Arkivera filer",
  "Unarchive the files": "Avarkivera filer",
  "The archive will be unarchived at": "Arkivet kommer att avarkiveras i",
  "Archive name. (.zip file will be created)": "Arkivnamn. (.zip-fil kommer att skapas)",
  "Vuefinder is a file manager component for vue 3.": "Vuefinder är en filhanteringskomponent för Vue 3.",
  "Create a new folder": "Skapa en ny mapp",
  "Create a new file": "Skapa en ny fil",
  "Are you sure you want to delete these files?": "Är du säker på att du vill radera dessa filer?",
  "This action cannot be undone.": "Denna åtgärd kan inte ångras.",
  "Search results for": "Sökresultat för",
  "item(s) selected.": "objekt valda.",
  "%s is renamed.": "%s har fått ett nytt namn.",
  "This is a readonly storage.": "Detta är en skrivskyddad lagring.",
  "%s is created.": "%s har skapats.",
  "Files moved.": "Filerna har flyttats.",
  "Files deleted.": "Filerna har raderats.",
  "The file unarchived.": "Filen har avarkiverats.",
  "The file(s) archived.": "Filen/filerna har arkiverats.",
  "Updated.": "Uppdaterad.",
  "No search result found.": "Inget sökresultat hittades.",
  "Are you sure you want to move these files?": "Är du säker på att du vill flytta dessa filer?",
  "File Size": "Filstorlek",
  "Last Modified": "Senast ändrad",
  "Drag&Drop: on": "Dra och släpp: på",
  "Drag&Drop: off": "Dra och släpp: av",
  uppy: r
};
export {
  l as default
};
