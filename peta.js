// =========================================================
// PETA & PELACAKAN PESANAN (Pelanggan <-> Helpman)
// Peta      : Leaflet + OpenStreetMap
// Rute/ETA  : OSRM (server demo publik), cadangan garis lurus
// Live      : Supabase Realtime "broadcast" + data pesanan (cadangan)
// =========================================================

const STATUS_BISA_DILACAK = ['Menunggu Admin', 'Mencari Helpman', 'Dikerjakan', 'Menunggu Validasi'];
const PUSAT_KOTA = { malang: [-7.9666, 112.6326], jember: [-8.1724, 113.7003] };

const JEDA_KIRIM_MS = 3000;      // jarak minimal antar kiriman posisi live
const DENYUT_MS = 8000;          // kirim ulang posisi terakhir (saat Helpman diam)
const SIMPAN_MIN_MS = 30000;     // simpan ke data pesanan bila sudah bergerak
const SIMPAN_MAKS_MS = 120000;   // simpan berkala walau diam

// ---------- Tahapan sesuai jenis pesanan ----------
function modeOrder(o) {
    if (o.modeLayanan) return o.modeLayanan;
    return o.lokasiTujuan ? 'rute' : 'lokasi';
}

function tahap(label, aksi, target = null) { return { label, aksi, target }; }

function tahapanOrder(o) {
    switch (modeOrder(o)) {
        case 'rute': {
            const barang = o.layananId === 'L05';
            return [
                tahap('Helpman menuju titik jemput', 'Berangkat ke titik jemput', 'jemput'),
                tahap(barang ? 'Helpman tiba, memuat barang' : 'Helpman sudah di titik jemput', 'Sudah di titik jemput', 'jemput'),
                tahap(barang ? 'Barang diantar ke tujuan' : 'Dalam perjalanan ke tujuan', 'Mulai jalan ke tujuan', 'tujuan'),
                tahap('Sudah sampai di tujuan', 'Sudah sampai tujuan', 'tujuan')
            ];
        }
        case 'belanja':
            return [
                tahap('Helpman menuju toko', 'Berangkat ke toko', 'jemput'),
                tahap('Pesanan sedang dibeli', 'Mulai belanja', 'jemput'),
                tahap('Pesanan diantar ke alamat Anda', 'Antar pesanan', 'tujuan'),
                tahap('Pesanan sudah sampai', 'Pesanan sudah diterima', 'tujuan')
            ];
        case 'online':
            return [
                tahap('Pekerjaan dimulai', 'Mulai kerjakan'),
                tahap('Sedang dikerjakan', 'Tandai sedang dikerjakan'),
                tahap('Pengecekan akhir', 'Masuk pengecekan akhir'),
                tahap('Hasil sudah dikirim', 'Hasil sudah dikirim')
            ];
        default: {
            const khusus = {
                L06: { menuju: 'Helpman menuju lokasi pertemuan', kerja: 'Sedang menemani Anda' },
                L09: { menuju: 'Helpman menuju lokasi dokumentasi', kerja: 'Sesi dokumentasi berlangsung' },
                L10: { menuju: 'Helpman menuju lokasi barang', kerja: 'Barang sedang ditangani' },
                L12: { menuju: 'Helpman menuju lokasi serah terima', kerja: 'Serah terima kendaraan / driver' },
                L16: { menuju: 'Tenaga kesehatan menuju lokasi', kerja: 'Pasien sedang ditangani' }
            }[o.layananId] || { menuju: 'Helpman menuju lokasi Anda', kerja: 'Pekerjaan sedang dilakukan' };
            return [
                tahap(khusus.menuju, 'Berangkat ke lokasi', 'jemput'),
                tahap('Helpman sudah tiba', 'Sudah tiba di lokasi', 'jemput'),
                tahap(khusus.kerja, 'Mulai pekerjaan', 'jemput'),
                tahap('Pekerjaan di lokasi selesai', 'Pekerjaan sudah selesai', 'jemput')
            ];
        }
    }
}

function indeksTahap(lacak) { return lacak && Number.isInteger(lacak.tahap) ? lacak.tahap : -1; }

function teksProgres(o) {
    if (o.status === 'Menunggu Admin') return 'Menunggu konfirmasi Admin';
    if (o.status === 'Mencari Helpman') return 'Sedang mencari Helpman';
    if (o.status === 'Menunggu Validasi') return 'Menunggu validasi Admin';
    if (o.status !== 'Dikerjakan') return o.status || '-';
    const t = tahapanOrder(o)[indeksTahap(o.lacak)];
    return t ? t.label : 'Helpman ditugaskan, bersiap';
}

function namaTitik(o, jenis) {
    const mode = modeOrder(o);
    if (jenis === 'tujuan') return mode === 'belanja' ? 'Alamat antar' : 'Tujuan';
    if (mode === 'rute') return 'Titik jemput';
    if (mode === 'belanja') return 'Toko';
    return 'Lokasi pesanan';
}

function ikonHelpman(o) {
    if (o.layananId === 'L01' || o.layananId === 'L02') return 'fa-motorcycle';
    if (o.layananId === 'L03' || o.layananId === 'L12') return 'fa-car';
    if (o.layananId === 'L05') return 'fa-truck';
    return 'fa-person-walking';
}

// ---------- Util geografi ----------
function titikValid(p) {
    return !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180;
}

function jarakMeter(a, b) {
    const r = x => x * Math.PI / 180;
    const d = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
    return 12742000 * Math.asin(Math.min(1, Math.sqrt(d)));
}

