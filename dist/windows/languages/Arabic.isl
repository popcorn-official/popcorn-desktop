; *** Inno Setup version 5.5.3+ Arabic messages ***
;
; Translated by Ahmad Alani (Ahmadalani75@hotmail.com)
; To download user-contributed translations of this file, go to:
;   http://www.jrsoftware.org/files/istrans/
;
; Note: When translating this text, do not add periods (.) to the end of
; messages that didn't have them already, because on those messages Inno
; Setup adds the periods automatically (appending a period would result in
; two periods being displayed).

[LangOptions]
; The following three entries are very important. Be sure to read and 
; understand the '[LangOptions] section' topic in the help file.
LanguageName=Arabic
LanguageID=$0401
LanguageCodePage=1265
; If the language you are translating to requires special font faces or
; sizes, uncomment any of the following entries and change them accordingly.
;DialogFontName=MS Shell Dlg
;DialogFontSize=8
;WelcomeFontName=Arial
;WelcomeFontSize=12
;TitleFontName=Arial
;TitleFontSize=29
;CopyrightFontName=Arial
;CopyrightFontSize=8

[Messages]

; *** Application titles
SetupAppTitle=إعداد
SetupWindowTitle=%1 - تثبيت
UninstallAppTitle=إلغاء التثبيت
UninstallAppFullTitle=%1 إلغاء تثبيت

; *** Misc. common
InformationTitle=معلومات
ConfirmTitle=تأكيد
ErrorTitle=خطأ

; *** SetupLdr messages
SetupLdrStartupMessage=سيتم تثبيت %1. هل تريد الاستمرار؟
LdrCannotCreateTemp=لا يمكن إنشاء ملف مؤقت. سيتم ايقاف عملية التثبيت
LdrCannotExecTemp=لا يمكن تنفيذ ملف في المجلد المؤقت سيتم إيقاف عملية التنصيب

; *** Startup error messages
LastErrorMessage=%1.%n%nخطأ %2: %3
SetupFileMissing=الملف %1 مفقود من مجلد التثبيت. رجاء حل المشكلة أو حاول الحصول على نسخة جديدة من البرنامج
SetupFileCorrupt=ملفات التثبيت معطوبة. الرجاء حاول الحصول على نسخة جديدة من البرنامج
SetupFileCorruptOrWrongVer=ملفات التثبيت معطوبة ، أو غير متوافقة مع إصدار برنامج التثبيت ، الرجاء حل المشكلة أو حاول الحصول على نسخة جديدة من البرنامج
InvalidParameter=تم تمرير معلمة غير صالحة في سطر الأوامر:%n%n%1
SetupAlreadyRunning=التثبيت قيد التشغيل مسبقا
WindowsVersionNotSupported=الذي على تستخدمه الآن على كمبيوترك Windows هذا البرنامج لا يدعم نوع نظام
WindowsServicePackRequired=أو أعلى %1 Service Pack %2 البرنامج يتطلب
NotOnThisPlatform=هذا البرنامج لا يمكنه العمل على %1.
OnlyOnThisPlatform=هذا البرنامج يجب أن يعمل على %1.
OnlyOnTheseArchitectures=%n%n%1 : هذا البرنامج يمكن فقط أن يثبت على نسخ الويندوز المصممة للهندسة المعمارية التالية
MissingWOW64APIs=إن نسخة الويندوز التي تملكها الآن لا تتضمن الوظيفة المطلوبة من الإعداد لإداء تثبيت بت-64 لتصحيح هذه المشكلة  ، الرجاء تثبيت حزمة الخدمة %1
WinVersionTooLowError=هذا البرنامج يتطلب %1 الإصدار %2 أو ما بعده.
WinVersionTooHighError=هذا البرنامج لا يمكن أن يعمل على %1 الإصدار %2 أو ما بعدة
AdminPrivilegesRequired=يجب أن تكون مدير الشبكة عندما تثبت هذا البرنامج
PowerUserPrivilegesRequired=يجب أن تكون المدير عند تسجيل الدخول أو عضوا له نفوذ عند تثبيت هذا البرنامج
SetupAppRunningError=برنامج التثبيت وجد أن %1 يعمل.%n%nالرجاء إقفال كل النوافذ الآن ، ثم الضغط على حسنا للاستمرار أو إلغاء الأمر للخروج
UninstallAppRunningError=برنامج إلغاء التثبيت وجد ان %1 يعمل.%n%nالرجاء إقفال كل نوافذه الآن ، ثم الضغط على حسنا للاستمرار أو إلغاء الأمر للخروج

