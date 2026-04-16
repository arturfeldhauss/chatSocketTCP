@echo off
echo Compilando servidor Java...
javac ChatServer.java ClientHandler.java
if %ERRORLEVEL% EQU 0 (
    echo Compilacao concluida com sucesso!
) else (
    echo ERRO na compilacao. Verifique se o Java JDK esta instalado e no PATH.
)
pause