function teksJarak(m) { return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`; }

function teksSejak(iso) {
    const d = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (d < 10) return 'baru saja';
    if (d < 60) return `${d} detik lalu`;
    if (d < 3600) return `${Math.floor(d / 60)} menit lalu`;
    return `${Math.floor(d / 3600)} jam lalu`;
}

function linkNavigasi(o, jenis) {
    const k = jenis === 'tujuan' ? o.koordTujuan : o.koordJemput;
    const teks = jenis === 'tujuan' ? o.lokasiTujuan : o.lokasiJemput;
    const tujuan = titikValid(k) ? `${k.lat},${k.lng}` : (teks || '');
    return tujuan ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(tujuan)}` : '';
}

// Ubah satu pesanan tanpa menimpa perubahan dari perangkat lain.
// Mengembalikan pesanan terbaru, atau null bila gagal / dibatalkan oleh ubah().
async function ubahOrder(id, ubah) {
    if (typeof storeUbahBaris === 'function') return storeUbahBaris('th_orders', id, ubah);
    const orders = getData('th_orders'); // cadangan bila tanpa supabase-store.js
    const o = orders.find(x => x.id === id);
    if (!o || ubah(o) === false) return null;
    try { setData('th_orders', orders); } catch (err) { return null; }
    return o;
}

// ---------- Leaflet ----------
function buatPeta(elId, pusat, zoom) {
    const peta = L.map(elId, { zoomControl: true }).setView(pusat, zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(peta);
    // Modal punya animasi, jadi ukuran peta dihitung ulang setelah tampil
    [60, 320].forEach(ms => setTimeout(() => { if (peta._container && peta._container.isConnected) peta.invalidateSize(); }, ms));
    return peta;
}

function ikonPeta(fa, kelas) {
    return L.divIcon({ className: 'pin-wrap', html: `<span class="pin ${kelas}"><i class="fa-solid ${fa}"></i></span>`, iconSize: [38, 38], iconAnchor: [19, 19] });
}

// =========================================================
// PEMILIH TITIK di form pemesanan
// =========================================================
let titikPesan = { jemput: null, tujuan: null };
let pemilih = null; // { jenis, peta, penanda }

function resetTitikPesanan() { titikPesan = { jemput: null, tujuan: null }; }

function titikUntukOrder(mode) {
    return {
        jemput: mode === 'online' ? null : titikPesan.jemput,
        tujuan: mode === 'rute' || mode === 'belanja' ? titikPesan.tujuan : null
    };
}

function tutupPemilih() {
    if (!pemilih) return;
    pemilih.peta.remove();
    pemilih.panel.remove();
    pemilih = null;
}

function pasangPemilihTitik(mode) {
    tutupPemilih();
    if (mode === 'online') return;
    ['jemput', 'tujuan'].forEach(jenis => {
        const input = document.getElementById(`pesan-${jenis}`);
        if (!input) return;
        const alat = document.createElement('div');
        alat.className = 'titik-alat';
        alat.id = `titik-alat-${jenis}`;
        input.parentElement.appendChild(alat);
        gambarAlatTitik(jenis);
    });
}

function gambarAlatTitik(jenis) {
    const alat = document.getElementById(`titik-alat-${jenis}`);
    if (!alat) return;
    const t = titikPesan[jenis];
    // "Lokasi saya" hanya masuk akal untuk titik tempat pelanggan berada
    const mode = modePaket(paketTerpilih());
    const bisaGps = !(mode === 'belanja' && jenis === 'jemput');
    alat.innerHTML = `
        ${bisaGps ? `<button type="button" class="btn-titik" onclick="titikDariGps('${jenis}')"><i class="fa-solid fa-location-crosshairs"></i> Lokasi saya</button>` : ''}
        <button type="button" class="btn-titik" onclick="bukaPemilih('${jenis}')"><i class="fa-solid fa-map-location-dot"></i> Pilih di peta</button>
        ${t ? `<span class="titik-ok"><i class="fa-solid fa-circle-check"></i> Titik ditandai <button type="button" onclick="hapusTitik('${jenis}')" aria-label="Hapus titik">&times;</button></span>`
            : '<small class="titik-hint">Tandai titik agar bisa dilacak di peta</small>'}`;
}

function hapusTitik(jenis) {
    titikPesan[jenis] = null;
    if (pemilih && pemilih.jenis === jenis) tutupPemilih();
    gambarAlatTitik(jenis);
}

async function isiAlamatDariTitik(jenis, t) {
    const input = document.getElementById(`pesan-${jenis}`);
    if (!input || (input.value.trim() && input.dataset.otomatis !== input.value)) return; // jangan timpa ketikan pengguna
    let teks = `Titik peta (${t.lat.toFixed(5)}, ${t.lng.toFixed(5)})`;
    input.value = input.dataset.otomatis = teks;
    try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${t.lat}&lon=${t.lng}&accept-language=id`);
        const d = await r.json();
        // Hanya ganti bila titik dan isian belum berubah selama menunggu
        if (d.display_name && titikPesan[jenis] === t && input.value === teks) input.value = input.dataset.otomatis = d.display_name;
    } catch (err) { /* alamat otomatis opsional */ }
}

function setTitik(jenis, lat, lng) {
    const t = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) };
    titikPesan[jenis] = t;
    gambarAlatTitik(jenis);
    if (pemilih && pemilih.jenis === jenis) {
        if (pemilih.penanda) pemilih.penanda.setLatLng(t);
        else pemilih.penanda = L.marker(t, { icon: ikonPeta('fa-location-dot', 'pin-jemput'), draggable: true })
            .addTo(pemilih.peta)
            .on('dragend', e => { const p = e.target.getLatLng(); setTitik(jenis, p.lat, p.lng); });
    }
    isiAlamatDariTitik(jenis, t);
}

function titikDariGps(jenis) {
    if (!navigator.geolocation) return showToast('Browser tidak mendukung lokasi.', true);
    showToast('Mengambil lokasi...');
    navigator.geolocation.getCurrentPosition(pos => {
        if (!document.getElementById(`pesan-${jenis}`)) return;
        setTitik(jenis, pos.coords.latitude, pos.coords.longitude);
        if (pemilih && pemilih.jenis === jenis) pemilih.peta.setView(titikPesan[jenis], 17);
        showToast('Titik lokasi ditandai.');
    }, () => showToast('Lokasi tidak bisa diambil. Aktifkan izin lokasi atau pilih di peta.', true),
        { enableHighAccuracy: true, timeout: 12000 });
}

function bukaPemilih(jenis) {
    if (!window.L) return showToast('Peta gagal dimuat. Periksa koneksi internet.', true);
    const samaDibuka = pemilih && pemilih.jenis === jenis;
    tutupPemilih();
    if (samaDibuka) return;

    const alat = document.getElementById(`titik-alat-${jenis}`);
    const panel = document.createElement('div');
    panel.className = 'pemilih-panel';
    panel.innerHTML = `
        <div class="pemilih-cari">
            <input type="search" id="pemilih-kata" placeholder="Cari nama jalan / tempat">
            <button type="button" class="btn btn-primary btn-sm" onclick="cariTempat()">Cari</button>
        </div>
        <div id="pemilih-peta" class="peta peta-kecil"></div>
        <div class="pemilih-bawah">
            <small>Ketuk peta untuk menaruh pin, pin bisa digeser.</small>
            <button type="button" class="btn btn-primary btn-sm" onclick="tutupPemilih()">Selesai</button>
        </div>`;
    alat.after(panel);
    const awal = titikPesan[jenis] || titikPesan.jemput;
    const peta = buatPeta('pemilih-peta', awal || PUSAT_KOTA[kotaAktif() || 'malang'], awal ? 16 : 13);
    pemilih = { jenis, peta, panel, penanda: null };
    if (titikPesan[jenis]) setTitik(jenis, titikPesan[jenis].lat, titikPesan[jenis].lng);
    peta.on('click', e => setTitik(jenis, e.latlng.lat, e.latlng.lng));
    panel.querySelector('#pemilih-kata').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); cariTempat(); }
    });
    panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

async function cariTempat() {
    if (!pemilih) return;
    const kata = document.getElementById('pemilih-kata').value.trim();
    if (!kata) return;
    const aktif = pemilih;
    try {
        const q = `${kata}, ${kotaLabel(kotaAktif() || 'malang')}`;
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=id&q=${encodeURIComponent(q)}`);
        const d = await r.json();
        if (pemilih !== aktif) return;
        if (!d.length) return showToast('Tempat tidak ditemukan. Geser peta lalu ketuk lokasinya.', true);
        const lat = parseFloat(d[0].lat), lng = parseFloat(d[0].lon);
        aktif.peta.setView([lat, lng], 17);
        setTitik(aktif.jenis, lat, lng);
    } catch (err) {
        showToast('Pencarian gagal. Ketuk langsung di peta.', true);
    }
}

