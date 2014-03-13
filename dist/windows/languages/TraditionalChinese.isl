; ************ Inno Setup version 5.5.3+ Traditional Chinese messages ************
; ***                                                                          ***
; ***    To download user-contributed translations of this file, go to:        ***
; ***    http://www.jrsoftware.org/files/istrans/                              ***
; ***                                                                          ***
; ***    Author: Jackmoo (enepgoo@gmail.com)                                   ***
; ***                                                                          ***        
; ***                                                                          ***
; ***                                                                          ***  
; *** Note: When translating this text, do not add periods (.) to the end of   ***
; *** messages that didn't have them already, because on those messages Inno   ***
; *** Setup adds the periods automatically (appending a period would result in ***
; *** two periods being displayed).                                            ***
; ********************************************************************************




[LangOptions]
; The following three entries are very important. Be sure to read and 
; understand the '[LangOptions] section' topic in the help file.

; ****Not test yet****
LanguageName=Traditional Chinese
LanguageID=$0404
LanguageCodePage=950
; ********************

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
BadDirName32=資料夾名稱不可有以下字元:%n%n%1
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
WizardSelectTasks=選擇其他工作
SelectTasksDesc=您想執行什麼額外工作
SelectTasksLabel2=選擇你於安裝 [name] 時想執行的額外工作 然後點選"下一步"

; *** "Select Start Menu Folder" wizard page
WizardSelectProgramGroup=選擇開始功能表選單資料夾
SelectStartMenuFolderDesc=您想把捷徑放在哪裡?
SelectStartMenuFolderLabel3=安裝程式將把捷徑建立在以下開始按鈕選單資料夾下
SelectStartMenuFolderBrowseLabel=請點選"下一步"繼續, 如想選擇其他資料夾請點選"瀏覽" 
MustEnterGroupName=您必須輸入一個資料夾名稱
GroupNameTooLong=資料夾名稱或是路徑太長
InvalidGroupName=資料夾名稱不合法
BadGroupName=資料夾名稱不可有以下字元:%n%n%1
NoProgramGroupCheck2=不建立開始按鈕選單資料夾(&D)

; *** "Ready to Install" wizard page
WizardReady=準備安裝
ReadyLabel1=安裝程式現在已經準備好安裝 [name] 至您的電腦
ReadyLabel2a=點選"安裝"以繼續安裝, 如果想更改或是確定各項設定請點選"上一步"
ReadyLabel2b=點選"安裝"以繼續安裝
ReadyMemoUserInfo=使用者資料:
ReadyMemoDir=目的地位址:
ReadyMemoType=安裝方式:
ReadyMemoComponents=已選擇的元件:
ReadyMemoGroup=開始功能表選單資料夾:
ReadyMemoTasks=額外工作:

; *** "Preparing to Install" wizard page
WizardPreparing=正準備安裝
PreparingDesc=安裝程式現在正準備安裝 [name] 至您的電腦
PreviousInstallNotCompleted=上一次的安裝/解除安裝未完成, 您必須重新開機以完成安裝%n%n重新開機後, 再次執行安裝程式以完成 [name] 的安裝
CannotContinue=安裝無法繼續, 請點選"取消"離開安裝程式
ApplicationsFound=以下應用程式正在使用安裝程式需更新的檔案, 建議您讓安裝程式自動關閉這些應用程式
ApplicationsFound2=以下應用程式正在使用安裝程式需更新的檔案, 建議您讓安裝程式自動關閉這些應用程式, 在安裝完成後本安裝程式將嘗試重新啟動這些應用程式
CloseApplications=自動關閉應用程式(&A)
DontCloseApplications=不要自動關閉應用程式(&D)
ErrorCloseApplications=安裝程式無法自動關閉全部的應用程式, 建議您在繼續安裝前, 手動關閉這些應用程式

; *** "Installing" wizard page
WizardInstalling=安裝中
InstallingLabel=請稍待, 安裝程式正在把 [name] 安裝至您的電腦上

