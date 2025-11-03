# Deployment Health Check Script
# This script helps diagnose deployment issues

Write-Host "🔍 Game Store Deployment Health Check`n" -ForegroundColor Cyan

# URLs - UPDATE THESE WITH YOUR ACTUAL VERCEL URLS
$BACKEND_URL = "https://game-store-tau-topaz.vercel.app"  # Update this
$FRONTEND_URL = "https://gamestore-frontend-9lqdnafbi-akils-projects-18747810.vercel.app"  # Update this

Write-Host "📍 Checking URLs:" -ForegroundColor Yellow
Write-Host "   Backend:  $BACKEND_URL"
Write-Host "   Frontend: $FRONTEND_URL`n"

# Test 1: Backend Health
Write-Host "1️⃣ Testing Backend Health..." -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/api/health" -TimeoutSec 10
    Write-Host "   ✅ Backend is UP" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend is DOWN or unreachable" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Games API
Write-Host "`n2️⃣ Testing Games API..." -ForegroundColor Green
try {
    $games = Invoke-RestMethod -Uri "$BACKEND_URL/api/games?limit=5" -TimeoutSec 10
    Write-Host "   ✅ Games API working" -ForegroundColor Green
    Write-Host "   Total games: $($games.pagination.total)" -ForegroundColor Gray
    Write-Host "   Sample games:" -ForegroundColor Gray
    $games.games | Select-Object -First 3 | ForEach-Object {
        Write-Host "      - $($_.title) (₹$($_.price))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Games API failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Frontend
Write-Host "`n3️⃣ Testing Frontend..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri $FRONTEND_URL -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is accessible" -ForegroundColor Green
        Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Frontend is not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Local Configuration
Write-Host "`n4️⃣ Checking Local Configuration..." -ForegroundColor Green

$backendEnv = Get-Content "backend\.env" -Raw
if ($backendEnv -match 'FRONTEND_URL=(.+)') {
    $configuredFrontend = $matches[1].Trim()
    Write-Host "   Backend expects frontend: $configuredFrontend" -ForegroundColor Gray
    if ($configuredFrontend -eq $FRONTEND_URL) {
        Write-Host "   ✅ Local config matches deployed frontend" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Local config MISMATCH" -ForegroundColor Yellow
    }
}

if (Test-Path "frontend\.env.production") {
    $frontendEnv = Get-Content "frontend\.env.production" -Raw
    if ($frontendEnv -match 'VITE_API_URL=(.+)') {
        $configuredBackend = $matches[1].Trim()
        Write-Host "   Frontend expects backend: $configuredBackend" -ForegroundColor Gray
        if ($configuredBackend -eq $BACKEND_URL) {
            Write-Host "   ✅ Frontend config matches deployed backend" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Frontend config MISMATCH" -ForegroundColor Yellow
        }
    }
}

# Test 5: File Configuration Check
Write-Host "`n5️⃣ Checking Configuration Files..." -ForegroundColor Green

$issues = @()

# Check vercel.json
if (Test-Path "frontend\vercel.json") {
    $vercelConfig = Get-Content "frontend\vercel.json" -Raw | ConvertFrom-Json
    if ($vercelConfig.rewrites) {
        $proxyUrl = $vercelConfig.rewrites[0].destination
        Write-Host "   Frontend proxy points to: $proxyUrl" -ForegroundColor Gray
        if ($proxyUrl -notmatch [regex]::Escape($BACKEND_URL)) {
            $issues += "vercel.json proxy URL doesn't match backend URL"
            Write-Host "   ⚠️  Proxy URL mismatch!" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ Proxy configuration correct" -ForegroundColor Green
        }
    }
}

# Summary
Write-Host "`n" + ("="*50) -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host ("="*50) -ForegroundColor Cyan

if ($issues.Count -eq 0) {
    Write-Host "✅ No configuration issues found!" -ForegroundColor Green
    Write-Host "`nIf data still not showing:" -ForegroundColor Yellow
    Write-Host "1. Check Vercel environment variables match local .env files"
    Write-Host "2. Redeploy both backend and frontend"
    Write-Host "3. Check browser console for CORS errors"
} else {
    Write-Host "⚠️  Issues found:" -ForegroundColor Yellow
    $issues | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host "`n📖 See DEPLOYMENT_FIXES.md for solutions" -ForegroundColor Cyan
}

Write-Host "`n💡 Quick Fixes:" -ForegroundColor Cyan
Write-Host "   - Update backend FRONTEND_URL in Vercel: $FRONTEND_URL"
Write-Host "   - Update frontend VITE_API_URL in Vercel: $BACKEND_URL"
Write-Host "   - Make sure URLs match in vercel.json files"
Write-Host "`n🔧 After making changes, redeploy both apps in Vercel!`n"
