:: Copy the node-webkit distro to the build dir
deltree %CD%\windows
mkdir %CD%\windows
copy %CD%\..\node-webkit\windows %CD%\windows

:: Make a zip with all the files and directories
"%ProgramFiles%\7-Zip\7z.exe" a -mx=0 -tzip windows\app.nw -ir@"build_file_list.txt"

copy /b %CD%\..\node-webkit\windows\nw.exe+%CD%\windows\app.nw %CD%\windows\popcorn-time.exe

:: Remove useless stuff
del %CD%\windows\nw.exe