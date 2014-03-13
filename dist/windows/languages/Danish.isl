; Translation made with Translator 1.32 (http://www2.arnes.si/~sopjsimo/translator.html)
; $Translator:NL=%n:TB=%t
;
; To download user-contributed translations of this file, go to:
;   http://www.jrsoftware.org/files/istrans/
;
; Note: When translating this text, do not add periods (.) to the end of
; messages that didn't have them already, because on those messages Inno
; Setup adds the periods automatically (appending a period would result in
; two periods being displayed).
;
; ID: Danish.isl,v 5.5.3+ 2012/12/14 Thomas Vedel, thomas@veco.dk

[LangOptions]
LanguageName=Dansk
LanguageID=$0406
LanguageCodePage=1252

; If the language you are translating to requires special font faces or
; sizes, uncomment any of the following entries and change them accordingly.
;DialogFontName=MS Shell Dlg
;DialogFontSize=8
;DialogFontStandardHeight=13
;TitleFontName=Arial
;TitleFontSize=29
;WelcomeFontName=Arial
;WelcomeFontSize=12
;CopyrightFontName=Arial
;CopyrightFontSize=8

[Messages]
; *** Application titles
SetupAppTitle=Installationsguide
SetupWindowTitle=Installationsguide - %1
UninstallAppTitle=Afinstaller
UninstallAppFullTitle=Afinstallerer %1

; *** Misc. common
InformationTitle=Information
ConfirmTitle=Bekræft
ErrorTitle=Fejl

; *** SetupLdr messages
SetupLdrStartupMessage=Denne guide installerer %1. Fortsæt?
LdrCannotCreateTemp=Kan ikke danne en midlertidig fil. Installationen afbrydes
LdrCannotExecTemp=Kan ikke udføre et program i mappen til opbevaring af midlertidige filer. Installationen afbrydes

; *** Startup error messages
LastErrorMessage=%1.%n%nFejl %2: %3
SetupFileMissing=Filen %1 mangler i installations-mappen. Ret fejlen eller skaf en ny kopi af programmet.
SetupFileCorrupt=Installationsfilerne er ødelagt. Skaf en ny kopi af installationsprogrammet.
SetupFileCorruptOrWrongVer=Installationsfilerne er ødelagt, eller også passer de ikke til denne version af installationen. Ret fejlen eller skaf en ny kopi af installationsprogrammet.
InvalidParameter=En ugyldig parameter blev angivet på kommandolinjen:%n%n%1
SetupAlreadyRunning=Installationsprogrammet kører allerede.
WindowsVersionNotSupported=Programmet kan ikke anvendes på den version af Windows som denne computer kører.
WindowsServicePackRequired=Dette program kræver %1 med Service Pack %2 eller senere.
NotOnThisPlatform=Programmet kan ikke anvendes på %1.
OnlyOnThisPlatform=Programmet kan kun anvendes på %1.
OnlyOnTheseArchitectures=Dette program kan kun installeres på Windows-versioner som er designet til denne processortype:%n%n%1
MissingWOW64APIs=Den anvendte Windows-version indeholder ikke funktioner som er nødvendige for at foretage en 64-bit installation. Du kan afhjælpe problemet ved at installere Service Pack %1.
WinVersionTooLowError=Programmet kræver %1 version %2 eller nyere.
WinVersionTooHighError=Programmet kan ikke installeres på %1 version %2 eller nyere.
AdminPrivilegesRequired=Du skal være logget på som administrator for at kunne installere dette program.
PowerUserPrivilegesRequired=Du skal være logget på som administrator eller være medlem af superbruger-gruppen for at kunne installere dette program.
SetupAppRunningError=Programmet %1 er aktivt.%n%nAfslut venligst først programmet, og klik dernæst OK for at fortsætte, eller Annuller for at afbryde.
UninstallAppRunningError=Programmet %1 er aktivt.%n%nAfslut venligst først programmet, og klik dernæst OK for at fortsætte, eller Annuller for at afbryde.

; *** Misc. errors
ErrorCreatingDir=Installationen kunne ikke oprette mappen "%1"
ErrorTooManyFilesInDir=Det kan ikke lade sig gøre at oprette en fil i mappen "%1" fordi mappen indeholder for mange filer

; *** Setup common messages
ExitSetupTitle=Afbryd installationen
ExitSetupMessage=Installationen er ikke færdiggjort. Hvis der afbrydes nu, vil programmet ikke blive installeret.%n%nInstallationsguiden skal køres igen for at færdiggøre installationen.%n%nAfbryd installationen?
AboutSetupMenuItem=&Om installationsguiden...
AboutSetupTitle=Om installationsguiden
AboutSetupMessage=%1 version %2%n%3%n%n%1 hjemmeside:%n%4
AboutSetupNote=

; *** Buttons
TranslatorNote=
ButtonBack=< &Tilbage
ButtonNext=Næ&ste >
ButtonInstall=&Installer
ButtonOK=&OK
ButtonCancel=&Afbryd
ButtonYes=&Ja
ButtonYesToAll=Ja til A&lle
ButtonNo=&Nej
ButtonNoToAll=Nej t&il Alle
ButtonFinish=&Færdig
ButtonBrowse=&Gennemse...
ButtonWizardBrowse=G&ennemse...
ButtonNewFolder=&Opret Ny Mappe

; *** "Select Language" dialog messages
SelectLanguageTitle=Vælg installationssprog
SelectLanguageLabel=Vælg hvilket sprog der skal anvendes under installationen:

; *** Common wizard text
ClickNext=Klik Næste for at fortsætte, eller Afbryd for at afslutte.
BeveledLabel=
BrowseDialogTitle=Udvælg mappe
BrowseDialogLabel=Vælg en mappe fra nedenstående liste. Klik dernæst OK.
NewFolderName=Ny Mappe

; *** "Welcome" wizard page
WelcomeLabel1=Velkommen til [name] installationsguiden
WelcomeLabel2=Denne guide installerer [name/ver] på computeren.%n%nDet anbefales at alle andre programmer afsluttes før der fortsættes.

; *** "Password" wizard page
WizardPassword=Adgangskode
PasswordLabel1=Installationen er beskyttet med adgangskode.
PasswordLabel3=Indtast adgangskoden og klik Næste for at fortsætte. Der skelnes mellem store og små bogstaver.
PasswordEditLabel=&Adgangskode:
IncorrectPassword=Adgangskoden er ikke korrekt. Prøv igen, og husk at der skelnes mellem store og små bogstaver.

; *** "License Agreement" wizard page
WizardLicense=Licensaftale
LicenseLabel=Læs venligst den følgende information, som er vigtig, inden du fortsætter.
LicenseLabel3=Læs venligst licensaftalen. Du skal acceptere betingelserne i aftalen for at fortsætte installationen.
LicenseAccepted=Jeg &accepterer aftalen
LicenseNotAccepted=Jeg accepterer &ikke aftalen

; *** "Information" wizard pages
WizardInfoBefore=Information
InfoBeforeLabel=Læs følgende information inden du fortsætter.
InfoBeforeClickLabel=Tryk på Næste, når du er klar til at fortsætte installationen.
WizardInfoAfter=Information
InfoAfterLabel=Læs følgende information inden du fortsætter.
InfoAfterClickLabel=Tryk på Næste, når du er klar til at fortsætte installationen.

; *** "User Information" wizard page
WizardUserInfo=Brugerinformation
UserInfoDesc=Indtast dine oplysninger.
UserInfoName=&Brugernavn:
UserInfoOrg=&Organisation:
UserInfoSerial=&Serienummer:
UserInfoNameRequired=Du skal indtaste et navn.

; *** "Select Destination Directory" wizard page
WizardSelectDir=Vælg installationsmappe
SelectDirDesc=Hvor skal [name] installeres?
SelectDirLabel3=Guiden installerer [name] i følgende mappe.
SelectDirBrowseLabel=Klik Næste for at fortsætte. Hvis du vil vælge en anden mappe skal du klikke Gennemse.
DiskSpaceMBLabel=Der skal være mindst [mb] MB fri diskplads.
CannotInstallToNetworkDrive=Programmet kan ikke installeres på et netværksdrev.
CannotInstallToUNCPath=Programmet kan ikke installeres til en UNC-sti.
InvalidPath=Du skal indtaste den komplette sti med drevangivelse; for eksempel:%n%nC:\APP%n%neller et UNC-stinavn på formen:%n%n\\server\share
InvalidDrive=Drevet eller UNC-stien du valgte eksisterer ikke. Vælg venligst noget andet.
DiskSpaceWarningTitle=Ikke nok fri diskplads.
DiskSpaceWarning=Guiden kræver mindst %1 KB fri diskplads for at kunne foretage installationen, men det valgte drev har kun %2 KB diskplads tilgængelig.%n%nVil du installere alligevel?
DirNameTooLong=Mappens eller stiens navn er for langt.
InvalidDirName=Mappenavnet er ikke gyldigt.
BadDirName32=Navne på mapper må ikke indeholde nogen af følgende tegn:%n%n%1
DirExistsTitle=Mappen eksisterer
DirExists=Mappen:%n%n%1%n%neksisterer allerede. Ønsker du at installere i denne mappe alligevel?
DirDoesntExistTitle=Mappen eksisterer ikke.
DirDoesntExist=Mappen:%n%n%1%n%neksisterer ikke. Ønsker du at oprette denne mappe?

; *** "Select Components" wizard page
WizardSelectComponents=Vælg Komponenter
SelectComponentsDesc=Hvilke komponenter skal installeres?
SelectComponentsLabel2=Vælg de komponenter der skal installeres, og fjern markering fra dem der ikke skal installeres. Klik Næste for at fortsætte.
FullInstallation=Komplet installation
; if possible don't translate 'Compact' as 'Minimal' (I mean 'Minimal' in your language)
CompactInstallation=Kompakt installation
CustomInstallation=Tilpasset installation
NoUninstallWarningTitle=Komponenterne er installeret
NoUninstallWarning=Installationen har konstateret at følgende komponenter allerede er installeret på computeren:%n%n%1%n%nAt fravælge komponenterne vil ikke fjerne dem.%n%nFortsæt alligevel?
ComponentSize1=%1 KB
ComponentSize2=%1 MB
ComponentsDiskSpaceMBLabel=Det valgte kræver mindst [mb] MB fri plads på harddisken.

; *** "Select Additional Tasks" wizard page
WizardSelectTasks=Vælg ekstra opgaver
SelectTasksDesc=Hvilke andre opgaver skal udføres?
SelectTasksLabel2=Vælg hvilke ekstraopgaver der skal udføres under installationen af [name] og klik på Næste.

; *** "Select Start Menu Folder" wizard page
WizardSelectProgramGroup=Vælg Start-menu mappe
SelectStartMenuFolderDesc=Hvor skal installationen oprette genveje til programmet?
SelectStartMenuFolderLabel3=Installationsguiden opretter genveje (ikoner) til programmet i følgende mappe i Start-menuen.
SelectStartMenuFolderBrowseLabel=Klik Næste for at fortsætte. Hvis du vil vælge en anden mappe skal du klikke Gennemse.
MustEnterGroupName=Du skal angive et mappenavn.
GroupNameTooLong=Mappens eller stiens navn er for langt.
InvalidGroupName=Mappenavnet er ikke gyldigt.
BadGroupName=Tegnene %1 må ikke anvendes i navnet på en programgruppe. Angiv andet navn.
NoProgramGroupCheck2=Opret &ingen programgruppe i Start-menuen

; *** "Ready to Install" wizard page
WizardReady=Klar til at installere
ReadyLabel1=Installationsguiden er nu klar til at installere [name] på computeren.
ReadyLabel2a=Tryk på Installer for at fortsætte med installationen, eller tryk på Tilbage hvis du ønsker at se eller ændre dine indstillinger.
ReadyLabel2b=Tryk på Installer for at fortsætte med installationen.
ReadyMemoUserInfo=Oplysninger om brugeren:
ReadyMemoDir=Installationsmappe :
ReadyMemoType=Installationstype:
ReadyMemoComponents=Valgte komponenter:
ReadyMemoGroup=Start-menu mappe:
ReadyMemoTasks=Valgte ekstraopgaver:

; *** "Preparing to Install" wizard page
WizardPreparing=Klargør installationen
PreparingDesc=Installationsguiden klargør installationen af [name] på din computer.
PreviousInstallNotCompleted=Den foregående installation eller fjernelse af et program er ikke afsluttet. Du skal genstarte computeren for at afslutte den foregående installation.%n%nEfter genstarten skal du køre installationsguiden igen for at fuldføre installationen af [name].
CannotContinue=Installationsguiden kan ikke fortsætte. Klik på Fortryd for at afslutte.
ApplicationsFound=Følgende programmer bruger filer som skal opdateres. Det anbefales at du giver installationsguiden lov til automatisk at lukke programmerne.
ApplicationsFound2=Følgende programmer bruger filer som skal opdateres. Det anbefales at du giver installationsguiden lov til automatisk at lukke programmerne. Installationsguiden vil forsøge at genstarte programmerne når installationen er afsluttet.
CloseApplications=&Luk programmerne automatisk
DontCloseApplications=Luk &ikke programmerne
ErrorCloseApplications=Installationsguiden kan ikke automatisk lukke alle programmerne. Det anbefales at du lukker alle programmer som bruger filer der skal opdateres, inden installationsguiden fortsætter.

; *** "Installing" wizard page
WizardInstalling=Installerer
InstallingLabel=Vent mens installationsguiden installerer [name] på din computer.

; *** "Setup Completed" wizard page
FinishedHeadingLabel=Afslutter installation af [name]
FinishedLabelNoIcons=Installationsguiden har installeret [name] på din computer.
FinishedLabel=Installationsguiden har installeret [name] på din computer. Programmet kan startes ved at vælge de oprettede genveje.
ClickFinish=Klik på Færdig for at afslutte installationsprogrammet.
FinishedRestartLabel=For at fuldføre installationen af [name], skal din computer genstartes. Vil du genstarte computeren nu?
FinishedRestartMessage=For at fuldføre installationen af [name], skal din computer genstartes.%n%nVil du genstarte computeren nu?
ShowReadmeCheck=Ja, jeg vil gerne læse README filen
YesRadio=&Ja, genstart computeren nu
NoRadio=&Nej, jeg genstarter selv computeren senere
; used for example as 'Run MyProg.exe'
RunEntryExec=Kør %1
; used for example as 'View Readme.txt'
RunEntryShellExec=Læs %1

; *** "Setup Needs the Next Disk" stuff
ChangeDiskTitle=Installationsprogrammet skal bruge den næste disk(ette)
SelectDiskLabel2=Indsæt disk nr. %1 og klik OK.%n%nHvis filerne findes i en anden mappe så indtast stien eller klik Gennemse.
PathLabel=&Stinavn:
FileNotInDir2=Filen "%1" findes ikke i "%2". Indsæt den rigtige disk eller vælg en anden mappe.
SelectDirectoryLabel=Angiv placeringen af den næste disk.

; *** Installation phase messages
SetupAborted=Installationen blev ikke gennemført.%n%nInstaller igen, hent programmet på ny, eller kontakt producenten for hjælp.
EntryAbortRetryIgnore=Klik Gentag for at forsøge igen, Ignorer for at fortsætte alligevel, eller Afbryd for at annullere installationen.

; *** Installation status messages
StatusClosingApplications=Lukker programmer...
StatusCreateDirs=Opretter mapper...
StatusExtractFiles=Udpakker filer...
StatusCreateIcons=Opretter program-genveje...
StatusCreateIniEntries=Opretter INI-filer...
StatusCreateRegistryEntries=Opdaterer registrerings-databasen...
StatusRegisterFiles=Registrerer filer...
StatusSavingUninstall=Gemmer information om afinstallation...
StatusRunProgram=Færdiggør installation...
StatusRestartingApplications=Genstarter programmer...
StatusRollback=Fjerner programmet igen...

; *** Misc. errors
ErrorInternal2=Intern fejl: %1
ErrorFunctionFailedNoCode=%1 fejlede
ErrorFunctionFailed=%1 fejlede; kode %2
ErrorFunctionFailedWithMessage=%1 fejlede; kode %2.%n%3
ErrorExecutingProgram=Kan ikke udføre filen:%n%1

; *** Registry errors
ErrorRegOpenKey=Fejl ved åbning af  registreringsnøgle:%n%1\%2
ErrorRegCreateKey=Fejl ved oprettelse af registreringsnøgle:%n%1\%2
ErrorRegWriteKey=Fejl ved skrivning til registreringsnøgle:%n%1\%2

; *** INI errors
ErrorIniEntry=Fejl ved oprettelse af variabel i INI-filen "%1".

; *** File copying errors
FileAbortRetryIgnore=Klik Gentag for at prøve igen, Ignorer for at springe filen over (kan normalt ikke anbefales) eller Afbryd for at afslutte installationen.
FileAbortRetryIgnore2=Klik Gentag for at prøve igen, Ignorer for at fortsætte alligevel (kan normalt ikke anbefales) eller Afbryd for at afslutte installationen.
SourceIsCorrupted=Kildefilen er beskadiget
SourceDoesntExist=Kildefilen "%1" findes ikke
ExistingFileReadOnly=Den eksisterende fil er markeret som skrivebeskyttet.%n%nKlik Gentag for at prøve igen (efter at du har fjernet skrivebeskyttelsen), Ignorer for at springe filen over eller Afbryd for at afslutte installationen.
ErrorReadingExistingDest=Der opsted en fejl ved forsøg på at læse den eksisterende fil:
FileExists=Filen eksisterer allerede.%n%nSkal Installationsguiden overskrive den?
ExistingFileNewer=Den eksisterende fil er nyere end den installation forsøger at skrive. Det anbefales at beholde den eksisterende fil.%n%n Skal den eksisterende fil beholdes?
ErrorChangingAttr=Der opstod en fejl ved forsøg på at ændre attributter for den eksisterende fil:
ErrorCreatingTemp=En fejl opstod ved forsøg på at oprette en fil i mappen:
ErrorReadingSource=En fejl opstod ved forsøg på at læse kildefilen:
ErrorCopying=En fejl opstod ved forsøg på at kopiere en fil:
ErrorReplacingExistingFile=En fejl opstod ved forsøg på at overskrive den eksisterende fil:
ErrorRestartReplace=Genstart/Erstat fejlede:
ErrorRenamingTemp=En fejl opstod ved forsøg på at omdøbe en fil i modtagemappen:
ErrorRegisterServer=Kan ikke registrere DLL/OCX: %1
ErrorRegSvr32Failed=RegSvr32 fejlede med exit kode %1
ErrorRegisterTypeLib=Kan ikke registrere typebiblioteket: %1

; *** Post-installation errors
ErrorOpeningReadme=Der opstod en fejl ved forsøg på at åbne README filen.
ErrorRestartingComputer=Installationen kunne ikke genstarte computeren. Genstart venligst computeren manuelt.

; *** Uninstaller messages
UninstallNotFound=Filen "%1" eksisterer ikke. Afinstallationen kan ikke fortsætte.
UninstallOpenError=Filen "%1" kunne ikke åbnes. Kan ikke afinstallere
UninstallUnsupportedVer=Afinstallations-logfilen "%1" er i et format der ikke kan genkendes af denne version af afinstallations-programmet. Afinstallationen afbrydes
UninstallUnknownEntry=Der er en ukendt kommando (%1) i afinstallings-logfilen.
ConfirmUninstall=Er du sikker på at %1 og alle tilhørende komponenter skal fjernes fra computeren?
UninstallOnlyOnWin64=Denne installation kan kun fjernes på 64-bit Windows-versioner
OnlyAdminCanUninstall=Programmet kan kun fjernes af en bruger med administrator-rettigheder.
UninstallStatusLabel=Vent venligst imens %1 fjernes.
UninstalledAll=%1 er fjernet uden fejl.
UninstalledMost=%1 Afinstallation er afsluttet.%n%nNogle filer kunne ikke fjernes. Fjern dem manuelt, hvis du ikke ønsker de skal blive liggende.
UninstalledAndNeedsRestart=For at afslutte afinstallation af %1 skal computeren genstartes.%n%nVil du genstarte nu?
UninstallDataCorrupted="%1" er beskadiget. Afinstallation kan ikke foretages

; *** Uninstallation phase messages
ConfirmDeleteSharedFileTitle=Fjern delt fil?
ConfirmDeleteSharedFile2=Systemet mener ikke længere at følgende delte fil(er) benyttes. Skal den/de delte fil(er) fjernes under afinstallationen?%n%nHvis du er usikker så vælg Nej. Beholdes filen på maskinen, vil den ikke gøre nogen skade, men hvis filen fjernes, selv om den stadig anvendes, bliver de programmer, der anvender filen, ustabile
SharedFileNameLabel=Filnavn:
SharedFileLocationLabel=Placering:
WizardUninstalling=Status for afinstallation
StatusUninstalling=Afinstallerer %1...

; *** Shutdown block reasons
ShutdownBlockReasonInstallingApp=Installerer %1.
ShutdownBlockReasonUninstallingApp=Afinstallerer %1.

[CustomMessages]
NameAndVersion=%1 version %2
AdditionalIcons=Ekstra ikoner:
CreateDesktopIcon=Lav ikon på skrive&bordet
CreateQuickLaunchIcon=Lav &hurtigstart-ikon
ProgramOnTheWeb=%1 på internettet
UninstallProgram=Afinstaller (fjern) %1
LaunchProgram=&Kør %1
AssocFileExtension=Sammen&kæd %1 med filtypen %2
AssocingFileExtension=Sammenkæder %1 med filtypen %2...
AutoStartProgramGroupDescription=Start:
AutoStartProgram=Start automatisk %1
AddonHostProgramNotFound=%1 blev ikke fundet i den mappe du angav.%n%nØnsker du alligevel at fortsætte?
