; ***************************************************************
; ***                                                         ***
; *** Inno Setup version 5.5.3+ Portuguese (Brazil) messages ***
; ***                                                         ***
; *** Original Author:                                        ***
; ***                                                         ***
; ***   Paulo Andre Rosa (parosa@gmail.com)                   ***
; ***                                                         ***
; *** Maintainer:                                             ***
; ***                                                         ***
; ***   Eduardo Mauro (emauro@acabit.com.br)                  ***
; ***                                                         ***
; *** Contributors:                                           ***
; ***                                                         ***
; ***   Felipe (felipefpl@ig.com.br)                          ***
; ***   Jeferson Oliveira (jefersonfoliveira@gmail.com)       ***
; ***                                                         ***
; ***************************************************************

; To download user-contributed translations of this file, go to:
;   http://www.jrsoftware.org/is3rdparty.php
;
; Note: When translating this text, do not add periods (.) to the end of
; messages that didn't have them already, because on those messages Inno
; Setup adds the periods automatically (appending a period would result in
; two periods being displayed).

[LangOptions]
; The following three entries are very important. Be sure to read and 
; understand the '[LangOptions] section' topic in the help file.
LanguageName=Portugu<00EA>s (Brasil)
LanguageID=$0416
LanguageCodePage=1252

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
SetupAppTitle=Programa de Instalação
SetupWindowTitle=%1 - Programa de Instalação
UninstallAppTitle=Desinstalar
UninstallAppFullTitle=Desinstalar %1

; *** Misc. common
InformationTitle=Informação
ConfirmTitle=Confirmação
ErrorTitle=Erro

; *** SetupLdr messages
SetupLdrStartupMessage=Este programa instalará %1. Você quer continuar?
LdrCannotCreateTemp=Não foi possível criar um arquivo temporário. Instalação cancelada
LdrCannotExecTemp=Não foi possível executar um arquivo na pasta de arquivos temporários. Instalação cancelada

; *** Startup error messages
LastErrorMessage=%1.%n%nErro %2: %3
SetupFileMissing=O arquivo %1 não se encontra no diretório de instalação. Por favor, corrija o problema ou obtenha uma nova cópia do programa.
SetupFileCorrupt=Os arquivos de instalação estão corrompidos. Por favor, obtenha uma nova cópia do programa.
SetupFileCorruptOrWrongVer=Os arquivos de instalação estão corrompidos ou são incompatíveis com esta versão do Instalador. Por favor, corrija o problema ou obtenha uma nova cópia do programa.
InvalidParameter=Um parâmetro inválido foi passado na linha de comando:%n%n%1
SetupAlreadyRunning=O programa de instalação já está sendo executado.
WindowsVersionNotSupported=Este programa não suporta a versão do Windows instalada em seu computador.
WindowsServicePackRequired=Este programa necessita %1 Service Pack %2 ou posterior.
NotOnThisPlatform=Este programa não executará no %1.
OnlyOnThisPlatform=Este programa deve ser executado no %1.
OnlyOnTheseArchitectures=Este programa só pode ser instalado em versões do Windows projetadas para as seguintes arquiteturas de processador:%n%n%1
MissingWOW64APIs=A versão do Windows que você está executando não inclui a funcionalidade requerida pelo Programa de Instalação para realizar uma instalação de 64 bits. Para corrigir este problema, por favor instale o Service Pack %1.
WinVersionTooLowError=Este programa requer %1 versão %2 ou posterior.
WinVersionTooHighError=Este programa não pode ser instalado em %1 versão %2 ou posterior.
AdminPrivilegesRequired=Você deve estar logado como um administrador para instalar este programa.
PowerUserPrivilegesRequired=Você deve estar logado como um administrador ou como membro do grupo Usuários Avançados para instalar este programa.
SetupAppRunningError=O Programa de Instalação detectou que %1 está sendo executado.%n%nPor favor, feche todas as instâncias do programa agora e clique em OK para continuar, ou em Cancelar para sair.
UninstallAppRunningError=O Desinstalador detectou que %1 está em execução atualmente.%n%nPor favor, feche todas as instâncias dele agora, então clique em OK para continuar, ou em Cancelar para sair.

