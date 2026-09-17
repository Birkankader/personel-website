# Ortak sunucu ve Windows yönetim penceresi

Arcade Machine **0.4.0** oyun API’lerini ve Haftanın Seyirliği API’sini **tek JVM, tek port, tek SQLite veritabanında** sunar. Film panosu için Node.js gerekmez. Mevcut Arcade eklentilerinin oyun protokolü korunur; iki eklentiye de aynı `http://SUNUCU_IP:8787` adresini yazın. İki eklentinin üyelikleri ayrı tutulur ve yönetim listesinde uygulama adıyla ayırt edilir.

## Windows’ta başlatma

1. [Windows x64 paketini](arcade-machine-server-0.4.0-windows-x64-87c2d7f82deb.zip) tamamıyla bir klasöre çıkarın.
2. **Baslat.bat** veya **Yonetim.bat** dosyasına çift tıklayın. Paket kendi Java 21 çalışma ortamını içerir; Java veya Node kurulumu gerekmez.
3. Pencerede **Başlat** düğmesine basın. Durum **Çalışıyor** olunca sunucu hazırdır.
4. **Sunucu** sekmesinde gösterilen ağ adresini ekiple paylaşın. Windows güvenlik duvarında seçilen porta yalnızca ekip ağından erişim verin.
5. Pencereyi küçültebilirsiniz. Pencereyi kapatmak sunucuyu durdurur; kapanış onayı gösterilir.

Konsol penceresi istemiyorsanız `Baslat-Arayuz.vbs` kullanılabilir. Kurum Windows Script Host’u kapattıysa `Baslat.bat` yolunu kullanın. Hatalar her iki yöntemde de `logs/arcade-server.log` dosyasına yazılır. **Konsol.bat** arayüz olmadan sunucuyu başlatır. Windows x64 paketi ARM/Linux/macOS Java runtime’ı içermez.

Küçük, runtimesız paket Java 21+ gerektirir. Başlatıcı önce paket içindeki `runtime/` klasörünü, sonra `JAVA_HOME`, PATH ve yaygın JetBrains kurulumlarını kontrol eder. Geliştirme ortamında `sh scripts/run-manager.sh` veya `java -jar server/build/libs/arcade-machine-server.jar --gui` kullanılabilir.

## Yönetim işlemleri

| Ekran | İşlemler |
|---|---|
| Sunucu | Başlat, durdur, yeniden başlat, çalışma süresi, gerçek LAN adresleri, üye/oda sayıları, canlı veritabanı yedeği |
| Oyuncular ve üyeler | İsim/ekip arama, aktifleri filtreleme, uygulama ve ekip bilgisi, bağlantı/son erişim, moderasyon nedeni |
| Moderasyon | **5 dakika at**, kalıcı **Engelle**, **Engeli kaldır**, film ekibi sahipliğini başka üyeye aktar |
| Odalar | Çizim odalarını görüntüle/kapat, film ekiplerinin öneri/oy sayılarını gör, haftanın seçimini yönetici olarak belirle |
| Canlı loglar | INFO/WARN/ERROR kayıtları, hata filtresi, otomatik kaydırma, görünen logu dosyaya aktarma |
| Ayarlar | Dinleme adresi, port, dosya yolları, günlük Wordle/soru sayısı, çizim odası kapasitesi/tur/süre/ipucu ayarları |

**Atma davranışı:** Arcade WebSocket bağlantısı kapanır ve oyuncu çizim odasından çıkarılır. Aynı üyelik beş dakika boyunca HTTP istekleriyle veya yeniden oturum açarak dönemez. Film panosu üyeliğinde de aynı süre boyunca okuma/yazma engellenir; eklenti bunu bir sonraki isteğinde görür. **Engelle** kaydı yeniden başlatmada korunur ve siz kaldırana kadar sürer. Puanlar, öneriler ve geçmiş oylar silinmez.

Arcade’de “Bağlı” açık WebSocket anlamına gelir. “Son 45 sn aktif” son yetkili HTTP isteğine dayanır; çevrimiçi kişi tespiti değildir. Film eklentisi görünürken 10 saniyede bir sorguladığından kapalı/gizli panel kısa süre sonra çevrimdışı görünür. Son erişim bilgisi sunucu yeniden başlayınca sıfırlanır; engeller kalıcıdır.

