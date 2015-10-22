;Butter
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
!define COMPANY_NAME "Butter Project"
Name "${APP_NAME}"
Caption "${APP_NAME} ${PT_VERSION}"
BrandingText "${APP_NAME} ${PT_VERSION}"
VIAddVersionKey "ProductName" "${APP_NAME}"
VIAddVersionKey "ProductVersion" "${PT_VERSION}"
VIAddVersionKey "FileDescription" "${APP_NAME} ${PT_VERSION} Installer"
VIAddVersionKey "FileVersion" "${PT_VERSION}"
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

!define APP_LAUNCHER "Butter.exe"
!define UNINSTALL_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"

; ------------------- ;
;     UI Settings     ;
; ------------------- ;
;Define UI settings
!ifdef WIN_PATHS
    !define MUI_UI_HEADERIMAGE_RIGHT "..\..\src\app\images\icon.png"
    !define MUI_ICON "..\..\src\app\images\butter.ico"
    !define MUI_UNICON "..\..\src\app\images\butter_uninstall.ico"
!else
    !define MUI_UI_HEADERIMAGE_RIGHT "../../src/app/images/icon.png"
    !define MUI_ICON "../../src/app/images/butter.ico"
    !define MUI_UNICON "../../src/app/images/butter_uninstall.ico"
!endif
!define MUI_WELCOMEFINISHPAGE_BITMAP "installer-image.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "uninstaller-image.bmp"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_LINK "${APP_URL}"
!define MUI_FINISHPAGE_LINK_LOCATION "${APP_URL}"
!define MUI_FINISHPAGE_RUN "$INSTDIR\nw.exe"
!define MUI_FINISHPAGE_SHOWREADME ""
!define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
!define MUI_FINISHPAGE_SHOWREADME_TEXT "$(desktopShortcut)"
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION finishpageaction

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

