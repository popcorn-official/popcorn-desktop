; ************ Inno Setup version 5.5.3+ Traditional Chinese messages ************
; ***                                                                          ***
; ***    To download user-contributed translations of this file, go to:        ***
; ***    http://www.jrsoftware.org/files/istrans/                              ***
; ***                                                                          ***
; ***    Author: Jackmoo (enepgoo@gmail.com)                                   ***
; ***                                                                          ***        
; ***    **UNDER TESTING SINCE CHINESE IS DOUBLE BYTE CHARACTER**              ***
; ***                                                                          ***  
; *** Note: When translating this text, do not add periods (.) to the end of   ***
; *** messages that didn't have them already, because on those messages Inno   ***
; *** Setup adds the periods automatically (appending a period would result in ***
; *** two periods being displayed).                                            ***
; ********************************************************************************



[LangOptions]
; The following three entries are very important. Be sure to read and 
; understand the '[LangOptions] section' topic in the help file.
LanguageName=Traditional Chinese
LanguageID=$7C04

; *Not test yet
LanguageCodePage=950
; ****

; If the language you are translating to requires special font faces or
; sizes, uncomment any of the following entries and change them accordingly.
;DialogFontName=
;DialogFontSize=8
;WelcomeFontName=Verdana
;WelcomeFontSize=12
;TitleFontName=Arial
;TitleFontSize=29
;CopyrightFontName=Arial
;CopyrightFontSize=8

[Messages]

; *** Application titles
SetupAppTitle=安裝
SetupWindowTitle=安裝 - %1
UninstallAppTitle=解除安裝
UninstallAppFullTitle=%1 解除安裝

; *** Misc. common
InformationTitle=資訊
ConfirmTitle=確認
ErrorTitle=錯誤

; *** SetupLdr messages
SetupLdrStartupMessage=將安裝%1. 您是否要繼續?
LdrCannotCreateTemp=無法建立暫存檔案. 安裝中止
LdrCannotExecTemp=無法啟動暫存資料夾中的檔案. 安裝中止

; *** Startup error messages
LastErrorMessage=%1.%n%n錯誤 %2: %3
SetupFileMissing=缺失安裝資料夾中的檔案: %1 請修正或重新下載本程式
SetupFileCorrupt=安裝檔案損毀. 請重新下載本程式
SetupFileCorruptOrWrongVer=安裝檔案損毀或不相容於本安裝程式 請修正或重新下載本程式
InvalidParameter=此參數在命令行不合法:%n%n%1
SetupAlreadyRunning=安裝程式已經在執行
WindowsVersionNotSupported=本程式並不支援您的Windows版本
WindowsServicePackRequired=本程式需要 %1 Service Pack %2 或更新的版本
NotOnThisPlatform=本程式無法在 %1 上執行
OnlyOnThisPlatform=本程式必須在 %1 上才能執行
OnlyOnTheseArchitectures=本程式僅能安裝於使用%n%n%1架構的Windows上
MissingWOW64APIs=您的Windows沒有安裝64位元程式的功能 請安裝 Service Pack %1.
WinVersionTooLowError=本程式需要 %1 版本 %2 或更新的版本
WinVersionTooHighError=本程式無法安裝於 %1 版本 %2 或更新的版本
AdminPrivilegesRequired=您必須以管理員(administrator)身分登入才能安裝此程式
PowerUserPrivilegesRequired=您必須以管理員(administrator)身分登入或是Power Users的成員才能安裝此程式
SetupAppRunningError=安裝程式已偵測到 %1 正在執行 %n%n請關閉所有該程式, 然後按"確定"來繼續安裝, 或按"取消"來取消安裝
UninstallAppRunningError=解除安裝程式已偵測到 %1 正在執行 %n%n請關閉所有該程式, 然後按"確定"來繼續安裝, 或按"取消"來取消安裝

