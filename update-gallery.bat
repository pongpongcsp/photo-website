@echo off
setlocal
cd /d "%~dp0"

if exist "C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  "C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" generate-gallery.js
) else (
  node generate-gallery.js
)

pause