// =========================================================
// KANAL LIVE (Supabase Realtime broadcast)
// =========================================================
function namaKanal(o) { return `lacak-${o.id}-${o.lacakKode || 'umum'}`; }

const kanalDitutup = new Map(); // nama kanal -> proses penutupan yang belum selesai

function bukaKanal(o, event, saatPesan, saatSiap) {
    if (!db || typeof db.channel !== 'function') return null;
    const nama = namaKanal(o);
    const k = { nama, ch: null, siap: false, batal: false };
    const sambung = () => {
        if (k.batal) return;
        try {
            k.ch = db.channel(nama, { config: { broadcast: { self: false } } });
            k.ch.on('broadcast', { event }, m => saatPesan(m.payload || {}));
            k.ch.subscribe(status => {
                if (k.batal) return;
                k.siap = status === 'SUBSCRIBED';
                if (k.siap && saatSiap) saatSiap(k);
            });
        } catch (err) { k.ch = null; } // tanpa kanal live, data pesanan tetap dipakai
    };
    // Kanal bernama sama harus selesai ditutup dulu sebelum dibuka lagi
    const menunggu = kanalDitutup.get(nama);
    if (menunggu) menunggu.then(sambung); else sambung();
    return k;
}

function kirimKanal(k, event, payload) {
    if (k && k.siap && k.ch) k.ch.send({ type: 'broadcast', event, payload });
}

function tutupKanal(k) {
    if (!k) return;
    k.batal = true;
    k.siap = false;
    if (!k.ch || !db) return;
    const proses = Promise.resolve(db.removeChannel(k.ch)).catch(() => { })
        .then(() => { if (kanalDitutup.get(k.nama) === proses) kanalDitutup.delete(k.nama); });
    kanalDitutup.set(k.nama, proses);
}

// =========================================================
// SISI HELPMAN: membagikan lokasi
// =========================================================
const sedangBagi = new Map(); // orderId -> sesi
let kunciLayar = null;

function kunciDaftarBagi() { return 'th_bagi_' + currentUser.username; }

