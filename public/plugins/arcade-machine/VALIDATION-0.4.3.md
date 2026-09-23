# 0.4.3 — renkli arayüz ve üç oyun doğrulaması

23 Eylül 2026. Bu rapor yerel çalışma ağacındaki tasarım değişikliğine aittir;
önceki yayın raporları bu değişiklik için kanıt değildir.

## Değişiklikler

- Modern eklentide mint Kelime, mercan Çizim ve mavi Sudoku kartları; yerel vektör
  çizimleri, oyunlara özel vurgu renkleri, açık/koyu tema ve azaltılmış hareket desteği.
- 2019 sürümünde aynı paletle çizilen, klavye ile kullanılabilen native Swing kartları.
- Az mı Çok mu ekranları, komutları, modelleri, sunucu uçları, veri seti ve sıralama
  katkısı kaldırıldı. Yeni veritabanları bu oyunun tablolarını oluşturmuyor.
- Eski ayar dosyasındaki yalnızca `higherLower` anahtarı yok sayılıyor; diğer hatalı
  anahtarlar reddediliyor. Eski oyun tabloları mevcut veritabanında korunuyor fakat
  okunmuyor. Kullanıcı kimliği ve diğer oyun kayıtları korunuyor.

## Bu koşuda doğrulananlar

- **57 JVM testi geçti:** sunucu 51, modern istemci 2, legacy istemci 4.
  Hata ve atlanan test yok. Sunucu yönetim penceresi testi dahil (`-PguiSmoke`).
- **6 JavaScript testi geçti:** Türkçe giriş, harf işaretleri, hata mesajları,
  çizim şekilleri ve Sudoku çakışmaları.
- **IntelliJ IDEA Community 2024.3.6 / JCEF: PASS, 179 kontrol.** Üç oyunlu menü,
  farklı kart renkleri, yazı kontrastı, 320 px panelde taşmama, Kelime tahminleri,
  Sudoku giriş/silme, çizim araçları, davetler, sıralamalar, tema ve yeniden bağlanma.
- **Native Swing legacy: PASS.** Gerçek yerel sunucuya bağlı oyun ve bağlantı
  akışları; yeni menünün görüntüsü incelendi.
- **Sunucu yönetim penceresi: PASS.** Kaldırılan oyunun ayarları yok; başlatma,
  oyuncu yönetimi, hata logu ve durdurma çalışıyor.
- Kaldırılan dört API ucu 404 döndürüyor. Ana sayfa yanıtı bu oyunu içermiyor.
  Eski oyun puanı bulunan veritabanında günlük/tüm zamanlar sıralamaları yalnızca
  kalan oyunları kullanıyor; oturum ve Kelime ilerlemesi yeniden açılışta korunuyor.
- Modern ve legacy ZIP'leri, sunucu JAR'ı oluşturuldu; modern plugin yapı kontrolü geçti.

Ekran kanıtları: `plugin/build/ui-smoke/`, `plugin-legacy/build/ui-smoke/` ve
`server/build/gui-smoke/`. Modern test sonucu `plugin/build/ui-smoke/result.txt`.
Test sunucusu ayrı geçici veritabanı ve ayar dosyasıyla çalıştırılıp kapatıldı.

## Kurulum ve sınırlar

Sunucu ve eklentiler birlikte güncellenmeli; eski istemciler kaldırılan API'yi kullanır.
Mevcut veritabanını silmek veya sıfırlamak gerekmez.

Bu rapor yayın öncesi yerel doğrulamayı kaydeder; yayın sonucu PUBLISH-0.4.3.md dosyasındadır. Windows
çalıştırması ve gerçek IntelliJ 2019 açılışı yapılmadı; legacy kanıtı Java 21 üzerinde
native Swing testi ve Java 8 hedefiyle paketlemedir.
