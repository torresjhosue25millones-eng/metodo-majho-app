# Script de inicio del Metodo MAJHO
Write-Host "Iniciando Metodo MAJHO App..." -ForegroundColor Magenta

# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm install; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm install; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "La app estara disponible en:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