function daftarBagi() {
    try { return JSON.parse(localStorage.getItem(kunciDaftarBagi())) || []; } catch (err) { return []; }
}

function simpanDaftarBagi(daftar) {
    try { localStorage.setItem(kunciDaftarBagi(), JSON.stringify(daftar)); } catch (err) { /* abaikan */ }
}

function mulaiBagikan(id) {
    if (sedangBagi.has(id)) return;
    const o = getData('th_orders').find(x => x.id === id);
    if (!o || !currentUser || o.helpman !== currentUser.username || o.status !== 'Dikerjakan' || modeOrder(o) === 'online') return;
    if (!navigator.geolocation) return showToast('Browser tidak mendukung lokasi.', true);
    if (window.isSecureContext === false) return showToast('Berbagi lokasi butuh alamat https://', true);

    const sesi = { posisi: null, kirimTerakhir: 0, simpanTerakhir: 0, posisiTersimpan: null };
    sedangBagi.set(id, sesi);
    sesi.kanal = bukaKanal(o, 'minta', () => kirimPosisi(id, true), () => kirimPosisi(id, true));

    sesi.watch = navigator.geolocation.watchPosition(pos => {
        sesi.posisi = {
            lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6),
            akurasi: Math.round(pos.coords.accuracy || 0), waktu: new Date().toISOString()
        };
        kirimPosisi(id);
        simpanPosisi(id);
        if (lacakUI && lacakUI.id === id) perbaruiLacak();
    }, err => {
        if (err.code === 1) {
            hentikanBagikan(id);
            showToast('Izin lokasi ditolak. Aktifkan izin lokasi di browser.', true);
        }
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });

    sesi.denyut = setInterval(() => {
        const kini = getData('th_orders').find(x => x.id === id);
        if (!kini || kini.status !== 'Dikerjakan' || kini.helpman !== currentUser.username) return hentikanBagikan(id);
        // watchPosition diam saat tidak bergerak: posisi terakhir tetap berlaku
        if (sesi.posisi) sesi.posisi.waktu = new Date().toISOString();
        kirimPosisi(id, true);
        simpanPosisi(id);
    }, DENYUT_MS);

    simpanDaftarBagi([...new Set([...daftarBagi(), id])]);
    jagaLayar();
    gambarBannerBagi();
}

function kirimPosisi(id, paksa) {
    const sesi = sedangBagi.get(id);
    if (!sesi) return;
    if (!paksa && Date.now() - sesi.kirimTerakhir < JEDA_KIRIM_MS) return;
    const o = getData('th_orders').find(x => x.id === id);
    if (!o) return;
    // Jeda hanya dihitung bila posisi benar-benar terkirim
    if (sesi.posisi && sesi.kanal && sesi.kanal.siap) sesi.kirimTerakhir = Date.now();
    kirimKanal(sesi.kanal, 'posisi', {
        orderId: id, posisi: sesi.posisi,
        tahap: indeksTahap(o.lacak), riwayat: (o.lacak && o.lacak.riwayat) || []
    });
}

async function simpanPosisi(id) {
    const sesi = sedangBagi.get(id);
    if (!sesi || !sesi.posisi || sesi.menyimpan) return;
    const lama = Date.now() - sesi.simpanTerakhir;
    const bergerak = !sesi.posisiTersimpan || jarakMeter(sesi.posisiTersimpan, sesi.posisi) > 30;
    if (sesi.posisiTersimpan && !(lama >= SIMPAN_MAKS_MS || (bergerak && lama >= SIMPAN_MIN_MS))) return;
    const posisi = { ...sesi.posisi };
    sesi.menyimpan = true;
    const ok = await ubahOrder(id, o => {
        if (o.status !== 'Dikerjakan' || o.helpman !== (currentUser && currentUser.username)) return false;
        o.lacak = Object.assign({ tahap: -1, riwayat: [] }, o.lacak, { posisi });
    });
    sesi.menyimpan = false;
    if (ok) { sesi.simpanTerakhir = Date.now(); sesi.posisiTersimpan = posisi; }
}

function hentikanBagikan(id, lupakan = true) {
    const sesi = sedangBagi.get(id);
    if (sesi) {
        navigator.geolocation.clearWatch(sesi.watch);
        clearInterval(sesi.denyut);
        const kanal = sesi.kanal;
        sedangBagi.delete(id);
        setTimeout(() => tutupKanal(kanal), 500);
    }
    if (lupakan && currentUser) simpanDaftarBagi(daftarBagi().filter(x => x !== id));
    if (sedangBagi.size === 0 && kunciLayar) { kunciLayar.release().catch(() => { }); kunciLayar = null; }
    gambarBannerBagi();
    if (lacakUI && lacakUI.id === id) perbaruiLacak();
}

function hentikanSemuaBagikan(lupakan = true) {
    Array.from(sedangBagi.keys()).forEach(id => hentikanBagikan(id, lupakan));
}

// Setelah halaman dimuat ulang, lanjutkan berbagi untuk order yang masih berjalan
function lanjutkanBagikanLokasi() {
    if (!currentUser || currentUser.role !== 'Helpman') return;
    daftarBagi().forEach(mulaiBagikan);
}

// Layar tetap menyala selama berbagi (bila browser mendukung)
async function jagaLayar() {
    if (kunciLayar || !navigator.wakeLock || document.visibilityState !== 'visible') return;
    try {
        kunciLayar = await navigator.wakeLock.request('screen');
        kunciLayar.addEventListener('release', () => { kunciLayar = null; });
    } catch (err) { /* opsional */ }
}
document.addEventListener('visibilitychange', () => { if (sedangBagi.size) jagaLayar(); });

