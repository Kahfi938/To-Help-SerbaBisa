// =====================================================================
// supabase-store.js
// Menggantikan penyimpanan localStorage dengan database Supabase.
// WAJIB dimuat SETELAH script.js (fungsi di bawah menimpa versi lama):
//   initDB, getSnapshot, getData, setData, window.onload
// Memakai konstanta `db` yang sudah dibuat di script.js.
// =====================================================================

const STORE_TABEL = { th_users: 'users', th_orders: 'orders', th_absensi: 'absensi', th_chats: 'chats', th_notifs: 'notifs' };

const STORE_ID = {
    th_users: r => r.username,
    th_orders: r => r.id,
    th_chats: r => r.id,
    th_notifs: r => r.id,
    th_absensi: r => r.id || (r.id = 'A-' + Date.now() + Math.random().toString(36).slice(2, 6))
};

const storeCache = {};
const storeLastSync = {};
let storeVersion = 0;      // naik setiap data berubah (dipakai auto-refresh halaman)
let storePending = 0;      // jumlah penulisan yang sedang berjalan
let storeSinkronBusy = false;
let storeSiap = false;     // true setelah data pertama kali selesai dimuat
const STORE_PER_HALAMAN = 1000; // batas baris per permintaan di Supabase

Object.keys(STORE_TABEL).forEach(k => { storeCache[k] = []; storeLastSync[k] = '1970-01-01T00:00:00Z'; });

// ---------- API yang dipakai script.js ----------
function getData(key) {
    return structuredClone(storeCache[key] || []);
}

function setData(key, arr) {
    const idOf = STORE_ID[key];
    const lama = new Map(storeCache[key].map(r => [idOf(r), JSON.stringify(r)]));
    const baru = [], ubah = [];

    arr.forEach(r => {
        const id = idOf(r);
        const js = JSON.stringify(r);
        if (!lama.has(id)) baru.push({ id, data: r });
        else if (lama.get(id) !== js) ubah.push({ id, data: r });
    });

    storeCache[key] = structuredClone(arr);   // tampil langsung di layar
    storeVersion++;
    if (baru.length || ubah.length) storeTulis(key, baru, ubah);
}

function getSnapshot() {
    return String(storeVersion);
}

// ---------- Tulis ke Supabase (hanya baris yang berubah) ----------
async function storeTulis(key, baru, ubah) {
    storePending++;
    try {
        if (baru.length) {
            const { error } = await db.from(STORE_TABEL[key]).insert(baru);
            if (error) throw error;
        }
        if (ubah.length) {
            const { error } = await db.from(STORE_TABEL[key]).upsert(ubah);
            if (error) throw error;
        }
    } catch (err) {
        console.error('Gagal menyimpan', key, err);
        showToast(err && err.code === '23505' ? 'Data sudah ada (duplikat).' : 'Gagal menyimpan ke server. Cek koneksi internet.', true);
        try { await storeMuatSemua(); } catch (e) { /* abaikan */ }
    } finally {
        storePending--;
    }
}

// ---------- Baca dari Supabase ----------
async function storeMuatSemua() {
    for (const key of Object.keys(STORE_TABEL)) {
        const data = [];
        for (let awal = 0; ; awal += STORE_PER_HALAMAN) {
            const { data: halaman, error } = await db.from(STORE_TABEL[key])
                .select('id,data,updated_at')
                .order('created_at', { ascending: true })
                .order('id', { ascending: true })
                .range(awal, awal + STORE_PER_HALAMAN - 1);
            if (error) throw error;
            data.push(...halaman);
            if (halaman.length < STORE_PER_HALAMAN) break;
        }
        storeCache[key] = data.map(r => r.data);
        storeLastSync[key] = data.reduce((m, r) => (r.updated_at > m ? r.updated_at : m), '1970-01-01T00:00:00Z');
    }
    storeVersion++;
}

