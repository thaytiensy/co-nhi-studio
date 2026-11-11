@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo    CO NHI STUDIO - AUTOMATED VERIFICATION SCRIPT (WINDOWS)
echo ==========================================================

echo [1/4] Kiem tra TypeScript (Strict Types)...
call npm run typecheck
if %errorlevel% neq 0 (
    echo [-] LOI: TypeScript Typecheck that bai!
    node -e "const fs = require('fs'); fs.writeFileSync('HANDOFF.json', JSON.stringify({status:'failed',phase:'typecheck',time:new Date().toISOString()}, null, 2));"
    exit /b 1
)
echo [+] TypeScript Typecheck: 0 loi.

echo [2/4] Kiem tra Cu phap (Linter)...
call npm run lint
if %errorlevel% neq 0 (
    echo [-] LOI: Linter phat hien vi pham!
    node -e "const fs = require('fs'); fs.writeFileSync('HANDOFF.json', JSON.stringify({status:'failed',phase:'lint',time:new Date().toISOString()}, null, 2));"
    exit /b 1
)
echo [+] Linter: 0 loi.

echo [3/4] Chay kiem thu tu dong (Unit & Integration Tests)...
call npm test
if %errorlevel% neq 0 (
    echo [-] LOI: Bo kiem thu tu dong that bai!
    node -e "const fs = require('fs'); fs.writeFileSync('HANDOFF.json', JSON.stringify({status:'failed',phase:'tests',time:new Date().toISOString()}, null, 2));"
    exit /b 1
)
echo [+] Test Suite: 100%% Passed.

echo [4/4] Kiem tra Dong goi San pham (Production Build)...
call npm run build
if %errorlevel% neq 0 (
    echo [-] LOI: Dong goi Production Build that bai!
    node -e "const fs = require('fs'); fs.writeFileSync('HANDOFF.json', JSON.stringify({status:'failed',phase:'build',time:new Date().toISOString()}, null, 2));"
    exit /b 1
)
echo [+] Build: Thanh cong 100%%.

echo ==========================================================
echo    XAC MINH HOAN TAT: 0 LOI - DONG GOI HOAN HAO
echo ==========================================================
exit /b 0
