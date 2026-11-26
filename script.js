// --- DATABASE LAYANAN & TARIF ---
// Setiap paket punya "mode" yang menentukan isi form pemesanan:
//   'rute'    : Lokasi Jemput + Lokasi Tujuan (ojek, taxi, pindahan)
//   'lokasi'  : Satu alamat, Helpman datang ke lokasi (bersih-bersih, teknisi, dll)
//   'belanja' : Tempat beli + alamat antar (jastip)
//   'online'  : Dikerjakan online, TANPA lokasi (joki tugas, editing, dll)
//   'pilih'   : Pelanggan memilih sendiri apakah Helpman perlu datang atau online (Jasa Kustom)
const SUPABASE_URL = "https://heemyevahpxqrnlanckq.supabase.co";
const SUPABASE_KEY = "sb_publishable_4Z3CaCDjSqoLL9CWZHZosg_PtSSftCY";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const pkt = (nama, harga, satuan, mode, awalan = '', extra = {}) => ({ nama, harga, satuan, mode, awalan, ...extra });
const MULAI = 'Mulai dari';

const layananData = [
    {
        id: 'L01', nama: 'Ojek (Motor)', icon: 'fa-motorcycle', color: '#ef4444',
        deskripsi: 'Layanan transportasi ojek motor cepat, andal, dan ramah kantong siap mengantar Anda ke tujuan.',
        pakets: [pkt('Motor (Ojek)', 8000, 'perjalanan', 'rute', MULAI)]
    },
    {
        id: 'L02', nama: 'Jastip (Jasa Titip)', icon: 'fa-shopping-bag', color: '#f97316',
        deskripsi: 'Jasa titip pembelian makanan, minuman, obat, oleh-oleh, atau belanjaan kebutuhan harian lainnya.',
        pakets: [pkt('Makanan/Minuman/Barang', 10000, 'order', 'belanja', MULAI)]
    },
    {
        id: 'L03', nama: 'Taxi (Mobil)', icon: 'fa-car', color: '#3b82f6',
        deskripsi: 'Layanan transportasi mobil ber-AC yang nyaman, aman, dan bersahabat untuk perjalanan pribadi.',
        pakets: [pkt('Mobil (Taxi)', 18000, 'perjalanan', 'rute', MULAI)]
    },
    {
        id: 'L04', nama: 'Bersih-Bersih', icon: 'fa-broom', color: '#10b981',
        deskripsi: 'Layanan pembersihan profesional untuk memastikan lingkungan Anda tetap bersih dan nyaman.',
        pakets: [
            pkt('Rumah Subsidi', 250000, 'paket', 'lokasi', '', { lokasiLabel: 'Alamat Rumah' }),
            pkt('Rumah Komersil', 350000, 'paket', 'lokasi', '', { lokasiLabel: 'Alamat Rumah' }),
            pkt('Ruang Tamu', 7000, 'm²', 'lokasi', '', { lokasiLabel: 'Alamat Lokasi Pembersihan', qtyLabel: 'Luas area (m²)' }),
            pkt('Kamar Tidur', 7000, 'm²', 'lokasi', '', { lokasiLabel: 'Alamat Lokasi Pembersihan', qtyLabel: 'Luas area (m²)' }),
            pkt('Dapur', 7000, 'm²', 'lokasi', '', { lokasiLabel: 'Alamat Lokasi Pembersihan', qtyLabel: 'Luas area (m²)' }),
            pkt('Halaman', 7000, 'm²', 'lokasi', '', { lokasiLabel: 'Alamat Lokasi Pembersihan', qtyLabel: 'Luas area (m²)' }),
            pkt('Kamar Mandi (Kecil)', 50000, 'kamar mandi', 'lokasi', '', { lokasiLabel: 'Alamat Lokasi Pembersihan', qtyLabel: 'Jumlah kamar mandi' }),
            pkt('Kamar Mandi (Besar)', 70000, 'kamar mandi', 'lokasi', '', { lokasiLabel: 'Alamat Lokasi Pembersihan', qtyLabel: 'Jumlah kamar mandi' }),
            pkt('Tandon', 50000, 'unit', 'lokasi', MULAI, { lokasiLabel: 'Alamat Lokasi Tandon', qtyLabel: 'Jumlah tandon' })
        ]
    },
    {
        id: 'L05', nama: 'Pindahan & Angkut Barang', icon: 'fa-truck', color: '#eab308',
        deskripsi: 'Solusi tepat dan mudah untuk pindahan rumah, kos, kantor, dan barang-barang besar Anda.',
        pakets: [
            pkt('Tossa', 85000, 'trip', 'rute', '', { qtyLabel: 'Jumlah trip' }),
            pkt('Pickup', 165000, 'trip', 'rute', '', { qtyLabel: 'Jumlah trip' }),
            pkt('Kuli Only', 35000, 'orang', 'lokasi', '', { lokasiLabel: 'Alamat Lokasi Angkut', qtyLabel: 'Jumlah orang' })
        ]
    },
    {
        id: 'L06', nama: 'Jasa Nemenin', icon: 'fa-user-friends', color: '#f59e0b',
        deskripsi: 'Layanan pendamping ramah untuk berbagai aktivitas seperti belanja, kondangan, jalan-jalan, dan lainnya.',
        pakets: [
            pkt('Tarif Durasi', 15000, 'jam', 'lokasi', '', { lokasiLabel: 'Lokasi Pertemuan', qtyLabel: 'Durasi (jam)' }),
            pkt('Paket Setengah Hari', 100000, '7 jam', 'lokasi', '', { lokasiLabel: 'Lokasi Pertemuan' }),
            pkt('Paket Satu Hari', 150000, '14 jam', 'lokasi', '', { lokasiLabel: 'Lokasi Pertemuan' }),
            pkt('Paket Full Time', 250000, '24 jam', 'lokasi', '', { lokasiLabel: 'Lokasi Pertemuan' }),
            pkt('Transport', 2000, 'km', 'rute', '', { qtyLabel: 'Perkiraan jarak (km)' })
        ]
    },
    {
        id: 'L07', nama: 'Bantuan Online', icon: 'fa-laptop', color: '#22c55e',
        deskripsi: 'Layanan bantuan digital dan online seperti paid promote, sleep call, buzzer, dan joki game.',
        pakets: [
            pkt('Paid Promote SW', 10000, 'posting', 'online', MULAI, { qtyLabel: 'Jumlah posting' }),
            pkt('Sleep Call', 15000, 'jam', 'online', '', { qtyLabel: 'Durasi (jam)' }),
            pkt('Buzzer', 50000, 'project', 'online', MULAI, { qtyLabel: 'Jumlah project' }),
            pkt('Joki All Game', 100000, 'order', 'online', 'Tarif tanya Admin', { qtyLabel: 'Jumlah order' })
        ]
    },
    {
        id: 'L08', nama: 'Joki Tugas', icon: 'fa-book', color: '#a855f7',
        deskripsi: 'Bantuan pengerjaan tugas sekolah, kuliah, makalah, presentasi, skripsi, dan karya ilmiah lainnya.',
        pakets: [
            pkt('Makalah', 100000, 'makalah', 'online', MULAI),
            pkt('Power Point', 50000, 'file', 'online', MULAI),
            pkt('Tugas Custom', 30000, 'tugas', 'online', MULAI),
            pkt('Thesis', 3500000, 'proyek', 'online', MULAI),
            pkt('Judul Skripsi', 75000, 'paket', 'online', MULAI),
            pkt('Proposal (Sempro)', 750000, 'paket', 'online', 'Paket Sempro'),
            pkt('Analisis Data', 900000, 'proyek', 'online', MULAI),
            pkt('Jurnal', 150000, 'artikel', 'online', MULAI),
            pkt('Essai', 100000, 'naskah', 'online', MULAI)
        ]
    },
    {
        id: 'L09', nama: 'Editing & Dokumentasi', icon: 'fa-camera', color: '#ec4899',
        deskripsi: 'Layanan kreatif editing foto, video, serta fotografer & videografer untuk wisuda, event, dan dokumentasi lainnya.',
        pakets: [
            pkt('Foto (Editing)', 30000, 'foto', 'online', MULAI, { qtyLabel: 'Jumlah foto' }),
            pkt('Video (Editing)', 50000, 'video', 'online', MULAI, { qtyLabel: 'Jumlah video' }),
            pkt('Fotografer (30 menit)', 200000, '30 menit', 'lokasi', '', { lokasiLabel: 'Lokasi Pemotretan' }),
            pkt('Fotografer (45 menit)', 250000, '45 menit', 'lokasi', '', { lokasiLabel: 'Lokasi Pemotretan' }),
            pkt('Fotografer (60 menit)', 300000, '60 menit', 'lokasi', '', { lokasiLabel: 'Lokasi Pemotretan' }),
            pkt('Videografer', 400000, 'sesi', 'lokasi', '', { lokasiLabel: 'Lokasi Pengambilan Video', qtyLabel: 'Jumlah sesi' }),
            pkt('Dokumentasi (iPhone 13)', 50000, 'sesi', 'lokasi', MULAI, { lokasiLabel: 'Lokasi Dokumentasi', qtyLabel: 'Jumlah sesi' })
        ]
    },
    {
        id: 'L10', nama: 'Penitipan & Packing', icon: 'fa-box', color: '#0ea5e9',
        deskripsi: 'Layanan penitipan barang harian, penitipan kendaraan, packing kardus rapi, dan unboxing.',
        pakets: [
            pkt('Packing', 15000, 'kardus', 'lokasi', MULAI, { lokasiLabel: 'Alamat Lokasi Packing', qtyLabel: 'Jumlah kardus' }),
            pkt('Unboxing', 5000, 'paket', 'lokasi', MULAI, { lokasiLabel: 'Alamat Lokasi Unboxing', qtyLabel: 'Jumlah paket' }),
            pkt('Titip Barang', 20000, 'hari', 'lokasi', MULAI, { lokasiLabel: 'Lokasi Penjemputan / Penyerahan Barang', qtyLabel: 'Lama titip (hari)' }),
            pkt('Titip Kendaraan', 10000, 'hari', 'lokasi', MULAI, { lokasiLabel: 'Lokasi Penjemputan / Penyerahan Kendaraan', qtyLabel: 'Lama titip (hari)' })
        ]
    },
    {
        id: 'L11', nama: 'Teknisi & Tukang', icon: 'fa-tools', color: '#eab308',
        deskripsi: 'Tenaga tukang dan teknisi handal untuk perbaikan genteng, instalasi listrik, pipa air, dan lainnya.',
        pakets: [
            pkt('Bantuan Ringan', 50000, 'pengerjaan', 'lokasi', '', { lokasiLabel: 'Alamat Lokasi Pengerjaan', qtyLabel: 'Jumlah pengerjaan' }),
            pkt('Bantuan Sedang', 100000, 'pengerjaan', 'lokasi', '', { lokasiLabel: 'Alamat Lokasi Pengerjaan', qtyLabel: 'Jumlah pengerjaan' }),
            pkt('Bantuan Berat', 150000, 'hari', 'lokasi', '', { lokasiLabel: 'Alamat Lokasi Pengerjaan', qtyLabel: 'Lama pengerjaan (hari)' })
        ]
    },
    {
        id: 'L12', nama: 'Travel & Rental Kendaraan', icon: 'fa-key', color: '#14b8a6',
        deskripsi: 'Sewa kendaraan mobil dan motor lepas kunci / plus driver serta sewa driver berpengalaman.',
        pakets: [
            pkt('Rental Mobil', 300000, 'hari', 'lokasi', MULAI, { lokasiLabel: 'Lokasi Pengambilan / Pengantaran Mobil', qtyLabel: 'Lama sewa (hari)' }),
            pkt('Rental Motor', 80000, 'hari', 'lokasi', '', { lokasiLabel: 'Lokasi Pengambilan / Pengantaran Motor', qtyLabel: 'Lama sewa (hari)' }),
            pkt('Driver Only', 100000, 'sesi', 'lokasi', MULAI, { lokasiLabel: 'Lokasi Penjemputan Driver', qtyLabel: 'Jumlah sesi' })
        ]
    },
    {
        id: 'L13', nama: 'Daily Activity', icon: 'fa-clock', color: '#8b5cf6',
        deskripsi: 'Bantuan aktivitas harian fleksibel untuk berbagai keperluan mendesak Anda.',
        pakets: [pkt('Kebutuhan Harian', 5000, 'Helpman', 'lokasi', '', { lokasiLabel: 'Lokasi Aktivitas', qtyLabel: 'Jumlah Helpman' })]
    },
    {
        id: 'L14', nama: 'Jasa Kustom', icon: 'fa-star', color: '#f43f5e',
        deskripsi: 'Layanan kustom bebas sesuai kebutuhan spesifik Anda yang tidak tertera di menu lainnya.',
        pakets: [pkt('Request Bantuan Apapun', 20000, 'request', 'pilih', MULAI, { lokasiLabel: 'Alamat Lokasi Pengerjaan', qtyLabel: 'Jumlah request' })]
    },
    {
        id: 'L16', nama: 'Ayo Sehat', icon: 'fa-user-doctor', color: '#2563eb', kota: ['jember'],
        deskripsi: 'Kini To Help menyediakan perawatan dokter private, dan kami sudah bekerjasama dengan dokter dan tenaga kesehatan berpengalaman.',
        pakets: [
            pkt('Perawatan Luka', 100000, 'layanan', 'lokasi', 'Start From', { lokasiLabel: 'Alamat Pasien', tanpaJumlah: true, detailLabel: 'Keluhan / Kondisi Pasien (usia, gejala, dll)' }),
            pkt('Perawatan Penyakit Lansia', 150000, 'layanan', 'lokasi', 'Start From', { lokasiLabel: 'Alamat Pasien', tanpaJumlah: true, detailLabel: 'Keluhan / Kondisi Pasien (usia, gejala, dll)' }),
            pkt('Pengobatan Penyakit Umum', 130000, 'layanan', 'lokasi', 'Start From', { lokasiLabel: 'Alamat Pasien', tanpaJumlah: true, detailLabel: 'Keluhan / Kondisi Pasien (usia, gejala, dll)' }),
            pkt('Khitan / Sunat', 500000, 'layanan', 'lokasi', 'Start From', { lokasiLabel: 'Alamat Pelaksanaan', tanpaJumlah: true, detailLabel: 'Data Pasien (usia, kondisi, catatan khusus)' }),
            pkt('Immune Booster', 150000, 'layanan', 'lokasi', 'Only', { lokasiLabel: 'Alamat Pasien', tanpaJumlah: true, detailLabel: 'Catatan / Kondisi Pasien' }),
            pkt('Booster Recovery', 200000, 'layanan', 'lokasi', 'Only', { lokasiLabel: 'Alamat Pasien', tanpaJumlah: true, detailLabel: 'Catatan / Kondisi Pasien' })
        ]
    },
    {
        id: 'L15', nama: 'Rakit Merakit', icon: 'fa-hammer', color: '#10b981',
        deskripsi: 'Layanan perakitan barang mulai dari kursi, meja, almari, ranjang, dan lain-lain.',
        pakets: [pkt('Rakit Barang', 50000, 'barang', 'lokasi', MULAI, { lokasiLabel: 'Alamat Lokasi Perakitan', qtyLabel: 'Jumlah barang' })]
    }
];