LangString noRoot ${LANG_ENGLISH} "You cannot install Butter in a directory that requires administrator permissions"
LangString noRoot ${LANG_Afrikaans} "Jy kan nie Butter installeer in 'n gids wat administrateur regte vereis"
LangString noRoot ${LANG_Albanian} "Ju nuk mund të instaloni Butter në një directory që kërkon lejet e administratorit"
LangString noRoot ${LANG_Arabic} " لا يمكنك تثبيت Butter في مجلد يتطلب صلاحيات مدير"
LangString noRoot ${LANG_Belarusian} "Вы не можаце ўсталяваць Butter ў каталогу, які патрабуе правоў адміністратара"
LangString noRoot ${LANG_Bosnian} "Nemoguće instalirati Butter u direktorij koji zahtjeva administrativnu dozvolu"
LangString noRoot ${LANG_Bulgarian} "Не може да инсталирате Butter в директория, изискваща администраторски права"
LangString noRoot ${LANG_Catalan} "No es pot instal·lar Butter en un directori que requereix permisos d'administrador"
LangString noRoot ${LANG_Croatian} "Nemoguće instalirati Butter u mapi koja zahtjeva administrativnu dozvolu"
LangString noRoot ${LANG_Czech} "Nemůžete nainstalovat Butter do složky, která vyžaduje administrátorské oprávnění"
LangString noRoot ${LANG_Danish} "Butter kan ikke installeres til denne sti, da det kræver administratorrettigheder"
LangString noRoot ${LANG_Dutch} "Butter kan niet worden geïnstalleerd in een map die beheerdersrechten vereist"
LangString noRoot ${LANG_Esperanto} "Vi ne povas instali Butter en dosierujo kiu postulas administranto permesojn"
LangString noRoot ${LANG_Estonian} "Butter`i ei ole võimalik installida kataloogi mis nõuab administraatori õiguseid"
LangString noRoot ${LANG_Farsi} "در یک دایرکتوری که نیاز به مجوز مدیر نصب Butter  کنید شما می توانید "
LangString noRoot ${LANG_Finnish} "Et voi asentaa Butter hakemistossa, joka vaatii järjestelmänvalvojan oikeudet"
LangString noRoot ${LANG_French} "Butter ne peut être installé dans un répertoire nécessitant un accès administrateur"
LangString noRoot ${LANG_Galician} "Butter non se pode instalar nun directorio que requira permisos de administrador"
LangString noRoot ${LANG_German} "Butter kann nicht in einem Ordner installiert werden für den Administratorrechte benötigt werden"
LangString noRoot ${LANG_Greek} "Δεν μπορείτε να εγκαταστήσετε το Butter σε ένα φάκελο που απαιτεί δικαιώματα διαχειριστή"
LangString noRoot ${LANG_Hebrew} "אין באפשרותכם להתקין את Butter בתיקייה שדורשת הרשאות מנהל"
LangString noRoot ${LANG_Hungarian} "A Butter nem telepíthető olyan mappába, amely adminisztrátori hozzáférést igényel"
LangString noRoot ${LANG_Icelandic} "Þú getur ekki sett Butter í möppu sem þarfnast stjórnenda réttindi"
LangString noRoot ${LANG_Indonesian} "Anda tidak bisa menginstall Butter pada direktori yang memerlukan ijin dari Administrator"
LangString noRoot ${LANG_Irish} "Ní féidir leat a shuiteáil Butter i eolaire go n-éilíonn ceadanna riarthóir"
LangString noRoot ${LANG_Italian} "Non puoi installare Butter in una cartella che richiede i permessi d'amministratore"
LangString noRoot ${LANG_Japanese} "アドミニストレータの聴許が必要なディレクトリには 'Butter'をインストールできません。"
LangString noRoot ${LANG_Korean} "관리자 권한이 요구되는 위치에 Butter을 설치 할 수 없습니다"
LangString noRoot ${LANG_Latvian} "Jūs nevarat instalēt Butter direktorijā, kas prasa administratora atļaujas"
LangString noRoot ${LANG_Lithuanian} "Jūs negalite įdiegti Butter į katalogą, kad reikia administratoriaus teisių"
LangString noRoot ${LANG_Macedonian} "Не можете да инсталирате Butter во директориумот кој бара администраторски дозволи"
LangString noRoot ${LANG_Malay} "Anda tidak boleh memasang Butter dalam direktori yang memerlukan keizinan pentadbir"
LangString noRoot ${LANG_Mongolian} "Та администратор зөвшөөрөл шаарддаг сан дахь Butter суулгаж чадахгүй байгаа"
LangString noRoot ${LANG_Norwegian} "Butter kan ikke installeres i en mappe som krever administratorrettigheter"
LangString noRoot ${LANG_NorwegianNynorsk} "Butter kan ikke installeres i en mappe som krever administratorrettigheter"
LangString noRoot ${LANG_Polish} "Nie można zainstalować Butter w katalogu wymagającym uprawnień administratora"
LangString noRoot ${LANG_Portuguese} "Não é possível instalar o Butter numa pasta que requer permissões administrativas"
LangString noRoot ${LANG_PortugueseBR} "Butter não poderá ser instalado em um diretório que requer permissões de administrador"
LangString noRoot ${LANG_Romanian} "Nu puteți instala Butter într-un director care necesită permisiuni de administrator"
LangString noRoot ${LANG_Russian} "Butter не может быть установлена в директорию требующей полномочия Администратора"
LangString noRoot ${LANG_Serbian} "Ви не можете инсталирати ПопцорнТиме у директоријуму која захтева администраторске дозволе"
LangString noRoot ${LANG_SerbianLatin} "Ne možete da instalirate Butter u direktorijum koji zahteva administartorsku dozvolu"
LangString noRoot ${LANG_SimpChinese} "你不能把Butter安装到一个需要管理员权限的目录"
LangString noRoot ${LANG_Slovak} "Nemôžete inštalovať Butter do zložky, ktorá vyžaduje administrátorské povolenia"
LangString noRoot ${LANG_Slovenian} "Ne morete namestiti Butter v imeniku, ki zahteva skrbniška dovoljenja"
LangString noRoot ${LANG_Spanish} "Butter no puede ser instalado en un directorio que requiera permisos de administrador"
LangString noRoot ${LANG_SpanishInternational} "Butter no puede ser instalado en un directorio que requiera permisos de administrador"
LangString noRoot ${LANG_Swedish} "Butter kan inte installeras i en mapp som kräver administratörsbehörighet"
LangString noRoot ${LANG_Thai} "คุณไม่สามารถติดตั้ง Butter ในโฟลเดอร์ ที่ต้องใช้สิทธิ์ของ Administrator"
LangString noRoot ${LANG_TradChinese} "您不能於一個需要管理員權限才能存取的目錄安裝 Butter"
LangString noRoot ${LANG_Turkish} "Butter'ı yönetici izinleri gerektiren bir dizine kuramazsınız"
LangString noRoot ${LANG_Ukrainian} "Ви не можете встановити Butter в директорію для якої потрібні права адміністратора"
LangString noRoot ${LANG_Vietnamese} "Bạn không thể cài đặt Butter trong một thư mục yêu cầu quyền quản trị admin"
LangString noRoot ${LANG_Welsh} "Ni gallwch gosod Butter mewn cyfarwyddiadur sydd angen caniatad gweinyddol"

