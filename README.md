# ICT Trade Journal — Smart Money

ICT / Smart Money metodolojisi için tasarlanmış, tamamen tarayıcıda çalışan bir trade günlüğü. İşlem analizi, risk yönetimi, hata takibi ve performans istatistikleri tek bir arayüzde.

## Özellikler

- **Dashboard** — equity curve, win rate, profit factor, haftalık özet
- **Trade Log** — işlemleri filtrele, ara, düzenle; ekran görüntüsü ekle
- **Trade Ekle** — sembol araması (forex, endeks, metal, 60+ kripto/altcoin), çoklu setup, entry model, otomatik risk/RR hesabı
- **Kasa & Risk** — pozisyon hesaplayıcı, risk uyarıları (%10 sınırı), dinamik tavsiyeler
- **Hata Analizi** — en sık hatalar ve maliyetleri
- **Analitik & Takvim & Günlük** — derinlemesine performans takibi
- **Veri Yedekleme** — tüm veriyi `.json` olarak dışa/içe aktar

## Kullanım

Veriler tarayıcının `localStorage`'ında saklanır — sunucu veya hesap gerekmez. Düzenli olarak **Kasa & Risk → Veri Yönetimi → Yedek Al** ile yedek almanız önerilir.

## Teknoloji

Saf HTML/CSS/JS. Bağımlılıklar CDN üzerinden: [Chart.js](https://www.chartjs.org/), [Day.js](https://day.js.org/).

## Lisans

Kişisel kullanım.