; *** Misc. errors
ErrorCreatingDir=O Programa de Instalação foi incapaz de criar o diretório "%1"
ErrorTooManyFilesInDir=Incapaz de criar um arquivo no diretório "%1" porque ele contém arquivos demais

; *** Setup common messages
ExitSetupTitle=Sair do Programa de Instalação
ExitSetupMessage=A Instalação não foi concluída. Se você sair agora, o programa não será instalado.%n%nVocê pode executar o Programa de instalação novamente em outra hora, para concluir a instalação.%n%nSair do Programa de Instalação?
AboutSetupMenuItem=&Sobre o Programa de Instalação...
AboutSetupTitle=Sobre o Programa de Instalação
AboutSetupMessage=%1 versão %2%n%3%n%n%1 página na internet:%n%4
AboutSetupNote=
TranslatorNote=

; *** Buttons
ButtonBack=< &Voltar
ButtonNext=&Avançar >
ButtonInstall=&Instalar
ButtonOK=OK
ButtonCancel=Cancelar
ButtonYes=&Sim
ButtonYesToAll=Sim para &Todos
ButtonNo=&Não
ButtonNoToAll=Nã&o para Todos
ButtonFinish=&Concluir
ButtonBrowse=&Procurar...
ButtonWizardBrowse=P&rocurar...
ButtonNewFolder=&Criar Nova Pasta

; *** "Select Language" dialog messages
SelectLanguageTitle=Selecionar Idioma do Programa de Instalação
SelectLanguageLabel=Selecione o idioma a ser utilizado durante a instalação:

; *** Common wizard text
ClickNext=Clique em Avançar para continuar, ou em Cancelar para sair do Programa de Instalação.
BeveledLabel=
BrowseDialogTitle=Procurar Pasta
BrowseDialogLabel=Selecione uma pasta na lista abaixo e clique em OK.
NewFolderName=Nova Pasta

; *** "Welcome" wizard page
WelcomeLabel1=Bem-vindo ao Assistente de Instalação de [name]
WelcomeLabel2=Este Assistente instalará [name/ver] no seu computador.%n%nÉ recomendado que você feche todos os outros aplicativos antes de continuar.

; *** "Password" wizard page
WizardPassword=Senha
PasswordLabel1=Esta instalação é protegida por senha.
PasswordLabel3=Por favor, forneça a senha e clique em Avançar para continuar. As senhas diferenciam maiúsculas de minúsculas.
PasswordEditLabel=&Senha:
IncorrectPassword=A senha que você informou não é correta. Por favor, tente novamente.

; *** "License Agreement" wizard page
WizardLicense=Contrato de Licença de Uso
LicenseLabel=Por favor, leia as seguintes informações importantes antes de continuar.
LicenseLabel3=Por favor, leia o seguinte Contrato de Licença de Uso. Você deve aceitar os termos do Contrato antes de prosseguir com a instalação.
LicenseAccepted=Eu aceito os termos do &Contrato
LicenseNotAccepted=Eu &não aceito os termos do Contrato

; *** "Information" wizard pages
WizardInfoBefore=Informação
InfoBeforeLabel=Por favor, leia as seguintes informações importantes antes de continuar.
InfoBeforeClickLabel=Quando você estiver pronto para continuar, clique em Avançar.
WizardInfoAfter=Informação
InfoAfterLabel=Por favor, leia as seguintes informações importantes antes de continuar.
InfoAfterClickLabel=Quando você estiver pronto para continuar, clique Avançar.