LangString desktopShortcut ${LANG_ENGLISH} "Desktop Shortcut"
LangString desktopShortcut ${LANG_Afrikaans} "Snelkoppeling op die lessenaar (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Albanian} "Shkurtore desktop (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Arabic} "إختصار سطح المكتب"
LangString desktopShortcut ${LANG_Belarusian} "ярлык Працоўнага Стала (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Bosnian} "Prečac Radne Površine"
LangString desktopShortcut ${LANG_Bulgarian} "Икона на десктоп"
LangString desktopShortcut ${LANG_Catalan} "Drecera d'escriptori"
LangString desktopShortcut ${LANG_Croatian} "Prečac na radnoj površini (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Czech} "Odkaz na ploše"
LangString desktopShortcut ${LANG_Danish} "Genvej til skrivebord"
LangString desktopShortcut ${LANG_Dutch} "Bureaublad-snelkoppeling"
LangString desktopShortcut ${LANG_Esperanto} "Labortablo ŝparvojo (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Estonian} "Otsetee töölaual"
LangString desktopShortcut ${LANG_Farsi} "(Desktop Shortcut) میانبر دسک تاپ"
LangString desktopShortcut ${LANG_Finnish} "Työpöydän pikakuvake"
LangString desktopShortcut ${LANG_French} "Placer un raccourci sur le bureau"
LangString desktopShortcut ${LANG_Galician} "Atallo de escritorio"
LangString desktopShortcut ${LANG_German} "Desktopsymbol"
LangString desktopShortcut ${LANG_Greek} "Συντόμευση επιφάνειας εργασίας"
LangString desktopShortcut ${LANG_Hebrew} "קיצורי דרך על שולחן העבודה"
LangString desktopShortcut ${LANG_Hungarian} "Asztali ikon"
LangString desktopShortcut ${LANG_Icelandic} "Flýtileið (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Indonesian} "Desktop Shortcut"
LangString desktopShortcut ${LANG_Irish} "Aicearra deisce (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Italian} "Collegati sul desktop"
LangString desktopShortcut ${LANG_Japanese} "デスクトップショートカット"
LangString desktopShortcut ${LANG_Korean} "바탕화면 바로가기"
LangString desktopShortcut ${LANG_Latvian} "Desktop īsceļu (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Lithuanian} "Darbalaukio nuoroda"
LangString desktopShortcut ${LANG_Macedonian} "Десктоп кратенка (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Malay} "Pintasan Desktop"
LangString desktopShortcut ${LANG_Mongolian} "Ширээний товчлохын (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Norwegian} "Skrivebordssnarvei"
LangString desktopShortcut ${LANG_NorwegianNynorsk} "Skrivebordssnarvei"
LangString desktopShortcut ${LANG_Polish} "Ikona na pulpicie"
LangString desktopShortcut ${LANG_Portuguese} "Atalho do Ambiente de Trabalho"
LangString desktopShortcut ${LANG_PortugueseBR} "Atalho da Área de Trabalho"
LangString desktopShortcut ${LANG_Romanian} "Scurtătură desktop"
LangString desktopShortcut ${LANG_Russian} "Ярлык на рабочем столе"
LangString desktopShortcut ${LANG_Serbian} "Пречица на радној површини"
LangString desktopShortcut ${LANG_SerbianLatin} "Desktop Shortcut"
LangString desktopShortcut ${LANG_SimpChinese} "桌面快捷方式"
LangString desktopShortcut ${LANG_Slovak} "Odkaz na pracovnej ploche"
LangString desktopShortcut ${LANG_Slovenian} "Bližnjica na namizju"
LangString desktopShortcut ${LANG_Spanish} "Acceso directo en el Escritorio"
LangString desktopShortcut ${LANG_SpanishInternational} "Acceso directo en el Escritorio"
LangString desktopShortcut ${LANG_Swedish} "Genväg på skrivbordet"
LangString desktopShortcut ${LANG_Thai} "ไอคอนตรงพื้นโต๊ะ"
LangString desktopShortcut ${LANG_TradChinese} "桌面捷徑"
LangString desktopShortcut ${LANG_Turkish} "Masaüstü Kısayolu"
LangString desktopShortcut ${LANG_Ukrainian} "Ярлик на робочому столі"
LangString desktopShortcut ${LANG_Vietnamese} "Lối tắt trên màn (Desktop Shortcut)"
LangString desktopShortcut ${LANG_Welsh} "Llwybr Byr ar y Bwrdd Gwaith"

