; Popcorn Time 
; Installer Source
; Version 1.0

;Include Modern UI
!include "MUI2.nsh"

;General Settings
Name "Popcorn Time"
Caption "Popcorn Time"
BrandingText "Popcorn Time"
OutFile "PopcornTimeSetup.exe"
CRCCheck on
SetCompressor /SOLID lzma

;Default installation folder
InstallDir "$APPDATA\Popcorn Time"

;Request application privileges
RequestExecutionLevel user

;Define UI settings
!define MUI_LICENSEPAGE_BGCOLOR /GRAY
!define MUI_UI_HEADERIMAGE_RIGHT "..\..\images\icon.png"
!define MUI_ICON "..\..\images\popcorntime.ico"
!define MUI_UNICON "..\..\images\popcorntime.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "installer-image.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "installer-image.bmp"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_LINK "Popcorn Time Official Homepage"
!define MUI_FINISHPAGE_LINK_LOCATION http://get-popcorn.com/

;Define the pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

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
ShowUninstDetails show

Section ; App Files
	
	RMDir /r "$INSTDIR"
	
	;Set output path to InstallDir
	SetOutPath "$INSTDIR"

	;Add the files
	File "..\..\build\releases\Popcorn-Time\win\Popcorn-Time\*"
	
	;Create uninstaller
	WriteUninstaller "$INSTDIR\Uninstall.exe"

SectionEnd

Section ; Shortcuts

	SetOutPath "$INSTDIR"
	File /oname=app.ico "..\..\images\popcorntime.ico"

	;Working Directory
	SetOutPath "$INSTDIR"

	;Start Menu Shortcut
	RMDir /r "$SMPROGRAMS\Popcorn Time"
	CreateDirectory "$SMPROGRAMS\Popcorn Time"
	CreateShortCut "$SMPROGRAMS\Popcorn Time\Popcorn Time.lnk" "$INSTDIR\Popcorn-Time.exe" "." "$INSTDIR\app.ico" "" "" "" "Start Popcorn Time"
	CreateShortCut "$SMPROGRAMS\Popcorn Time\Uninstall.lnk" "$INSTDIR\Uninstall.exe"

	;Desktop Shortcut
	Delete "$DESKTOP\Popcorn Time.lnk"
	CreateShortCut "$DESKTOP\Popcorn Time.lnk" "$INSTDIR\Popcorn-Time.exe" "." "$INSTDIR\app.ico" "" "" "" "Start Popcorn Time"

SectionEnd

Section "uninstall" ; Uninstaller

	RMDir /r "$INSTDIR"
	RMDir /r "$SMPROGRAMS\Popcorn Time"
	Delete "$DESKTOP\Popcorn Time.lnk"
	
SectionEnd