;Popcorn Time
;Installer Source for NSIS 3.0 or higher

;Enable Unicode encoding
Unicode True

;Include Modern UI
!include "MUI2.nsh"
!include "FileFunc.nsh"

;Check file paths
!if /FILEEXISTS "..\..\package.json"
    ;File exists!
    !define WIN_PATHS
!else
    ;File does NOT exist!
!endif

; ------------------- ;
;  Parse Gruntfile.js ;
; ------------------- ;
!ifdef WIN_PATHS
    !searchparse /file "..\..\Gruntfile.js" "version: '" APP_NW "',"
!else
    !searchparse /file "../../Gruntfile.js" "version: '" APP_NW "',"
!endif

;Parse package.json
!ifdef WIN_PATHS
    !searchparse /file "..\..\package.json" '"name": "' APP_NAME '",'
!else
    !searchparse /file "../../package.json" '"name": "' APP_NAME '",'
!endif
!searchreplace APP_NAME "${APP_NAME}" "-" " "
!ifdef WIN_PATHS
    !searchparse /file "..\..\package.json" '"version": "' PT_VERSION '",'
!else
    !searchparse /file "../../package.json" '"version": "' PT_VERSION '",'
!endif
!searchreplace PT_VERSION_CLEAN "${PT_VERSION}" "-" ".0"
!ifdef WIN_PATHS
    !searchparse /file "..\..\package.json" '"homepage": "' APP_URL '",'
    !searchparse /file "..\..\package.json" '"name": "' DATA_FOLDER '",'
!else
    !searchparse /file "../../package.json" '"homepage": "' APP_URL '",'
    !searchparse /file "../../package.json" '"name": "' DATA_FOLDER '",'
!endif

; ------------------- ;
;      Settings       ;
; ------------------- ;
;General Settings
!define COMPANY_NAME "Popcorn Official"
!define UNINSTALL_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
Name "${APP_NAME}"
Caption "${APP_NAME} v${PT_VERSION}"
BrandingText "${APP_NAME} v${PT_VERSION}"
VIAddVersionKey "ProductName" "${APP_NAME}"
VIAddVersionKey "ProductVersion" "v${PT_VERSION}"
VIAddVersionKey "FileDescription" "${APP_NAME} v${PT_VERSION} Installer"
VIAddVersionKey "FileVersion" "v${PT_VERSION}"
VIAddVersionKey "CompanyName" "${COMPANY_NAME}"
VIAddVersionKey "LegalCopyright" "${APP_URL}"
VIProductVersion "${PT_VERSION_CLEAN}.0"
OutFile "${APP_NAME}-${PT_VERSION}-Win-Setup.exe"
CRCCheck on
SetCompressor /SOLID lzma

;Default installation folder
InstallDir "$LOCALAPPDATA\${APP_NAME}"

;Request application privileges
RequestExecutionLevel user

!define APP_LAUNCHER "Popcorn Time Launcher.exe"

; ------------------- ;
;     UI Settings     ;
; ------------------- ;
;Define UI settings
!ifdef WIN_PATHS
    !define MUI_UI_HEADERIMAGE_RIGHT "..\..\src\app\images\icon.png"
    !define MUI_ICON "..\..\src\app\images\popcorntime.ico"
    !define MUI_UNICON "..\..\src\app\images\popcorntime.ico"
!else
    !define MUI_UI_HEADERIMAGE_RIGHT "../../src/app/images/icon.png"
    !define MUI_ICON "../../src/app/images\popcorntime.ico"
    !define MUI_UNICON "../../src/app/images\popcorntime.ico"
!endif
!define MUI_WELCOMEFINISHPAGE_BITMAP "installer-image.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "uninstaller-image.bmp"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_LINK "${APP_URL}"
!define MUI_FINISHPAGE_LINK_LOCATION "${APP_URL}"
!define MUI_FINISHPAGE_RUN "$INSTDIR\node-webkit\${APP_NAME}.exe"
!define MUI_FINISHPAGE_RUN_PARAMETERS "."

