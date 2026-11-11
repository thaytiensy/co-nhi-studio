#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "   CO NHI STUDIO - AUTOMATED VERIFICATION SCRIPT          "
echo "=========================================================="

# 1. Kiểm tra Git Baseline
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[-] Khoi tao Git Repository baseline..."
  git init
  git add .
  git commit -m "chore: initial baseline commit" || true
fi

# 2. Kiểm tra TypeScript Types (Strict Zero Any)
echo "[1/4] Kiem tra TypeScript (Strict Types)..."
if ! npm run typecheck; then
  echo "[-] LOI: TypeScript Typecheck that bai!"
  node -e '
    const fs = require("fs");
    const report = { status: "failed", phase: "typecheck", time: new Date().toISOString() };
    fs.writeFileSync("HANDOFF.json", JSON.stringify(report, null, 2));
  '
  exit 1
fi
echo "[+] TypeScript Typecheck: 0 loi."

# 3. Kiem tra Cu phap (Lint)
echo "[2/4] Kiem tra Cu phap (Linter)..."
if ! npm run lint; then
  echo "[-] LOI: Linter phat hien vi pham!"
  node -e '
    const fs = require("fs");
    const report = { status: "failed", phase: "lint", time: new Date().toISOString() };
    fs.writeFileSync("HANDOFF.json", JSON.stringify(report, null, 2));
  '
  exit 1
fi
echo "[+] Linter: 0 loi."

# 4. Chay Bo Test Runner
echo "[3/4] Chay kiem thu tu dong (Unit & Integration Tests)..."
if ! npm test; then
  echo "[-] LOI: Bo kiem thu tu dong that bai!"
  node -e '
    const fs = require("fs");
    const report = { status: "failed", phase: "tests", time: new Date().toISOString() };
    fs.writeFileSync("HANDOFF.json", JSON.stringify(report, null, 2));
  '
  exit 1
fi
echo "[+] Test Suite: 100% Passed."

# 5. Kiem tra Dong goi San pham (Vite Production Build)
echo "[4/4] Kiem tra Dong goi San pham (Production Build)..."
if ! npm run build; then
  echo "[-] LOI: Dong goi Production Build that bai!"
  node -e '
    const fs = require("fs");
    const report = { status: "failed", phase: "build", time: new Date().toISOString() };
    fs.writeFileSync("HANDOFF.json", JSON.stringify(report, null, 2));
  '
  exit 1
fi
echo "[+] Build: Thanh cong 100%."

echo "=========================================================="
echo "   XAC MINH HOAN TAT: 0 LOI - SAN SANG CHECKPOINT          "
echo "=========================================================="
