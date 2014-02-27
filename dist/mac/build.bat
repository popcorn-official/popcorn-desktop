:: Builds "Popcorn Time.app" for Mac
rd /s /q "%CD%\Popcorn Time.app"

:: Start by taking the standard node-webkit for mac
:: .app Files (MacOS Applications) are actually directories
mkdir "%CD%\Popcorn Time.app"
xcopy /s "%CD%\..\..\node-webkit\mac\node-webkit.app" "%CD%\Popcorn Time.app"

:: Now copy all the necessary files into the Contents folder fo create a (fake) package
@echo off
set packageDir=%CD%\Popcorn Time.app\Contents\Resources\app.nw
mkdir "%packageDir%"

xcopy /s/i "%CD%\..\..\css" "%packageDir%\css"
xcopy /s/i "%CD%\..\..\js" "%packageDir%\js"
xcopy /s/i "%CD%\..\..\fonts" "%packageDir%\fonts"
xcopy /s/i "%CD%\..\..\images" "%packageDir%\images"
xcopy /s/i "%CD%\..\..\language" "%packageDir%\language"
xcopy /s/i "%CD%\..\..\node_modules" "%packageDir%\node_modules"
xcopy /s/i "%CD%\..\..\tmp" "%packageDir%\tmp"

:: Put our custom icons in place
del "%CD%\Popcorn Time.app\Contents\Resources\nw.icns"
copy "%CD%\popcorntime.icns" "%CD%\Popcorn Time.app\Contents\Resources\nw.icns"

:: Zip the file (Requires 7zip)
del "Popcorn Time.zip"
"%ProgramFiles%\7-Zip\7z.exe" a -tzip -mx9 "Popcorn Time.zip" "Popcorn Time.app"