function hargaLabel(p) {
    return `${p.awalan ? p.awalan + ' ' : ''}${formatRupiah(p.harga)} / ${p.satuan}`;
}

const defaultUsers = [
    { name: "Admin Malang", username: "admin_malang", password: "123456", role: "Admin Cabang", wilayah: "malang" },
    { name: "Admin Jember", username: "admin_jember", password: "123456", role: "Admin Cabang", wilayah: "jember" },
    { name: "Andi Finance", username: "finance", password: "123456", role: "Finance" },
    { name: "Bapak Direktur", username: "head_admin", password: "123456", role: "Head Admin" }
];

const VALID_OTP_CODES = ["TOHELP-HELPMAN-2024", "HELPMAN-VIP-001", "JOKO-HELPMAN-99"];

// Dinaikkan ke v6.0 untuk menghapus data lama otomatis
const DB_VERSION = "v6.0";
let refreshInterval;

// --- INISIALISASI ---
// (Versi ini ditimpa oleh supabase-store.js yang dimuat setelah script.js)
function initDB() {
    let dbVersion = localStorage.getItem('th_db_version');
    if (dbVersion !== DB_VERSION) {
        localStorage.removeItem('th_users');
        localStorage.removeItem('th_orders');
        localStorage.removeItem('th_absensi');
        localStorage.setItem('th_db_version', DB_VERSION);
    }

    let existingUsers = getData('th_users') || [];
    defaultUsers.forEach(defUser => {
        if (!existingUsers.find(u => u.username === defUser.username)) existingUsers.push(defUser);
    });
    setData('th_users', existingUsers);

    if (!localStorage.getItem('th_orders')) localStorage.setItem('th_orders', JSON.stringify([]));
    if (!localStorage.getItem('th_absensi')) localStorage.setItem('th_absensi', JSON.stringify([]));
    if (!localStorage.getItem('th_chats')) localStorage.setItem('th_chats', JSON.stringify([]));
    if (!localStorage.getItem('th_notifs')) localStorage.setItem('th_notifs', JSON.stringify([]));
}

// --- AUTO UPDATE (REALTIME) ---
let lastSnapshot = '';
function getSnapshot() {
    return ['th_orders', 'th_users', 'th_absensi', 'th_chats', 'th_notifs'].map(k => localStorage.getItem(k)).join('|');
}

function startAutoUpdate(pageId) {
    clearInterval(refreshInterval);
    lastSnapshot = getSnapshot();
    refreshInterval = setInterval(() => {
        // Jangan refresh saat modal terbuka agar input form tidak hilang
        if (document.getElementById('modal').classList.contains('active')) return;

        // PERBAIKAN: hanya render ulang kalau data benar-benar berubah.
        // Sebelumnya halaman dirender ulang tiap 2 detik sehingga dropdown
        // pilihan Helpman selalu kembali ke pilihan pertama.
        const snap = getSnapshot();
        if (snap === lastSnapshot) return;
        lastSnapshot = snap;

        if (['dashboard', 'order', 'riwayat', 'order_saya', 'penghasilan', 'helpman'].includes(pageId)) {
            const container = document.getElementById('dashboard-content');

            // Simpan pilihan dropdown agar tidak ter-reset
            const selected = {};
            container.querySelectorAll('select').forEach(s => { if (s.id) selected[s.id] = s.value; });
            const scrollY = window.scrollY;

            renderContent(container, pageId);

            Object.keys(selected).forEach(id => {
                const el = document.getElementById(id);
                if (el && Array.from(el.options).some(op => op.value === selected[id])) el.value = selected[id];
            });
            window.scrollTo(0, scrollY);
        }
    }, 2000);
}

// --- UTILITAS ---
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    toast.className = isError ? 'toast show error' : 'toast show';
    toast.querySelector('i').className = isError ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check';
    setTimeout(() => toast.classList.remove('show'), 3500);
}

function openModal(title, htmlContent) { document.getElementById('modal-title').innerText = title; document.getElementById('modal-body').innerHTML = htmlContent; document.getElementById('modal').classList.add('active'); }
function closeModal() { clearInterval(chatInterval); document.getElementById('modal').classList.remove('active'); }
function formatRupiah(angka) {
    if (angka === null || angka === undefined || isNaN(angka)) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}