; *** Misc. errors
ErrorCreatingDir=برنامج التثبيت لم يستطع إنشاء المجلد "%1"
ErrorTooManyFilesInDir=لا يمكن إنشاء ملف في المجلد "%1"%nلأنه يحتوى عدد كبير من الملفات

; *** Setup common messages
ExitSetupTitle=إنهاء عملية التثبيت
ExitSetupMessage=.عملية التثبيت لم تكتمل. إذا خرجت الآن فان البرنامج لن يتم تثبيته%n%nيمكنك تشغيل برنامج التثبيت لاحقا .لأستكمال العملية%n%nهل تريد الخروج ؟
AboutSetupMenuItem=...&حول برنامج التثبيت
AboutSetupTitle=حول برنامج التثبيت
AboutSetupMessage=%1 إصدار %2%n%3%n%n%1 الموقع على الإنترنت:%n%4
AboutSetupNote=
TranslatorNote=

; *** Buttons
ButtonBack=< &السابق
ButtonNext=&التالي >
ButtonInstall=&تثبيت
ButtonOK=حسنا
ButtonCancel=إلغاء الأمر
ButtonYes=&نعم
ButtonYesToAll=نعم لل&كل
ButtonNo=&لا
ButtonNoToAll=ل&ا للكل
ButtonFinish=&إنهاء
ButtonBrowse=&تصفح...
ButtonWizardBrowse=...تصفّح
ButtonNewFolder=إنشاء مجلد جديد

; *** "Select Language" dialog messages
SelectLanguageTitle=حدد لغة التثبيت
SelectLanguageLabel=حدد اللغة المستخدمة أثناء التثبيت:

; *** Common wizard text
ClickNext=اضغط التالي للمواصلة ، أو إلغاء الأمر للخروج%n%nترجمة : أحـمـد الـعـانــي
BeveledLabel=
BrowseDialogTitle=تصفح عن مجلد
BrowseDialogLabel=حدد مجلدا ما في القائمة تحت , ثم إضغط حسنا
NewFolderName=مجلد جديد

; *** "Welcome" wizard page
WelcomeLabel1=[name] مرحبا مع تثبيت
WelcomeLabel2=على جهازك [name/ver] سيتم تثبيت%n%nينصح بشدة إغلاق جميع البرامج الأخرى قبل المواصلة ، لتجنب الأخطاء و التعارض مع البرامج الأخرى خلال عملية التثبيت

; *** "Password" wizard page
WizardPassword=كلمة المرور
PasswordLabel1=عملية التثبيت محمية بكلمة مرور
PasswordLabel3=الرجاء كتابة كلمة المرور ثم ضغط التالي للمواصلة. حالة الاحرف مهمة في كلمة المرور
PasswordEditLabel=&كلمة المرور:
IncorrectPassword=كلمة المرور التي أدخلتها غير صحيحة. الرجاء المحاولة مرة أخرى

; *** "License Agreement" wizard page
WizardLicense=اتفاقية التشغيل
LicenseLabel=الرجاء قراءة المعلومات التالية قبل المواصلة.
LicenseLabel3=الرجاء أقرأ إتفاقية الرخصة التالية . يجب عليك أن تَقْبل شروطَ هذه الاتفاقية قبل الاستمرار بالتثبيت
LicenseAccepted=أوافق على الاتفاقية
LicenseNotAccepted=لا أوافق على الاتفاقية

; *** "Information" wizard pages
WizardInfoBefore=معلومات
InfoBeforeLabel=الرجاء قراءة المعلومات التالية قبل المواصلة
InfoBeforeClickLabel=عندما تكون مستعدا للمواصلة اضغط التالي
WizardInfoAfter=معلومات
InfoAfterLabel=الرجاء قراءة المعلومات التالية قبل المواصلة
InfoAfterClickLabel=عندما تكون مستعدا للمواصلة اضغط التالي