function gambarBannerBagi() {
    let el = document.getElementById('banner-bagi');
    if (sedangBagi.size === 0) { if (el) el.remove(); document.body.classList.remove('ada-banner'); return; }
    if (!el) {
        el = document.createElement('div');
        el.id = 'banner-bagi';
        el.className = 'banner-bagi';
        document.body.appendChild(el);
    }
    document.body.classList.add('ada-banner');
    el.innerHTML = `<span class="titik-live"></span> <span>Lokasi dibagikan (${sedangBagi.size} order). Biarkan halaman ini terbuka.</span>
        <button type="button" onclick="hentikanSemuaBagikan()">Hentikan</button>`;
}

const sedangMaju = new Set(); // cegah ketuk ganda saat menyimpan

async function majuTahap(id, dari) {
    const cek = getData('th_orders').find(x => x.id === id);
    if (!cek || !currentUser || cek.helpman !== currentUser.username || cek.status !== 'Dikerjakan') {
        return showToast('Pesanan sudah dibatalkan atau berubah status.', true);
    }
    const daftar = tahapanOrder(cek);
    const berikut = indeksTahap(cek.lacak) + 1;
    if (berikut !== dari + 1 || !daftar[berikut]) return perbaruiLacak();
    if (sedangMaju.has(id)) return;

    // Izin lokasi diminta langsung saat tombol ditekan
    const terakhir = berikut === daftar.length - 1;
    if (!terakhir && modeOrder(cek) !== 'online') mulaiBagikan(id);

    sedangMaju.add(id);
    const o = await ubahOrder(id, x => {
        if (x.status !== 'Dikerjakan' || x.helpman !== cek.helpman || indeksTahap(x.lacak) !== dari) return false;
        const lacak = Object.assign({ tahap: -1, riwayat: [] }, x.lacak);
        lacak.tahap = berikut;
        lacak.riwayat = [...(lacak.riwayat || []), { tahap: berikut, waktu: new Date().toISOString() }];
        const sesi = sedangBagi.get(id);
        if (sesi && sesi.posisi) lacak.posisi = { ...sesi.posisi };
        x.lacak = lacak;
    });
    sedangMaju.delete(id);
    if (!o) {
        perbaruiLacak();
        return showToast('Progres belum tersimpan. Cek koneksi atau status pesanan.', true);
    }

    tambahNotif(o.pelanggan, `Pesanan #${kodeOrder(o)} (${o.layanan}): ${daftar[berikut].label}.`, o.id);
    kirimPosisi(id, true);
    if (terakhir) hentikanBagikan(id);
    showToast(daftar[berikut].label);
    perbaruiLacak();
}

// =========================================================
// LAYAR LACAK PESANAN (semua peran yang berhak)
// =========================================================
let lacakUI = null;

function bolehLacak(o) {
    if (!o || !currentUser) return false;
    return o.pelanggan === currentUser.username || o.helpman === currentUser.username ||
        (currentUser.role === 'Admin Cabang' && o.wilayah === currentUser.wilayah) || currentUser.role === 'Head Admin';
}

function tombolLacak(o) {
    if (!STATUS_BISA_DILACAK.includes(o.status)) return '';
    const online = modeOrder(o) === 'online';
    const helpman = currentUser && currentUser.username === o.helpman;
    const teks = online ? 'Progres' : (helpman ? 'Peta & Progres' : 'Lacak');
    return `<button type="button" class="btn btn-primary btn-sm btn-lacak" onclick="bukaLacak('${o.id}')"><i class="fa-solid ${online ? 'fa-list-check' : 'fa-map-location-dot'}"></i> ${teks}</button>`;
}

// Dipanggil setiap modal dibuka / ditutup
function bersihkanPeta() {
    tutupPemilih();
    if (!lacakUI) return;
    clearInterval(lacakUI.timer);
    tutupKanal(lacakUI.kanal);
    if (lacakUI.peta) lacakUI.peta.remove();
    lacakUI = null;
}

function bukaLacak(id) {
    const o = getData('th_orders').find(x => x.id === id);
    if (!bolehLacak(o)) return showToast('Pesanan tidak ditemukan.', true);
    const online = modeOrder(o) === 'online';

    openModal(`Lacak Pesanan #${kodeOrder(o)}`, `
        <div class="lacak ${online ? 'lacak-online' : ''}">
            ${online ? '' : `
            <div class="lacak-kiri">
                <div class="peta-wrap">
                    <div id="lacak-peta" class="peta peta-lacak"></div>
                    <button type="button" class="peta-pusat" onclick="pusatkanPeta()" title="Tampilkan semua titik" aria-label="Tampilkan semua titik"><i class="fa-solid fa-expand"></i></button>
                </div>
                <div id="lacak-tandai"></div>
            </div>`}
            <div class="lacak-kanan">
                <div id="lacak-info"></div>
                <div id="lacak-aksi"></div>
                <div id="lacak-tahapan"></div>
            </div>
        </div>`);
    document.querySelector('#modal .modal-content').classList.add('modal-lebar');

    lacakUI = { id, peta: null, penanda: {}, garis: null, live: null, kanal: null, rute: null, ruteDiminta: 0, sudahPas: '', tandai: null };

    if (!online) {
        if (window.L) {
            lacakUI.peta = buatPeta('lacak-peta', o.koordJemput || PUSAT_KOTA[o.wilayah] || PUSAT_KOTA.malang, 13);
            lacakUI.peta.on('click', e => klikPetaLacak(e.latlng));
        } else {
            document.getElementById('lacak-peta').innerHTML = '<p class="peta-gagal">Peta gagal dimuat. Periksa koneksi internet.</p>';
        }
    }

    // Perangkat Helpman adalah sumber posisi, jadi hanya penonton yang berlangganan
    if (!online && currentUser.username !== o.helpman) {
        lacakUI.kanal = bukaKanal(o, 'posisi', data => {
            if (!lacakUI || lacakUI.id !== id || data.orderId !== id) return;
            lacakUI.live = data;
            perbaruiLacak();
        }, k => kirimKanal(k, 'minta', { orderId: id }));
    }

    lacakUI.timer = setInterval(perbaruiLacak, 2000);
    perbaruiLacak();
    if (lacakUI.peta) setTimeout(pusatkanPeta, 400);
}