Üyelikler SSO ile doğrulanmış gerçek kişiler değildir. Yeni IDE kimliği/yeni üyelik oluşturan biri farklı hesapla katılabilir; bu araç güvenilen küçük ekip içindir. Yönetici işlemleri **HTTP üzerinden sunulmaz**; yalnızca sunucu bilgisayarındaki yerel pencere bunları çağırır.

## Kayıt ve yedek

- Veriler: `data/arcade-machine.db` (Arcade + film panosu + engeller).
- **Yedek al**, çalışan SQLite veritabanının tutarlı anlık kopyasını üretir; WAL’deki tamamlanmış işlemler dahildir. Açık çizim odalarının geçici tuvali yedeğe girmez.
- Geri yüklemek için sunucuyu durdurun, mevcut veritabanını ve varsa `-wal`/`-shm` dosyalarını ayrı bir klasöre yedekleyin; geri yüklenecek `.db` dosyasını **temiz bir klasöre** koyup Ayarlar’dan o dosyayı seçin. Eski WAL dosyalarının üstüne `.db` kopyalamayın.
- Oyun ayarları `arcade-config.json`, pencerenin adres/yol tercihleri `server-manager.properties` içinde saklanır. Bunları ayrıca yedekleyin.
- Loglar `logs/` içinde 10 MB parçalarla döner; 14 gün ve toplam 200 MB sınırı vardır. Ekran son 1500 kaydı tutar. `ARCADE_LOG_DIR` farklı log klasörü seçer.
- Başlatıcı aynı veritabanına ikinci ortak sunucu açılmasını dosya kilidiyle engeller. SQLite veri dosyasını ağ paylaşımı yerine sunucu diski üzerinde tutun.

## Mevcut kurulumdan geçiş

**Arcade:** Eski sunucuyu kapatın. Mevcut `.db` dosyasını güvenli biçimde yedekleyin. Yeni sunucuda aynı veritabanı yolunu kullanın; yeni tablolar otomatik eklenir, mevcut oyuncular ve puanlar korunur. Eski `arcade-config.json` ayarlarını koruyun. Eski açık çizim odaları yeniden başlatmada kapanır.

**Film panosu:** Eski Node sunucusunu kapatın. Yönetim penceresinde sunucuyu başlatıp **Odalar → Eski film panosunu aktar** ile eski `server/data/board.json` dosyasını seçin. Ekipler, geçmiş haftalar, oylar ve token özetleri aktarılır. Aynı ekip kodu zaten varsa işlem tamamen geri alınır; mevcut oda değiştirilmez. Eski dosya silinmez.

Film eklentisi aynı sunucu adresini kullanmaya devam ediyorsa kayıtlı oturum geçerli kalır. Adres değişirse PasswordSafe kaydı başka anahtarda kalır; bu MVP’de otomatik adres/kimlik taşıma yoktur. Mümkünse eski adreste yeni ortak sunucuyu çalıştırın.

## Ayarların etkisi

**Ayarları kaydet** dosyayı günceller. Aktif sunucuya uygulanması için **Yeniden başlat** gerekir. Başlamış günlük oyunların mevcut kelime/soru sayıları korunur; yeni sayılar sonraki oluşturulan güne uygulanır. Yeniden başlatma açık çizim odalarını kapatır; bitmiş puanlar ile film panosu kalır.

Ortam değişkenleri: `ARCADE_HOST`, `ARCADE_PORT`, `ARCADE_DB`, `ARCADE_CONFIG`, `ARCADE_LOG_DIR`. Pencere açılırken ortam değişkenleri kaydedilmiş pencere tercihlerinden önceliklidir. Konsol modu yalnızca ortam değişkenlerini ve oyun ayar dosyasını kullanır.

## Doğrulama sınırı

Windows paketi Windows x64 Java 21 ve platformdan bağımsız JAR içerir; Windows üzerinde çalıştırma bu macOS geliştirme oturumunda doğrulanmadı. GUI akışı macOS’ta gerçek Swing penceresinde, HTTP ve WebSocket akışları otomatik testlerle kontrol edilir. Son koşu: [0.4.0 doğrulama kaydı](VALIDATION-0.4.0.md).