; *** Misc. errors
ErrorCreatingDir=安裝程式無法建立"%1"資料夾
ErrorTooManyFilesInDir=資料夾"%1"檔案太多, 已無法建立檔案

; *** Setup common messages
ExitSetupTitle=離開安裝程式
ExitSetupMessage=安裝尚未完成 如果您現在離開,程式將不會被安裝 %n%n您可以重新執行安裝程式來完成安裝 %n%n確定要離開安裝程式?
AboutSetupMenuItem=&關於本安裝程式...
AboutSetupTitle=關於本安裝程式
AboutSetupMessage=%1 版本 %2%n%3%n%n%1 官方網址:%n%4
AboutSetupNote=
TranslatorNote=繁體中文化 by Jackmoo

; *** Buttons
ButtonBack=< 上一頁(&B)
ButtonNext=安裝(&I) Popcorn Time >
ButtonInstall=安裝(&I)
ButtonOK=確定
ButtonCancel=取消
ButtonYes=是(&Y)
ButtonYesToAll=全部皆是(&a)
ButtonNo=否(&N)
ButtonNoToAll=全部皆否(&o)
ButtonFinish=完成(&F)
ButtonBrowse=瀏覽(&B)...
ButtonWizardBrowse=瀏覽(&r)...
ButtonNewFolder=建立新資料夾(&M)

; *** "Select Language" dialog messages
SelectLanguageTitle=選擇安裝語言
SelectLanguageLabel=選擇安裝時顯示的語言:

; *** Common wizard text
ClickNext=點選"安裝 Popcorn Time" 以繼續, 或點選"取消"離開安裝程式
BeveledLabel=
BrowseDialogTitle=瀏覽資料夾
BrowseDialogLabel=在下列選擇一個資料夾, 然後點選"確定"
NewFolderName=新資料夾

; *** "Welcome" wizard page
WelcomeLabel1=您即將開始安裝 Popcorn Time!
WelcomeLabel2=將安裝[name/ver]至您的電腦 %n%n請記得 Popcorn Time 還在Beta測試階段, 因此我們不保證任何事, 使用者需自行承擔任何可能的風險

; *** "Password" wizard page
WizardPassword=密碼
PasswordLabel1=此安裝由密碼保護
PasswordLabel3=請輸入密碼, 然後點選"下一步"繼續, 請注意密碼有區分大小寫
PasswordEditLabel=密碼(&P):
IncorrectPassword=您輸入的密碼不正確 請再輸入一次

; *** "License Agreement" wizard page
WizardLicense=授權同意書
LicenseLabel=繼續前請先詳細閱讀以下重要資訊
LicenseLabel3=請詳閱以下授權同意書, 您必須接受本同意書才能繼續安裝本程式
LicenseAccepted=我接受此同意書(&a)
LicenseNotAccepted=我不接受此同意書(&d)

; *** "Information" wizard pages
WizardInfoBefore=資訊
InfoBeforeLabel=繼續前請先詳細閱讀以下重要資訊
InfoBeforeClickLabel=當您準備好繼續安裝, 請點選"下一步"
WizardInfoAfter=資訊
InfoAfterLabel=繼續前請先詳細閱讀以下重要資訊
InfoAfterClickLabel=當您準備好繼續安裝, 請點選"下一步"

; *** "User Information" wizard page
WizardUserInfo=使用者資料
UserInfoDesc=請輸入您的資料
UserInfoName=使用者名稱(&U):
UserInfoOrg=組織(&O):
UserInfoSerial=序號(&S):
UserInfoNameRequired=您必須輸入一個名字