function isiBilaBerubah(id, html) {
    const el = document.getElementById(id);
    if (el && el._isi !== html) { el._isi = html; el.innerHTML = html; }
}

// Gabungkan data tersimpan, kiriman live, dan posisi perangkat ini
function keadaanLacak(o) {
    let indeks = indeksTahap(o.lacak);
    let riwayat = (o.lacak && o.lacak.riwayat) || [];
    let posisi = o.lacak && titikValid(o.lacak.posisi) ? o.lacak.posisi : null;
    const live = lacakUI && lacakUI.live;
    if (live) {
        if (Number.isInteger(live.tahap) && live.tahap > indeks) { indeks = live.tahap; riwayat = Array.isArray(live.riwayat) ? live.riwayat : riwayat; }
        if (titikValid(live.posisi) && (!posisi || live.posisi.waktu > posisi.waktu)) posisi = live.posisi;
    }
    const sesi = sedangBagi.get(o.id);
    if (sesi && sesi.posisi) posisi = sesi.posisi;
    return { indeks, riwayat, posisi };
}

function perbaruiLacak() {
    if (!lacakUI) return;
    const o = getData('th_orders').find(x => x.id === lacakUI.id);
    if (!o) return;
    const online = modeOrder(o) === 'online';
    const daftar = tahapanOrder(o);
    const { indeks, riwayat, posisi } = keadaanLacak(o);
    const helpman = currentUser.username === o.helpman;
    const dikerjakan = o.status === 'Dikerjakan';
    const sekarang = daftar[indeks];
    const jenisTarget = sekarang && sekarang.target ? sekarang.target : 'jemput';
    const koordTarget = jenisTarget === 'tujuan' ? o.koordTujuan : o.koordJemput;
    const selesaiJalan = indeks >= daftar.length - 1;
    // Posisi Helpman hanya relevan selama pesanan dikerjakan
    const posisiTampil = dikerjakan && !online ? posisi : null;

    // --- Judul status ---
    let judul = teksProgres(o);
    if (dikerjakan && sekarang) judul = sekarang.label;
    if (o.status === 'Selesai') judul = 'Pesanan selesai';

    let rincian = '';
    if (posisiTampil) {
        const umur = Date.now() - new Date(posisiTampil.waktu).getTime();
        const basi = umur > 60000;
        if (titikValid(koordTarget) && !selesaiJalan) {
            mintaRute(posisiTampil, koordTarget, jenisTarget);
            const r = lacakUI.rute && lacakUI.rute.jenis === jenisTarget ? lacakUI.rute : null;
            const lurus = jarakMeter(posisiTampil, koordTarget);
            const jarak = r ? r.jarak : lurus * 1.3;
            const menit = Math.max(1, Math.round((r ? r.durasi : jarak / (25000 / 3600)) / 60));
            rincian += lurus < 80
                ? `<div class="lacak-eta"><strong>Sudah dekat</strong><span>${namaTitik(o, jenisTarget)}</span></div>`
                : `<div class="lacak-eta"><strong>&plusmn; ${menit} menit</strong><span>${teksJarak(jarak)} ke ${namaTitik(o, jenisTarget).toLowerCase()}${r ? '' : ' (perkiraan)'}</span></div>`;
        }
        rincian += `<div class="lacak-update ${basi ? 'basi' : ''}"><span class="titik-live"></span> Posisi Helpman diperbarui ${teksSejak(posisiTampil.waktu)}${basi ? ' &mdash; mungkin layar HP Helpman mati atau koneksinya terputus' : ''}</div>`;
    } else if (dikerjakan && !online && !selesaiJalan) {
        rincian = `<div class="lacak-update basi">${helpman ? 'Lokasi Anda belum dibagikan.' : 'Helpman belum membagikan lokasinya.'}</div>`;
    }
    if (online) rincian = `<div class="lacak-update"><i class="fa-solid fa-wifi"></i> Layanan online, tidak memakai peta. Progres diperbarui oleh Helpman.</div>`;

    const alamat = [];
    if (!online && o.lokasiJemput) alamat.push(`<li><i class="fa-solid fa-location-dot jemput"></i><span><b>${namaTitik(o, 'jemput')}</b>${escapeHtml(o.lokasiJemput)}</span></li>`);
    if (!online && o.lokasiTujuan) alamat.push(`<li><i class="fa-solid fa-flag-checkered tujuan"></i><span><b>${namaTitik(o, 'tujuan')}</b>${escapeHtml(o.lokasiTujuan)}</span></li>`);

    isiBilaBerubah('lacak-info', `
        <div class="lacak-status">
            <small>${labelLayanan(o)}</small>
            <h4>${escapeHtml(judul)}</h4>
            ${o.helpman ? `<div class="lacak-orang"><i class="fa-solid fa-user"></i> ${helpman ? `Pelanggan: ${escapeHtml(o.namaPelanggan || '-')}` : `Helpman: ${escapeHtml(namaUser(o.helpman))}`}</div>` : ''}
        </div>
        ${rincian}
        ${alamat.length ? `<ul class="lacak-alamat">${alamat.join('')}</ul>` : ''}`);

    // --- Tombol ---
    let aksi = '';
    if (helpman && dikerjakan) {
        const lanjut = daftar[indeks + 1];
        if (lanjut) aksi += `<button type="button" class="btn btn-warning" onclick="majuTahap('${o.id}', ${indeks})"><i class="fa-solid fa-forward-step"></i> ${lanjut.aksi}</button>`;
        else aksi += `<button type="button" class="btn btn-warning" onclick="laporSelesai('${o.id}')"><i class="fa-solid fa-flag-checkered"></i> Lapor Selesai</button>`;
        if (!online) {
            aksi += sedangBagi.has(o.id)
                ? `<button type="button" class="btn btn-danger" onclick="hentikanBagikan('${o.id}')"><i class="fa-solid fa-stop"></i> Hentikan berbagi lokasi</button>`
                : `<button type="button" class="btn btn-primary" onclick="mulaiBagikan('${o.id}'); perbaruiLacak()"><i class="fa-solid fa-location-arrow"></i> Bagikan lokasi saya</button>`;
        }
    }
    const kecil = [];
    if (o.helpman && (helpman || currentUser.username === o.pelanggan)) kecil.push(`<button type="button" class="btn btn-outline" onclick="openChat('${o.id}')"><i class="fa-solid fa-comments"></i> Chat</button>`);
    if (helpman && !online) {
        const nav = linkNavigasi(o, jenisTarget);
        if (nav) kecil.push(`<a class="btn btn-outline" href="${escapeHtml(nav)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-route"></i> Navigasi</a>`);
    }
    if (kecil.length) aksi += `<div class="lacak-aksi-baris">${kecil.join('')}</div>`;
    isiBilaBerubah('lacak-aksi', aksi ? `<div class="lacak-aksi">${aksi}</div>` : '');

    // --- Garis waktu ---
    const urutan = ['Menunggu Admin', 'Mencari Helpman', 'Dikerjakan', 'Menunggu Validasi', 'Selesai'];
    const posStatus = urutan.indexOf(o.status);
    const waktuTahap = i => { const r = riwayat.find(x => x.tahap === i); return r ? formatJam(r.waktu) : ''; };
    const baris = [
        { label: 'Pesanan dibuat', selesai: true, waktu: o.waktuPesan ? formatJam(o.waktuPesan) : '' },
        { label: 'Dikonfirmasi Admin', selesai: posStatus >= 1 },
        { label: 'Helpman ditugaskan', selesai: posStatus >= 2 },
        ...daftar.map((t, i) => ({ label: t.label, selesai: posStatus >= 3 || i < indeks, aktif: dikerjakan && i === indeks, waktu: waktuTahap(i) })),
        { label: 'Divalidasi, pesanan selesai', selesai: posStatus >= 4 }
    ];
    isiBilaBerubah('lacak-tahapan', o.status === 'Dibatalkan'
        ? '<div class="chat-closed">Pesanan ini sudah dibatalkan.</div>'
        : `<ol class="tahapan">${baris.map(b => `<li class="${b.aktif ? 'aktif' : (b.selesai ? 'selesai' : '')}"><span>${escapeHtml(b.label)}</span>${b.waktu ? `<small>${b.waktu}</small>` : ''}</li>`).join('')}</ol>`);

    if (!online) {
        gambarTandai(o);
        gambarPeta(o, posisiTampil, jenisTarget, selesaiJalan);
    }
}

