@echo off
SET "INPUT_FOLDER=%cd%\..\data\tinyPNGAssets\original" 
for /R "%INPUT_FOLDER%" %%f in (*) do (if not "%%~xf"==".png" del "%%~f")
echo Press any key to exit...
pause >nul