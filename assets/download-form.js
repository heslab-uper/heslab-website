/*
 * download-form.js
 * ================
 * Form singkat (nama, afiliasi) sebelum unduhan bulanan pertama di sebuah
 * browser. Dipasang build_page_data.py hanya bila cfg.DOWNLOAD_FORM_URL
 * terisi; alamat penerima dibaca dari atribut data-log-url.
 *
 * - Isian disimpan di localStorage, jadi form muncul sekali per browser.
 * - Tiap klik bulan dikirim ke Apps Script (apps_script/download_log.gs)
 *   lewat navigator.sendBeacon, yang tetap terkirim walau halaman berpindah.
 * - Unduhan tidak pernah tertahan: bila penyimpanan atau pengiriman gagal,
 *   link tetap dibuka.
 */
(function () {
  "use strict";
  var KEY = "heslab_data_user";
  var root = document.querySelector("[data-log-url]");
  var dialog = document.getElementById("download-form");
  if (!root || !dialog || typeof dialog.showModal !== "function") return;
  var url = root.getAttribute("data-log-url");
  var form = dialog.querySelector("form");
  var pending = null;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }
  function save(user) {
    try { localStorage.setItem(KEY, JSON.stringify(user)); } catch (e) { /* mode privat */ }
  }
  function send(user, link, first, extra) {
    var body = new URLSearchParams({
      name: user.name, affiliation: user.affiliation,
      dataset: link.getAttribute("data-dataset") || "",
      file: link.getAttribute("title") || "",
      page: location.pathname, first: first ? "yes" : "no",
      website: extra || ""
    });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(url, body)) return;
      fetch(url, { method: "POST", body: body, mode: "no-cors", keepalive: true });
    } catch (e) { /* pencatatan gagal; unduhan tetap jalan */ }
  }

  root.addEventListener("click", function (ev) {
    var link = ev.target.closest("a.month-link");
    if (!link || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button !== 0) return;
    var user = load();
    if (user && user.name && user.affiliation) {
      send(user, link, false);
      return;                       // biarkan link terbuka seperti biasa
    }
    ev.preventDefault();
    pending = link;
    dialog.showModal();
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var data = new FormData(form);
    var user = {
      name: String(data.get("name") || "").trim(),
      affiliation: String(data.get("affiliation") || "").trim()
    };
    if (!user.name || !user.affiliation || !data.get("consent")) return;
    save(user);
    var link = pending;
    pending = null;
    dialog.close();
    if (!link) return;
    send(user, link, true, String(data.get("website") || ""));
    location.href = link.href;
  });

  dialog.querySelector("[data-cancel]").addEventListener("click", function () {
    pending = null;
    dialog.close();
  });
})();