; *** "Select Destination Location" wizard page
WizardSelectDir=選擇目標位置
SelectDirDesc=您想將 [name] 安裝到哪裡?
SelectDirLabel3=安裝程式將把 [name] 安裝至以下資料夾
SelectDirBrowseLabel=請點選"下一步"繼續安裝, 或點選"瀏覽"來選擇其他資料夾
DiskSpaceMBLabel=至少需要 [mb] MB 的硬碟空間
CannotInstallToNetworkDrive=安裝程式無法安裝至網路磁碟
CannotInstallToUNCPath=安裝程式無法安裝至UNC路徑
InvalidPath=您必須提供一個含磁碟機代號的完整路徑, 例如:%n%nC:\APP%n%n 或是UNC路徑, 例如:%n%n\\server\share
InvalidDrive=您所選擇的磁碟機或是UNC路徑不存在或是無法連結 請重新選擇
DiskSpaceWarningTitle=磁碟機空間不足
DiskSpaceWarning=安裝程式至少需要 %1 KB 的可用空間, 但所選擇的磁碟機上只有 %2 KB 的可用空間 %n%n您是否仍要繼續?
DirNameTooLong=資料夾的名稱或是路徑太長
InvalidDirName=資料夾名稱不合法
BadDirName32=資料夾名稱不可有以下字:%n%n%1
DirExistsTitle=資料夾已存在
DirExists=資料夾:%n%n%1%n%n已經存在 您是否仍要安裝至該資料夾?
DirDoesntExistTitle=資料夾不存在
DirDoesntExist=資料夾:%n%n%1%n%n不存在 您是否要建立該資料夾?

; *** "Select Components" wizard page
WizardSelectComponents=選擇元件
SelectComponentsDesc=要安裝哪些元件?
SelectComponentsLabel2=點選你想安裝的元件, 清除不想安裝的元件, 如要繼續請點選"下一步"
FullInstallation=完整安裝
; if possible don't translate 'Compact' as 'Minimal' (I mean 'Minimal' in your language)
CompactInstallation=簡易安裝
CustomInstallation=自訂安裝
NoUninstallWarningTitle=該元件已存在
NoUninstallWarning=安裝程式已偵測到以下元件已安裝:%n%n%1%n%您可選擇不安裝這些元件%n%n您是否仍要繼續(並重新安裝這些元件)?
ComponentSize1=%1 KB
ComponentSize2=%1 MB
ComponentsDiskSpaceMBLabel=目前所需至少 [mb] MB 的磁碟機空間

; *** "Select Additional Tasks" wizard page
WizardSelectTasks=Select Additional Tasks
SelectTasksDesc=Which additional tasks should be performed?
SelectTasksLabel2=Select the additional tasks you would like Setup to perform while installing [name], then click Next.

; *** "Select Start Menu Folder" wizard page
WizardSelectProgramGroup=Select Start Menu Folder
SelectStartMenuFolderDesc=Where should Setup place the program's shortcuts?
SelectStartMenuFolderLabel3=Setup will create the program's shortcuts in the following Start Menu folder.
SelectStartMenuFolderBrowseLabel=To continue, click Next. If you would like to select a different folder, click Browse.
MustEnterGroupName=You must enter a folder name.
GroupNameTooLong=The folder name or path is too long.
InvalidGroupName=The folder name is not valid.
BadGroupName=The folder name cannot include any of the following characters:%n%n%1
NoProgramGroupCheck2=&Don't create a Start Menu folder

; *** "Ready to Install" wizard page
WizardReady=Ready to Install
ReadyLabel1=Setup is now ready to begin installing [name] on your computer.
ReadyLabel2a=Click Install to continue with the installation, or click Back if you want to review or change any settings.
ReadyLabel2b=Click Install to continue with the installation.
ReadyMemoUserInfo=User information:
ReadyMemoDir=Destination location:
ReadyMemoType=Setup type:
ReadyMemoComponents=Selected components:
ReadyMemoGroup=Start Menu folder:
ReadyMemoTasks=Additional tasks:

; *** "Preparing to Install" wizard page
WizardPreparing=Preparing to Install
PreparingDesc=Setup is preparing to install [name] on your computer.
PreviousInstallNotCompleted=The installation/removal of a previous program was not completed. You will need to restart your computer to complete that installation.%n%nAfter restarting your computer, run Setup again to complete the installation of [name].
CannotContinue=Setup cannot continue. Please click Cancel to exit.
ApplicationsFound=The following applications are using files that need to be updated by Setup. It is recommended that you allow Setup to automatically close these applications.
ApplicationsFound2=The following applications are using files that need to be updated by Setup. It is recommended that you allow Setup to automatically close these applications. After the installation has completed, Setup will attempt to restart the applications.
CloseApplications=&Automatically close the applications
DontCloseApplications=&Do not close the applications
ErrorCloseApplications=Setup was unable to automatically close all applications. It is recommended that you close all applications using files that need to be updated by Setup before continuing.

; *** "Installing" wizard page
WizardInstalling=Installing
InstallingLabel=Please wait while Setup installs [name] on your computer.

; *** "Setup Completed" wizard page
FinishedHeadingLabel=Completing the [name] Setup Wizard
FinishedLabelNoIcons=Setup has finished installing [name] on your computer.
FinishedLabel=Setup has finished installing [name] on your computer. The application may be launched by selecting the installed icons.
ClickFinish=Click Finish to exit Setup.
FinishedRestartLabel=To complete the installation of [name], Setup must restart your computer. Would you like to restart now?
FinishedRestartMessage=To complete the installation of [name], Setup must restart your computer.%n%nWould you like to restart now?
ShowReadmeCheck=Yes, I would like to view the README file
YesRadio=&Yes, restart the computer now
NoRadio=&No, I will restart the computer later
; used for example as 'Run MyProg.exe'
RunEntryExec=Run %1
; used for example as 'View Readme.txt'
RunEntryShellExec=View %1

; *** "Setup Needs the Next Disk" stuff
ChangeDiskTitle=Setup Needs the Next Disk
SelectDiskLabel2=Please insert Disk %1 and click OK.%n%nIf the files on this disk can be found in a folder other than the one displayed below, enter the correct path or click Browse.
PathLabel=&Path:
FileNotInDir2=The file "%1" could not be located in "%2". Please insert the correct disk or select another folder.
SelectDirectoryLabel=Please specify the location of the next disk.

; *** Installation phase messages
SetupAborted=Setup was not completed.%n%nPlease correct the problem and run Setup again.
EntryAbortRetryIgnore=Click Retry to try again, Ignore to proceed anyway, or Abort to cancel installation.

; *** Installation status messages
StatusClosingApplications=Closing applications...
StatusCreateDirs=Creating directories...
StatusExtractFiles=Extracting files...
StatusCreateIcons=Creating shortcuts...
StatusCreateIniEntries=Creating INI entries...
StatusCreateRegistryEntries=Creating registry entries...
StatusRegisterFiles=Registering files...
StatusSavingUninstall=Saving uninstall information...
StatusRunProgram=Finishing installation...
StatusRestartingApplications=Restarting applications...
StatusRollback=Rolling back changes...

; *** Misc. errors
ErrorInternal2=Internal error: %1
ErrorFunctionFailedNoCode=%1 failed
ErrorFunctionFailed=%1 failed; code %2
ErrorFunctionFailedWithMessage=%1 failed; code %2.%n%3
ErrorExecutingProgram=Unable to execute file:%n%1

; *** Registry errors
ErrorRegOpenKey=Error opening registry key:%n%1\%2
ErrorRegCreateKey=Error creating registry key:%n%1\%2
ErrorRegWriteKey=Error writing to registry key:%n%1\%2

; *** INI errors
ErrorIniEntry=Error creating INI entry in file "%1".

