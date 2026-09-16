# Arcade Machine 0.3.2 — hızlı başlangıç

## Sunucu

Java 21 veya üstü olan ofis bilgisayarında `scripts/run-server.bat` (Windows)
veya `sh scripts/run-server.sh` (macOS/Linux) çalıştırın. Başlatıcı kurulu
JetBrains Java runtime'ını da kullanabilir. Hazır JAR:
`server/build/libs/arcade-machine-server.jar`. Çalışırken internet gerekmez.

Sunucu adresi: `http://SUNUCU_IP:8787`. Kendi bilgisayarınızda
`http://localhost:8787/health` ile kontrol edin. Diğer bilgisayarlar sunucunun
LAN IP adresini kullanır; `localhost` kullanmaz. Tek sunucu çalıştırın.

**Güncelleme:** Eski sunucuyu durdurun, veritabanını yedekleyin ve JAR'ı değiştirin.
Aynı klasörden ve aynı `ARCADE_DB` yolu ile başlatın. Oyuncular ve geçmiş sonuçlar
korunur. “Yeniden oyna” için eklenti ve sunucu 0.3.2 gerekir. Açık çizim odaları sunucu yeniden
başlatıldığında kapanır; tamamlanmış oyun puanları kalır.

## Ayarlar

`arcade-config.json` dosyasını metin düzenleyiciyle açın. İlk çalıştırmada yoksa
otomatik oluşur. Değiştirdikten sonra sunucuyu yeniden başlatın.

```json
{
  "wordle": { "dailyWords": 5 },
  "higherLower": { "dailyQuestions": 10, "repeatLookbackDays": 14 },
  "drawing": {
    "maxPlayers": 8,
    "rounds": 2,
    "turnSeconds": 80,
    "chooseSeconds": 15,
    "revealSeconds": 6
  }
}
```

- `dailyWords`: günlük kelime sayısı (1–20).
- `dailyQuestions`: günlük karşılaştırma sayısı (1–50).
- `repeatLookbackDays`: tekrar seçilmemesi tercih edilen geçmiş gün sayısı (0–365).
- `maxPlayers`: oda kapasitesi (2–12).
- `rounds`: herkesin kaç kez çizeceği (1–5).
- Diğer üç değer saniyedir: çizim (20–180), kelime seçimi (5–60), sonuç (2–20).

Başlamış bir günün kelime/soru sayısı değişmez; yeni sayı sonraki oluşturulan güne
uygulanır. 0.3.0'a ilk geçişte bugünkü eski Wordle, ilk kelime olarak korunur ve
kalan kelimeler eklenir. Başka bir ayar dosyası için `ARCADE_CONFIG` kullanılabilir.

## Eklenti

JetBrains IDE'de **Settings → Plugins → dişli → Manage Plugin Repositories**:

`https://birkankader.com/plugins/updatePlugins.xml`

Bu ortak adres Arcade Machine ve Kaşif'i içerir. Arcade Machine'i yükleyin veya
güncelleyin. **View → Tool Windows → Arcade Machine** penceresinde ayarlardan
sunucu adresini girin. Adınızı aynı ekranda değiştirebilirsiniz.

## Oyunlar ve sıralama

- **Wordle:** Her gün beş kelime; her birinde altı tahmin. Sözlük kontrolü açık.
  Numaralı düğmelerle kelimeler arasında geçilir. Bulunan kelime sayısı, eşitlikte
  bulunan kelimelerde harcanan toplam tahmin sayısı sıralamayı belirler.
- **Az mı Çok mu:** 220 veri / 6 kategori. Günlük on karşılaştırma; doğru yanıta
  bir puan. Aynı gün ve yakın geçmişte tekrarlar mümkün olduğunca azaltılır.
- **Çiz & Bil:** Oda kurulduğunda diğer bağlı oyunculara davet gider. İsteyen
  katılır, oda sahibi başlatır. Herkes sırayla üç kelimeden birini seçip çizer.
  Doğru tahmine hızına göre 50–100, çizene 25 puan verilir. Oda bitince toplam
  puanlar genel tabloya eklenir. Kopan bağlantı için 60 saniye beklenir.
- **Arcade sıralaması:** Ana sayfadan günlük ve tüm zamanlar tablolarına ulaşılır.
  Her oyundaki sıranın katkısı `1000 / sıra` (aşağı yuvarlanır), üç oyunda eşit
  ağırlıklıdır. Ham puanı sıfır olan oyun katkı yapmaz. Eşit sonuçlar aynı sıradadır.
  Tüm zamanlarda önce her oyunun birikmiş sonuç sırası hesaplanır.

Wordle ve karşılaştırma İstanbul saatiyle 00.00'da yenilenir. Sıralamalar oyun
başlığının altında açık gelir; kendi sıranız listenin üstünde ayrıca gösterilir.

Ayrıntılar: [README](README.md). Güncel doğrulama: [0.3.2 raporu](docs/VALIDATION-0.3.2.md).

Çiz & Bil tamamlandığında oda sahibi **Yeniden oyna** düğmesiyle aynı odadaki
en az iki oyuncuyla yeni oyuna geçer. Oda puanları ve tuval sıfırlanır; biten her
oyunun puanları genel sıralamada korunur ve yalnızca bir kez eklenir.