// --- Pelanggan bisa menambahkan titik untuk pesanan yang belum punya koordinat ---
function gambarTandai(o) {
    let html = '';
    if (currentUser.username === o.pelanggan && o.status !== 'Menunggu Validasi') {
        const perlu = [];
        if (!titikValid(o.koordJemput)) perlu.push('jemput');
        if (!titikValid(o.koordTujuan) && o.lokasiTujuan) perlu.push('tujuan');
        html = perlu.map(j => `<button type="button" class="btn-titik ${lacakUI.tandai === j ? 'aktif' : ''}" onclick="mulaiTandai('${j}')"><i class="fa-solid fa-map-pin"></i> ${lacakUI.tandai === j ? `Ketuk peta: ${namaTitik(o, j).toLowerCase()}` : `Tandai ${namaTitik(o, j).toLowerCase()}`}</button>`).join('');
    } else if (!titikValid(o.koordJemput)) {
        html = '<small class="titik-hint">Titik di peta belum ditandai pelanggan. Gunakan alamat tertulis atau chat.</small>';
    }
    isiBilaBerubah('lacak-tandai', html ? `<div class="titik-alat">${html}</div>` : '');
}

function mulaiTandai(jenis) {
    lacakUI.tandai = lacakUI.tandai === jenis ? null : jenis;
    perbaruiLacak();
}

