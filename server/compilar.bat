@echo off
echo Compilando...
javac ChatServer.java ClientHandler.java
if %ERRORLEVEL% EQU 0 (
    echo OK
) else (
    echo Erro de compilacao.
)
pause
