$ErrorActionPreference = 'Stop'

$apiDir     = "C:\Projects\PropertyAnalytics\src\PropertyAnalytics.API"
$tmpDir     = "C:\tmp\property-analytics-backend-publish"
$publishDir = "\\DESKTOP-7B0NR97\inetpub\wwwroot\PropertyAnalyticsWS"

Write-Host ">>> Provjera mrežnog patha..."
if (-not (Test-Path $publishDir)) {
    Write-Error "Mrežni path nije dostupan: $publishDir"
    exit 1
}

Write-Host ">>> dotnet publish..."
Set-Location $apiDir
dotnet publish PropertyAnalytics.API.csproj -c Release -o $tmpDir
if ($LASTEXITCODE -ne 0) { Write-Error "dotnet publish failed"; exit 1 }

Write-Host ">>> Kopiranje u publish folder..."
Copy-Item -Path "$tmpDir\*" -Destination $publishDir -Recurse -Force

Write-Host ">>> IIS reset..."
Invoke-Command -ComputerName DESKTOP-7B0NR97 -ScriptBlock { iisreset }

Write-Host ">>> DONE: Backend publishan."
