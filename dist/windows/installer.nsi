; Popcorn Time 
; Installer Source
; Version 1.0

;Include Modern UI
!include "MUI2.nsh"

;General Settings
!searchparse /file "..\..\package.json" `  "version": "` PT_VERSION `",`
!searchreplace PT_VERSION "${PT_VERSION}" "-" "."
Name "Popcorn Time"
Caption "Popcorn Time v${PT_VERSION}"
BrandingText "Popcorn Time v${PT_VERSION}"
VIAddVersionKey "ProductName" "Popcorn Time"
VIAddVersionKey "ProductVersion" "v${PT_VERSION}"
VIAddVersionKey "FileDescription" "Popcorn Time v${PT_VERSION} Installer"
VIAddVersionKey "FileVersion" "v${PT_VERSION}"
VIAddVersionKey "CompanyName" "Popcorn Official"
VIAddVersionKey "LegalCopyright" "http://popcorntime.io"
VIProductVersion "${PT_VERSION}.0"
OutFile "PopcornTimeSetup.exe"
CRCCheck on
SetCompressor /SOLID lzma

;Default installation folder
InstallDir "$LOCALAPPDATA\Popcorn Time"

;Request application privileges
RequestExecutionLevel user

;Define UI settings
!define MUI_LICENSEPAGE_BGCOLOR /GRAY
!define MUI_UI_HEADERIMAGE_RIGHT "..\..\src\app\images\icon.png"
!define MUI_ICON "..\..\src\app\images\popcorntime.ico"
!define MUI_UNICON "..\..\src\app\images\popcorntime.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "installer-image.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "uninstaller-image.bmp"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_LINK "Popcorn Time Official Homepage"
!define MUI_FINISHPAGE_LINK_LOCATION "http://popcorntime.io/"

;Define the pages
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

;Define uninstall pages
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

Section ; Node Webkit Files

	;Delete existing install
	RMDir /r "$INSTDIR"

	;Set output path to InstallDir
	SetOutPath "$INSTDIR\node-webkit"

	;Add the files
	File "..\..\build\cache\win\0.9.2\*.dll"
	File "/oname=Popcorn Time.exe" "..\..\build\cache\win\0.9.2\nw.exe"
	File "..\..\build\cache\win\0.9.2\nw.pak"

SectionEnd

Section ; App Files

	;Set output path to InstallDir
	SetOutPath "$INSTDIR\src\app"

	;Add the files
	File /r "..\..\src\app\css"
	File /r "..\..\src\app\fonts"
	File /r "..\..\src\app\images"
	File /r "..\..\src\app\language"
	File /r "..\..\src\app\lib"
	File /r "..\..\src\app\templates"
	File /r "..\..\src\app\vendor"
	File "..\..\src\app\index.html"
	File "..\..\src\app\*.js"

	SetOutPath "$INSTDIR"
	File "..\..\package.json"

	SetOutPath "$INSTDIR\node_modules"
	File /r /x "*grunt*" /x "stylus" /x "bower" /x ".bin" /x "bin" /x "test"  /x "test*" /x "example*" "..\..\node_modules\*.*"

	;Create uninstaller
	WriteUninstaller "$INSTDIR\Uninstall.exe"

SectionEnd

Section ; Shortcuts

	;Working Directory
	SetOutPath "$INSTDIR"
    
	CreateShortCut "$INSTDIR\Popcorn Time.lnk" "$INSTDIR\node-webkit\Popcorn Time.exe" "." "$INSTDIR\src\app\images\popcorntime.ico" "" "" "" "Popcorn Time"

	;Start Menu Shortcut
	RMDir /r "$SMPROGRAMS\Popcorn Time"
	CreateDirectory "$SMPROGRAMS\Popcorn Time"
	CreateShortCut "$SMPROGRAMS\Popcorn Time\Popcorn Time.lnk" "$INSTDIR\node-webkit\Popcorn Time.exe" "." "$INSTDIR\src\app\images\popcorntime.ico" "" "" "" "Popcorn Time"
	CreateShortCut "$SMPROGRAMS\Popcorn Time\Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\src\app\images\popcorntime.ico" "" "" "" "Uninstall Popcorn Time"

	;Desktop Shortcut
	Delete "$DESKTOP\Popcorn Time.lnk"
	CreateShortCut "$DESKTOP\Popcorn Time.lnk" "$INSTDIR\node-webkit\Popcorn Time.exe" "." "$INSTDIR\src\app\images\popcorntime.ico" "" "" "" "Popcorn Time"

SectionEnd

Section "uninstall" ; Uninstaller

	RMDir /r "$INSTDIR"
	RMDir /r "$SMPROGRAMS\Popcorn Time"
	Delete "$DESKTOP\Popcorn Time.lnk"
	
SectionEnd
