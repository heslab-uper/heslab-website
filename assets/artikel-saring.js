/* Saring daftar artikel menurut topik (halaman /artikel/; pemilik 2026-11-16).
   Markup dari build_page_artikel.py: .artikel-saring (hidden sampai skrip ini
   jalan), .card[data-topik], section.artikel-bulan, details.artikel-tahun.
   Topik terpilih disimpan di alamat sebagai #topik=<kunci> agar bisa dibagikan.
   Tanpa JavaScript semua artikel tetap tampil. */
(function () {
  "use strict";
  var bar = document.querySelector(".artikel-saring");
  if (!bar) return;
  var buttons = Array.prototype.slice.call(bar.querySelectorAll(".saring-tombol"));
  var known = buttons.map(function (b) { return b.getAttribute("data-topik"); });
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card[data-topik]"));
  var months = Array.prototype.slice.call(document.querySelectorAll("section.artikel-bulan"));
  var years = Array.prototype.slice.call(document.querySelectorAll("details.artikel-tahun"));
  var empty = document.querySelector(".artikel-kosong");

  function visibleCards(root) {
    return Array.prototype.filter.call(root.querySelectorAll(".card[data-topik]"),
      function (c) { return !c.hidden; }).length;
  }

  function apply(topik) {
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-topik") === topik ? "true" : "false");
    });
    cards.forEach(function (c) {
      c.hidden = topik !== "" && c.getAttribute("data-topik") !== topik;
    });
    months.forEach(function (s) { s.hidden = visibleCards(s) === 0; });
    years.forEach(function (d) {
      var n = visibleCards(d);
      d.hidden = n === 0;
      var count = d.querySelector("summary .count");
      if (count) count.textContent = n + " artikel";
    });
    if (empty) empty.hidden = cards.some(function (c) { return !c.hidden; });
  }

  function fromHash() {
    var m = /^#topik=([a-z0-9-]+)$/.exec(window.location.hash);
    return m && known.indexOf(m[1]) >= 0 ? m[1] : "";
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var topik = b.getAttribute("data-topik");
      apply(topik);
      var url = window.location.pathname + window.location.search + (topik ? "#topik=" + topik : "");
      if (window.history && window.history.replaceState) window.history.replaceState(null, "", url);
    });
  });
  window.addEventListener("hashchange", function () { apply(fromHash()); });

  bar.hidden = false;
  apply(fromHash());
})();