; *** "User Information" wizard page
WizardUserInfo=معلومات المستخدم
UserInfoDesc=فضلا أدخل معلوماتك
UserInfoName=إسم المستخدم :
UserInfoOrg=المنشأة :
UserInfoSerial=رقم التسلسل :
UserInfoNameRequired=يجب أن تدخل إسما ما

; *** "Select Destination Location" wizard page
WizardSelectDir=حدد مجلد التثبيت
SelectDirDesc=؟  [name] أين تريد أن يتم تثبيت
SelectDirLabel3= إلى المجلد التالي [name] سيقوم الإعداد بتثبيت
SelectDirBrowseLabel=إضغط التالي للمتابعة , إذا ترغب بتحديد مجلد مختلف إضغط تصفح
DiskSpaceMBLabel=البرنامج يتطلب على الأقل [mb] ميقا بايت من مساحة التخزين.
CannotInstallToNetworkDrive=لا يمكن لبرنامج الإعداد التثبيت إلى محرك أقراص الشبكة
CannotInstallToUNCPath=UNC لا يمكن لبرنامج الإعداد التثبيت إلى مسار
InvalidPath=يجب أن تدخل مسار كامل مع اسم القرص; مثل:%n%nC:\APP%n%n
InvalidDrive=القرص أو الـ UNC الذي حددت ليس موجودا أو لا يمكن الوصول إليه. الرجاء تحديد غيره
DiskSpaceWarningTitle=لا يوجد مساحة تخزين كافية
DiskSpaceWarning=برنامج التثبيت يحتاج إلى %1 كيلو بايت على الاقل من المساحة للتخزين ، بينما القرص المحدد لا يحتوى الا على %2 كيلو بايت فارغة فقط%n%nهل تريد الاستمرار على أي حال؟
DirNameTooLong=إسم المجلد أو المسار طويل جدا
InvalidDirName=إسم المجلد غير صالح
BadDirName32=أسماء المجلدات لا يمكن أن تحتوي على أي من الحروف التالية:%n%n%1
DirExistsTitle=المجلد موجود مسبقاً
DirExists=المجلد%n%n%1%n%nموجود مسبقا . هل تريد التخزين عليه على أي حال؟
DirDoesntExistTitle=المجلد ليس موجوداً مسبقاً
DirDoesntExist=المجلد%n%n%1%n%nغير موجود مسبقا . هل تريد انشائه؟

; *** "Select Components" wizard page
WizardSelectComponents=حدد المكونات
SelectComponentsDesc=أي المكونات ترغب في تثبيتها؟
SelectComponentsLabel2=حدد المكونات التي ترغب في تثبيتها؛ و الغي تحديد المكونات التي لا ترغب بتثبيتها . إضغط التالي عندما تكون مستعدا للمواصلة
FullInstallation=تثبيت كامل
; if possible don't translate 'Compact' as 'Minimal' (I mean 'Minimal' in your language)
CompactInstallation=تثبيت مختصر
CustomInstallation=تثبيت محدد
NoUninstallWarningTitle=المكونات موجودة مسبقاً
NoUninstallWarning=المكونات التالية موجودة مسبقاً على جهازك:%n%n%1%n%nإلغاء تحديدها يعني عدم تثبيتها%n%nهل تريد المواصلة على أي حال?
ComponentSize1=%1 كيلو بايت
ComponentSize2=%1 ميقابايت
ComponentsDiskSpaceMBLabel=التحديدات الحالية تحتاج على الاقل [mb] ميغا بايت من المساحة الفارغة على القرص

; *** "Select Additional Tasks" wizard page
WizardSelectTasks=إضغط عمليات إضافية
SelectTasksDesc=ما هي العمليات الإضافية التالية المراد تنفيذها ؟
SelectTasksLabel2=ثم إضغط التالي [name] حدد طلباتك من

; *** "Select Start Menu Folder" wizard page
WizardSelectProgramGroup=تحديد مجلد قائمة ابدأ
SelectStartMenuFolderDesc=أين يجب وضع اختصار للبرنامج؟
SelectStartMenuFolderLabel3=سيقوم التثبيت بإنشاء إختصار للبرنامج في مجلد قائمة ابدأ التالي
SelectStartMenuFolderBrowseLabel=إضغط التالي للمتابعة , إذا ترغب بتحديد مجلد مختلف إضغط تصفح
MustEnterGroupName=يجب إدخال اسم المجلد
GroupNameTooLong=إسم المجلد أو المسار طويل جدا
InvalidGroupName=إسم المجلد غير صالح
BadGroupName=اسم المجلد يجب أن لا يحوي أي من الحروف التالية:%n%n%1
NoProgramGroupCheck2=&لا تنشئ مجلدا في قائمة ابدأ

