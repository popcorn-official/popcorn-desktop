'create shell'
Set WshShell = CreateObject("WScript.Shell")

'define variables'
Dim arg, command, path, package, executable

'set argument if exists'
If WScript.Arguments.Count > 0     Then
    arg = chr(34) & WScript.Arguments(0) & chr(34)
Else
    arg = ""
End If

'set executable'
executable = "\nw.exe"

'set app path'
path = WshShell.RegRead("HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall\Butter\InstallString")

'set command'
command = chr(34) & path & executable & chr(34)

'launch the app'
WshShell.Exec( command & " " & arg)

'close shell'
Set WshShell = Nothing