function formatTanggal(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// --- AUTH & LANDING ---
function showLogin() { document.getElementById('landing-section').style.display = 'none'; document.getElementById('auth-section').style.display = 'flex'; document.body.style.overflow = 'auto'; }
function hideLogin() { document.getElementById('auth-section').style.display = 'none'; document.getElementById('landing-section').style.display = 'block'; document.body.style.overflow = 'auto'; }
function toggleMobileMenu() { const menu = document.getElementById('mobile-menu'); menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex'; }

function toggleAuth(type) {
    document.getElementById('login-form').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = type === 'register' ? 'block' : 'none';
    document.getElementById('auth-title').innerText = type === 'login' ? "Selamat Datang" : "Buat Akun Baru";
    document.getElementById('auth-subtitle').innerText = type === 'login' ? "Silakan masuk untuk melanjutkan" : "Daftar untuk mulai menggunakan layanan";
}

function checkRoleForOTP() {
    const role = document.getElementById('reg-role').value;
    document.getElementById('otp-group').style.display = role === 'Helpman' ? 'block' : 'none';
    document.getElementById('reg-otp').required = role === 'Helpman';
}

function handleRegister(e) {
    e.preventDefault();
    let users = getData('th_users');
    const role = document.getElementById('reg-role').value;
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const otp = document.getElementById('reg-otp').value;

    if (users.find(u => u.username === username)) return showToast("Username sudah dipakai!", true);
    if (role === 'Helpman') {
        if (!VALID_OTP_CODES.includes(otp)) return showToast("Kode OTP tidak valid!", true);
        VALID_OTP_CODES.splice(VALID_OTP_CODES.indexOf(otp), 1);
    }

    users.push({
        name: document.getElementById('reg-name').value,
        username: username, password: document.getElementById('reg-password').value, role: role,
        status: role === 'Helpman' ? 'OFFLINE' : 'ACTIVE'
    });
    setData('th_users', users);
    showToast("Registrasi Berhasil! Silakan Login.");
    toggleAuth('login');
}

function handleLogin(e) {
    e.preventDefault();
    let users = getData('th_users');
    const roleInput = document.getElementById('login-role').value;
    const usernameInput = document.getElementById('login-username').value.trim().toLowerCase();
    const passwordInput = document.getElementById('login-password').value;

    const user = users.find(u => u.username === usernameInput && u.password === passwordInput);
    if (!user) return showToast("Username atau Password salah!", true);
    if (user.role !== roleInput) return showToast(`Akun terdaftar sebagai ${user.role}.`, true);

    sessionStorage.setItem('th_session', JSON.stringify(user));
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('landing-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'flex';
    initDashboard(user);
}

function logout() {
    clearInterval(refreshInterval);
    clearInterval(notifInterval);
    clearInterval(chatInterval);
    sessionStorage.removeItem('th_session');
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('landing-section').style.display = 'block';
    document.getElementById('auth-section').style.display = 'none';
    toggleAuth('login');
    window.scrollTo(0, 0);
}

// Membuka dan menutup sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar.classList.contains('active')) {
        closeSidebar();
    } else {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    }
}

// Menutup sidebar
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// --- INIT DASHBOARD ---
let currentUser = null;

function initDashboard(user) {
    currentUser = user;
    document.getElementById('header-user').innerHTML = `${user.name} <i class="fa-solid fa-chevron-down" style="font-size:12px; margin-left:5px;"></i>`;
    document.getElementById('header-branch').innerText = user.wilayah ? `Cabang ${user.wilayah.toUpperCase()}` : 'Semua Cabang';
    renderSidebar(user.role);
    if (user.role === 'Pelanggan') siapkanKotaPelanggan(); else resetHeaderKota();
    navigate('dashboard', 'Dashboard');
    startNotifWatcher();
}

function renderSidebar(role) {
    const menuContainer = document.getElementById('sidebar-menu');
    let menus = [];

    if (role === 'Pelanggan') {
        menus = [{ id: 'dashboard', icon: 'fa-home', text: 'Katalog' }, { id: 'riwayat', icon: 'fa-history', text: 'Riwayat Pesanan' }];
    } else if (role === 'Admin Cabang') {
        menus = [{ id: 'dashboard', icon: 'fa-home', text: 'Dashboard' }, { id: 'order', icon: 'fa-clipboard-list', text: 'Order Masuk' }, { id: 'helpman', icon: 'fa-users', text: 'Helpman' }];
    } else if (role === 'Helpman') {
        menus = [
            { id: 'dashboard', icon: 'fa-home', text: 'Dashboard' },
            { id: 'absensi', icon: 'fa-fingerprint', text: 'Absensi' },
            { id: 'order_saya', icon: 'fa-tasks', text: 'Order Saya' },
            { id: 'penghasilan', icon: 'fa-wallet', text: 'Penghasilan' }
        ];
    } else if (role === 'Finance') {
        menus = [{ id: 'dashboard', icon: 'fa-home', text: 'Dashboard' }, { id: 'rekap_gaji', icon: 'fa-money-bill-wave', text: 'Rekap Gaji' }];
    } else if (role === 'Head Admin') {
        menus = [{ id: 'dashboard', icon: 'fa-home', text: 'Dashboard' }, { id: 'laporan', icon: 'fa-chart-line', text: 'Laporan Operasional' }];
    }

    menuContainer.innerHTML = menus.map(m => `
        <a class="menu-item" id="menu-${m.id}" onclick="navigate('${m.id}', '${m.text}')">
            <i class="fa-solid ${m.icon}"></i> ${m.text}
        </a>
    `).join('');
}

// --- ROUTER ---
function navigate(pageId, title) {
      // Tutup sidebar setelah memilih menu
    closeSidebar();
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    const activeMenu = document.getElementById(`menu-${pageId}`);
    if (activeMenu) activeMenu.classList.add('active');

    document.getElementById('breadcrumb').innerText = `Beranda > ${title}`;

    const container = document.getElementById('dashboard-content');
    container.innerHTML = '';
    renderContent(container, pageId);
    startAutoUpdate(pageId);
}

function renderContent(container, pageId) {
    if (currentUser.role === 'Pelanggan') {
        if (pageId === 'dashboard') renderKatalog(container);
        if (pageId === 'riwayat') renderRiwayatPelanggan(container);
    } else if (currentUser.role === 'Admin Cabang') {
        if (pageId === 'dashboard') renderDashboardAdmin(container);
        if (pageId === 'order') renderAdminOrder(container);
        if (pageId === 'helpman') renderAdminHelpman(container);
    } else if (currentUser.role === 'Helpman') {
        if (pageId === 'dashboard') renderDashboardHelpman(container);
        if (pageId === 'order_saya') renderHelpmanOrder(container);
        if (pageId === 'absensi') renderHelpmanAbsensi(container);
        if (pageId === 'penghasilan') renderHelpmanPenghasilan(container);
    } else if (currentUser.role === 'Finance') {
        if (pageId === 'dashboard') renderFinanceDashboard(container);
        if (pageId === 'rekap_gaji') renderFinanceRekap(container);
    } else if (currentUser.role === 'Head Admin') {
        if (pageId === 'dashboard') renderHeadAdminDashboard(container);
        if (pageId === 'laporan') renderHeadAdminLaporan(container);
    }
}

// ==========================================
// RENDER HALAMAN PELANGGAN
// ==========================================
function renderKatalog(container) {
    const kota = kotaAktif() || 'malang';
    let html = `<div class="page-header"><h1>Katalog Layanan</h1><p class="text-muted">Kota layanan: <strong>${kotaLabel(kota)}</strong>. Pilih layanan dan paket yang Anda butuhkan. Tarif final disepakati dengan Helpman.</p></div>`;
    html += `<div class="svc-grid">`;
    layananData.filter(l => !l.kota || l.kota.includes(kota)).forEach(l => {
        html += `
            <div class="svc-card">
                <div class="svc-head">
                    <div class="svc-icon" style="background:${l.color}"><i class="fa-solid ${l.icon}"></i></div>
                    <div>
                        <h3>${l.nama}</h3>
                        <span class="svc-avail"><i class="fa-solid fa-circle-check"></i> Tersedia di ${kotaLabel(kota)}</span>
                    </div>
                </div>
                <p class="svc-desc">${l.deskripsi}</p>
                <div class="svc-label">PILIHAN PAKET &amp; TARIF:</div>
                <div class="svc-paket-list">
                    ${l.pakets.map((p, i) => `
                        <button type="button" class="svc-paket" onclick="openPesanModal('${l.id}', ${i})">
                            <span class="svc-paket-nama" style="color:${l.color}"><i class="fa-solid fa-circle-check"></i></span>
                            <span class="svc-paket-teks">${p.nama}${p.mode === 'online' ? ' <span class="svc-tag-online">Online</span>' : ''}</span>
                            <span class="svc-paket-harga">${hargaLabel(p)}</span>
                        </button>`).join('')}
                </div>
                <button class="btn btn-primary btn-sm svc-cta" onclick="openPesanModal('${l.id}')">LIHAT LAYANAN &amp; PESAN <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// --- Helper tampilan pesanan (dipakai semua role) ---
const STATUS_BISA_DIBATALKAN = ['Menunggu Admin', 'Mencari Helpman', 'Dikerjakan'];

function badgeStatus(status) {
    if (!status) return '-';
    let cls = 'badge-info';
    if (status === 'Menunggu Admin') cls = 'badge-warning';
    else if (status === 'Selesai') cls = 'badge-success';
    else if (status === 'Dibatalkan') cls = 'badge-danger';
    return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

function labelLayanan(o) {
    let teks = escapeHtml(o.layanan || '-');
    if (o.paket) teks += ` &mdash; ${escapeHtml(o.paket)}`;
    return teks;
}

function ringkasLokasi(o) {
    const jemput = escapeHtml(o.lokasiJemput || '-');
    const tujuan = escapeHtml(o.lokasiTujuan || '-');
    switch (o.modeLayanan) {
        case 'online': return `<i class="fa-solid fa-wifi"></i> Online (tanpa lokasi)`;
        case 'rute': return `${jemput} <i class="fa-solid fa-arrow-right"></i> ${tujuan}`;
        case 'belanja': return `Beli di: ${jemput} <i class="fa-solid fa-arrow-right"></i> Antar ke: ${tujuan}`;
        case 'lokasi': return `<i class="fa-solid fa-location-dot"></i> ${jemput}`;
        default: // data lama tanpa modeLayanan
            return o.lokasiTujuan ? `${jemput} <i class="fa-solid fa-arrow-right"></i> ${tujuan}` : jemput;
    }
}

function renderRiwayatPelanggan(container) {
    let orders = getData('th_orders').filter(o => o.pelanggan === currentUser.username).slice().reverse();

    let tableHtml = `<div class="table-wrapper"><table>
        <tr><th>ID Order</th><th>Tanggal</th><th>Layanan</th><th>Lokasi</th><th>Status</th><th>Total Tarif</th><th>Helpman</th><th>Chat</th><th>Aksi</th></tr>`;

    if (orders.length === 0) {
        tableHtml += `<tr><td colspan="9" style="text-align:center;">Belum ada pesanan</td></tr>`;
    } else {
        orders.forEach(o => {
            let tgl = o.waktuPesan ? formatTanggal(o.waktuPesan) : '-';
            let aksi;
            if (STATUS_BISA_DIBATALKAN.includes(o.status)) {
                aksi = `<button class="btn btn-danger btn-sm" onclick="bukaBatalPesanan('${o.id}')"><i class="fa-solid fa-ban"></i> Batalkan</button>`;
            } else if (o.status === 'Selesai') {
                aksi = o.ulasan
                    ? `${bintangHtml(o.ulasan.rating)}${o.ulasan.komentar ? `<br><small class="text-muted">${escapeHtml(o.ulasan.komentar)}</small>` : ''}`
                    : `<button class="btn btn-primary btn-sm" onclick="bukaUlasan('${o.id}')"><i class="fa-solid fa-star"></i> Beri Ulasan</button>`;
            } else if (o.status === 'Dibatalkan') {
                aksi = `<small class="text-muted">${escapeHtml(o.alasanBatal || 'Dibatalkan')}</small>`;
            } else {
                aksi = `<span class="text-muted">-</span>`;
            }
            let total = o.totalAkhir ? formatRupiah(o.totalAkhir) : (o.total ? formatRupiah(o.total) : (o.status === 'Dibatalkan' ? '-' : 'Menunggu Konfirmasi'));

            tableHtml += `<tr>
                <td><strong>#${kodeOrder(o)}</strong></td>
                <td>${tgl}</td>
                <td><strong>${escapeHtml(o.layanan || '-')}</strong>${o.paket ? `<br><small>${escapeHtml(o.paket)}${o.jumlah ? ' &times; ' + escapeHtml(o.jumlah) + ' ' + escapeHtml(o.satuan || '') : ''}</small>` : ''}</td>
                <td><small>${ringkasLokasi(o)}</small></td>
                <td>${statusLengkap(o)}</td>
                <td>${total}</td>
                <td>${o.helpman ? `<strong>${escapeHtml(namaUser(o.helpman))}</strong>` : '<span class="text-muted">Belum ditugaskan</span>'}</td>
                <td>${tombolChat(o)}</td>
                <td>${aksi}</td>
            </tr>`;
        });
    }
    tableHtml += `</table></div>`;

    if (container.querySelector('.page-header') === null) {
        container.innerHTML = `<div class="page-header"><h1>Riwayat Pesanan</h1></div>` + tableHtml;
    } else {
        container.querySelector('.table-wrapper').outerHTML = tableHtml;
    }
}

// --- PEMBATALAN PESANAN OLEH PELANGGAN ---
function bukaBatalPesanan(id) {
    const o = getData('th_orders').find(x => x.id === id);
    if (!o || o.pelanggan !== currentUser.username) return;
    if (!STATUS_BISA_DIBATALKAN.includes(o.status)) return showToast('Pesanan ini sudah tidak bisa dibatalkan.', true);

    const peringatan = o.status === 'Dikerjakan'
        ? `<div class="info-box warn-box"><i class="fa-solid fa-triangle-exclamation"></i> Pesanan ini sudah ditugaskan ke Helpman <strong>${escapeHtml(namaUser(o.helpman))}</strong> dan mungkin sedang dikerjakan. Helpman akan diberi tahu soal pembatalan.</div>`
        : '';

    const alasan = ['Salah memilih layanan / paket', 'Salah mengisi data atau lokasi', 'Sudah menemukan solusi lain', 'Jadwal berubah', 'Terlalu lama menunggu Helpman', 'Lainnya'];
    openModal('Batalkan Pesanan', `
        <form onsubmit="prosesBatalPesanan(event, '${id}')">
            <div class="info-box">
                <strong>Order #${kodeOrder(o)}</strong><br>
                ${labelLayanan(o)}<br>
                Status saat ini: ${badgeStatus(o.status)}
            </div>
            ${peringatan}
            <div class="input-group">
                <label>Alasan Pembatalan</label>
                <select id="batal-alasan" required style="width:100%; padding:12px; border-radius:10px; border:1px solid #ccc;">
                    <option value="" disabled selected>-- Pilih alasan --</option>
                    ${alasan.map(a => `<option value="${a}">${a}</option>`).join('')}
                </select>
            </div>
            <div class="input-group">
                <label>Keterangan Tambahan (opsional)</label>
                <textarea id="batal-catatan" rows="2" placeholder="Ceritakan singkat jika perlu"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Kembali</button>
                <button type="submit" class="btn btn-danger"><i class="fa-solid fa-ban"></i> Ya, Batalkan Pesanan</button>
            </div>
        </form>
    `);
}

function prosesBatalPesanan(e, id) {
    e.preventDefault();
    const orders = getData('th_orders');
    const idx = orders.findIndex(x => x.id === id);
    if (idx < 0) return;
    const o = orders[idx];
    if (o.pelanggan !== currentUser.username) return;

    if (!STATUS_BISA_DIBATALKAN.includes(o.status)) {
        closeModal();
        showToast('Status pesanan sudah berubah, tidak bisa dibatalkan.', true);
        return navigate('riwayat', 'Riwayat Pesanan');
    }

    const alasan = document.getElementById('batal-alasan').value;
    const catatan = document.getElementById('batal-catatan').value.trim();
    o.statusSebelumBatal = o.status;
    o.status = 'Dibatalkan';
    o.alasanBatal = alasan + (catatan ? ` - ${catatan}` : '');
    o.dibatalkanOleh = currentUser.username;
    o.waktuBatal = new Date().toISOString();
    setData('th_orders', orders);

    const pesan = `Pesanan #${kodeOrder(o)} (${o.layanan}) dibatalkan oleh pelanggan ${o.namaPelanggan || ''}. Alasan: ${o.alasanBatal}`;
    if (o.helpman) tambahNotif(o.helpman, pesan, o.id);
    const admin = getData('th_users').find(u => u.role === 'Admin Cabang' && u.wilayah === o.wilayah);
    if (admin) tambahNotif(admin.username, pesan, o.id);

    closeModal();
    showToast('Pesanan berhasil dibatalkan.');
    navigate('riwayat', 'Riwayat Pesanan');
}

// --- FORM PEMESANAN DINAMIS ---
let pesanLayananAktif = null;

function modePaket(p) {
    if (p.mode !== 'pilih') return p.mode;
    const r = document.querySelector('input[name="pesan-perlu"]:checked');
    return r && r.value === 'tidak' ? 'online' : 'lokasi';
}

function paketTerpilih() {
    const sel = document.getElementById('pesan-paket');
    return pesanLayananAktif && sel ? pesanLayananAktif.pakets[parseInt(sel.value)] : null;
}

function openPesanModal(layananId, paketIdx = 0) {
    const l = layananData.find(x => x.id === layananId);
    const kota = kotaAktif() || 'malang';
    if (l.kota && !l.kota.includes(kota)) return showToast(`${l.nama} hanya tersedia di ${l.kota.map(kotaLabel).join(' & ')}.`, true);
    pesanLayananAktif = l;
    const html = `
        <form onsubmit="prosesPesanan(event, '${layananId}')">
            <div class="info-box"><strong>${l.nama}</strong><br>${l.deskripsi}</div>
            <div class="form-row">
                <div class="input-group"><label>Nama Lengkap</label><input type="text" id="pesan-nama" value="${escapeHtml(currentUser.name || '')}" required></div>
                <div class="input-group"><label>No. WhatsApp</label><input type="tel" id="pesan-wa" required></div>
            </div>
            <input type="hidden" id="pesan-cabang" value="${kota}">
            <div class="info-box kota-info"><i class="fa-solid fa-location-dot"></i> Cabang layanan: <strong>${kotaLabel(kota)}</strong> <small>(ubah lewat tombol kota di bagian atas)</small></div>
            <div class="input-group">
                <label>Pilih Paket Layanan</label>
                <select id="pesan-paket" onchange="ubahPesanForm()" style="width:100%; padding:12px; border-radius:10px; border:1px solid #ccc;">
                    ${l.pakets.map((p, i) => `<option value="${i}">${p.nama} &mdash; ${hargaLabel(p)}</option>`).join('')}
                </select>
            </div>
            <div id="pesan-dinamis"></div>
            <div class="form-row">
                <div class="input-group" id="grp-jumlah"><label id="lbl-jumlah">Jumlah</label><input type="number" id="pesan-jumlah" min="0.1" step="any" value="1" oninput="hitungEstimasi()" required></div>
                <div class="input-group"><label id="lbl-jadwal">Jadwal</label><input type="datetime-local" id="pesan-jadwal"></div>
            </div>
            <div class="input-group"><label id="lbl-kebutuhan">Kebutuhan / Detail</label><textarea id="pesan-kebutuhan" rows="3" required></textarea></div>
            <div class="info-box" id="pesan-estimasi"></div>
            <button type="submit" class="btn btn-primary">Kirim Pesanan</button>
        </form>
    `;
    openModal(`Form Pemesanan: ${l.nama}`, html);
    document.getElementById('pesan-paket').value = String(paketIdx);
    ubahPesanForm();
}

// Dipanggil saat paket diganti atau pilihan "perlu Helpman datang?" berubah
function ubahPesanForm() {
    const p = paketTerpilih();
    if (!p) return;
    const mode = modePaket(p);
    const nilai = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    const jemput = nilai('pesan-jemput'), tujuan = nilai('pesan-tujuan'), link = nilai('pesan-link');
    const perlu = (document.querySelector('input[name="pesan-perlu"]:checked') || {}).value || 'ya';
    const lokasiLabel = p.lokasiLabel || 'Alamat Lokasi';

    let html = '';
    if (p.mode === 'pilih') {
        html += `
            <div class="input-group">
                <label>Apakah Helpman perlu datang ke lokasi?</label>
                <div class="radio-group">
                    <label class="radio-label"><input type="radio" name="pesan-perlu" value="ya" ${perlu === 'ya' ? 'checked' : ''} onchange="ubahPesanForm()"> Ya, datang ke lokasi</label>
                    <label class="radio-label"><input type="radio" name="pesan-perlu" value="tidak" ${perlu === 'tidak' ? 'checked' : ''} onchange="ubahPesanForm()"> Tidak, dikerjakan online</label>
                </div>
            </div>`;
    }
    if (mode === 'rute') {
        html += `<div class="form-row">
            <div class="input-group"><label>Lokasi Jemput</label><input type="text" id="pesan-jemput" required></div>
            <div class="input-group"><label>Lokasi Tujuan</label><input type="text" id="pesan-tujuan" required></div>
        </div>`;
    } else if (mode === 'belanja') {
        html += `<div class="form-row">
            <div class="input-group"><label>Nama Toko / Tempat Pembelian</label><input type="text" id="pesan-jemput" required></div>
            <div class="input-group"><label>Alamat Pengantaran</label><input type="text" id="pesan-tujuan" required></div>
        </div>`;
    } else if (mode === 'lokasi') {
        html += `<div class="input-group"><label>${lokasiLabel}</label><input type="text" id="pesan-jemput" required placeholder="Tulis alamat lengkap / patokan"></div>`;
    } else {
        html += `
            <div class="info-box online-box"><i class="fa-solid fa-wifi"></i> <strong>Layanan online</strong> &mdash; dikerjakan jarak jauh, jadi Anda <strong>tidak perlu</strong> mengisi lokasi antar atau jemput. Koordinasi lewat chat setelah Helpman ditugaskan.</div>
            <div class="input-group"><label>Link Referensi / Akun / Materi (opsional)</label><input type="text" id="pesan-link" placeholder="Contoh: link Google Drive, username akun, dll"></div>`;
    }
    document.getElementById('pesan-dinamis').innerHTML = html;
    if (document.getElementById('pesan-jemput')) document.getElementById('pesan-jemput').value = jemput;
    if (document.getElementById('pesan-tujuan')) document.getElementById('pesan-tujuan').value = tujuan;
    if (document.getElementById('pesan-link')) document.getElementById('pesan-link').value = link;

    // Label jumlah, jadwal, dan detail menyesuaikan jenis layanan
    const perjalanan = p.satuan === 'perjalanan' || p.tanpaJumlah;
    document.getElementById('grp-jumlah').style.display = perjalanan ? 'none' : '';
    if (perjalanan) document.getElementById('pesan-jumlah').value = 1;
    document.getElementById('lbl-jumlah').innerText = p.qtyLabel || (/^\d/.test(p.satuan) ? 'Jumlah paket' : `Jumlah (${p.satuan})`);
    document.getElementById('lbl-jadwal').innerText = mode === 'online' ? 'Deadline / Target Selesai (opsional)' : 'Jadwal Pelaksanaan (kosongkan jika sekarang)';
    document.getElementById('lbl-kebutuhan').innerText = p.detailLabel ? p.detailLabel :
        mode === 'online' ? 'Detail Pekerjaan (topik, ketentuan, jumlah halaman, dll)' :
        mode === 'belanja' ? 'Daftar Belanjaan & Catatan' : 'Kebutuhan / Catatan untuk Helpman';
    hitungEstimasi();
}

function hitungEstimasi() {
    const p = paketTerpilih();
    const box = document.getElementById('pesan-estimasi');
    if (!p || !box) return;
    const qty = parseFloat(document.getElementById('pesan-jumlah').value) || 0;
    const total = p.harga * qty;
    const kata = p.awalan ? `${p.awalan.toLowerCase()} ` : '';
    box.innerHTML = `Estimasi biaya: <strong>${kata}${formatRupiah(total)}</strong><br><small>Tarif final dikonfirmasi Admin Cabang dan disepakati dengan Helpman.</small>`;
}

function prosesPesanan(e, layananId) {
    e.preventDefault();
    const l = layananData.find(x => x.id === layananId);
    const p = paketTerpilih();
    if (!p) return showToast('Pilih paket layanan.', true);

    if (!currentUser || !currentUser.username) {
        return showToast("Sesi login habis, silakan login ulang.", true);
    }

    const mode = modePaket(p);
    const el = id => document.getElementById(id);
    const jumlah = parseFloat(el('pesan-jumlah').value) || 1;
    const orders = getData('th_orders');

    orders.push({
        id: 'ORD-' + Date.now(),
        pelanggan: currentUser.username,
        namaPelanggan: el('pesan-nama').value,
        waPelanggan: el('pesan-wa').value,
        layanan: l.nama,
        layananId: l.id,
        paket: p.nama,
        satuan: p.satuan,
        jumlah: jumlah,
        estimasi: p.harga * jumlah,
        modeLayanan: mode,
        wilayah: el('pesan-cabang').value,
        // Layanan online: lokasi sengaja dikosongkan
        lokasiJemput: mode === 'online' ? '' : (el('pesan-jemput') ? el('pesan-jemput').value : ''),
        lokasiTujuan: (mode === 'rute' || mode === 'belanja') && el('pesan-tujuan') ? el('pesan-tujuan').value : '',
        linkReferensi: el('pesan-link') ? el('pesan-link').value : '',
        jadwal: el('pesan-jadwal').value || '',
        kebutuhan: el('pesan-kebutuhan').value,
        status: 'Menunggu Admin',
        waktuPesan: new Date().toISOString(),
        helpman: null,
        total: null
    });

    setData('th_orders', orders);
    closeModal();
    showToast("Pesanan Berhasil!");
    navigate('riwayat', 'Riwayat Pesanan');
}

// ==========================================
// RENDER HALAMAN ADMIN CABANG
// ==========================================
function renderDashboardAdmin(container) {
    let orders = getData('th_orders').filter(o => o.wilayah === currentUser.wilayah);
    let helpmans = getData('th_users').filter(u => u.role === 'Helpman');
    let readyCount = helpmans.filter(h => h.status === 'READY').length;
    let pendingOrders = orders.filter(o => o.status === 'Menunggu Admin').length;

    let html = `
        <div class="page-header"><h1>Ringkasan Hari Ini</h1></div>
        <div class="grid-stats">
            <div class="stat-card"><h3>Order Baru</h3><div class="value">${pendingOrders}</div></div>
            <div class="stat-card"><h3>Helpman Ready</h3><div class="value green">${readyCount}</div></div>
            <div class="stat-card"><h3>Menunggu Validasi</h3><div class="value orange">${orders.filter(o => o.status === 'Menunggu Validasi').length}</div></div>
        </div>
        <h2 class="section-title" style="margin-bottom:15px; font-size:18px;">Order Terbaru</h2>
        <div class="table-wrapper"><table><tr><th>ID Order</th><th>Tanggal</th><th>Pelanggan</th><th>Layanan</th><th>Status</th></tr>
    `;
    orders.slice(0, 5).forEach(o => {
        let tgl = o.waktuPesan ? formatTanggal(o.waktuPesan) : '-';
        let idPendek = o.id ? o.id.split('-')[1].slice(-5) : 'XXXXX';
        html += `<tr>
            <td>#${idPendek}</td>
            <td>${tgl}</td>
            <td>${o.namaPelanggan || '-'}</td>
            <td>${o.layanan || '-'}</td>
            <td>${statusLengkap(o)}</td>
        </tr>`;
    });
    if (orders.length === 0) html += `<tr><td colspan="5" style="text-align:center;">Belum ada order.</td></tr>`;
    html += `</table></div>`;
    container.innerHTML = html;
}

function renderAdminOrder(container) {
    let orders = getData('th_orders').filter(o => o.wilayah === currentUser.wilayah);
    let helpmans = getData('th_users').filter(u => u.role === 'Helpman');

    let tableHtml = `<div class="table-wrapper"><table><tr><th>ID Order</th><th>Pelanggan</th><th>Layanan & Rute</th><th>Status</th><th>Aksi</th></tr>`;

    orders.forEach(o => {
        let aksi = '';
        if (o.status === 'Menunggu Admin') {
            aksi = `<button class="btn btn-primary btn-sm" onclick="terimaOrder('${o.id}')">Terima & Tentukan Tarif</button>`;
        } else if (o.status === 'Mencari Helpman') {
            let readyHelpman = helpmans.filter(h => h.status === 'READY');
            if (readyHelpman.length > 0) {
                aksi = `<div style="display:flex; gap:5px;">
                            <select id="select-hm-${o.id}" style="padding:8px; border-radius:8px; border:1px solid var(--border); font-size:13px;">
                                ${readyHelpman.map(h => `<option value="${h.username}">${h.name}</option>`).join('')}
                            </select>
                            <button class="btn btn-primary btn-sm" onclick="tugaskanHelpman('${o.id}')">Tugaskan</button>
                        </div>`;
            } else {
                aksi = `<span style="color:var(--danger); font-size:12px;">Helpman tidak tersedia</span>`;
            }
        } else if (o.status === 'Menunggu Validasi') {
            aksi = `<button class="btn btn-primary btn-sm" onclick="lihatBuktiValidasi('${o.id}')">Cek & Validasi</button>`;
        } else if (o.status === 'Dibatalkan') {
            aksi = `<small class="text-muted">Dibatalkan pelanggan: ${escapeHtml(o.alasanBatal || '-')}</small>`;
        } else if (o.status === 'Selesai') {
            aksi = `<span class="badge badge-success">Selesai</span>`;
        } else {
            aksi = `<span class="badge badge-info">${o.status}</span>`;
        }

        let tgl = o.waktuPesan ? formatTanggal(o.waktuPesan) : '-';
        let idPendek = o.id ? o.id.split('-')[1].slice(-5) : 'XXXXX';

        tableHtml += `<tr>
            <td><strong>#${idPendek}</strong><br><small>${tgl}</small></td>
            <td>${o.namaPelanggan || '-'}<br><small>${o.waPelanggan || '-'}</small></td>
            <td><strong>${labelLayanan(o)}</strong><br><small>${ringkasLokasi(o)}</small></td>
            <td>${statusLengkap(o)}</td>
            <td>${aksi}</td>
        </tr>`;
    });
    if (orders.length === 0) tableHtml += `<tr><td colspan="5" style="text-align:center;">Belum ada order masuk.</td></tr>`;
    tableHtml += `</table></div>`;

    if (container.querySelector('.page-header') === null) {
        container.innerHTML = `<div class="page-header"><h1>Order Masuk</h1><p class="text-muted">Kelola pesanan untuk Cabang ${currentUser.wilayah.toUpperCase()}</p></div>` + tableHtml;
    } else {
        container.querySelector('.table-wrapper').outerHTML = tableHtml;
    }
}

function renderAdminHelpman(container) {
    let helpmans = getData('th_users').filter(u => u.role === 'Helpman');
    let html = `<div class="page-header"><h1>Data Helpman</h1></div>`;
    html += `<div class="table-wrapper"><table><tr><th>Nama Lengkap</th><th>Username</th><th>Status</th><th>Total Order Selesai</th><th>Rating</th></tr>`;

    helpmans.forEach(h => {
        let ordersHelpman = getData('th_orders').filter(o => o.helpman === h.username && o.status === 'Selesai');
        let badge = h.status === 'READY' ? 'badge-success' : 'badge-danger';
        html += `<tr>
            <td>${h.name || '-'}</td>
            <td>@${h.username || '-'}</td>
            <td><span class="badge ${badge}">${h.status || 'OFFLINE'}</span></td>
            <td>${ordersHelpman.length} Order</td>
            <td>${ringkasRatingHelpman(h.username)}</td>
        </tr>`;
    });
    if (helpmans.length === 0) html += `<tr><td colspan="5" style="text-align:center;">Belum ada Helpman terdaftar.</td></tr>`;
    html += `</table></div>`;
    container.innerHTML = html;
}

function terimaOrder(id) {
    let orders = getData('th_orders');
    let o = orders.find(x => x.id === id);
    let idPendek = o.id ? o.id.split('-')[1].slice(-5) : 'XXXXX';

    let html = `
        <form onsubmit="prosesTerimaOrder(event, '${id}')">
            <div class="info-box">
                <strong>Order #${idPendek}</strong><br>
                Layanan: ${labelLayanan(o)}${o.jumlah ? ` (${escapeHtml(o.jumlah)} ${escapeHtml(o.satuan || '')})` : ''}<br>
                Kebutuhan: ${escapeHtml(o.kebutuhan)}<br>
                Lokasi: ${ringkasLokasi(o)}<br>
                ${o.jadwal ? `Jadwal: ${formatTanggal(o.jadwal)}<br>` : ''}${o.linkReferensi ? `Referensi: ${escapeHtml(o.linkReferensi)}<br>` : ''}${o.estimasi ? `Estimasi pelanggan: ${formatRupiah(o.estimasi)}` : ''}
            </div>
            <div class="input-group"><label>Konfirmasi Tarif Dasar (Rp)</label><input type="number" id="tarif-dasar" required min="0" value="${o.estimasi ? Math.round(o.estimasi) : ''}"></div>
            <div class="input-group"><label>Catatan untuk Helpman</label><input type="text" id="catatan-admin" placeholder="Contoh: Barang rapuh"></div>
            <button type="submit" class="btn btn-primary">Konfirmasi Tarif & Lanjut Tugaskan</button>
        </form>
    `;
    openModal("Terima Order", html);
}

function prosesTerimaOrder(e, id) {
    e.preventDefault();
    let orders = getData('th_orders');
    let idx = orders.findIndex(o => o.id === id);
    if (idx < 0 || orders[idx].status !== 'Menunggu Admin') {
        closeModal(); showToast('Pesanan sudah dibatalkan atau berubah status.', true);
        return navigate('order', 'Order Masuk');
    }
    orders[idx].total = parseInt(document.getElementById('tarif-dasar').value);
    orders[idx].catatanAdmin = document.getElementById('catatan-admin').value;
    orders[idx].status = 'Mencari Helpman';
    setData('th_orders', orders);
    closeModal();
    showToast("Order diterima.");
    navigate('order', 'Order Masuk');
}

function tugaskanHelpman(id) {
    const helpmanUsername = document.getElementById(`select-hm-${id}`).value;
    let orders = getData('th_orders');
    let idx = orders.findIndex(o => o.id === id);
    if (idx < 0 || orders[idx].status !== 'Mencari Helpman') {
        showToast('Pesanan sudah dibatalkan atau berubah status.', true);
        return navigate('order', 'Order Masuk');
    }
    orders[idx].status = 'Dikerjakan';
    orders[idx].helpman = helpmanUsername;
    setData('th_orders', orders);

    // Notifikasi ke pelanggan & helpman
    const o = orders[idx];
    const namaHm = namaUser(helpmanUsername);
    tambahNotif(o.pelanggan, `Pesanan #${kodeOrder(o)} (${o.layanan}) dibantu oleh Helpman ${namaHm}. Anda sekarang bisa chat dengan Helpman.`, o.id);
    tambahNotif(helpmanUsername, `Anda ditugaskan untuk pesanan #${kodeOrder(o)} (${o.layanan}) dari ${o.namaPelanggan}.`, o.id);
    showToast("Helpman ditugaskan!");
    navigate('order', 'Order Masuk');
}

function lihatBuktiValidasi(id) {
    let orders = getData('th_orders');
    let o = orders.find(x => x.id === id);
    let html = `
        <div class="info-box">
            <strong>Laporan Helpman:</strong><br>
            Catatan: <em>"${o.catatanHelpman || '-'}"</em><br>
            Tarif Akhir: <strong>${formatRupiah(o.totalAkhir)}</strong><br>
            Uang Belanja (Pinjaman): <strong>${o.pinjaman > 0 ? formatRupiah(o.pinjaman) : 'Tidak Ada'}</strong>
        </div>
        <div style="text-align:center; margin-bottom:20px;"><img src="${o.buktiFoto}" style="max-width:100%; border-radius:10px;"></div>
        <button class="btn btn-primary" onclick="validasiPekerjaan('${id}')">Validasi Selesai</button>
    `;
    openModal("Validasi Pekerjaan", html);
}

function validasiPekerjaan(id) {
    let orders = getData('th_orders');
    let idx = orders.findIndex(o => o.id === id);
    orders[idx].status = 'Selesai';
    setData('th_orders', orders);
    closeModal();
    showToast("Pekerjaan divalidasi.");
    navigate('order', 'Order Masuk');
}

// ==========================================
// RENDER HALAMAN HELPMAN
// ==========================================
function renderDashboardHelpman(container) {
    let orders = getData('th_orders').filter(o => o.helpman === currentUser.username);
    let statusSaatIni = currentUser.status || 'OFFLINE';

    let html = `
        <div class="page-header"><h1>Halo, ${currentUser.name}</h1><p class="text-muted">Status Anda: <span class="badge ${statusSaatIni === 'READY' ? 'badge-success' : 'badge-danger'}">${statusSaatIni}</span></p></div>
        <div class="grid-stats">
            <div class="stat-card"><h3>Kesiapan Menerima Order</h3>
                <button class="btn ${statusSaatIni === 'READY' ? 'btn-danger' : 'btn-primary'}" style="margin-top:10px;" onclick="aksiHelpman('${statusSaatIni === 'READY' ? 'OFFLINE' : 'READY'}')">
                    ${statusSaatIni === 'READY' ? 'Set Offline' : 'Set READY'}
                </button>
            </div>
            <div class="stat-card"><h3>Rating Dari Pelanggan</h3><div class="value">${ringkasRatingHelpman(currentUser.username)}</div></div>
        </div>
        <h2 class="section-title" style="margin-bottom:15px; font-size:18px;">Tugas Saya</h2>
        <div class="table-wrapper"><table><tr><th>ID Order</th><th>Tanggal</th><th>Layanan</th><th>Status</th><th>Aksi</th></tr>`;

    orders.slice(0, 3).forEach(o => {
        let aksi = `<div style="display:flex; gap:6px; flex-wrap:wrap;">` + (o.status === 'Dikerjakan' ? `<button class="btn btn-primary btn-sm" onclick="laporSelesai('${o.id}')">Update</button>` : badgeStatus(o.status)) + tombolChat(o) + `</div>`;
        let tgl = o.waktuPesan ? formatTanggal(o.waktuPesan) : '-';
        let idPendek = o.id ? o.id.split('-')[1].slice(-5) : 'XXXXX';

        html += `<tr>
            <td>#${idPendek}</td>
            <td>${tgl}</td>
            <td>${o.layanan || '-'}</td>
            <td>${statusLengkap(o)}</td>
            <td>${aksi}</td>
        </tr>`;
    });
    if (orders.length === 0) html += `<tr><td colspan="5" style="text-align:center;">Belum ada tugas.</td></tr>`;
    html += `</table></div>`;
    container.innerHTML = html;
}

function renderHelpmanOrder(container) {
    let orders = getData('th_orders').filter(o => o.helpman === currentUser.username);

    let tableHtml = `<div class="table-wrapper"><table><tr><th>ID Order</th><th>Tanggal</th><th>Layanan & Rute</th><th>Catatan Admin</th><th>Status</th><th>Aksi</th></tr>`;
    orders.forEach(o => {
        let aksi = `<div style="display:flex; gap:6px; flex-wrap:wrap;">` + (o.status === 'Dikerjakan' ? `<button class="btn btn-primary btn-sm" onclick="laporSelesai('${o.id}')">Lapor Selesai</button>` : badgeStatus(o.status)) + tombolChat(o) + `</div>`;
        let tgl = o.waktuPesan ? formatTanggal(o.waktuPesan) : '-';
        let idPendek = o.id ? o.id.split('-')[1].slice(-5) : 'XXXXX';

        tableHtml += `<tr>
            <td>#${idPendek}</td>
            <td>${tgl}</td>
            <td><strong>${labelLayanan(o)}</strong><br><small>${ringkasLokasi(o)}</small></td>
            <td>${o.catatanAdmin || '-'}</td>
            <td>${statusLengkap(o)}</td>
            <td>${aksi}</td>
        </tr>`;
    });
    if (orders.length === 0) tableHtml += `<tr><td colspan="6" style="text-align:center;">Belum ada tugas.</td></tr>`;
    tableHtml += `</table></div>`;

    if (container.querySelector('.page-header') === null) {
        container.innerHTML = `<div class="page-header"><h1>Order Saya</h1></div>` + tableHtml;
    } else {
        container.querySelector('.table-wrapper').outerHTML = tableHtml;
    }
}

function renderHelpmanAbsensi(container) {
    let absensi = getData('th_absensi').filter(a => a.username === currentUser.username);
    let isAbsenHariIni = absensi.some(a => new Date(a.tanggal).toDateString() === new Date().toDateString() && a.tipe === 'MASUK');

    let html = `<div class="page-header"><h1>Absensi Harian</h1></div>`;
    html += `<div class="grid-stats">
        <div class="stat-card" style="text-align:center;">
            <h3>Absen Masuk</h3>
            <button class="btn btn-primary" style="margin-top:10px;${isAbsenHariIni ? ' opacity:0.5;' : ''}" onclick="absen('MASUK')" ${isAbsenHariIni ? 'disabled' : ''}>CHECK-IN</button>
        </div>
        <div class="stat-card" style="text-align:center;">
            <h3>Absen Pulang</h3>
            <button class="btn btn-warning" style="margin-top:10px;${!isAbsenHariIni ? ' opacity:0.5;' : ''}" onclick="absen('PULANG')" ${!isAbsenHariIni ? 'disabled' : ''}>CHECK-OUT</button>
        </div>
    </div>
    <h2 class="section-title" style="margin-bottom:15px; font-size:18px;">Riwayat Absensi</h2>
    <div class="table-wrapper"><table><tr><th>Tanggal & Waktu</th><th>Tipe</th></tr>`;
    absensi.forEach(a => {
        html += `<tr><td>${formatTanggal(a.tanggal)}</td><td><span class="badge ${a.tipe === 'MASUK' ? 'badge-success' : 'badge-warning'}">${a.tipe}</span></td></tr>`;
    });
    if (absensi.length === 0) html += `<tr><td colspan="2" style="text-align:center;">Belum ada riwayat absensi.</td></tr>`;
    html += `</table></div>`;
    container.innerHTML = html;
}

function renderHelpmanPenghasilan(container) {
    let orders = getData('th_orders').filter(o => o.helpman === currentUser.username && o.isPaid);

    let totalBulanIni = 0;
    let html = `<div class="page-header"><h1>Dashboard Penghasilan</h1><p class="text-muted">Rekap upah Anda yang sudah dibayar oleh Finance (Transparan).</p></div>`;

    orders.forEach(o => { totalBulanIni += (o.upahBersih + o.pinjaman); });

    html += `<div class="grid-stats">
        <div class="stat-card"><h3>Total Pendapatan Bersih (Inc. Reimburse)</h3><div class="value green">${formatRupiah(totalBulanIni)}</div></div>
        <div class="stat-card"><h3>Status Gaji</h3><div class="value" style="font-size:18px; color:var(--primary);">Dibayar / Lunas</div></div>
    </div>`;

    html += `<h2 class="section-title" style="margin-bottom:15px; font-size:18px;">Rincian Penghasilan</h2>`;
    html += `<div class="table-wrapper"><table>
        <tr>
            <th>ID Order</th>
            <th>Tanggal</th>
            <th>Layanan</th>
            <th>Tarif Layanan</th>
            <th>Reimburse Pinjaman</th>
            <th>Skema</th>
            <th>Total Diterima</th>
        </tr>`;

    if (orders.length === 0) {
        html += `<tr><td colspan="7" style="text-align:center;">Belum ada riwayat pembayaran.</td></tr>`;
    } else {
        orders.forEach(o => {
            let skema = o.tipeBagiHasil === 'tim' ? '80 : 20' : '70 : 30';
            let tgl = o.waktuPesan ? formatTanggal(o.waktuPesan) : '-';
            let idPendek = o.id ? o.id.split('-')[1].slice(-5) : 'XXXXX';

            html += `<tr>
                <td><strong>#${idPendek}</strong></td>
                <td>${tgl}</td>
                <td>${o.layanan || '-'}</td>
                <td>${formatRupiah(o.totalAkhir)}</td>
                <td style="color:var(--success);">+ ${formatRupiah(o.pinjaman)}</td>
                <td><span class="badge badge-info">${o.tipeBagiHasil === 'tim' ? 'Tim' : 'Individu'}</span> (${skema})</td>
                <td style="color:var(--success); font-weight:bold;">${formatRupiah(o.upahBersih + o.pinjaman)}</td>
            </tr>`;
        });
    }
    html += `</table></div>`;
    container.innerHTML = html;
}

function aksiHelpman(newStatus) {
    let users = getData('th_users');
    let idx = users.findIndex(u => u.username === currentUser.username);
    users[idx].status = newStatus;
    setData('th_users', users);
    currentUser.status = newStatus;
    sessionStorage.setItem('th_session', JSON.stringify(currentUser));
    showToast(`Status: ${newStatus}`);
    navigate('dashboard', 'Dashboard');
}

function absen(tipe) {
    let absensi = getData('th_absensi');
    absensi.push({ username: currentUser.username, tanggal: new Date().toISOString(), tipe: tipe });
    setData('th_absensi', absensi);
    showToast(`Absen ${tipe} berhasil!`);
    navigate('absensi', 'Absensi');
}

function laporSelesai(id) {
    let html = `
        <form onsubmit="prosesLaporSelesai(event, '${id}')">
            <div class="input-group"><label>Nominal Tarif Akhir Layanan (Rp)</label><input type="number" id="lapor-tarif-akhir" required min="0"></div>
            <div class="input-group">
                <label>Uang Belanja Customer yang Anda Pinjam (Rp)</label>
                <input type="number" id="lapor-pinjaman" min="0" placeholder="0">
                <small style="color:var(--text-muted); font-size:11px; display:block; margin-top:5px;">*Uang ini akan dikembalikan utuh oleh To Help kepada Anda, bukan dipotong.</small>
            </div>
            <div class="input-group"><label>Catatan Pekerjaan</label><textarea id="lapor-catatan" rows="2" required></textarea></div>
            <div class="input-group"><label>Upload Bukti Foto</label>
                <div class="file-upload" onclick="document.getElementById('lapor-foto').click()">
                    <i class="fa-solid fa-cloud-upload-alt"></i><span id="file-name-display">Klik untuk upload foto</span>
                    <input type="file" id="lapor-foto" accept="image/*" required onchange="document.getElementById('file-name-display').innerText = this.files[0].name">
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Kirim Laporan</button>
        </form>
    `;
    openModal("Lapor Penyelesaian", html);
}

function prosesLaporSelesai(e, id) {
    e.preventDefault();
    const fileInput = document.getElementById('lapor-foto');
    const tarifAkhir = parseInt(document.getElementById('lapor-tarif-akhir').value);
    const pinjaman = parseInt(document.getElementById('lapor-pinjaman').value) || 0;
    const catatan = document.getElementById('lapor-catatan').value;
    if (fileInput.files.length === 0) return showToast("Upload bukti foto!", true);

    const reader = new FileReader();
    reader.onload = function () {
        let orders = getData('th_orders');
        let idx = orders.findIndex(o => o.id === id);
        if (idx < 0 || orders[idx].status !== 'Dikerjakan') {
            closeModal(); showToast('Pesanan sudah dibatalkan atau berubah status.', true);
            return navigate('order_saya', 'Order Saya');
        }
        orders[idx].status = 'Menunggu Validasi';
        orders[idx].totalAkhir = tarifAkhir;
        orders[idx].pinjaman = pinjaman;
        orders[idx].catatanHelpman = catatan;
        orders[idx].buktiFoto = reader.result;
        setData('th_orders', orders);
        closeModal(); showToast("Laporan dikirim."); navigate('order_saya', 'Order Saya');
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// ==========================================
// RENDER HALAMAN FINANCE
// ==========================================
function renderFinanceDashboard(container) {
    let orders = getData('th_orders').filter(o => o.status === 'Selesai' && !o.isPaid);
    let totalTagihan = orders.reduce((sum, o) => sum + o.totalAkhir + o.pinjaman, 0);

    let html = `<div class="page-header"><h1>Ringkasan Keuangan</h1></div>`;
    html += `<div class="grid-stats">
        <div class="stat-card"><h3>Tagihan Menunggu Pembayaran</h3><div class="value orange">${orders.length} Order</div></div>
        <div class="stat-card"><h3>Total Dana Disiapkan (Tarif + Reimburse)</h3><div class="value">${formatRupiah(totalTagihan)}</div></div>
    </div>`;
    html += `<p class="text-muted">Silakan buka menu Rekap Gaji untuk memproses pembayaran.</p>`;
    container.innerHTML = html;
}

function renderFinanceRekap(container) {
    let orders = getData('th_orders').filter(o => o.status === 'Selesai' && !o.isPaid);

    let html = `<div class="page-header"><h1>Rekap Gaji & Pembayaran</h1></div>`;
    html += `<div class="table-wrapper"><table>
        <tr>
            <th>ID Order</th>
            <th>Nama Helpman</th>
            <th>Layanan</th>
            <th>Tarif Akhir</th>
            <th>Reimburse Pinjaman</th>
            <th>Total Transfer</th>
            <th>Aksi</th>
        </tr>`;

    orders.forEach(o => {
        let helpmanData = getData('th_users').find(u => u.username === o.helpman);
        let namaHelpman = helpmanData ? helpmanData.name : (o.helpman || '-');
        let totalTransferKeHelpman = o.totalAkhir + o.pinjaman;
        let idPendek = o.id ? o.id.split('-')[1].slice(-5) : 'XXXXX';

        html += `<tr>
            <td><strong>#${idPendek}</strong></td>
            <td>${namaHelpman}</td>
            <td>${o.layanan || '-'}</td>
            <td>${formatRupiah(o.totalAkhir)}</td>
            <td style="color:var(--success);">+ ${formatRupiah(o.pinjaman)}</td>
            <td style="color:var(--primary); font-weight:bold;">${formatRupiah(totalTransferKeHelpman)}</td>
            <td><button class="btn btn-primary btn-sm" onclick="pilihTipePembayaran('${o.id}')">Proses</button></td>
        </tr>`;
    });
    if (orders.length === 0) html += `<tr><td colspan="7" style="text-align:center;">Tidak ada tagihan tertunda.</td></tr>`;
    html += `</table></div>`;
    container.innerHTML = html;
}

function pilihTipePembayaran(id) {
    let orders = getData('th_orders');
    let o = orders.find(x => x.id === id);
    let totalTransfer = o.totalAkhir + o.pinjaman;

    let html = `
        <form onsubmit="prosesPembayaran(event, '${id}')">
            <div class="info-box">
                Tarif Layanan: <strong>${formatRupiah(o.totalAkhir)}</strong><br>
                Reimburse Pinjaman: <strong>+ ${formatRupiah(o.pinjaman)}</strong><br>
                <hr style="margin: 10px 0; border: 0; border-top: 1px solid rgba(0,0,0,0.1);">
                <strong>Total Transfer ke Helpman: ${formatRupiah(totalTransfer)}</strong>
            </div>
            <div class="input-group">
                <label>Pilih Tipe Pekerjaan (Bagi Hasil dari Tarif Layanan):</label>
                <div class="radio-group">
                    <label class="radio-label"><input type="radio" name="tipe-bagi" value="individu" checked onchange="updatePreviewBagi('${id}', 'individu', ${o.totalAkhir}, ${o.pinjaman})"> Individu (70:30)</label>
                    <label class="radio-label"><input type="radio" name="tipe-bagi" value="tim" onchange="updatePreviewBagi('${id}', 'tim', ${o.totalAkhir}, ${o.pinjaman})"> Tim (80:20)</label>
                </div>
            </div>
            <div class="info-box" id="preview-bagi" style="background:#f0fdf4; border-color:var(--success); color:#065f46;">
                <div>Pendapatan TO HELP: <strong>${formatRupiah(o.totalAkhir * 0.3)}</strong></div>
                <div>Upah Bersih Helpman: <strong>${formatRupiah(o.totalAkhir * 0.7)}</strong></div>
                <div style="margin-top: 5px; border-top: 1px dashed #10b981; padding-top: 5px;">Total Uang Diterima Helpman: <strong>${formatRupiah((o.totalAkhir * 0.7) + o.pinjaman)}</strong></div>
            </div>
            <button type="submit" class="btn btn-primary">Konfirmasi Pembayaran</button>
        </form>
    `;
    openModal("Proses Pembayaran", html);
}

function updatePreviewBagi(id, tipe, totalAkhir, pinjaman) {
    let porsiHelpman = tipe === 'tim' ? 0.8 : 0.7;
    let porsiTH = tipe === 'tim' ? 0.2 : 0.3;

    document.getElementById('preview-bagi').innerHTML = `
        <div>Pendapatan TO HELP: <strong>${formatRupiah(totalAkhir * porsiTH)}</strong></div>
        <div>Upah Bersih Helpman: <strong>${formatRupiah(totalAkhir * porsiHelpman)}</strong></div>
        <div style="margin-top: 5px; border-top: 1px dashed #10b981; padding-top: 5px;">Total Uang Diterima Helpman: <strong>${formatRupiah((totalAkhir * porsiHelpman) + pinjaman)}</strong></div>
    `;
}

function prosesPembayaran(e, id) {
    e.preventDefault();
    const tipe = document.querySelector('input[name="tipe-bagi"]:checked').value;
    let orders = getData('th_orders');
    let idx = orders.findIndex(o => o.id === id);
    let o = orders[idx];

    o.isPaid = true; o.tipeBagiHasil = tipe;
    o.upahBersih = tipe === 'tim' ? o.totalAkhir * 0.8 : o.totalAkhir * 0.7;
    o.pendapatanTH = tipe === 'tim' ? o.totalAkhir * 0.2 : o.totalAkhir * 0.3;
    o.totalTransfer = o.upahBersih + o.pinjaman;

    setData('th_orders', orders);
    closeModal(); showToast("Pembayaran Berhasil!"); navigate('rekap_gaji', 'Rekap Gaji');
}

// ==========================================
// RENDER HALAMAN HEAD ADMIN
// ==========================================
function renderHeadAdminDashboard(container) {
    let orders = getData('th_orders');
    let totalSelesai = orders.filter(o => o.status === 'Selesai').length;
    let totalPendapatan = orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.pendapatanTH, 0);

    let html = `<div class="page-header"><h1>Executive Summary</h1></div>
        <div class="grid-stats">
            <div class="stat-card"><h3>Total Order Masuk</h3><div class="value">${orders.length}</div></div>
            <div class="stat-card"><h3>Order Selesai</h3><div class="value green">${totalSelesai}</div></div>
            <div class="stat-card"><h3>Pendapatan Perusahaan</h3><div class="value">${formatRupiah(totalPendapatan)}</div></div>
            <div class="stat-card"><h3>Rating Pelanggan</h3><div class="value">${ringkasRatingSemua()}</div></div>
        </div>`;
    container.innerHTML = html;
}

function renderHeadAdminLaporan(container) {
    let orders = getData('th_orders');
    let html = `<div class="page-header"><h1>Laporan Operasional</h1><p class="text-muted">Data seluruh cabang (Malang & Jember)</p></div>`;
    html += `<div class="table-wrapper"><table>
        <tr><th>ID Order</th><th>Tanggal</th><th>Layanan</th><th>Cabang</th><th>Status</th><th>Nama Helpman</th></tr>`;

    orders.forEach(o => {
        let helpmanData = getData('th_users').find(u => u.username === o.helpman);
        let namaHelpman = helpmanData ? helpmanData.name : (o.helpman || '-');
        let tgl = o.waktuPesan ? formatTanggal(o.waktuPesan) : '-';
        let idPendek = o.id ? o.id.split('-')[1].slice(-5) : 'XXXXX';

        html += `<tr>
            <td>#${idPendek}</td>
            <td>${tgl}</td>
            <td>${o.layanan || '-'}</td>
            <td>${o.wilayah ? o.wilayah.toUpperCase() : '-'}</td>
            <td>${statusLengkap(o)}</td>
            <td>${namaHelpman}</td>
        </tr>`;
    });
    if (orders.length === 0) html += `<tr><td colspan="6" style="text-align:center;">Belum ada data order.</td></tr>`;
    html += `</table></div>`;
    container.innerHTML = html;
}

// ==========================================
// CHAT PELANGGAN <-> HELPMAN & NOTIFIKASI
// ==========================================
let chatInterval = null;
let notifInterval = null;
let lastNotifCount = 0;

// (getData & setData ditimpa oleh supabase-store.js yang dimuat setelah script.js)
function getData(key) { return JSON.parse(localStorage.getItem(key)) || []; }
function setData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function kodeOrder(o) { return o.id ? o.id.split('-')[1].slice(-5) : 'XXXXX'; }
function namaUser(username) {
    const u = getData('th_users').find(x => x.username === username);
    return u ? u.name : (username || '-');
}
function escapeHtml(str) {
    return String(str === null || str === undefined ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function formatJam(iso) {
    return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function tambahNotif(to, text, orderId) {
    const notifs = getData('th_notifs');
    notifs.push({
        id: 'N-' + Date.now() + Math.random().toString(36).slice(2, 6),
        to: to, text: text, orderId: orderId,
        time: new Date().toISOString(), read: false
    });
    setData('th_notifs', notifs);
}

// Tombol chat di tabel (muncul setelah helpman ditugaskan)
function tombolChat(o) {
    if (!o.helpman) return '<span class="text-muted">-</span>';
    const unread = getData('th_chats').filter(m => m.orderId === o.id && m.to === currentUser.username && !m.read).length;
    return `<button class="btn btn-primary btn-sm" onclick="openChat('${o.id}')"><i class="fa-solid fa-comments"></i> Chat${unread ? ` <span class="chat-badge">${unread}</span>` : ''}</button>`;
}

// --- Notifikasi (ikon lonceng) ---
function getPesanBelumDibaca() {
    // Dikelompokkan per order
    const grup = {};
    getData('th_chats').filter(m => m.to === currentUser.username && !m.read).forEach(m => {
        grup[m.orderId] = grup[m.orderId] || { orderId: m.orderId, from: m.from, jumlah: 0, time: m.time };
        grup[m.orderId].jumlah++;
        grup[m.orderId].time = m.time;
    });
    return Object.values(grup);
}

function updateNotifBadge() {
    if (!currentUser) return;
    const unreadNotif = getData('th_notifs').filter(n => n.to === currentUser.username && !n.read).length;
    const total = unreadNotif + getPesanBelumDibaca().length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
        badge.innerText = total;
        badge.style.display = total > 0 ? 'flex' : 'none';
    }
    if (total > lastNotifCount) showToast('Ada notifikasi baru!');
    lastNotifCount = total;
}

function startNotifWatcher() {
    clearInterval(notifInterval);
    lastNotifCount = 0;
    updateNotifBadge();
    notifInterval = setInterval(updateNotifBadge, 2000);
}

function openNotifications() {
    const notifs = getData('th_notifs').filter(n => n.to === currentUser.username).reverse();
    const pesan = getPesanBelumDibaca();
    let html = '';

    pesan.forEach(p => {
        html += `<div class="notif-item unread">
            <div><i class="fa-solid fa-comment-dots" style="color:var(--primary);"></i> <strong>${p.jumlah} pesan baru</strong> dari ${escapeHtml(namaUser(p.from))}
            <br><small>${formatTanggal(p.time)}</small></div>
            <button class="btn btn-primary btn-sm" onclick="closeModal(); openChat('${p.orderId}')">Buka Chat</button>
        </div>`;
    });

    notifs.slice(0, 20).forEach(n => {
        const orders = getData('th_orders');
        const o = orders.find(x => x.id === n.orderId);
        const bisaChat = o && o.helpman;
        html += `<div class="notif-item ${n.read ? '' : 'unread'}">
            <div><i class="fa-solid fa-bell" style="color:var(--warning);"></i> ${escapeHtml(n.text)}
            <br><small>${formatTanggal(n.time)}</small></div>
            ${bisaChat ? `<button class="btn btn-primary btn-sm" onclick="closeModal(); openChat('${n.orderId}')">Chat</button>` : ''}
        </div>`;
    });

    if (!html) html = `<p class="text-muted" style="text-align:center; padding:20px;">Belum ada notifikasi.</p>`;
    openModal('Notifikasi', html);

    // Tandai notifikasi sudah dibaca
    const all = getData('th_notifs');
    all.forEach(n => { if (n.to === currentUser.username) n.read = true; });
    setData('th_notifs', all);
    updateNotifBadge();
}

// --- Chat ---
const MAKS_VIDEO_MB = 3; // penyimpanan browser (localStorage) terbatas, jadi video dibatasi

function openChat(orderId) {
    const o = getData('th_orders').find(x => x.id === orderId);
    if (!o || !o.helpman) return showToast('Chat tersedia setelah Helpman ditugaskan.', true);

    const isPelanggan = currentUser.username === o.pelanggan;
    const lawanUsername = isPelanggan ? o.helpman : o.pelanggan;
    const lawanNama = isPelanggan ? namaUser(o.helpman) : (o.namaPelanggan || namaUser(o.pelanggan));
    const labelLawan = isPelanggan ? 'Helpman Anda' : 'Pelanggan';
    const ditutup = o.status === 'Dibatalkan';

    const formHtml = ditutup
        ? `<div class="chat-closed"><i class="fa-solid fa-ban"></i> Pesanan ini sudah dibatalkan. Percakapan ditutup dan hanya bisa dibaca.</div>`
        : `
        <div class="chat-panel" id="chat-lokasi-panel" style="display:none;"></div>
        <form class="chat-form" onsubmit="kirimChat(event, '${orderId}')">
            <input type="file" id="chat-file" accept="image/*,video/*" style="display:none;" onchange="kirimLampiran(event, '${orderId}')">
            <button type="button" class="chat-tool" title="Kirim foto atau video" onclick="document.getElementById('chat-file').click()"><i class="fa-solid fa-paperclip"></i></button>
            <button type="button" class="chat-tool" title="Bagikan lokasi (Google Maps)" onclick="toggleLokasiPanel('${orderId}')"><i class="fa-solid fa-location-dot"></i></button>
            <input type="text" id="chat-input" placeholder="Tulis pesan..." autocomplete="off">
            <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-paper-plane"></i></button>
        </form>`;

    const html = `
        <div class="info-box" style="margin-bottom:12px;">
            <strong>${escapeHtml(labelLawan)}: ${escapeHtml(lawanNama)}</strong><br>
            Order #${kodeOrder(o)} - ${labelLayanan(o)} ${ditutup ? badgeStatus(o.status) : ''}
        </div>
        <div class="chat-box" id="chat-box" data-count="-1"></div>
        ${formHtml}
    `;
    openModal(`Chat dengan ${lawanNama}`, html);
    renderChatMessages(orderId);
    clearInterval(chatInterval);
    chatInterval = setInterval(() => renderChatMessages(orderId), 1500);
    setTimeout(() => { const i = document.getElementById('chat-input'); if (i) i.focus(); }, 100);
}

function renderChatMessages(orderId) {
    const box = document.getElementById('chat-box');
    if (!box) { clearInterval(chatInterval); return; }

    let chats = getData('th_chats');
    let berubah = false;
    chats.forEach(m => {
        if (m.orderId === orderId && m.to === currentUser.username && !m.read) { m.read = true; berubah = true; }
    });
    if (berubah) { try { setData('th_chats', chats); } catch (err) { /* abaikan jika penyimpanan penuh */ } updateNotifBadge(); }

    const msgs = chats.filter(m => m.orderId === orderId);
    if (String(msgs.length) === box.dataset.count) return;
    box.dataset.count = msgs.length;

    if (msgs.length === 0) {
        box.innerHTML = `<p class="text-muted" style="text-align:center; margin-top:40px;">Belum ada pesan. Mulai percakapan sekarang.</p>`;
        return;
    }
    box.innerHTML = msgs.map(m => `
        <div class="chat-msg ${m.from === currentUser.username ? 'me' : 'other'}">
            <div class="chat-bubble">${isiPesan(m)}</div>
            <small>${formatJam(m.time)}</small>
        </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
}

// Isi bubble sesuai tipe pesan: text | image | video | location
function isiPesan(m) {
    const caption = m.text ? `<div class="chat-caption">${escapeHtml(m.text)}</div>` : '';
    if (m.type === 'image' && typeof m.media === 'string' && m.media.startsWith('data:image/')) {
        return `<img class="chat-media" src="${m.media}" alt="Foto" onclick="lihatMedia(this.src)">${caption}`;
    }
    if (m.type === 'video' && typeof m.media === 'string' && m.media.startsWith('data:video/')) {
        return `<video class="chat-media" src="${m.media}" controls preload="metadata" playsinline></video>${caption}`;
    }
    if (m.type === 'location') return kartuLokasi(m) + caption;
    return escapeHtml(m.text);
}

function kartuLokasi(m) {
    if (typeof m.lat === 'number' && typeof m.lng === 'number') {
        const q = `${m.lat},${m.lng}`;
        return `<div class="chat-loc">
            <div class="chat-loc-title"><i class="fa-solid fa-location-dot"></i> Lokasi dibagikan</div>
            <iframe class="chat-loc-map" loading="lazy" referrerpolicy="no-referrer" title="Peta lokasi" src="https://maps.google.com/maps?q=${q}&amp;z=16&amp;output=embed"></iframe>
            <div class="chat-loc-actions">
                <a href="https://www.google.com/maps?q=${q}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-map"></i> Buka di Google Maps</a>
                <a href="https://www.google.com/maps/dir/?api=1&amp;destination=${q}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-route"></i> Petunjuk arah</a>
            </div>
            ${m.akurasi ? `<small>Akurasi sekitar ${Math.round(m.akurasi)} m</small>` : ''}
        </div>`;
    }
    const url = typeof m.url === 'string' ? normalisasiLinkMaps(m.url) : null;
    if (url) {
        return `<div class="chat-loc">
            <div class="chat-loc-title"><i class="fa-solid fa-location-dot"></i> Lokasi Google Maps</div>
            <div class="chat-loc-actions"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-map"></i> Buka di Google Maps</a></div>
        </div>`;
    }
    return escapeHtml(m.text || 'Lokasi');
}

// Hanya link Google Maps (https) yang diterima
function normalisasiLinkMaps(str) {
    try {
        const u = new URL(String(str).trim());
        if (u.protocol !== 'https:') return null;
        const h = u.hostname.toLowerCase();
        const googleMaps = /^(www\.|maps\.)?google\.[a-z.]{2,}$/.test(h) && (u.pathname.startsWith('/maps') || h.startsWith('maps.'));
        const pendek = h === 'maps.app.goo.gl' || (h === 'goo.gl' && u.pathname.startsWith('/maps'));
        return (googleMaps || pendek) ? u.href : null;
    } catch (err) {
        return null;
    }
}

function lihatMedia(src) {
    const layar = document.createElement('div');
    layar.className = 'media-lightbox';
    const img = document.createElement('img');
    img.src = src;
    layar.appendChild(img);
    layar.onclick = () => layar.remove();
    document.body.appendChild(layar);
}

// Simpan satu pesan ke penyimpanan. Mengembalikan true jika berhasil.
function simpanPesan(orderId, data) {
    const o = getData('th_orders').find(x => x.id === orderId);
    if (!o) return false;
    if (o.status === 'Dibatalkan') { showToast('Pesanan dibatalkan, chat sudah ditutup.', true); return false; }
    const to = currentUser.username === o.pelanggan ? o.helpman : o.pelanggan;

    const chats = getData('th_chats');
    chats.push(Object.assign({
        id: 'C-' + Date.now() + Math.random().toString(36).slice(2, 6),
        orderId: orderId, from: currentUser.username, to: to,
        type: 'text', text: '', time: new Date().toISOString(), read: false
    }, data));
    try {
        setData('th_chats', chats);
    } catch (err) {
        showToast('Penyimpanan browser penuh. Coba kirim file yang lebih kecil.', true);
        return false;
    }
    renderChatMessages(orderId);
    return true;
}

function kirimChat(e, orderId) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    if (simpanPesan(orderId, { type: 'text', text })) {
        input.value = '';
        input.focus();
    }
}

// --- Upload foto / video ---
function bacaSebagaiDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Gagal membaca file'));
        reader.readAsDataURL(file);
    });
}

// Foto dikecilkan dulu supaya hemat penyimpanan
function kompresGambar(file, maxDim = 1280, kualitas = 0.8) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const skala = Math.min(1, maxDim / Math.max(img.width, img.height));
            const w = Math.round(img.width * skala), h = Math.round(img.height * skala);
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', kualitas));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal memuat gambar')); };
        img.src = url;
    });
}

async function kirimLampiran(e, orderId) {
    const fileInput = e.target;
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    const input = document.getElementById('chat-input');
    const caption = input ? input.value.trim() : '';

    try {
        let type, media;
        if (file.type.startsWith('image/')) {
            type = 'image';
            media = await kompresGambar(file);
        } else if (file.type.startsWith('video/')) {
            if (file.size > MAKS_VIDEO_MB * 1024 * 1024) {
                return showToast(`Video terlalu besar. Maksimal ${MAKS_VIDEO_MB} MB.`, true);
            }
            type = 'video';
            media = await bacaSebagaiDataUrl(file);
        } else {
            return showToast('Hanya foto atau video yang bisa dikirim.', true);
        }
        if (simpanPesan(orderId, { type, media, text: caption }) && input) input.value = '';
    } catch (err) {
        showToast('Gagal memproses file. Coba file lain.', true);
    }
}

// --- Share lokasi (Google Maps) ---
function toggleLokasiPanel(orderId) {
    const panel = document.getElementById('chat-lokasi-panel');
    if (!panel) return;
    if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
    panel.innerHTML = `
        <div class="chat-panel-row">
            <button type="button" class="btn btn-primary btn-sm" onclick="bagikanLokasiSaatIni('${orderId}')"><i class="fa-solid fa-crosshairs"></i> Kirim lokasi saya sekarang</button>
            <a class="btn btn-outline btn-sm" href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-map"></i> Buka Google Maps</a>
        </div>
        <div class="chat-panel-row">
            <input type="url" id="chat-maps-link" placeholder="Tempel link Google Maps di sini">
            <button type="button" class="btn btn-primary btn-sm" onclick="kirimLinkMaps('${orderId}')">Kirim</button>
        </div>
        <small class="text-muted">Di Google Maps: pilih tempat, tekan Bagikan, lalu Salin link dan tempel di atas.</small>
    `;
    panel.style.display = 'block';
}

function bagikanLokasiSaatIni(orderId) {
    if (!navigator.geolocation) return showToast('Browser tidak mendukung lokasi.', true);
    showToast('Mengambil lokasi...');
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        const ok = simpanPesan(orderId, { type: 'location', lat: +latitude.toFixed(6), lng: +longitude.toFixed(6), akurasi: accuracy });
        const panel = document.getElementById('chat-lokasi-panel');
        if (ok && panel) panel.style.display = 'none';
    }, err => {
        showToast(err.code === 1
            ? 'Izin lokasi ditolak. Aktifkan izin lokasi di browser, atau tempel link Google Maps.'
            : 'Lokasi tidak bisa diambil. Coba lagi atau tempel link Google Maps.', true);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
}

function kirimLinkMaps(orderId) {
    const input = document.getElementById('chat-maps-link');
    const url = normalisasiLinkMaps(input.value);
    if (!url) return showToast('Link tidak valid. Gunakan link Google Maps (https).', true);
    if (simpanPesan(orderId, { type: 'location', url })) {
        input.value = '';
        document.getElementById('chat-lokasi-panel').style.display = 'none';
    }
}

// ==========================================
// PILIH KOTA LAYANAN (PELANGGAN)
// ==========================================
const KOTA_LIST = [
    { id: 'jember', nama: 'Jember', icon: 'fa-city' },
    { id: 'malang', nama: 'Malang', icon: 'fa-building' }
];

function kotaLabel(id) {
    const k = KOTA_LIST.find(x => x.id === id);
    return k ? k.nama : '-';
}
function kotaAktif() {
    if (!currentUser) return null;
    return localStorage.getItem('th_kota_' + currentUser.username);
}
function setKota(id) {
    localStorage.setItem('th_kota_' + currentUser.username, id);
}

function siapkanKotaPelanggan() {
    const info = document.querySelector('.branch-info');
    if (info) {
        info.style.cursor = 'pointer';
        info.title = 'Ganti kota layanan';
        info.onclick = bukaPilihKota;
    }
    perbaruiHeaderKota();
    if (!kotaAktif()) bukaPilihKota();
}

function resetHeaderKota() {
    const info = document.querySelector('.branch-info');
    if (info) { info.style.cursor = ''; info.title = ''; info.onclick = null; }
}

function perbaruiHeaderKota() {
    const el = document.getElementById('header-branch');
    const kota = kotaAktif();
    el.innerHTML = kota ? `Kota: ${kotaLabel(kota)} <i class="fa-solid fa-chevron-down" style="font-size:11px;"></i>` : 'Pilih Kota';
}

function bukaPilihKota() {
    const lama = document.getElementById('kota-overlay');
    if (lama) lama.remove();
    const aktif = kotaAktif();
    const ov = document.createElement('div');
    ov.id = 'kota-overlay';
    ov.className = 'kota-overlay';
    ov.innerHTML = `
        <div class="kota-box" role="dialog" aria-modal="true" aria-label="Pilih Kota Layanan">
            <button type="button" class="kota-close" onclick="tutupPilihKota(true)" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
            <div class="kota-icon"><i class="fa-solid fa-map-location-dot"></i></div>
            <h3>Pilih Kota Layanan</h3>
            <p>Tentukan lokasi Anda untuk menyesuaikan ketersediaan layanan dan personil terdekat:</p>
            <div class="kota-options">
                ${KOTA_LIST.map(k => `
                    <button type="button" class="kota-opt ${aktif === k.id ? 'active' : ''}" onclick="pilihKota('${k.id}')">
                        ${aktif === k.id ? '<span class="kota-check"><i class="fa-solid fa-circle-check"></i></span>' : ''}
                        <i class="fa-solid ${k.icon}"></i>
                        <span>${k.nama}</span>
                    </button>`).join('')}
            </div>
            <div class="kota-note"><i class="fa-solid fa-circle-info"></i> Lokasi ini berlaku untuk semua layanan ToHelp SerbaBisa.</div>
        </div>`;
    ov.addEventListener('click', e => { if (e.target === ov) tutupPilihKota(true); });
    document.body.appendChild(ov);
}

// Jika ditutup tanpa memilih, kota default Malang dipakai
function tutupPilihKota(pakaiDefault) {
    const ov = document.getElementById('kota-overlay');
    if (ov) ov.remove();
    if (pakaiDefault && currentUser && !kotaAktif()) {
        setKota('malang');
        perbaruiHeaderKota();
        segarkanKatalog();
    }
}

function pilihKota(id) {
    setKota(id);
    const ov = document.getElementById('kota-overlay');
    if (ov) ov.remove();
    perbaruiHeaderKota();
    showToast(`Kota layanan: ${kotaLabel(id)}`);
    segarkanKatalog();
}

function segarkanKatalog() {
    const menu = document.getElementById('menu-dashboard');
    if (menu && menu.classList.contains('active')) navigate('dashboard', 'Katalog');
}

// ==========================================
// ULASAN PELANGGAN
// ==========================================
function bintangHtml(n) {
    let h = '';
    for (let i = 1; i <= 5; i++) h += `<i class="fa-${i <= n ? 'solid' : 'regular'} fa-star bintang ${i <= n ? 'on' : ''}"></i>`;
    return `<span class="bintang-wrap" title="${n} dari 5">${h}</span>`;
}

// Badge status + bintang ulasan (jika ada)
function statusLengkap(o) {
    return badgeStatus(o.status) + (o.ulasan ? `<br><small>${bintangHtml(o.ulasan.rating)}</small>` : '');
}

function teksRating(daftar) {
    if (daftar.length === 0) return '<small>Belum ada ulasan</small>';
    const avg = daftar.reduce((s, o) => s + o.ulasan.rating, 0) / daftar.length;
    return `${avg.toFixed(1)} <i class="fa-solid fa-star bintang on"></i> <small>(${daftar.length} ulasan)</small>`;
}
function ringkasRatingHelpman(username) {
    return teksRating(getData('th_orders').filter(o => o.helpman === username && o.ulasan));
}
function ringkasRatingSemua() {
    return teksRating(getData('th_orders').filter(o => o.ulasan));
}

const LABEL_RATING = ['Pilih bintang', 'Sangat buruk', 'Kurang baik', 'Cukup', 'Baik', 'Sangat baik'];

function bukaUlasan(id) {
    const o = getData('th_orders').find(x => x.id === id);
    if (!o || o.pelanggan !== currentUser.username) return;
    if (o.status !== 'Selesai') return showToast('Ulasan bisa diberikan setelah pesanan selesai.', true);
    if (o.ulasan) return showToast('Anda sudah memberi ulasan untuk pesanan ini.', true);

    openModal('Beri Ulasan', `
        <form onsubmit="prosesUlasan(event, '${id}')">
            <div class="info-box">
                <strong>Order #${kodeOrder(o)}</strong><br>
                ${labelLayanan(o)}<br>
                Helpman: <strong>${escapeHtml(namaUser(o.helpman))}</strong>
            </div>
            <div class="input-group">
                <label>Bagaimana layanan kami?</label>
                <div class="rating-input" id="rating-input">
                    ${[1, 2, 3, 4, 5].map(n => `<button type="button" class="rating-star" data-n="${n}" onclick="pilihBintang(${n})" aria-label="${n} bintang"><i class="fa-regular fa-star"></i></button>`).join('')}
                </div>
                <small id="rating-label" class="text-muted">${LABEL_RATING[0]}</small>
                <input type="hidden" id="ulasan-rating" value="0">
            </div>
            <div class="input-group">
                <label>Komentar (opsional)</label>
                <textarea id="ulasan-komentar" rows="3" maxlength="300" placeholder="Ceritakan pengalaman Anda dengan Helpman dan layanan kami"></textarea>
            </div>
            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Kirim Ulasan</button>
        </form>
    `);
}

function pilihBintang(n) {
    document.getElementById('ulasan-rating').value = n;
    document.getElementById('rating-label').innerText = LABEL_RATING[n];
    document.querySelectorAll('#rating-input .rating-star').forEach(b => {
        const aktif = parseInt(b.dataset.n) <= n;
        b.classList.toggle('on', aktif);
        b.querySelector('i').className = `fa-${aktif ? 'solid' : 'regular'} fa-star`;
    });
}

function prosesUlasan(e, id) {
    e.preventDefault();
    const rating = parseInt(document.getElementById('ulasan-rating').value) || 0;
    if (rating < 1 || rating > 5) return showToast('Pilih jumlah bintang dulu.', true);

    const orders = getData('th_orders');
    const o = orders.find(x => x.id === id);
    if (!o || o.pelanggan !== currentUser.username || o.status !== 'Selesai' || o.ulasan) {
        closeModal();
        return showToast('Ulasan tidak bisa dikirim untuk pesanan ini.', true);
    }
    o.ulasan = {
        rating: rating,
        komentar: document.getElementById('ulasan-komentar').value.trim(),
        waktu: new Date().toISOString()
    };
    setData('th_orders', orders);

    if (o.helpman) tambahNotif(o.helpman, `Pelanggan ${o.namaPelanggan || ''} memberi ulasan ${rating} bintang untuk pesanan #${kodeOrder(o)} (${o.layanan}).`, o.id);
    const admin = getData('th_users').find(u => u.role === 'Admin Cabang' && u.wilayah === o.wilayah);
    if (admin) tambahNotif(admin.username, `Ulasan ${rating} bintang untuk pesanan #${kodeOrder(o)} (${o.layanan}).`, o.id);

    closeModal();
    showToast('Terima kasih atas ulasan Anda!');
    navigate('riwayat', 'Riwayat Pesanan');
}

// --- START APP ---
// (Versi ini ditimpa oleh supabase-store.js yang dimuat setelah script.js)
window.onload = () => {
    initDB();
    const session = sessionStorage.getItem('th_session');
    if (session) {
        const user = JSON.parse(session);
        document.getElementById('landing-section').style.display = 'none';
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'flex';
        initDashboard(user);
    }
};
