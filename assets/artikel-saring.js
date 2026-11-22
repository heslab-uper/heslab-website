/* Saring daftar artikel menurut topik dan kata kunci (halaman /artikel/; pemilik 2026-11-16, cari 2026-11-22).
   Markup dari build_page_artikel.py: .artikel-saring (hidden sampai skrip ini
   jalan), .card[data-topik], section.artikel-bulan, details.artikel-tahun.
   Topik terpilih disimpan di alamat sebagai #topik=<kunci> agar bisa dibagikan.
   Tanpa JavaScript semua artikel tetap tampil. */
/* Tombol "Salin alamat" umpan RSS (.salin-rss, hidden tanpa JS atau tanpa
   clipboard API; alamatnya tetap terbaca sebagai teks). */
(function () {
  "use strict";
  var btn = document.querySelector(".salin-rss");
  if (!btn || !navigator.clipboard) return;
  btn.hidden = false;
  btn.addEventListener("click", function () {
    navigator.clipboard.writeText(btn.getAttribute("data-salin")).then(function () {
      btn.textContent = "Tersalin";
      setTimeout(function () { btn.textContent = "Salin alamat"; }, 2000);
    }, function () {
      // Clipboard ditolak (izin browser): seleksi alamatnya agar bisa disalin manual.
      var code = document.querySelector(".rss-alamat");
      if (code && window.getSelection) {
        var range = document.createRange();
        range.selectNodeContents(code);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        btn.textContent = "Tekan Ctrl+C";
      } else {
        btn.textContent = "Gagal menyalin";
      }
    });
  });
})();

(function () {
  "use strict";
  // Topik (tombol, #topik=<kunci>) dan kata kunci (kotak .artikel-cari,
  // pemilik 2026-11-22, C2) disaring bersama: kartu tampil bila cocok keduanya.
  // Kata kunci: semua kata harus ada di teks kartu (judul, topik, tanggal,
  // penulis, ringkasan); huruf besar-kecil dan aksen diabaikan ("nino" = "Niño").
  var bar = document.querySelector(".artikel-saring");
  var cariBox = document.querySelector(".artikel-cari");
  var cariInput = cariBox && cariBox.querySelector("input");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card[data-topik]"));
  if (!cards.length || (!bar && !cariInput)) return;
  var buttons = bar ? Array.prototype.slice.call(bar.querySelectorAll(".saring-tombol")) : [];
  var known = buttons.map(function (b) { return b.getAttribute("data-topik"); });
  var months = Array.prototype.slice.call(document.querySelectorAll("section.artikel-bulan"));
  var years = Array.prototype.slice.call(document.querySelectorAll("details.artikel-tahun"));
  var empty = document.querySelector(".artikel-kosong");
  var emptyTopik = empty ? empty.textContent : "";

  function normal(s) {
    s = String(s || "").toLowerCase();
    if (s.normalize) s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
    return s.replace(/\s+/g, " ").trim();
  }
  var teks = cards.map(function (c) { return normal(c.textContent); });
  var topikNow = "", kataNow = [];

  function visibleCards(root) {
    return Array.prototype.filter.call(root.querySelectorAll(".card[data-topik]"),
      function (c) { return !c.hidden; }).length;
  }

  function apply() {
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-topik") === topikNow ? "true" : "false");
    });
    cards.forEach(function (c, i) {
      var okTopik = topikNow === "" || c.getAttribute("data-topik") === topikNow;
      var okKata = kataNow.every(function (k) { return teks[i].indexOf(k) >= 0; });
      c.hidden = !(okTopik && okKata);
    });
    months.forEach(function (s) { s.hidden = visibleCards(s) === 0; });
    years.forEach(function (d) {
      var n = visibleCards(d);
      d.hidden = n === 0;
      if (kataNow.length && n) d.open = true;      // hasil cari di arsip tahun langsung terlihat
      var count = d.querySelector("summary .count");
      if (count) count.textContent = n + " artikel";
    });
    if (empty) {
      empty.hidden = cards.some(function (c) { return !c.hidden; });
      empty.textContent = kataNow.length
        ? "Tidak ada artikel yang cocok dengan “" + cariInput.value.trim() + "”" +
          (topikNow ? " pada topik ini." : ".")
        : emptyTopik;
    }
  }

  function fromHash() {
    var m = /^#topik=([a-z0-9-]+)$/.exec(window.location.hash);
    return m && known.indexOf(m[1]) >= 0 ? m[1] : "";
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      topikNow = b.getAttribute("data-topik");
      apply();
      var url = window.location.pathname + window.location.search + (topikNow ? "#topik=" + topikNow : "");
      if (window.history && window.history.replaceState) window.history.replaceState(null, "", url);
    });
  });
  window.addEventListener("hashchange", function () { topikNow = fromHash(); apply(); });

  if (cariInput) {
    cariInput.addEventListener("input", function () {
      kataNow = normal(cariInput.value).split(" ").filter(Boolean);
      apply();
    });
    cariBox.hidden = false;
  }
  if (bar) bar.hidden = false;
  topikNow = fromHash();
  apply();
})();