; *** "Setup Completed" wizard page
FinishedHeadingLabel=完成 [name] 安裝精靈
FinishedLabelNoIcons=安裝程式已將 [name] 安裝至您的電腦上
FinishedLabel=安裝程式已將 [name] 安裝至您的電腦上, 可選擇該捷徑來執行此應用程式
ClickFinish=請點選"結束"來離開安裝程式
FinishedRestartLabel=要完成 [name] 的安裝, 安裝程式必須重新啟動電腦, 您是否想要立刻重新啟動電腦?
FinishedRestartMessage=要完成 [name] 的安裝, 安裝程式必須重新啟動電腦 %n%n您是否想要立刻重新啟動電腦?
ShowReadmeCheck=是, 我想現在查看讀我(README)檔案
YesRadio=是, 立刻重新啟動電腦(&Y)
NoRadio=否, 我等下會自行重新啟動電腦(&N)
; used for example as 'Run MyProg.exe'
RunEntryExec=Run %1
; used for example as 'View Readme.txt'
RunEntryShellExec=View %1

; *** "Setup Needs the Next Disk" stuff
ChangeDiskTitle=安裝程式需要更換下一片磁片
SelectDiskLabel2=請插入磁片%1然後點選"確定"%n%n若該檔案放在另一個資料夾, 請輸入正確的路徑或點選"瀏覽"
PathLabel=路徑(&P)h:
FileNotInDir2=檔案"%1"不在"%2"中. 請插入正確的磁片或是選擇另一個資料夾
SelectDirectoryLabel=請選擇下一片磁片所在的位置

; *** Installation phase messages
SetupAborted=安裝程式未安裝完成%n%n請修正問題後再一次執行安裝程式
EntryAbortRetryIgnore=請點選"重試"再試一次, 或"忽略"繼續執行, 或"中止"來取消安裝

; *** Installation status messages
StatusClosingApplications=關閉應用程式中...
StatusCreateDirs=建立資料夾中...
StatusExtractFiles=解壓縮檔案中...
StatusCreateIcons=建立捷徑中...
StatusCreateIniEntries=建立INI資料中...
StatusCreateRegistryEntries=建立註冊表資料中...
StatusRegisterFiles=註冊檔案中...
StatusSavingUninstall=儲存移除安裝資訊中...
StatusRunProgram=完成安裝中...
StatusRestartingApplications=重新啟動應用程式中...
StatusRollback=取消修改中...

; *** Misc. errors
ErrorInternal2=內部錯誤: %1
ErrorFunctionFailedNoCode=%1 失敗
ErrorFunctionFailed=%1 失敗; 代碼 %2
ErrorFunctionFailedWithMessage=%1 失敗;  代碼%2.%n%3
ErrorExecutingProgram=無法執行檔案:%n%1

; *** Registry errors
ErrorRegOpenKey=註冊表key開啟錯誤:%n%1\%2
ErrorRegCreateKey=註冊表key建立錯誤:%n%1\%2
ErrorRegWriteKey=註冊表key寫入錯誤:%n%1\%2

; *** INI errors
ErrorIniEntry=在檔案"%1"建立INI資訊時發生錯誤

