$ErrorActionPreference = 'Stop'

$buildDir   = "C:\Projects\PropertyAnalytics\property-analytics-frontend"
$publishDir = "\\DESKTOP-7B0NR97\inetpub\wwwroot\PropertyAnalytics"

Write-Host ">>> Provjera mrežnog patha..."
if (-not (Test-Path $publishDir)) {
    Write-Error "Mrežni path nije dostupan: $publishDir"
    exit 1
}

Write-Host ">>> Brisanje starog builda..."
Get-ChildItem -Path $publishDir -Force | Remove-Item -Recurse -Force

Write-Host ">>> Build frontenda..."
Set-Location $buildDir
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "npm run build failed"; exit 1 }

Write-Host ">>> Kopiranje u publish folder..."
Copy-Item -Path "$buildDir\dist\*" -Destination $publishDir -Recurse -Force

Write-Host ">>> DONE: Frontend publishan."