;Define the pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
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
!insertmacro MUI_LANGUAGE "Belarusian"
!insertmacro MUI_LANGUAGE "Bosnian"
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
!insertmacro MUI_LANGUAGE "Latvian"
!insertmacro MUI_LANGUAGE "Lithuanian"
!insertmacro MUI_LANGUAGE "Macedonian"
!insertmacro MUI_LANGUAGE "Malay"
!insertmacro MUI_LANGUAGE "Mongolian"
!insertmacro MUI_LANGUAGE "Norwegian"
!insertmacro MUI_LANGUAGE "NorwegianNynorsk"
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
!insertmacro MUI_LANGUAGE "Vietnamese"
!insertmacro MUI_LANGUAGE "Welsh"

; ------------------- ;
;    Localization     ;
; ------------------- ;
LangString removeDataFolder ${LANG_ENGLISH} "Remove all databases and configuration files?"
LangString removeDataFolder ${LANG_Afrikaans} "Alle databasisse en opset lêers verwyder?" 
LangString removeDataFolder ${LANG_Albanian} "Hiq të gjitha bazat e të dhënave dhe fotografi konfigurimit?" 
LangString removeDataFolder ${LANG_Arabic} "إزالة كافة قواعد البيانات وملفات التكوين؟" 
LangString removeDataFolder ${LANG_Belarusian} "Выдаліць усе базы дадзеных і файлы канфігурацыі?" 
LangString removeDataFolder ${LANG_Bosnian} "Uklonite sve baze podataka i konfiguracijske datoteke?" 
LangString removeDataFolder ${LANG_Bulgarian} "Премахнете всички бази данни и конфигурационни файлове?" 
LangString removeDataFolder ${LANG_Catalan} "Eliminar totes les bases de dades i arxius de configuració?" 
LangString removeDataFolder ${LANG_Croatian} "Uklonite sve baze podataka i konfiguracijske datoteke?" 
LangString removeDataFolder ${LANG_Czech} "Odstraňte všechny databáze a konfiguračních souborů?" 
LangString removeDataFolder ${LANG_Danish} "Fjern alle databaser og konfigurationsfiler?" 
LangString removeDataFolder ${LANG_Dutch} "Verwijder alle databases en configuratiebestanden?" 
LangString removeDataFolder ${LANG_Esperanto} "Forigi la tuta datumbazojn kaj agordaj dosieroj?" 
LangString removeDataFolder ${LANG_Estonian} "Eemalda kõik andmebaasid ja konfiguratsioonifailid?" 
LangString removeDataFolder ${LANG_Farsi} "حذف تمام پایگاه داده ها و فایل های پیکربندی؟" 
LangString removeDataFolder ${LANG_Finnish} "Poista kaikki tietokannat ja asetustiedostot?" 
LangString removeDataFolder ${LANG_French} "Supprimer toutes les bases de données et les fichiers de configuration ?" 
LangString removeDataFolder ${LANG_Galician} "Eliminar todos os bancos de datos e arquivos de configuración?" 
LangString removeDataFolder ${LANG_German} "Alle Datenbanken und Konfigurationsdateien zu entfernen?" 
LangString removeDataFolder ${LANG_Greek} "Αφαιρέστε όλες τις βάσεις δεδομένων και τα αρχεία διαμόρφωσης;" 
LangString removeDataFolder ${LANG_Hebrew} "הסר את כל קבצי תצורת מסדי נתונים ו" 
LangString removeDataFolder ${LANG_Hungarian} "Vegye ki az összes adatbázisok és konfigurációs fájlok?" 
LangString removeDataFolder ${LANG_Icelandic} "Fjarlægja allar gagnagrunna og stillingar skrá?" 
LangString removeDataFolder ${LANG_Indonesian} "Hapus semua database dan file konfigurasi?" 
LangString removeDataFolder ${LANG_Irish} "Bain na bunachair shonraí agus comhaid cumraíochta?" 
LangString removeDataFolder ${LANG_Italian} "Rimuovere tutti i database ei file di configurazione?" 
LangString removeDataFolder ${LANG_Japanese} "すべてのデータベースと設定ファイルを削除しますか？" 
LangString removeDataFolder ${LANG_Korean} "모든 데이터베이스와 구성 파일을 삭제 하시겠습니까?" 
LangString removeDataFolder ${LANG_Latvian} "Noņemt visas datu bāzes un konfigurācijas failus?" 
LangString removeDataFolder ${LANG_Lithuanian} "Pašalinti visas duombazes ir konfigūravimo failus?" 
LangString removeDataFolder ${LANG_Macedonian} "Отстрани ги сите бази на податоци и конфигурациските датотеки?" 
LangString removeDataFolder ${LANG_Malay} "Buang semua pangkalan data dan fail-fail konfigurasi?" 
LangString removeDataFolder ${LANG_Mongolian} "Бүх өгөгдлийн сангууд болон тохиргооны файлуудыг устгана?" 
LangString removeDataFolder ${LANG_Norwegian} "Fjern alle databaser og konfigurasjonsfiler?" 
LangString removeDataFolder ${LANG_NorwegianNynorsk} "Fjern alle databaser og konfigurasjonsfiler?" 
LangString removeDataFolder ${LANG_Polish} "Usuń wszystkie bazy danych i plików konfiguracyjnych?" 
LangString removeDataFolder ${LANG_Portuguese} "Remova todos os bancos de dados e arquivos de configuração?" 
LangString removeDataFolder ${LANG_PortugueseBR} "Remova todos os bancos de dados e arquivos de configuração?" 
LangString removeDataFolder ${LANG_Romanian} "Elimina toate bazele de date și fișierele de configurare?" 
LangString removeDataFolder ${LANG_Russian} "Удалить все базы данных и файлы конфигурации?" 
LangString removeDataFolder ${LANG_Serbian} "Уклоните све базе података и конфигурационе фајлове?" 
LangString removeDataFolder ${LANG_SerbianLatin} "Uklonite sve baze podataka i datoteke za konfiguraciju ?" 
LangString removeDataFolder ${LANG_SimpChinese} "删除所有数据库和配置文件？" 
LangString removeDataFolder ${LANG_Slovak} "Odstráňte všetky databázy a konfiguračných súborov?" 
LangString removeDataFolder ${LANG_Slovenian} "Odstranite vse podatkovne baze in konfiguracijske datoteke?" 
LangString removeDataFolder ${LANG_Spanish} "Eliminar todas las bases de datos y archivos de configuración?" 
LangString removeDataFolder ${LANG_SpanishInternational} "Eliminar todas las bases de datos y archivos de configuración?" 
LangString removeDataFolder ${LANG_Swedish} "Ta bort alla databaser och konfigurationsfiler?" 
LangString removeDataFolder ${LANG_Thai} "ลบฐานข้อมูลทั้งหมดและแฟ้มการกำหนดค่า?" 
LangString removeDataFolder ${LANG_TradChinese} "刪除所有數據庫和配置文件？" 
LangString removeDataFolder ${LANG_Turkish} "Tüm veritabanlarını ve yapılandırma dosyaları çıkarın?" 
LangString removeDataFolder ${LANG_Ukrainian} "Видалити всі бази даних і файли конфігурації?" 
LangString removeDataFolder ${LANG_Vietnamese} "Loại bỏ tất cả các cơ sở dữ liệu và các tập tin cấu hình?" 
LangString removeDataFolder ${LANG_Welsh} "Tynnwch yr holl gronfeydd data a ffeiliau cyfluniad?" 