async function klikPetaLacak(p) {
    if (!lacakUI || !lacakUI.tandai) return;
    const kunci = lacakUI.tandai === 'tujuan' ? 'koordTujuan' : 'koordJemput';
    const id = lacakUI.id;
    lacakUI.tandai = null;
    const o = await ubahOrder(id, x => {
        if (x.pelanggan !== currentUser.username || x.status === 'Dibatalkan') return false;
        x[kunci] = { lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) };
    });
    showToast(o ? 'Titik disimpan.' : 'Titik belum tersimpan. Coba lagi.', !o);
    perbaruiLacak();
}

function gambarPeta(o, posisi, jenisTarget, selesaiJalan) {
    const peta = lacakUI.peta;
    if (!peta) return;
    const atur = (kunci, titik, fa, kelas, judul) => {
        let m = lacakUI.penanda[kunci];
        if (!titikValid(titik)) { if (m) { m.remove(); delete lacakUI.penanda[kunci]; } return; }
        if (!m) {
            m = lacakUI.penanda[kunci] = L.marker([titik.lat, titik.lng], { icon: ikonPeta(fa, kelas), title: judul, alt: judul, zIndexOffset: kunci === 'helpman' ? 1000 : 0 })
                .addTo(peta).bindPopup(escapeHtml(judul));
        } else m.setLatLng([titik.lat, titik.lng]);
    };
    atur('jemput', o.koordJemput, modeOrder(o) === 'belanja' ? 'fa-store' : 'fa-location-dot', 'pin-jemput', namaTitik(o, 'jemput'));
    atur('tujuan', o.koordTujuan, 'fa-flag-checkered', 'pin-tujuan', namaTitik(o, 'tujuan'));
    atur('helpman', posisi, ikonHelpman(o), 'pin-helpman', `Helpman: ${namaUser(o.helpman)}`);

    // Garis dari Helpman ke titik berikutnya; sebelum ada posisi, garis jemput -> tujuan
    const target = jenisTarget === 'tujuan' ? o.koordTujuan : o.koordJemput;
    let titik = null, putus = true;
    if (posisi && titikValid(target) && !selesaiJalan) {
        const r = lacakUI.rute && lacakUI.rute.jenis === jenisTarget ? lacakUI.rute : null;
        titik = r ? r.garis : [[posisi.lat, posisi.lng], [target.lat, target.lng]];
        putus = !r;
    } else if (titikValid(o.koordJemput) && titikValid(o.koordTujuan)) {
        titik = [[o.koordJemput.lat, o.koordJemput.lng], [o.koordTujuan.lat, o.koordTujuan.lng]];
    }
    if (!titik) { if (lacakUI.garis) { lacakUI.garis.remove(); lacakUI.garis = null; } }
    else {
        if (!lacakUI.garis) lacakUI.garis = L.polyline(titik, { color: '#2563eb', weight: 5, opacity: .75 }).addTo(peta);
        else lacakUI.garis.setLatLngs(titik);
        lacakUI.garis.setStyle({ dashArray: putus ? '8 10' : null });
    }

    // Paskan tampilan saat susunan titik berubah, atau Helpman keluar dari layar
    const susunan = Object.keys(lacakUI.penanda).sort().join();
    const m = lacakUI.penanda.helpman;
    if (susunan !== lacakUI.sudahPas) { lacakUI.sudahPas = susunan; pusatkanPeta(); }
    else if (m && peta._loaded && !peta.getBounds().contains(m.getLatLng())) pusatkanPeta();
}

function pusatkanPeta() {
    if (!lacakUI || !lacakUI.peta) return;
    const titik = Object.values(lacakUI.penanda).map(m => m.getLatLng());
    lacakUI.peta.invalidateSize();
    if (titik.length === 1) lacakUI.peta.setView(titik[0], 16);
    else if (titik.length > 1) lacakUI.peta.fitBounds(L.latLngBounds(titik), { padding: [40, 40], maxZoom: 17 });
}

// Rute jalan dari OSRM, dibatasi agar tidak membebani server
async function mintaRute(dari, ke, jenis) {
    const ui = lacakUI;
    if (!ui || Date.now() - ui.ruteDiminta < 15000) return;
    const r = ui.rute;
    if (r && r.jenis === jenis && jarakMeter(r.dari, dari) < 100 && jarakMeter(r.ke, ke) < 10) return;
    ui.ruteDiminta = Date.now();
    try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${dari.lng},${dari.lat};${ke.lng},${ke.lat}?overview=full&geometries=geojson`);
        const d = await res.json();
        const rute = d.routes && d.routes[0];
        if (!rute || lacakUI !== ui) return;
        ui.rute = {
            jenis, dari: { ...dari }, ke: { ...ke }, jarak: rute.distance, durasi: rute.duration,
            garis: rute.geometry.coordinates.map(c => [c[1], c[0]])
        };
        perbaruiLacak();
    } catch (err) {
        if (lacakUI === ui) ui.rute = null; // pakai perkiraan garis lurus
    }
}

// Putar layar / ubah ukuran jendela: sesuaikan kembali tampilan peta
let jedaUkuran = null;
window.addEventListener('resize', () => {
    clearTimeout(jedaUkuran);
    jedaUkuran = setTimeout(() => {
        if (pemilih) pemilih.peta.invalidateSize();
        // Saat keyboard HP muncul, ukuran berubah: cukup hitung ulang bila lebar tetap
        if (lacakUI && lacakUI.peta) {
            if (window.innerWidth !== lacakUI.lebar) { lacakUI.lebar = window.innerWidth; pusatkanPeta(); }
            else lacakUI.peta.invalidateSize();
        }
    }, 250);
});
