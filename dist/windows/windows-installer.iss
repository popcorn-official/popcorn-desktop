; Installer Variables
#define AppName "Popcorn Time"
#define AppVersion "Beta 2.5"
#define AppPublisher "Popcorn Time Team"
#define AppURL "https://github.com/popcorn-time/popcorn-app"
#define AppExeName "run.bat"


[Setup]
; DON'T FUCK WITH THE APPID. This uniquely identifies this application, which is used to find the app if we need to update it.
AppId={{F4B2C5C1-F084-4858-B9C3-E641F5C12BBA}

AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}

; Make the Installer nicer and Minimalistic
WizardImageFile=.\installer-image.bmp
WindowResizable=no

; Don't ask for a install folder (it goes into \Users\Username\AppData\Roaming\Popcorn Time\, which doesn't require admin privileges)
UsePreviousAppDir=no
DefaultDirName={userappdata}\Popcorn Time
DisableDirPage=yes

; No Start Menu Folder picker (It's always created)
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes

; We just need a Welcome Page and a Finish page. Nothing else.
DisableReadyPage=yes
DisableFinishedPage=no
DisableWelcomePage=no

; No UAC bullshit
PrivilegesRequired=lowest
; Put the uninstaller in the same folder, or else it'll go into Program Files, which requires Admin Privileges
UninstallFilesDir={app}

; Use the same language as the user (or ask otherwise)
ShowLanguageDialog=auto

; Compress the files nicely
Compression=lzma2
SolidCompression=yes

; Final Installer
OutputBaseFilename=Install Popcorn Time
SetupIconFile=..\..\images\popcorntime.ico
OutputDir=.\


[Languages]
Name: "ar"; MessagesFile: ".\languages\Arabic.isl"
Name: "eu"; MessagesFile: ".\languages\Basque.isl"
Name: "ptbr"; MessagesFile: ".\languages\BrazilianPortuguese.isl"
Name: "ca"; MessagesFile: ".\languages\Catalan.isl"
; Name: ""; MessagesFile: ".\languages\Corsican.isl"
Name: "cs"; MessagesFile: ".\languages\Czech.isl"
Name: "da"; MessagesFile: ".\languages\Danish.isl"
Name: "nl"; MessagesFile: ".\languages\Dutch.isl"
Name: "en"; MessagesFile: ".\languages\English.isl"
Name: "fi"; MessagesFile: ".\languages\Finnish.isl"
Name: "fr"; MessagesFile: ".\languages\French.isl"
Name: "ge"; MessagesFile: ".\languages\German.isl"
Name: "el"; MessagesFile: ".\languages\Greek.isl"
Name: "he"; MessagesFile: ".\languages\Hebrew.isl"
Name: "hu"; MessagesFile: ".\languages\Hungarian.isl"
Name: "it"; MessagesFile: ".\languages\Italian.isl"
Name: "ja"; MessagesFile: ".\languages\Japanese.isl"
; Name: ""; MessagesFile: ".\languages\Nepali.isl"
Name: "no"; MessagesFile: ".\languages\Norwegian.isl"
Name: "pl"; MessagesFile: ".\languages\Polish.isl"
Name: "pt"; MessagesFile: ".\languages\Portuguese.isl"
Name: "ru"; MessagesFile: ".\languages\Russian.isl"
; Name: "sr"; MessagesFile: ".\languages\SerbianCyrillic.isl"
; Name: "sr"; MessagesFile: ".\languages\SerbianLatin.isl"
Name: "sk"; MessagesFile: ".\languages\Slovak.isl"
; Name: ""; MessagesFile: ".\languages\Slovenian.isl"
Name: "es"; MessagesFile: ".\languages\Spanish.isl"
Name: "sv"; MessagesFile: ".\languages\Swedish.isl"
Name: "zh-tw"; MessagesFile: ".\languages\TraditonalChinese.isl"
Name: "tk"; MessagesFile: ".\languages\Turkish.isl"
; Name: ""; MessagesFile: ".\languages\Ukrainian.isl"


[Files]
Source: ".\run.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\index.html"; DestDir: "{app}\app\"; Flags: ignoreversion
Source: "..\..\package.json"; DestDir: "{app}\app\"; Flags: ignoreversion
Source: "..\..\css\*"; DestDir: "{app}\app\css\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\js\*"; DestDir: "{app}\app\js\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\fonts\*"; DestDir: "{app}\app\fonts\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\images\*"; DestDir: "{app}\app\images\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\language\*"; DestDir: "{app}\app\language\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\*"; DestDir: "{app}\app\node_modules\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node-webkit\windows\*"; DestDir: "{app}\node-webkit\"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files


[Icons]
; Add an Icon in the app folder as a reference
Name: "{app}\{#AppName}"; WorkingDir: "{app}"; Filename: "{app}\node-webkit\nw.exe"; Parameters:"""{app}\app"""; IconFilename: "{app}\app\images\popcorntime.ico"; Flags: runminimized preventpinning
; Another in the group (this one can be featured)
Name: "{group}\{#AppName}"; WorkingDir: "{app}"; Filename: "{app}\node-webkit\nw.exe"; Parameters:"""{app}\app"""; IconFilename: "{app}\app\images\popcorntime.ico"; Flags: runminimized
; Another in the desktop
Name: "{commondesktop}\{#AppName}"; WorkingDir: "{app}"; Filename: "{app}\node-webkit\nw.exe"; Parameters:"""{app}\app"""; IconFilename: "{app}\app\images\popcorntime.ico"; Flags: runminimized preventpinning


[Run]
; Run the app after installing
Filename: "{app}\node-webkit\nw.exe"; Parameters: """{app}\app"""; Description: "{cm:LaunchProgram,{#StringChange(AppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent runminimized