LangString noRoot ${LANG_ENGLISH} "You cannot install Popcorn Time in a directory that requires administrator permissions"
LangString noRoot ${LANG_Afrikaans} "Jy kan nie Popcorn Time in 'n gids wat vereis administrateur regte installeer"
LangString noRoot ${LANG_Albanian} "Ju nuk mund të instaloni Popcorn Time në një directory që kërkon lejet e administratorit"
LangString noRoot ${LANG_Arabic} " لا يمكنك تثبيت Popcorn Time في مجلد يتطلب صلاحيات مدير"
LangString noRoot ${LANG_Belarusian} "Вы не можаце ўсталяваць Popcorn Time ў каталогу, які патрабуе правоў адміністратара"
LangString noRoot ${LANG_Bosnian} "Nemoguće instalirati Popcorn Time u direktorij koji zahtjeva administrativnu dozvolu" 
LangString noRoot ${LANG_Bulgarian} "Не може да инсталирате Popcorn Time в директория, изискваща администраторски права"
LangString noRoot ${LANG_Catalan} "No es pot instal·lar Popcorn Time en un directori que requereix permisos d'administrador"
LangString noRoot ${LANG_Croatian} "Nemoguće instalirati Popcorn Time u mapi koja zahtjeva administrativnu dozvolu"
LangString noRoot ${LANG_Czech} "Nelze nainstalovat Popcorn Time v adresáři, který vyžaduje oprávnění správce"
LangString noRoot ${LANG_Danish} "Popcorn Time kan ikke installeres til denne sti, da det kræver administratorrettigheder"
LangString noRoot ${LANG_Dutch} "Popcorn Time kan niet worden geïnstalleerd in een map die beheerdersrechten vereist"
LangString noRoot ${LANG_Esperanto} "Vi ne povas instali Popcorn Time en dosierujo kiu postulas administranto permesojn"
LangString noRoot ${LANG_Estonian} "Popcorn Time`i ei ole võimalik installida kataloogi mis nõuab administraatori õiguseid" 
LangString noRoot ${LANG_Farsi} "در یک دایرکتوری که نیاز به مجوز مدیر نصب Popcorn Time  کنید شما می توانید "
LangString noRoot ${LANG_Finnish} "Et voi asentaa Popcorn Time hakemistossa, joka vaatii järjestelmänvalvojan oikeudet"
LangString noRoot ${LANG_French} "Popcorn Time ne peut être installé dans un répertoire nécessitant un accès administrateur"
LangString noRoot ${LANG_Galician} "Popcorn Time non se pode instalar nun directorio que requira permisos de administrador"
LangString noRoot ${LANG_German} "Sie können Popcorn Time nicht in einem Verzeichnis, das über Administratorrechte zum Installieren der benötigten" 
LangString noRoot ${LANG_Greek} "Δεν μπορείτε να εγκαταστήσετε το Popcorn Time σε ένα φάκελο που απαιτεί δικαιώματα διαχειριστή"
LangString noRoot ${LANG_Hebrew} "אין באפשרותכם להתקין את Popcorn Time בתיקייה שדורשת הרשאות מנהל"
LangString noRoot ${LANG_Hungarian} "A Popcorn Time nem telepíthető olyan mappába, amely adminisztrátori hozzáférést igényel"
LangString noRoot ${LANG_Icelandic} "Þú getur ekki sett Popcorn Time í möppu sem þarfnast stjórnenda réttindi"
LangString noRoot ${LANG_Indonesian} "Anda tidak bisa menginstall Popcorn Time pada direktori yang memerlukan ijin dari Administrator"
LangString noRoot ${LANG_Irish} "Ní féidir leat a shuiteáil Popcorn Time i eolaire go n-éilíonn ceadanna riarthóir"
LangString noRoot ${LANG_Italian} "Non puoi installare Popcorn Time in una cartella che richiede i permessi d'amministratore"
LangString noRoot ${LANG_Japanese} "アドミニストレータの聴許が必要なディレクトリには 'Popcorn Time'をインストールできません。"
LangString noRoot ${LANG_Korean} "관리자 권한이 요구되는 위치에 Popcorn Time을 설치 할 수 없습니다"
LangString noRoot ${LANG_Latvian} "Jūs nevarat instalēt Popcorn Time direktorijā, kas prasa administratora atļaujas"
LangString noRoot ${LANG_Lithuanian} "Jūs negalite įdiegti Popcorn Time į katalogą, kad reikia administratoriaus teisių"
LangString noRoot ${LANG_Macedonian} "Не можете да инсталирате Popcorn Time во директориумот со која се бара администратор дозволи"
LangString noRoot ${LANG_Malay} "Anda tidak boleh memasang Popcorn Time dalam direktori yang memerlukan keizinan pentadbir"
LangString noRoot ${LANG_Mongolian} "Та администратор зөвшөөрөл шаарддаг сан дахь Popcorn Time суулгаж чадахгүй байгаа"
LangString noRoot ${LANG_Norwegian} "Popcorn Time kan ikke installeres i en mappe som krever administratorrettigheter"
LangString noRoot ${LANG_NorwegianNynorsk} "Popcorn Time kan ikke installeres i en mappe som krever administratorrettigheter" 
LangString noRoot ${LANG_Polish} "Nie można zainstalować Popcorn Time w katalogu wymagającym uprawnień administratora"
LangString noRoot ${LANG_Portuguese} "Não é possível instalar o Popcorn Time numa pasta que requer permissões administrativas"
LangString noRoot ${LANG_PortugueseBR} "Popcorn Time não poderá ser instalado em um diretório que requer permissões de administrador"
LangString noRoot ${LANG_Romanian} "Nu puteți instala Popcorn Time într-un director care necesită permisiuni de administrator"
LangString noRoot ${LANG_Russian} "Popcorn Time не может быть установлена в директорию требующей полномочия Администратора"
LangString noRoot ${LANG_Serbian} "Ви не можете инсталирати ПопцорнТиме у директоријуму која захтева администраторске дозволе"
LangString noRoot ${LANG_SerbianLatin} "Ne možete da instalirate Popcorn Time u direktorijum koji zahteva administartorsku dozvolu"
LangString noRoot ${LANG_SimpChinese} "你不能把PopCorn Time安装到一个需要管理员权限的目录"
LangString noRoot ${LANG_Slovak} "Nemôžete inštalovať Popcorn Time do zložky, ktorá vyžaduje administrátorské povolenia"
LangString noRoot ${LANG_Slovenian} "Ne morete namestiti Popcorn Time v imeniku, ki zahteva skrbniška dovoljenja"
LangString noRoot ${LANG_Spanish} "Popcorn Time no puede ser instalado en un directorio que requiera permisos de administrador"
LangString noRoot ${LANG_SpanishInternational} "Popcorn Time no puede ser instalado en un directorio que requiera permisos de administrador"
LangString noRoot ${LANG_Swedish} "Popcorn Time kan inte installeras i en mapp som kräver administratörsbehörighet"
LangString noRoot ${LANG_Thai} "คุณไม่สามารถติดตั้ง Popcorn Time ในไดเรกทอรีที่ต้องใช้สิทธิ์ของผู้ดูแล"
LangString noRoot ${LANG_TradChinese} "你不能把Popcorn Time安装到一个需要管理员权限的目录"
LangString noRoot ${LANG_Turkish} "Popcorn Time'ı yönetici izinleri gerektiren bir dizine kuramazsınız"
LangString noRoot ${LANG_Ukrainian} "Ви не можете встановити Popcorn Time в каталозі, який вимагає прав адміністратора"
LangString noRoot ${LANG_Vietnamese} "Bạn không thể cài đặt Popcorn time trong một thư mục yêu cầu quyền quản trị admin"
LangString noRoot ${LANG_Welsh} "Ni gallwch gosod Popcorn Time mewn cyfarwyddiadur sydd angen caniatad gweinyddol"