; *** "Ready to Install" wizard page
WizardReady=جاهز للتثبيت
ReadyLabel1=على جهازك [name] برنامج التثبيت جاهز لتثبيت برنامج 
ReadyLabel2a=اضغط تثبيت إذا كنت ترغب في مواصلة عملية التثبيت ، أو السابق إذا كنت ترغب في مراجعة أو تغيير أي إعدادات
ReadyLabel2b=اضغط تثبيت للمواصلة
ReadyMemoUserInfo=معلومات المستخدم :
ReadyMemoDir=مجلد التخزين:
ReadyMemoType=نوع التثبيت:
ReadyMemoComponents=المكونات المحددة:
ReadyMemoGroup=مجلد قائمة ابدأ:
ReadyMemoTasks=العمليات الإضافية:

; *** "Preparing to Install" wizard page
WizardPreparing=الإستعداد للتثبيت
PreparingDesc=في كمبيوترك  [name] يقوم الإعداد بتجهيز تثبيت
PreviousInstallNotCompleted=لم يتم إكمال تثبيت أو إزالة أحد البرامج السابقة. أنت تحتاج إلى إعادة تشغيل الكمبيوتر لإكمال عملية التثبيت أو الإزالة السابقة%n%n[name] بعد إعادة تشغيل الكمبيوتر، قم بإعادة تثبيت
CannotContinue=الإعداد لا يَستطيع الإستمرار . الرجاء إضغط إلغاء الأمر للخُرُوج
ApplicationsFound=التطبيقات التالية تستخدم ملفات بحاجة إلى تحديثها بواسطة برنامج التثبيت. يستحسن السماح لبرنامج التثبيت بإغلاق هذه التطبيقات تلقائيا
ApplicationsFound2=التطبيقات التالية تستخدم ملفات بحاجة إلى تحديثها بواسطة برنامج التثبيت. يستحسن السماح لبرنامج التثبيت بإغلاق هذه التطبيقات تلقائيا و بعد اكتمال عملية التثبيت، سيحاول برنامج التثبيت إعادة تشغيل التطبيقات
CloseApplications=إ&غلاق التطبيقات تلقائيا
DontCloseApplications=&غدم إغلاق التطبيقات
ErrorCloseApplications=لم يتمكن الإعداد تلقائياً بإغلاق كافة التطبيقات. من المستحسن أن تقوم بإغلاق كافة التطبيقات التي تستخدم .الملفات التي تحتاج إلى تحديث بواسطة الإعداد قبل المتابعة

; *** "Installing" wizard page
WizardInstalling=تتم عملية التثبيت
InstallingLabel=على جهازك [name] الرجاء الانتظار حتى تثبيت برنامج 

; *** "Setup Completed" wizard page
FinishedHeadingLabel= [name] إكتمال معالج إعداد
FinishedLabelNoIcons=على جهازك [name] تم تثبيت برنامج
FinishedLabel=يمكن تشغيله من أيقونته [name] تم تثبيت
ClickFinish=اضغط إنهاء للخروج
FinishedRestartLabel=يجب إعادة تشغيل الكمبيوتر [name] لإتمام تثبيت%n%nهل تريد إعادة التشغيل الآن؟ 
FinishedRestartMessage=بنجاح [name] يجب إعادة تشغيل الكمبيوتر  لتثبيت%n%nهل تريد إعادة التشغيل الآن؟
ShowReadmeCheck=نعم ارغب في قراءة ملف README
YesRadio=&نعم ، إعادة تشغيل الكمبيوتر الآن
NoRadio=&لا ، سأعيد تشغيل الكمبيوتر بنفسي لاحقا
; used for example as 'Run MyProg.exe'
RunEntryExec=تشغيل %1
; used for example as 'View Readme.txt'
RunEntryShellExec=اعرض %1