; ------------------- ;
;    Install code     ;
; ------------------- ;
Function .onInit ; check for previous version
    Exec "taskkill /F /IM nw.exe /T"
    ReadRegStr $0 HKCU "${UNINSTALL_KEY}" "InstallString"
    StrCmp $0 "" done
    StrCpy $INSTDIR $0
done:
FunctionEnd

Section ; Node Webkit Files

    ;Delete existing install
    RMDir /r "$INSTDIR"
    
    ;Delete cache
    RMDir /r "$LOCALAPPDATA\${DATA_FOLDER}\Cache"
    RMDir /r "$LOCALAPPDATA\${DATA_FOLDER}\GPUCache"
    RMDir /r "$LOCALAPPDATA\${DATA_FOLDER}\databases"
    RMDir /r "$LOCALAPPDATA\${DATA_FOLDER}\Local Storage"

    ;Set output path to InstallDir
    SetOutPath "$INSTDIR"

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
        File "..\..\build\cache\win\${APP_NW}\nw.exe"
        File "..\..\build\cache\win\${APP_NW}\nw.pak"
        File /r "..\..\build\cache\win\${APP_NW}\locales"
    !else
        File "../../build/cache/win/${APP_NW}/*.dll"
        File "../../build/cache/win/${APP_NW}/nw.exe"
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
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\nw.exe" "" "$INSTDIR\src\app\images\butter.ico" "" "" "" "${APP_NAME} ${PT_VERSION}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\src\app\images\butter_uninstall.ico" "" "" "" "Uninstall ${APP_NAME}"

    ;Desktop Shortcut
    Delete "$DESKTOP\${APP_NAME}.lnk"

    ;Add/remove programs uninstall entry
    ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
    IntFmt $0 "0x%08X" $0
    WriteRegDWORD HKCU "${UNINSTALL_KEY}" "EstimatedSize" "$0"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayName" "${APP_NAME}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayIcon" "$INSTDIR\src\app\images\butter.ico"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "Publisher" "${COMPANY_NAME}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "InstallString" "$INSTDIR"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "URLInfoAbout" "${APP_URL}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "HelpLink" "https://discuss.butter.io"

    ;File association
    WriteRegStr HKCU "Software\Classes\Applications\${APP_LAUNCHER}" "FriendlyAppName" "${APP_NAME}"
    WriteRegStr HKCU "Software\Classes\Applications\${APP_LAUNCHER}\shell\open\command" "" '"$INSTDIR\${APP_LAUNCHER}" "%1"'

    System::Call "shell32::SHChangeNotify(i,i,i,i) (0x08000000, 0x1000, 0, 0)"

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
    DeleteRegKey HKCU "Software\Classes\Applications\${APP_LAUNCHER}" ;file association
    
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

; ------------------ ;
;  Desktop Shortcut  ;
; ------------------ ;
Function finishpageaction
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\nw.exe" "" "$INSTDIR\src\app\images\butter.ico" "" "" "" "${APP_NAME} ${PT_VERSION}"
FunctionEnd