; ------------------- ;
;    Install code     ;
; ------------------- ;
Section ; Node Webkit Files

    ;Delete existing install
    RMDir /r "$INSTDIR"

    ;Set output path to InstallDir
    SetOutPath "$INSTDIR\node-webkit"

    ;Check to see if this nw uses datfiles
    !ifdef WIN_PATHS
        !define DATPATH "..\..\build\cache\win\${APP_NW}\"
    !else
        !define DATPATH "../../build/cache/win/${APP_NW}/"
    !endif

    !ifdef DATPATH
        !if /FILEEXISTS "${DATPATH}icudtl.dat"
            ;File exists!
            !define DATFILES
        !else
            ;File does NOT exist!
        !endif
    !endif
    
    ;Add the files
    !ifdef WIN_PATHS
        File "..\..\build\cache\win\${APP_NW}\*.dll"
        File "/oname=${APP_NAME}.exe" "..\..\build\cache\win\${APP_NW}\nw.exe"
        File "..\..\build\cache\win\${APP_NW}\nw.pak"
        File /r "..\..\build\cache\win\${APP_NW}\locales"
    !else
        File "../../build/cache/win/${APP_NW}/*.dll"
        File "/oname=${APP_NAME}.exe" "../../build/cache/win/${APP_NW}/nw.exe"
        File "../../build/cache/win/${APP_NW}/nw.pak"
        File /r "../../build/cache/win/${APP_NW}/locales"
    !endif

    !ifdef DATFILES
        File "${DATPATH}*.dat"
    !endif