; *** "Setup Needs the Next Disk" stuff
ChangeDiskTitle=برنامج التثبيت يحتاج القرص التالي
SelectDiskLabel2=الرجاء إدخال القرص رقم %1 ثم اضغط حسنا%n%nاذ كانت الملفات على هذا القرص موجودة في داخل مجلد غير المعروض في الأسفل ادخل المسار الصحيح أو  اضغط تصفح
PathLabel=ال&مسار:
FileNotInDir2=الملف "%1" لا يمكن إيجاده في "%2" ، الرجاء ادخال القرص الصحيح أو حدد مجلد آخر
SelectDirectoryLabel=الرجاء تحديد مكان القرص التالي

; *** Installation phase messages
SetupAborted=عملية التثبيت لم تكتمل%n%nالرجاء حل المشكلة ثم اعادة تشغيل التثبيت مرة أخرى
EntryAbortRetryIgnore=إضغط إعادة للمحاولة مرة أخرى ، تجاهل للمواصلة على أي حال أو توقف لإلغاء عملية التثبيت

; *** Installation status messages
StatusClosingApplications=...يتم إغلاق التطبيقات
StatusCreateDirs=إنشاء المجلدات...
StatusExtractFiles=فك ضغط الملفات...
StatusCreateIcons=إنشاء أيقونات البرنامج...
StatusCreateIniEntries=إنشاء مدخلات INI...
StatusCreateRegistryEntries=إنشاء مدخلات ملف التسجيل...
StatusRegisterFiles=تسجيل الملفات...
StatusSavingUninstall=حفظ معلومات إلغاء التثبيت...
StatusRunProgram=إنهاء عملية التثبيت...
StatusRestartingApplications=...يتم إعادة تشغيل التطبيقات
StatusRollback=إرجاع التغييرات...

; *** Misc. errors
ErrorInternal2=%1: خطأ داخلي
ErrorFunctionFailedNoCode=فشل %1
ErrorFunctionFailed=%1 فشل : الرمز %2
ErrorFunctionFailedWithMessage=%1 فشل : الرمز %2%n%3
ErrorExecutingProgram=لا يمكن تنفيذ الملف:%n%1

; *** Registry errors
ErrorRegOpenKey=%n%1\%2 : خطأ بفتح مفتاح الريجستري
ErrorRegCreateKey=%n%1\%2 : خطأ بإنشاء مفتاح الريجستري
ErrorRegWriteKey=%n%1\%2 : خطأ بكتابة مفتاح الريجستري

; *** INI errors
ErrorIniEntry="%1" في الملف INI خطأ بإنشاء مدخلة

; *** File copying errors
FileAbortRetryIgnore=إضغط إعادة للمحاولة مرة أخرى ، تجاهل لتجاهل هذا الملف (لا ينصح بهذا) ، أو توقف لإلغاء التثبيت
FileAbortRetryIgnore2=إضغط إعادة للمحاولة مرة أخرى ، تجاهل للمواصلة على أي حال (لا ينصح بهذا) ، أو توقف لإلغاء التثبيت
SourceIsCorrupted=ملف المصدر معطوب
SourceDoesntExist=ملف المصدر "%1" ليس موجوداً
ExistingFileReadOnly=الملف الحالي محدد للقراءة فقط%n%nغير خاصية للقراءة فقط ثم المحاولة مرة ثانية ، تجاهل لتجاهل الملف أو توقف لإلغاء التثبيت
ErrorReadingExistingDest=حصل خطأ عند محاولة قراءة الملف :
FileExists=الملف موجود مسبقا%n%nهل تريد الكتابة علية؟
ExistingFileNewer= الملف الموجود مسبقا احدث من الملف الذي يحاول برنامج التثبيت نسخه . يفضل الاحتفاظ بالملف الموجود مسبقا%n%nهل تحتفظ بالملف الموجود مسبقا؟
ErrorChangingAttr=حصل خطأ عند محاولة تغيير خصائص الملف:
ErrorCreatingTemp=حصل خطأ عند محاولة إنشاء ملف في مجلد التخزين:
ErrorReadingSource=حصل خطأ عند قراءة الملف:
ErrorCopying=حصل خطأ عند محاولة نسخ الملف:
ErrorReplacingExistingFile=حصل خطأ عند محاولة استبدال الملف:
ErrorRestartReplace=فشلت إعادة تشغيل أو إستبدال:
ErrorRenamingTemp=حصل خطأ أثناء محاولة تغيير اسم ملف في مجلد التثبيت:
ErrorRegisterServer=DLL/OCX: %1 تعذر تسجيل الـ
ErrorRegSvr32Failed=فشل RegSvr32 مع رمز الخروج %1
ErrorRegisterTypeLib=%1: تعذر تسجيل نوع المكتبة

