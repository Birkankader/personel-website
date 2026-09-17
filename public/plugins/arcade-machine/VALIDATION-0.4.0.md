# 0.4.0 ortak sunucu doğrulaması

17 Eylül 2026. Hedef: Arcade Machine ve Haftanın Seyirliği’nin tek sunucuda çalışması, yerel masaüstü yönetimi ve Windows dağıtımı.

Sonuç: **48 sunucu/GUI testi + 2 Arcade eklenti entegrasyon testi = 50 test geçti**, hata veya atlanan test yok. Yönetim penceresi `result.txt` kaydı **PASS**. Haftanın Seyirliği 0.2.0 gerçek IntelliJ akış testi de ortak Ktor sunucusuna karşı **PASS** verdi; öneri, oy, seçim, izledim ve PasswordSafe ile yeniden bağlanma kontrol edildi. Eklenti ZIP’i ve ortak sunucu JAR’ı derlendi.

Doğrulama komutları:

```sh
./gradlew :server:test :plugin:test :server:fatJar -PguiSmoke
python3 scripts/package-server.py
python3 scripts/package-server.py --windows-runtime .tools/windows-runtime/jdk-21.0.12.1+1-jre
```

Mevcut oyun kuralları/HTTP/WebSocket testlerine ortak hizmetler, film oylaması, İstanbul hafta sınırı, eski tur isteği, yetki izolasyonu, engel kalıcılığı, 5 dakika atma, aktif WebSocket kapatma, film sahipliği, eski JSON aktarımı, canlı yedek ve port çakışması/restart testleri eklendi.

`-PguiSmoke` gerçek bir masaüstü oturumu gerektirir. `ServerWindowSmokeTest` native pencereyi açar, Başlat düğmesiyle sunucuyu başlatır, iki uygulamanın üyelerini listeler, seçili oyuncuyu 5 dakika atar ve HTTP 403 aldığını doğrular. Kontrollü ERROR kaydını log ekranında bulur; Durdur düğmesiyle portun kapandığını kontrol eder. Başarı dosyası: `server/build/gui-smoke/result.txt`. PNG’ler aynı klasördedir.

Windows x64 çalışma ortamı resmi Eclipse Adoptium Temurin 21.0.12.1+1 JRE dağıtımından alınır. Kaynak ZIP SHA-256: `d35f31e712f0fcf6ac5a093edc90204fbff22f720ba3950bd09d331d5e621636`; indirilen içerik resmi `.sha256.txt` ile karşılaştırılır. Paket runtime lisans dosyalarını içerir.

macOS ARM64 + JDK 21 üzerinde yapılan kontroller Windows çalıştırması anlamına gelmez. Windows `.bat`/PowerShell/VBS başlatıcıları, gerçek ekip ağı ve Windows yerel görünümü hedef Windows makinesinde ayrıca denenmelidir. Marketplace veya mevcut güncelleme sitesine yayın yapılmadı.