SectionEnd

Section ; App Files

    ;Set output path to InstallDir
    SetOutPath "$INSTDIR\src\app"

    ;Add the files
    !ifdef WIN_PATHS
        File /r "..\..\src\app\css"
        File /r "..\..\src\app\fonts"
        File /r "..\..\src\app\images"
        File /r "..\..\src\app\language"
        File /r "..\..\src\app\lib"
        File /r "..\..\src\app\templates"
        File /r "..\..\src/app\themes"
        File /r /x ".*" /x "test*" /x "example*" "..\..\src\app\vendor"
        File "..\..\src\app\index.html"
        File "..\..\src\app\*.js"
        File /oname=License.txt "..\..\dist\windows\LICENSE.txt"
    !else
        File /r "../../src/app/css"
        File /r "../../src/app/fonts"
        File /r "../../src/app/images"
        File /r "../../src/app/language"
        File /r "../../src/app/lib"
        File /r "../../src/app/templates"
        File /r "../../src/app/themes"
        File /r /x ".*" /x "test*" /x "example*" "../../src/app/vendor"
        File "../../src/app/index.html"
        File "../../src/app/*.js"
        File /oname=License.txt "../../dist/windows/LICENSE.txt"
    !endif

    SetOutPath "$INSTDIR"
    !ifdef WIN_PATHS
        File "..\..\package.json"
        File "..\..\dist\windows\${APP_LAUNCHER}"
        File "..\..\CHANGELOG.md"
        File /NONFATAL "..\..\.git.json"
    !else
        File "../../package.json"
		File "../../dist/windows/${APP_LAUNCHER}"
        File "../../CHANGELOG.md"
        File /NONFATAL "../../.git.json"
    !endif

    SetOutPath "$INSTDIR\node_modules"
    !ifdef WIN_PATHS
        File /r /x "*grunt*" /x "stylus" /x "nw-gyp" /x "bower" /x ".bin" /x "bin" /x "test"  /x "test*" /x "example*" /x ".*" /x "*.md" /x "*.gz" /x "benchmark*" /x "*.markdown" "..\..\node_modules\*.*"
    !else
        File /r /x "*grunt*" /x "stylus" /x "nw-gyp" /x "bower" /x ".bin" /x "bin" /x "test"  /x "test*" /x "example*" /x ".*" /x "*.md" /x "*.gz" /x "benchmark*" /x "*.markdown" "../../node_modules/*.*"
    !endif

    ;Create uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"

