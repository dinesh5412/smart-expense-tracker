@echo off
setlocal enabledelayedexpansion
echo ===================================================
echo   Smart Expense ^& Budget Tracker - Spring Boot
echo ===================================================
cd /d "%~dp0backend"

set ACTIVE_PROFILE=h2
if "%~1"=="mysql" set ACTIVE_PROFILE=default

echo.
echo Starting Spring Boot backend with profile [%ACTIVE_PROFILE%]...
echo API server will be available at: http://localhost:8080/api
echo.

if exist "mvnw.cmd" (
    echo Using project Maven Wrapper (mvnw.cmd)...
    if "%ACTIVE_PROFILE%"=="h2" (
        call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2
    ) else (
        call mvnw.cmd spring-boot:run
    )
    goto END
)

where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Using system Maven...
    if "%ACTIVE_PROFILE%"=="h2" (
        call mvn spring-boot:run -Dspring-boot.run.profiles=h2
    ) else (
        call mvn spring-boot:run
    )
    goto END
)

for /r "%USERPROFILE%\.m2\wrapper\dists" %%f in (mvn.cmd) do (
    if exist "%%f" (
        echo Found Maven in user .m2 cache: %%f
        if "%ACTIVE_PROFILE%"=="h2" (
            call "%%f" spring-boot:run -Dspring-boot.run.profiles=h2
        ) else (
            call "%%f" spring-boot:run
        )
        goto END
    )
)

echo [ERROR] Maven not found.
echo Please run: cd backend ^&^& .\mvnw.cmd spring-boot:run
pause

:END
