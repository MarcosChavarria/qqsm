@echo off
setlocal

cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8000/QQSM.HTML"
  py -m http.server 8000
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8000/QQSM.HTML"
  python -m http.server 8000
  goto :eof
)

echo Python no esta instalado o no esta en PATH.
echo Instala Python y vuelve a ejecutar este archivo.
pause