SectionEnd

; ------------------- ;
;      Shortcuts      ;
; ------------------- ;
Section ; Shortcuts

    ;Working Directory
    SetOutPath "$INSTDIR"

    ;Start Menu Shortcut
    RMDir /r "$SMPROGRAMS\${APP_NAME}"
    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_LAUNCHER}" "" "$INSTDIR\src\app\images\popcorntime.ico" "" "" "" "${APP_NAME} ${PT_VERSION}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\src\app\images\popcorntime.ico" "" "" "" "Uninstall ${APP_NAME}"

    ;Desktop Shortcut
    Delete "$DESKTOP\${APP_NAME}.lnk"
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_LAUNCHER}" "" "$INSTDIR\src\app\images\popcorntime.ico" "" "" "" "${APP_NAME} ${PT_VERSION}"

    ;Add/remove programs uninstall entry
    ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
    IntFmt $0 "0x%08X" $0
	WriteRegDWORD HKCU "${UNINSTALL_KEY}" "EstimatedSize" "$0"
	WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayName" "${APP_NAME}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayIcon" "$INSTDIR\src\app\images\popcorntime.ico"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "Publisher" "${COMPANY_NAME}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "InstallString" "$INSTDIR"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "URLInfoAbout" "${APP_URL}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "HelpLink" "https://discuss.popcorntime.io"