; *** "User Information" wizard page
WizardUserInfo=Informações do Usuário
UserInfoDesc=Por favor, insira suas informações.
UserInfoName=&Nome do Usuário:
UserInfoOrg=&Empresa:
UserInfoSerial=Número de &Série:
UserInfoNameRequired=Você deve informar um nome.

; *** "Select Destination Location" wizard page
WizardSelectDir=Selecione o Local de Destino
SelectDirDesc=Onde [name] deve ser instalado?
SelectDirLabel3=O Programa de Instalação instalará [name] na seguinte pasta.
SelectDirBrowseLabel=Para continuar, clique em Avançar. Se você deseja escolher uma pasta diferente, clique em Procurar.
DiskSpaceMBLabel=São necessários pelo menos [mb] MB de espaço livre em disco.
CannotInstallToNetworkDrive=O programa de instalação não pode fazer a instalação em uma unidade de rede.
CannotInstallToUNCPath=O programa de instalação não fazer a instalação num caminhho de rede UNC.
InvalidPath=Você deve informar um caminho completo, incluindo a letra da unidade de disco; por exemplo:%n%nC:\APP%n%e não um caminho de rede UNC na forma:%n%n\\servidor\compartilhamento
InvalidDrive=A unidade de disco ou compartilhamento de rede UNC que você selecionou não existe ou não está acessível. Por favor, selecione outro local.
DiskSpaceWarningTitle=Espaço em Disco Insuficiente
DiskSpaceWarning=O Programa de Instalação requer pelo menos %1 KB de espaço livre, mas a unidade de disco selecionada tem apenas %2 KB disponíveis.%n%nVocê quer continuar assim mesmo?
DirNameTooLong=O nome da pasta ou caminho é muito longo.
InvalidDirName=O nome da pasta não é válido.
BadDirName32=Nomes de pastas não podem incluir quaisquer dos seguintes caracteres:%n%n%1
DirExistsTitle=A Pasta Existe
DirExists=A pasta:%n%n%1%n%njá existe. Você quer instalar nesta pasta assim mesmo?
DirDoesntExistTitle=A Pasta Não Existe
DirDoesntExist=A pasta:%n%n%1%n%nnão existe. Você gostaria que a pasta fosse criada?

; *** "Select Components" wizard page
WizardSelectComponents=Selecionar Componentes
SelectComponentsDesc=Quais componentes devem ser instalados?
SelectComponentsLabel2=Selecione os componentes que você quer instalar; desmarque os componentes que você não quer instalar. Clique em Avançar quando estiver pronto para continuar.
FullInstallation=Instalação completa
; if possible don't translate 'Compact' as 'Minimal' (I mean 'Minimal' in your language)
CompactInstallation=Instalação compacta
CustomInstallation=Instalação personalizada
NoUninstallWarningTitle=Componente Existe
NoUninstallWarning=O Programa de Instalação detectou que os seguintes componentes já estão instalados em seu computador:%n%n%1%n%nDesmarcar estes componentes, não irá desinstalar eles.%n%nVocê quer continuar assim mesmo?
ComponentSize1=%1 KB
ComponentSize2=%1 MB
ComponentsDiskSpaceMBLabel=A seleção atual requer pelo menos [mb] MB de espaço em disco.

; *** "Select Additional Tasks" wizard page
WizardSelectTasks=Selecionar Tarefas Adicionais
SelectTasksDesc=Quais tarefas adicionais devem ser executadas?
SelectTasksLabel2=Selecione as tarefas adicionais que você deseja que o Programa de Instalação execute enquanto instala [name] e clique em Avançar.