; *** Post-installation errors
ErrorOpeningReadme=README ظهور خطأ أثناء محاولة فتح ملف
ErrorRestartingComputer=لم يتمكن برنامج التثبيت من إعادة تشغيل جهاز الكمبيوتر الرجاء القيام بهذا يدويا

; *** Uninstaller messages
UninstallNotFound=الملف "%1" ليس موجودا ، لا يمكن إعادة التشغيل
UninstallOpenError= تعذر إلغاء التثبيت "%1" قد لا يُفتح الملف
UninstallUnsupportedVer=بصيغة مجهولة لهذه النسخة من لاغي التثبيت . تعذر إلغاء التثبيت "%1" ملف سجل إلغاء التثبيت
UninstallUnknownEntry=ظهور مدخلة مجهولة ما في سجل إلغاء تثبيت (%1)
ConfirmUninstall=وكل مكوناته ؟ %1 هل تريد إلغاء تثبيت
UninstallOnlyOnWin64=هذا التثبيت يمكن فقط أن يتم إلغائه على ويندوز 64-بت
OnlyAdminCanUninstall=لا يمكن إلغاء التثبيت سوى من قبل مستخدم مدير للشبكة
UninstallStatusLabel=من جهازك %1 الرجاء الانتظار ليتم إلغاء تثبيت
UninstalledAll=من جهازك بنجاح %1 تم إلغاء تثبيت
UninstalledMost= تم إلغاء تثبيت برنامج %1%n%nبعض المكونات لا يمكن إزالتها ، يمكن إزالتها يدويا
UninstalledAndNeedsRestart=%1 يجب إعادة تشغيل الكمبيوتر لإتمام عملية إلغاء تثبيت%n%nهل تريد إعادة التشغيل الآن
UninstallDataCorrupted= الملف "%1" معطوب ولا يمكن إلغاء التثبيت

; *** Uninstallation phase messages
ConfirmDeleteSharedFileTitle=هل تريد إلغاء الملفات المشتركة؟
ConfirmDeleteSharedFile2=يقول  نظام التشغيل إن الملفات المشتركة التالية لم تعد مستخدمة من قبل أي برنامج . هل تريد إلغائها؟%n%nلو كان هناك أي برنامج يستخدم هذه الملفات ثم تم إلغائها فإن هذا البرنامج لن يعمل جيدا ، اختيار لا لإبقاء هذه الملفات لن يسبب أي مشاكل
SharedFileNameLabel=أسماء الملفات:
SharedFileLocationLabel=المكان:
WizardUninstalling=حالة إلغاء التثبيت
StatusUninstalling=إلغاء تثبيت %1...

; *** Shutdown block reasons
ShutdownBlockReasonInstallingApp=تثبيت %1
ShutdownBlockReasonUninstallingApp=إلغاء تثبيت %1

; The custom messages below aren't used by Setup itself, but if you make
; use of them in your scripts, you'll want to translate them.

[CustomMessages]

NameAndVersion=%1 النسخة %2
AdditionalIcons=رموز إضافية :
CreateDesktopIcon=إنشاء أيقونة على سطح المكتب :
CreateQuickLaunchIcon=إنشاء أيقونة إطلاق سريع بجوار ابدأ
ProgramOnTheWeb=%1 على الإنترنت
UninstallProgram=%1 إلغاء تثبيت
LaunchProgram=%1 تشغيل
AssocFileExtension=إشراك %1 مع إمتداد ملف %2
AssocingFileExtension=يتم إشراك %1 مع إمتداد ملف %2 ...
AutoStartProgramGroupDescription=بدء التشغيل:
AutoStartProgram=تشغيل %1 تلقائيا
AddonHostProgramNotFound=تعذر العثور على %1 في المجلد الذي قمت بتحديده%n%nهل تريد المتابعة على أي حال ؟
