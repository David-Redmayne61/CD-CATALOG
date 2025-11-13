# CD Catalog Deployment Script
# This script builds and deploys the web app to Firebase Hosting

Write-Host "🔨 Building web application..." -ForegroundColor Cyan
npx expo export --platform web

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Fixing overflow issue in index.html..." -ForegroundColor Cyan
(Get-Content dist\index.html) -replace 'overflow: hidden;', 'overflow: auto;' | Set-Content dist\index.html

Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Cyan
npx firebase deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your app is live at: https://cd-catalog.web.app" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