; *** "Select Start Menu Folder" wizard page
WizardSelectProgramGroup=Selecionar a Pasta do Menu Iniciar
SelectStartMenuFolderDesc=Onde o Programa de Instalação deve colocar os atalhos do programa?
SelectStartMenuFolderLabel3=O Programa de Instalação irá criar os atalhos do programa na seguinte pasta do Menu Iniciar.
SelectStartMenuFolderBrowseLabel=Clique em Avançar para continuar. Se você quiser escolher outra pasta, clique em Procurar.
MustEnterGroupName=Você deve informar um nome de pasta.
GroupNameTooLong=O nome da pasta ou caminho é muito longo.
InvalidGroupName=O nome da pasta não é válido.
BadGroupName=O nome da pasta não pode incluir quaisquer dos seguintes caracteres:%n%n%1
NoProgramGroupCheck2=&Não criar uma pasta no Menu Iniciar

; *** "Ready to Install" wizard page
WizardReady=Pronto para Instalar
ReadyLabel1=O Programa de Instalação está pronto para começar a instalação de [name] no seu computador.
ReadyLabel2a=Clique Instalar para iniciar a instalação, ou clique em Voltar se você quer revisar ou alterar alguma configuração.
ReadyLabel2b=Clique em Instalar para iniciar a instalação.
ReadyMemoUserInfo=Dados do Usuário:
ReadyMemoDir=Local de destino:
ReadyMemoType=Tipo de Instalação:
ReadyMemoComponents=Componentes selecionados:
ReadyMemoGroup=Pasta do Menu Iniciar:
ReadyMemoTasks=Tarefas adicionais:

; *** "Preparing to Install" wizard page
WizardPreparing=Preparando para Instalar
PreparingDesc=O Programa de Instalação está se preparando para instalar [name] no seu computador.
PreviousInstallNotCompleted=A instalação/remoção de um programa anterior não foi concluída. Você precisará reiniciar seu computador para finalizá-la.%n%nApós reiniciar o computador, execute novamente o Programa de Instalação para concluir a instalação de [name].
CannotContinue=O Programa de Instalação não pode continuar. Por favor, clique em Cancelar para sair.
ApplicationsFound=As seguintes aplicações estap usando arquivos que necessitam ser atualizados pelo programa de instalação. É recomendável que você permita que o programa da instalação encerre automaticamente estas aplicações.
ApplicationsFound2=As seguintes aplicações estão usandos arquivos que necessitam ser atualizados pelo programa de instalação. É recomendável que você permita que o programa da instalação encerre automaticamente estas aplicações. Após a instalação estar completa, o programa de instalação tentará iniciar novamente as aplicações.
CloseApplications=&Automaticamente encerre as aplicações
DontCloseApplications=&Não encerre as aplicações
ErrorCloseApplications=O instalador foi incapaz de fechar automaticamente todos os aplicativos. É recomendado que você feche todos os aplicativos usando os arquivos que precisam ser atualizados pelo Instalador antes de continuar.

; *** "Installing" wizard page
WizardInstalling=Instalando
InstallingLabel=Por favor, aguarde enquanto o Programa de Instalação instala [name] no seu computador.

; *** "Setup Completed" wizard page
FinishedHeadingLabel=Finalizando o Assistente de Instalação de [name]
FinishedLabelNoIcons=O Programa de Instalação finalizou a instalação de [name] no seu computador.
FinishedLabel=O Programa de Instalação terminou de instalar [name] no seu computador. O programa pode ser iniciado clicando nos ícones instalados.
ClickFinish=Clique em Concluir para sair do Programa de Instalação.
FinishedRestartLabel=Para concluir a instalação de [name], o Programa de Instalação deve reiniciar o computador. Você gostaria de reiniciar agora?
FinishedRestartMessage=Para concluir a instalação de [name], o Programa de Instalação deve reiniciar o computador.%n%nVocê gostaria de reiniciar agora?
ShowReadmeCheck=Sim, eu quero visualizar o arquivo LEIA-ME
YesRadio=&Sim, reiniciar o computador agora
NoRadio=&Não, eu vou reiniciar o computador depois
; used for example as 'Run MyProg.exe'
RunEntryExec=Executar %1
; used for example as 'View Readme.txt'
RunEntryShellExec=Visualizar %1

