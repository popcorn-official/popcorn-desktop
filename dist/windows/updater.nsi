; Popcorn Time 
; Updater Source
; Version 1.0

;Include Modern UI
!include "MUI2.nsh"

;General Settings
!searchparse /file "..\..\package.json" `  "version": "` PT_VERSION `",`
Name "Popcorn Time"
Caption "Popcorn Time Updater v${PT_VERSION}"
BrandingText "Popcorn Time v${PT_VERSION}"
VIAddVersionKey "ProductName" "Popcorn Time"
VIAddVersionKey "ProductVersion" "v${PT_VERSION}"
VIAddVersionKey "FileDescription" "Popcorn Time"
VIAddVersionKey "FileVersion" "v${PT_VERSION}"
VIAddVersionKey "CompanyName" "Popcorn Official"
VIAddVersionKey "LegalCopyright" "http://get-popcorn.com"
VIAddVersionKey "OriginalFilename" "Updater-Popcorn-Time-${PT_VERSION}-Win-32.exe"
VIProductVersion "${PT_VERSION}.0"
OutFile "Updater-Popcorn-Time-${PT_VERSION}-Win-32.exe"
CRCCheck on
SetCompressor /SOLID lzma

;Default installation folder
InstallDir "$APPDATA\Popcorn Time"

;Request application privileges
RequestExecutionLevel user

;Define UI settings
!define MUI_LICENSEPAGE_BGCOLOR /GRAY
!define MUI_UI_HEADERIMAGE_RIGHT "..\..\src\app\images\icon.png"
!define MUI_ICON "..\..\src\app\images\popcorntime.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "installer-image.bmp"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Start Popcorn Time"
!define MUI_FINISHPAGE_RUN_FUNCTION "LaunchPopcornTime"
!define MUI_FINISHPAGE_LINK "Popcorn Time Official Homepage"
!define MUI_FINISHPAGE_LINK_LOCATION "http://get-popcorn.com/"

;Define the pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

;Load Language Files
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Afrikaans"
!insertmacro MUI_LANGUAGE "Albanian"
!insertmacro MUI_LANGUAGE "Arabic"
!insertmacro MUI_LANGUAGE "Asturian"
!insertmacro MUI_LANGUAGE "Basque"
!insertmacro MUI_LANGUAGE "Belarusian"
!insertmacro MUI_LANGUAGE "Bosnian"
!insertmacro MUI_LANGUAGE "Breton"
!insertmacro MUI_LANGUAGE "Bulgarian"
!insertmacro MUI_LANGUAGE "Catalan"
!insertmacro MUI_LANGUAGE "Croatian"
!insertmacro MUI_LANGUAGE "Czech"
!insertmacro MUI_LANGUAGE "Danish"
!insertmacro MUI_LANGUAGE "Dutch"
!insertmacro MUI_LANGUAGE "Esperanto"
!insertmacro MUI_LANGUAGE "Estonian"
!insertmacro MUI_LANGUAGE "Farsi"
!insertmacro MUI_LANGUAGE "Finnish"
!insertmacro MUI_LANGUAGE "French"
!insertmacro MUI_LANGUAGE "Galician"
!insertmacro MUI_LANGUAGE "German"
!insertmacro MUI_LANGUAGE "Greek"
!insertmacro MUI_LANGUAGE "Hebrew"
!insertmacro MUI_LANGUAGE "Hungarian"
!insertmacro MUI_LANGUAGE "Icelandic"
!insertmacro MUI_LANGUAGE "Indonesian"
!insertmacro MUI_LANGUAGE "Irish"
!insertmacro MUI_LANGUAGE "Italian"
!insertmacro MUI_LANGUAGE "Japanese"
!insertmacro MUI_LANGUAGE "Korean"
!insertmacro MUI_LANGUAGE "Kurdish"
!insertmacro MUI_LANGUAGE "Latvian"
!insertmacro MUI_LANGUAGE "Lithuanian"
!insertmacro MUI_LANGUAGE "Luxembourgish"
!insertmacro MUI_LANGUAGE "Macedonian"
!insertmacro MUI_LANGUAGE "Malay"
!insertmacro MUI_LANGUAGE "Mongolian"
!insertmacro MUI_LANGUAGE "Norwegian"
!insertmacro MUI_LANGUAGE "NorwegianNynorsk"
!insertmacro MUI_LANGUAGE "Pashto"
!insertmacro MUI_LANGUAGE "Polish"
!insertmacro MUI_LANGUAGE "Portuguese"
!insertmacro MUI_LANGUAGE "PortugueseBR"
!insertmacro MUI_LANGUAGE "Romanian"
!insertmacro MUI_LANGUAGE "Russian"
!insertmacro MUI_LANGUAGE "Serbian"
!insertmacro MUI_LANGUAGE "SerbianLatin"
!insertmacro MUI_LANGUAGE "SimpChinese"
!insertmacro MUI_LANGUAGE "Slovak"
!insertmacro MUI_LANGUAGE "Slovenian"
!insertmacro MUI_LANGUAGE "Spanish"
!insertmacro MUI_LANGUAGE "SpanishInternational"
!insertmacro MUI_LANGUAGE "Swedish"
!insertmacro MUI_LANGUAGE "Thai"
!insertmacro MUI_LANGUAGE "TradChinese"
!insertmacro MUI_LANGUAGE "Turkish"
!insertmacro MUI_LANGUAGE "Ukrainian"
!insertmacro MUI_LANGUAGE "Uzbek"
!insertmacro MUI_LANGUAGE "Vietnamese"
!insertmacro MUI_LANGUAGE "Welsh"

AutoCloseWindow false
ShowInstDetails show

Section ; App Files

	IfFileExists "$INSTDIR\Popcorn-Time.exe" ff fnf
	fnf:
	MessageBox MB_OK "You need to have Popcorn-Time installed from the installer to use the updater."
	Quit
	ff:
	
	RMDir /r "$INSTDIR\src"
	RMDir /r "$INSTDIR\node_modules"
	
	;Set output path to InstallDir
	SetOutPath "$INSTDIR"

	;Add the files
	File "..\..\package.json" "..\..\README.md" "..\..\LICENSE.txt"
	File /r /x "*grunt*" /x "stylus" /x "bower" /x "test" /x "bin" /x ".*" "..\..\node_modules"
	SetOutPath "$INSTDIR\src"
	File /r "..\..\src\*.*"

SectionEnd

Function LaunchPopcornTime
  ExecShell "" "$INSTDIR\Start Popcorn Time.lnk"
FunctionEnd