; *** File copying errors
FileAbortRetryIgnore=請點選"重試"再試一次, 或"忽略"跳過此檔案(不建議), 或"中止"來取消安裝
FileAbortRetryIgnore2=請點選"重試"再試一次, 或"忽略"繼續執行(不建議), 或"中止"來取消安裝
SourceIsCorrupted=原始檔已損毀
SourceDoesntExist=原始檔"%1"不存在
ExistingFileReadOnly=該檔案被標示為"唯讀"%n%n請點選"重試"取消唯讀屬性, 或"忽略"跳過此檔案, 或"中止"來取消安裝
ErrorReadingExistingDest=當讀取此檔案時發生錯誤:
FileExists=此檔案已存在%n%n您是否要安裝程式複寫該檔案?
ExistingFileNewer=此檔案版本比安裝程式安裝的還要新, 建議您保留此檔案 %n%n您是否要保留此檔案?
ErrorChangingAttr=當嘗試改變此檔案屬性時發生錯誤:
ErrorCreatingTemp=當嘗試建立檔案於此目標資料夾時發生錯誤:
ErrorReadingSource=當嘗試讀取此原始檔時發生錯誤:
ErrorCopying=當嘗試複製此檔案時發生錯誤:
ErrorReplacingExistingFile=當嘗試取代此檔案時發生錯誤:
ErrorRestartReplace=重新取代時錯誤:
ErrorRenamingTemp=當嘗試重新命名此檔案時發生錯誤:
ErrorRegisterServer=無法註冊DLL/OCX: %1
ErrorRegSvr32Failed=RegSvr32 failed with exit code %1
ErrorRegisterTypeLib=Unable to register the type library: %1

; *** Post-installation errors
ErrorOpeningReadme=開啟讀我(README)檔案時發生錯誤
ErrorRestartingComputer=安裝程式無法自動重新啟動電腦, 請手動重新啟動電腦

; *** Uninstaller messages
UninstallNotFound=檔案"%1"不存在, 無法解除安裝
UninstallOpenError=無法開啟檔案"%1", 無法解除安裝
UninstallUnsupportedVer=此版本的解除安裝程式無法辨識紀錄檔"%1", 無法解除安裝
UninstallUnknownEntry=An unknown entry (%1) was encountered in the uninstall log
ConfirmUninstall=您是否確定要完全移除 %1 和他的所有元件
UninstallOnlyOnWin64=此程式僅能由64位元的Windows移除
OnlyAdminCanUninstall=此程式僅能由擁有管理者權限的使用者移除
UninstallStatusLabel=請稍待, 正在從您的電腦中移除 %1 
UninstalledAll=%1 已由您的電腦內成功移除
UninstalledMost=%1 解除安裝已完成%n%n但某些元素並未被移除, 請以手動方式移除
UninstalledAndNeedsRestart=要完成 %1 的安裝, 安裝程式必須重新啟動電腦 %n%n您是否想要立刻重新啟動電腦?
UninstallDataCorrupted=檔案"%1"已毀損, 無法解除安裝

; *** Uninstallation phase messages
ConfirmDeleteSharedFileTitle=移除共享檔案?
ConfirmDeleteSharedFile2=系統偵測到以下共享檔案已不被任何程式使用, 您是否要移除這些檔案?%n%n若有其他程式仍會使用這些檔案, 則可能造成該程式無法執行, 若你無法確定, 請選擇"否", 保留該檔案並不會對系統造成損害
SharedFileNameLabel=檔案名稱:
SharedFileLocationLabel=位址:
WizardUninstalling=解除安裝程式狀態
StatusUninstalling=%1 解除安裝中...

; *** Shutdown block reasons
ShutdownBlockReasonInstallingApp=%1 安裝中.
ShutdownBlockReasonUninstallingApp=%1 解除安裝中

; The custom messages below aren't used by Setup itself, but if you make
; use of them in your scripts, you'll want to translate them.

[CustomMessages]

NameAndVersion=%1 版本 %2
AdditionalIcons=額外捷徑:
CreateDesktopIcon=建立桌面捷徑(&d)
CreateQuickLaunchIcon=建立快速啟動捷徑(&Q)
ProgramOnTheWeb=%1 on the Web
UninstallProgram=解除安裝 %1
LaunchProgram=執行 %1
AssocFileExtension=&Associate %1 with the %2 file extension
AssocingFileExtension=Associating %1 with the %2 file extension...
AutoStartProgramGroupDescription=Startup:
AutoStartProgram=自動開啟 %1
AddonHostProgramNotFound=您所選擇的資料夾內找不到 %1 %n%n您是否仍要繼續?