; *** "Setup Needs the Next Disk" stuff
ChangeDiskTitle=O Programa de Instalação Precisa do Próximo Disco
SelectDiskLabel2=Por favor, insira o Disco %1 e clique em OK.%n%nSe os arquivos deste disco estão numa pasta diferente da indicada abaixo, informe o caminho correto ou clique em Procurar.
PathLabel=&Caminho:
FileNotInDir2=O arquivo "%1" não pôde ser encontrado em "%2". Por favor, insira o disco correto ou escolha outra pasta.
SelectDirectoryLabel=Por favor, informe o local do próximo disco.

; *** Installation phase messages
SetupAborted=A instalação não foi concluída.%n%nPor favor, corrija o problema e execute novamente o Programa de Instalação.
EntryAbortRetryIgnore=Clique Repetir para tentar novamente, Ignorar para continuar assim mesmo, or Cancelar para cancelar a instalação.

; *** Installation status messages
StatusClosingApplications=Encerrando aplicações...
StatusCreateDirs=Criando diretórios...
StatusExtractFiles=Extraindo arquivos...
StatusCreateIcons=Criando atalhos...
StatusCreateIniEntries=Criando entradas INI...
StatusCreateRegistryEntries=Criando entradas no Registro...
StatusRegisterFiles=Registrando arquivos...
StatusSavingUninstall=Salvando informações de desinstalação...
StatusRunProgram=Finalizando a instalação...
StatusRestartingApplications=Reiniciando applicações...
StatusRollback=Desfazendo as alterações efetuadas...

; *** Misc. errors
ErrorInternal2=Erro interno: %1
ErrorFunctionFailedNoCode=%1 falhou
ErrorFunctionFailed=%1 falhou; código %2
ErrorFunctionFailedWithMessage=%1 falhou; código %2.%n%3
ErrorExecutingProgram=Não foi possível executar o arquivo:%n%1

; *** Registry errors
ErrorRegOpenKey=Erro ao abrir a chave do registro:%n%1\%2
ErrorRegCreateKey=Erro ao criar a chave do registro:%n%1\%2
ErrorRegWriteKey=Erro ao escrever na chave do registro:%n%1\%2

; *** INI errors
ErrorIniEntry=Erro ao criar entrada INI no arquivo "%1".

; *** File copying errors
FileAbortRetryIgnore=Clique em Repetir para tentar novamente, em Ignorar para ignorar este arquivo (não recomendado) ou em Cancelar para cancelar a instalação.
FileAbortRetryIgnore2=Clique em Repetir para tentar novamente, em Ignorar para ignorar este arquivo (não recomendado) ou em Cancelar para cancelar a instalação.
SourceIsCorrupted=O arquivo de origem está corrompido
SourceDoesntExist=O arquivo de origem "%1" não existe
ExistingFileReadOnly=O arquivo existente está marcado como somente leitura.%n%nClique em Repetir para remover o atributo de somente leitura e tentar novamente, em Ignorar para ignorar este arquivo, ou em Anular para cancelar a instalação.
ErrorReadingExistingDest=Ocorreu um erro ao tentar ler o arquivo existente:
FileExists=O arquivo já existe.%n%nVocê quer que o Programa de Instalação sobrescreva o arquivo?
ExistingFileNewer=O arquivo já existente é mais recente do que o arquivo que o Programa de Instalação está tentando instalar. Recomenda-se que você mantenha o arquivo existente.%n%nVocê quer manter o arquivo existente?
ErrorChangingAttr=Ocorreu um erro ao tentar modificar os atributos do arquivo existente:
ErrorCreatingTemp=Ocorreu um erro ao tentar criar um arquivo nao diretório de destino:
ErrorReadingSource=Ocorreu um erro ao tentar ler o arquivo de origem:
ErrorCopying=Ocorreu um erro ao tentar copiar um arquivo:
ErrorReplacingExistingFile=Ocorreu um erro ao tentar substituir o arquivo existente:
ErrorRestartReplace=Reiniciar/Substituir falhou:
ErrorRenamingTemp=Ocorreu um erro ao tentar renomear um arquivo no diretório de destino:
ErrorRegisterServer=Não foi possível registrar a DLL/OCX: %1
ErrorRegSvr32Failed=RegSvr32 falhou com o código de saída %1
ErrorRegisterTypeLib=Não foi possível registrar a biblioteca de tipos: %1

