/* Halaman satu artikel (pemilik 2026-11-22, A3): baris "Bagikan".
   Markup dari build_page_artikel._share_html: .bagikan[data-judul][data-url]
   berisi tautan WhatsApp (selalu tampil) dan dua tombol yang hidden sampai
   skrip ini memastikan browser mendukungnya:
   - .bagikan-salin : salin alamat artikel (Clipboard API);
   - .bagikan-lain  : menu bagikan bawaan ponsel (Web Share API).
   Tanpa JavaScript tautan WhatsApp tetap jalan. */
(function () {
  "use strict";
  var box = document.querySelector(".bagikan");
  if (!box) return;
  var url = box.getAttribute("data-url");
  var judul = box.getAttribute("data-judul");

  var salin = box.querySelector(".bagikan-salin");
  if (salin && navigator.clipboard) {
    salin.hidden = false;
    salin.addEventListener("click", function () {
      navigator.clipboard.writeText(url).then(function () {
        salin.textContent = "Tersalin";
      }, function () {
        // Clipboard ditolak (izin browser): tampilkan alamatnya agar disalin manual.
        window.prompt("Salin alamat artikel:", url);
      });
      setTimeout(function () { salin.textContent = "Salin tautan"; }, 2000);
    });
  }

  var lain = box.querySelector(".bagikan-lain");
  if (lain && navigator.share) {
    lain.hidden = false;
    lain.addEventListener("click", function () {
      // Batal oleh pengguna juga masuk ke catch; tidak perlu pesan.
      navigator.share({ title: judul, url: url }).catch(function () {});
    });
  }
})();