SectionEnd

; ------------------- ;
;     Uninstaller     ;
; ------------------- ;
Section "uninstall" 

    RMDir /r "$INSTDIR"
    RMDir /r "$SMPROGRAMS\${APP_NAME}"
    Delete "$DESKTOP\${APP_NAME}.lnk"
    
    MessageBox MB_YESNO|MB_ICONQUESTION "$(removeDataFolder)" IDNO NoUninstallData
    RMDir /r "$LOCALAPPDATA\${DATA_FOLDER}"
    NoUninstallData:
    DeleteRegKey HKCU "${UNINSTALL_KEY}"
	DeleteRegKey HKCU "Software\Chromium" ;workaround for NW leftovers
    
SectionEnd

; ------------------- ;
;  Check if writable  ;
; ------------------- ;
Function IsWritable

  !define IsWritable `!insertmacro IsWritableCall`
 
  !macro IsWritableCall _PATH _RESULT
    Push `${_PATH}`
    Call IsWritable
    Pop ${_RESULT}
  !macroend
 
  Exch $R0
  Push $R1
 
start:
  StrLen $R1 $R0
  StrCmp $R1 0 exit
  ${GetFileAttributes} $R0 "DIRECTORY" $R1
  StrCmp $R1 1 direxists
  ${GetParent} $R0 $R0
  Goto start
 
direxists:
  ${GetFileAttributes} $R0 "DIRECTORY" $R1
  StrCmp $R1 0 ok

  StrCmp $R0 $PROGRAMFILES64 notok
  StrCmp $R0 $WINDIR notok

  ${GetFileAttributes} $R0 "READONLY" $R1

  Goto exit

notok:
  StrCpy $R1 1
  Goto exit

ok:
  StrCpy $R1 0
 
exit:
  Exch
  Pop $R0
  Exch $R1
 
FunctionEnd

; ------------------- ;
;  Check install dir  ;
; ------------------- ;
Function CloseBrowseForFolderDialog
	!ifmacrodef "_P<>" ; NSIS 3+
		System::Call 'USER32::GetActiveWindow()p.r0'
		${If} $0 P<> $HwndParent
	!else
		System::Call 'USER32::GetActiveWindow()i.r0'
		${If} $0 <> $HwndParent
	!endif
		SendMessage $0 ${WM_CLOSE} 0 0
		${EndIf}
FunctionEnd

Function .onVerifyInstDir

  Push $R1
  ${IsWritable} $INSTDIR $R1
  IntCmp $R1 0 pathgood
  Pop $R1
  Call CloseBrowseForFolderDialog
  MessageBox MB_OK|MB_USERICON "$(noRoot)"
  Abort

pathgood:
  Pop $R1

FunctionEnd