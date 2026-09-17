# 0.4.2 Sudoku ve sade menü doğrulaması

17 Eylül 2026. Bu koşu 0.4.0 ile eklenen ortak Ktor/SQLite sunucusu ve yerel yönetim arayüzü üzerinde yapıldı; ayrı bir oyun sunucusu oluşturulmadı.

Bu yayın sürümü, 0.4.1 adıyla yerel olarak doğrulanan Sudoku değişikliklerini 0.4.2 sürüm numarasıyla paketler. Aşağıdaki oyun akışı kanıtları aynı kod içindir.

## Sonuç

- **59 JVM testi geçti:** 53 sunucu (yerel yönetim penceresi dahil), 2 modern eklenti, 4 legacy eklenti. Hata ve atlanan test yok.
- **6 JavaScript testi geçti.** Sudoku satır/sütun/kutu çakışmaları ile mevcut kelime ve çizim yardımcıları doğrulandı.
- **Gerçek IntelliJ 2024.3.6 / JCEF: PASS, 215 kontrol.** Dört oyunun menü sırası, 100 px altında menü butonları, Sudoku sayı girişi ve silmenin sunucuya kaydı, 320 px panelde taşmama; mevcut kelime, karşılaştırma, çizim, yeniden bağlanma ve tema akışları çalıştı.
- **Yerel sunucu yönetim penceresi: PASS.** Başlatma, ortak hizmet üye listesi, geçici oyuncu çıkarma, hata logu ve durdurma doğrulandı.
- **Native Swing legacy: PASS.** Sudoku hücresi/sayı/sil kontrolü, diğer oyunlar, davet ve yeniden bağlanma gerçek yerel sunucuya karşı test edildi. Bu koşu Java 21 üzerinde Swing panel testidir; IntelliJ 2019 çalıştırması değildir.
- Modern eklenti ZIP'i, legacy ZIP'i ve ortak sunucu JAR'ı derlendi; modern plugin yapı kontrolü geçti.

## Sudoku davranışı

30 kontrollü rastgele örnekte tüm satır/sütun/kutular geçerli ve bulmacalar tek çözümlü. Aynı İstanbul günü herkes aynı bulmacayı alır. İlerleme oyuncuya özeldir ve veritabanı yeniden açılınca korunur. İstanbul gece yarısında yeni bulmaca oluşur; eski gün isteği reddedilir.

Sabit hücre, geçersiz değer ve eşzamanlı eski revizyon reddedilir. Sayı silme kalıcıdır. API yanıtlarında çözüm bulunmaz. Yalnızca tam çözüm puan verir; günlük bitirenler eşit sıradadır. Eski genel sıralama isteği SUDOKU enum'u içermez; yeni eklentiler `includeSudoku=true` ile dört oyunu alır. Eski sunucuda yeni eklenti mevcut oyunları sürdürür ve Sudoku ekranında güncelleme mesajı gösterir.

## Komutlar ve kanıtlar

JDK 21 seçilerek:

```sh
./gradlew test :plugin:buildPlugin :plugin:verifyPluginStructure :plugin-legacy:buildPlugin :server:fatJar
node --check plugin/src/main/resources/web/app.js
node --test plugin/src/test/js/core.test.cjs
./gradlew :server:test -PguiSmoke
./gradlew :plugin:runIde -PuiSmoke
python3 scripts/package-server.py
python3 scripts/package-server.py --windows-runtime .tools/windows-runtime/jdk-21.0.12.1+1-jre
```

IDE testi için port 8878'de geçici veritabanıyla izole sunucu başlatıldı. Üretim veritabanı kullanılmadı.

- JUnit: `server/build/test-results/test/`, `plugin/build/test-results/test/`, `plugin-legacy/build/test-results/test/`.
- IDE: `plugin/build/ui-smoke/result.txt`; incelenen görüntüler `home-dark.png`, `sudoku-dark.png`, `sudoku-narrow.png`.
- Legacy: `plugin-legacy/build/ui-smoke/result.txt`, `sudoku.png`.
- Yönetim: `server/build/gui-smoke/result.txt`.

## Kurulum ve sınır

Ortak sunucuyu kapatıp veritabanını yedekleyin; 0.4.2 paketinde aynı veritabanı ve ayar yollarını kullanın. İki yeni Sudoku tablosu otomatik eklenir; diğer oyun ve film verileri korunur. Eklentiler aynı sunucu adresinde kalır. Windows paketi mevcut doğrulanmış Windows x64 Java 21 runtime'ını içerir. Windows çalıştırması, gerçek ekip ağı ve IntelliJ 2019 içinde bu sürümün kurulumu bu oturumda denenmedi. Güncelleme sitesine yayın yapılmadı.
