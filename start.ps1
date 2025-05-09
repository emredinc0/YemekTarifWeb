# Çalışan API'yi durdur
$process = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Name "dotnet" -Force
    Start-Sleep -Seconds 2
}

# API'yi başlat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd YemekTarifiSitesi.API; dotnet run"

# 2 saniye bekle (API'nin başlaması için)
Start-Sleep -Seconds 2

# Web sunucusunu 5000 portunda başlat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx serve -l 5000"

# 2 saniye bekle (Web sunucusunun başlaması için)
Start-Sleep -Seconds 2

# Chrome'u aç (sadece web ve Swagger)
Start-Process "chrome.exe" -ArgumentList "http://localhost:5000"
Start-Process "chrome.exe" -ArgumentList "http://localhost:5111/swagger" 