// Ambil hanya baris yang berubah sejak sinkron terakhir
async function storeSinkron() {
    if (storeSinkronBusy || storePending > 0) return;
    storeSinkronBusy = true;
    try {
        for (const key of Object.keys(STORE_TABEL)) {
            const { data, error } = await db.from(STORE_TABEL[key])
                .select('id,data,updated_at')
                .gte('updated_at', storeLastSync[key])
                .order('updated_at', { ascending: true });
            if (error || storePending > 0) return;

            const idOf = STORE_ID[key];
            data.forEach(r => {
                const i = storeCache[key].findIndex(x => idOf(x) === r.id);
                if (i < 0) {
                    storeCache[key].push(r.data);
                    storeVersion++;
                } else if (JSON.stringify(storeCache[key][i]) !== JSON.stringify(r.data)) {
                    storeCache[key][i] = r.data;
                    storeVersion++;
                }
                if (r.updated_at > storeLastSync[key]) storeLastSync[key] = r.updated_at;
            });
        }
    } catch (err) {
        console.error('Sinkron gagal', err);
    } finally {
        storeSinkronBusy = false;
    }
}

// ---------- Ubah satu baris dengan aman (dipakai peta.js) ----------
// Baris dibaca ulang dari server, lalu ditulis HANYA jika belum diubah perangkat lain.
// Dengan begitu pembaruan lokasi tidak menimpa pembatalan / perubahan status.
// ubah(data) boleh mengembalikan false untuk membatalkan penulisan.
async function storeUbahBaris(key, id, ubah) {
    const terapkan = data => {
        const i = storeCache[key].findIndex(x => STORE_ID[key](x) === id);
        if (i >= 0 && JSON.stringify(storeCache[key][i]) !== JSON.stringify(data)) {
            storeCache[key][i] = structuredClone(data);
            storeVersion++;
        }
    };
    storePending++;
    try {
        for (let coba = 0; coba < 3; coba++) {
            const { data: baris, error } = await db.from(STORE_TABEL[key])
                .select('data,updated_at').eq('id', id).single();
            if (error) throw error;
            const data = structuredClone(baris.data);
            if (ubah(data) === false) { terapkan(baris.data); return null; }
            const { data: hasil, error: gagal } = await db.from(STORE_TABEL[key])
                .update({ data }).eq('id', id).eq('updated_at', baris.updated_at).select('id');
            if (gagal) throw gagal;
            if (hasil.length) { terapkan(data); return data; }
        }
        return null;
    } catch (err) {
        console.warn('Gagal memperbarui', key, err);
        return null;
    } finally {
        storePending--;
    }
}

// ---------- Menimpa initDB & onload ----------
async function initDB() {
    try {
        await storeMuatSemua();
    } catch (err) {
        console.error(err);
        showToast('Tidak bisa terhubung ke database. Mencoba lagi...', true);
        await new Promise(selesai => setTimeout(selesai, 5000)); // sinyal HP sering putus sebentar
        return initDB();
    }

    // Akun bawaan (admin, finance, head admin) dibuat sekali, tidak menimpa yang sudah ada
    const ada = new Set(storeCache.th_users.map(u => u.username));
    const belum = defaultUsers.filter(u => !ada.has(u.username));
    if (belum.length) {
        const { error } = await db.from('users')
            .upsert(belum.map(u => ({ id: u.username, data: u })), { onConflict: 'id', ignoreDuplicates: true });
        if (!error) { storeCache.th_users.push(...belum.map(u => structuredClone(u))); storeVersion++; }
        else console.error(error);
    }

    storeSiap = true;
    setInterval(storeSinkron, 3000);
}

window.onload = async () => {
    await initDB();
    const session = sessionStorage.getItem('th_session');
    if (session) {
        const tersimpan = JSON.parse(session);
        const user = getData('th_users').find(u => u.username === tersimpan.username);
        if (user) {
            document.getElementById('landing-section').style.display = 'none';
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('dashboard-section').style.display = 'flex';
            initDashboard(user);
        }
    }
};
