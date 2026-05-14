$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
Set-Location -Path $ScriptDir

if (-Not (Test-Path -Path "node_modules" -PathType Container)) {
    Write-Host "Root dependencies are missing. Run: npm install" -ForegroundColor Red
    exit 1
}

if (-Not (Test-Path -Path "backend\node_modules" -PathType Container)) {
    Write-Host "Backend dependencies are missing. Run: npm --prefix backend install" -ForegroundColor Red
    exit 1
}

if (-Not (Test-Path -Path ".env" -PathType Leaf)) {
    if (Test-Path -Path ".env.example" -PathType Leaf) {
        Copy-Item -Path ".env.example" -Destination ".env"
        Write-Host ".env was missing - copied from .env.example." -ForegroundColor Yellow
        Write-Host "Edit .env and set JWT_SECRET to a random value before exposing this app." -ForegroundColor Yellow
    } else {
        Write-Host ".env is missing and no .env.example found. Cannot start backend." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting Vela development servers..." -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan

npm run dev
