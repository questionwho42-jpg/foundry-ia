# Script para copiar arquivos do desenvolvimento para o Foundry VTT
# Execute após fazer alterações nos arquivos

$foundryModulePath = "$env:LOCALAPPDATA\FoundryVTT\Data\modules\ai-dungeon-master-pf2e"

Write-Host "🚀 Copiando arquivos para o Foundry VTT..." -ForegroundColor Cyan

# Copiar scripts
Copy-Item "C:\foundry-ia\scripts\*" -Destination "$foundryModulePath\scripts\" -Force
Write-Host "✅ Scripts copiados" -ForegroundColor Green

# Copiar templates (se houver alterações)
if (Test-Path "C:\foundry-ia\templates") {
    Copy-Item "C:\foundry-ia\templates\*" -Destination "$foundryModulePath\templates\" -Force
    Write-Host "✅ Templates copiados" -ForegroundColor Green
}

# Copiar styles (se houver alterações)
if (Test-Path "C:\foundry-ia\styles") {
    Copy-Item "C:\foundry-ia\styles\*" -Destination "$foundryModulePath\styles\" -Force
    Write-Host "✅ Estilos copiados" -ForegroundColor Green
}

# Copiar module.json
Copy-Item "C:\foundry-ia\module.json" -Destination "$foundryModulePath\module.json" -Force
Write-Host "✅ module.json copiado" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Deploy completo!" -ForegroundColor Yellow
Write-Host "⚠️  Recarregue o Foundry com Ctrl+Shift+R" -ForegroundColor Yellow
Write-Host ""