; *** Post-installation errors
ErrorOpeningReadme=Ocorreu um erro ao tentar abrir o arquivo LEIA-ME.
ErrorRestartingComputer=O Programa de Instalação não conseguiu reiniciar o computador. Por favor, reinicie o computador manualmente.

; *** Uninstaller messages
UninstallNotFound=O arquivo "%1" não existe. Não é possível desinstalar.
UninstallOpenError=O arquivo "%1" não pode ser aberto. Não é possível desinstalar
UninstallUnsupportedVer=O arquivo de log de desinstalação "%1" está num formato não reconhecido por esta versão do desinstalador. Não é possível desinstalar
UninstallUnknownEntry=Foi encontrada uma entrada desconhecida (%1) no arquivo de log de desinstalação
ConfirmUninstall=Você tem certeza que deseja remover completamente %1 e todos os seus componentes?
UninstallOnlyOnWin64=Esta instalação não pode ser desinstalada em Windows 64 bits.
OnlyAdminCanUninstall=Esta instalação só pode ser desinstalada por usuários com direitos administrativos.
UninstallStatusLabel=Por favor, aguarde enquanto %1 é removido do seu computador.
UninstalledAll=%1 foi removido com sucesso do seu computador.
UninstalledMost=A desinstalação de %1 foi concluída.%n%nAlguns elementos não puderam ser removidos. Estes podem ser removidos manualmente.
UninstalledAndNeedsRestart=Para concluir a desinstalação de %1, o computador deve ser reiniciado.%n%nVocê quer que o computador seja reiniciado agora?
UninstallDataCorrupted=O arquivo "%1" está corrompido. Não é possível desinstalar

; *** Uninstallation phase messages
ConfirmDeleteSharedFileTitle=Remover Arquivo Compartilhado?
ConfirmDeleteSharedFile2=O sistema indica que o seguinte arquivo compartilhado não está mais em uso por nenhum outro programa. Você quer que a desinstalação remova este arquivo compartilhado?%n%nSe ainda houver programas utilizando este arquivo e ele for removido, esses programas poderão não funcionar corretamente. Se você não tem certeza, escolha Não. Manter o arquivo no seu computador não trará prejuízo algum.
SharedFileNameLabel=Nome do arquivo:
SharedFileLocationLabel=Local:
WizardUninstalling=Status da Desinstalação
StatusUninstalling=Desinstalando %1...

; *** Shutdown block reasons
ShutdownBlockReasonInstallingApp=Instalando %1.
ShutdownBlockReasonUninstallingApp=Removendo %1.

; The custom messages below aren't used by Setup itself, but if you make
; use of them in your scripts, you'll want to translate them.

[CustomMessages]

NameAndVersion=%1 versão %2
AdditionalIcons=Ícones adicionais:
CreateDesktopIcon=Criar um ícone na Área de &Trabalho
CreateQuickLaunchIcon=Criar um ícone na &Barra de Inicialização Rápida
ProgramOnTheWeb=%1 na Internet
UninstallProgram=Desinstalar %1
LaunchProgram=Executar %1
AssocFileExtension=Associar %1 com a e&xtensão de arquivo %2
AssocingFileExtension=Associando %1 com a extensão de arquivo...
AutoStartProgramGroupDescription=Startup:
AutoStartProgram=Iniciar automaticamente %1
AddonHostProgramNotFound=%1 não pôde ser localizado na pasta que você selecionou.%n%nVocê deseja continuar assim mesmo?