; *** File copying errors
FileAbortRetryIgnore=Click Retry to try again, Ignore to skip this file (not recommended), or Abort to cancel installation.
FileAbortRetryIgnore2=Click Retry to try again, Ignore to proceed anyway (not recommended), or Abort to cancel installation.
SourceIsCorrupted=The source file is corrupted
SourceDoesntExist=The source file "%1" does not exist
ExistingFileReadOnly=The existing file is marked as read-only.%n%nClick Retry to remove the read-only attribute and try again, Ignore to skip this file, or Abort to cancel installation.
ErrorReadingExistingDest=An error occurred while trying to read the existing file:
FileExists=The file already exists.%n%nWould you like Setup to overwrite it?
ExistingFileNewer=The existing file is newer than the one Setup is trying to install. It is recommended that you keep the existing file.%n%nDo you want to keep the existing file?
ErrorChangingAttr=An error occurred while trying to change the attributes of the existing file:
ErrorCreatingTemp=An error occurred while trying to create a file in the destination directory:
ErrorReadingSource=An error occurred while trying to read the source file:
ErrorCopying=An error occurred while trying to copy a file:
ErrorReplacingExistingFile=An error occurred while trying to replace the existing file:
ErrorRestartReplace=RestartReplace failed:
ErrorRenamingTemp=An error occurred while trying to rename a file in the destination directory:
ErrorRegisterServer=Unable to register the DLL/OCX: %1
ErrorRegSvr32Failed=RegSvr32 failed with exit code %1
ErrorRegisterTypeLib=Unable to register the type library: %1

; *** Post-installation errors
ErrorOpeningReadme=An error occurred while trying to open the README file.
ErrorRestartingComputer=Setup was unable to restart the computer. Please do this manually.

; *** Uninstaller messages
UninstallNotFound=File "%1" does not exist. Cannot uninstall.
UninstallOpenError=File "%1" could not be opened. Cannot uninstall
UninstallUnsupportedVer=The uninstall log file "%1" is in a format not recognized by this version of the uninstaller. Cannot uninstall
UninstallUnknownEntry=An unknown entry (%1) was encountered in the uninstall log
ConfirmUninstall=Are you sure you want to completely remove %1 and all of its components?
UninstallOnlyOnWin64=This installation can only be uninstalled on 64-bit Windows.
OnlyAdminCanUninstall=This installation can only be uninstalled by a user with administrative privileges.
UninstallStatusLabel=Please wait while %1 is removed from your computer.
UninstalledAll=%1 was successfully removed from your computer.
UninstalledMost=%1 uninstall complete.%n%nSome elements could not be removed. These can be removed manually.
UninstalledAndNeedsRestart=To complete the uninstallation of %1, your computer must be restarted.%n%nWould you like to restart now?
UninstallDataCorrupted="%1" file is corrupted. Cannot uninstall

; *** Uninstallation phase messages
ConfirmDeleteSharedFileTitle=Remove Shared File?
ConfirmDeleteSharedFile2=The system indicates that the following shared file is no longer in use by any programs. Would you like for Uninstall to remove this shared file?%n%nIf any programs are still using this file and it is removed, those programs may not function properly. If you are unsure, choose No. Leaving the file on your system will not cause any harm.
SharedFileNameLabel=File name:
SharedFileLocationLabel=Location:
WizardUninstalling=Uninstall Status
StatusUninstalling=Uninstalling %1...

; *** Shutdown block reasons
ShutdownBlockReasonInstallingApp=Installing %1.
ShutdownBlockReasonUninstallingApp=Uninstalling %1.

; The custom messages below aren't used by Setup itself, but if you make
; use of them in your scripts, you'll want to translate them.

[CustomMessages]

NameAndVersion=%1 version %2
AdditionalIcons=Additional icons:
CreateDesktopIcon=Create a &desktop icon
CreateQuickLaunchIcon=Create a &Quick Launch icon
ProgramOnTheWeb=%1 on the Web
UninstallProgram=Uninstall %1
LaunchProgram=Launch %1
AssocFileExtension=&Associate %1 with the %2 file extension
AssocingFileExtension=Associating %1 with the %2 file extension...
AutoStartProgramGroupDescription=Startup:
AutoStartProgram=Automatically start %1
AddonHostProgramNotFound=%1 could not be located in the folder you selected.%n%nDo you want to continue anyway?
