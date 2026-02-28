import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCOuLRN2VNULW1T2P-43GkXBUqpCHqQSY",
  authDomain: "zmtstore-92963.firebaseapp.com",
  databaseURL: "https://zmtstore-92963-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zmtstore-92963",
  storageBucket: "zmtstore-92963.firebasestorage.app",
  messagingSenderId: "761749645893",
  appId: "1:761749645893:web:b320961b1a672c3191d12c",
  measurementId: "G-9VZQ2HWX50"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const productsRef = ref(db, 'store_data');

document.addEventListener('DOMContentLoaded', function() {
    let products = [];
    let offset = parseInt(localStorage.getItem('zerModzOffset')) || 0;
    let timerInterval = null;

    // --- SINRONISASI FIREBASE ---
    function saveProducts() {
        // Simpan ke Firebase (Data otomatis terupdate ke semua user)
        set(productsRef, products.map(p => ({
            ...p,
            timerEnd: p.timerEnd ? p.timerEnd.toISOString() : null
        })));
    }

    onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            products = data.map(p => ({
                ...p,
                timerEnd: p.timerEnd ? new Date(p.timerEnd) : null
            }));
        } else {
            // Data Default Jika Kosong
            products = [
                { id: 'p1', name: 'HOLO ALL CHAR FFM', oldPrice: 22000, newPrice: 22000, discount: 0, timerEnd: null, buttonText: '[ ORDER ]' },
                { id: 'p2', name: 'HOLO SENJATA FFM', oldPrice: 18000, newPrice: 18000, discount: 0, timerEnd: null, buttonText: '[ ORDER ]' },
                { id: 'p3', name: 'HOLO SENJATA FFB', oldPrice: 15000, newPrice: 15000, discount: 0, timerEnd: null, buttonText: '[ ORDER ]' }
            ];
            saveProducts();
        }
        renderProducts();
        if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) {
            loadAdminPanel();
        }
    });

    // --- LOGIKA JAM ASLI ---
    function updateClock() {
        const now = new Date();
        const adjusted = new Date(now.getTime() + offset * 60000);
        const clockEl = document.getElementById('clock');
        const dateEl = document.getElementById('date');
        if (clockEl) clockEl.innerText = adjusted.toLocaleTimeString('id-ID', { hour12: false });
        if (dateEl) dateEl.innerText = adjusted.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    setInterval(updateClock, 1000);

    // --- RENDER PRODUK ASLI ---
    function renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        grid.innerHTML = '';
        products.forEach(product => {
            const discPercent = product.oldPrice > 0 ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100) : 0;
            const card = document.createElement('div');
            card.className = 'product';
            card.innerHTML = `
                <div class="product-name">${product.name}</div>
                <div class="product-price">
                    <span class="old-price">Rp ${product.oldPrice.toLocaleString()}</span>
                    <span class="new-price">Rp ${product.newPrice.toLocaleString()}</span>
                </div>
                ${discPercent > 0 ? `<div class="discount-badge">DISKON ${discPercent}%</div>` : ''}
                <div id="timer-${product.id}" class="timer-badge ${product.timerEnd ? '' : 'hidden'}"></div>
                <button class="order-btn" onclick="handleOrder('${product.name}', ${product.newPrice})">${product.buttonText || '[ ORDER ]'}</button>
            `;
            grid.appendChild(card);
        });
    }

    window.handleOrder = (name, price) => {
        const msg = encodeURIComponent(`Halo kak saya mau order ${name} (Rp ${price.toLocaleString()})`);
        window.open(`https://wa.me/6289653938936?text=${msg}`, '_blank');
    };

    // --- LOGIN & ADMIN PANEL ASLI (TIDAK ADA YANG DIUBAH) ---
    const adminBtn = document.getElementById('adminProfileBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.getElementById('closeModalBtn');
    if(adminBtn) adminBtn.onclick = () => loginModal.classList.remove('hidden');
    if(closeBtn) closeBtn.onclick = () => loginModal.classList.add('hidden');

    document.getElementById('loginBtn').onclick = () => {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        if(u === 'ZeroXitAndro' && p === 'ROBB15') {
            loginModal.classList.add('hidden');
            document.getElementById('adminPanelContainer').classList.remove('hidden');
            loadAdminPanel();
        } else { alert('Gagal!'); }
    };

    window.loadAdminPanel = function() {
        const container = document.getElementById('adminPanelBody');
        container.innerHTML = `
            <div class="admin-section-title">TAMBAH PRODUK</div>
            <div class="admin-row"><input type="text" id="addN" placeholder="Nama"><input type="number" id="addP" placeholder="Harga"><button onclick="window.addNew()" class="admin-btn">ADD</button></div>
            <div class="admin-section-title">MANAJEMEN PRODUK</div>
            <div id="adminList"></div>
        `;
        const list = document.getElementById('adminList');
        products.forEach(p => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <input type="text" value="${p.name}" onchange="window.upName('${p.id}', this.value)" style="width:120px; background:black; color:white; border:1px solid #ff6b35;">
                <div class="admin-control">
                    <input type="number" id="d-${p.id}" placeholder="%" style="width:40px">
                    <input type="number" id="m-${p.id}" placeholder="Min" style="width:40px">
                    <button onclick="window.setD('${p.id}')" class="admin-btn small">SET</button>
                    <button onclick="window.delP('${p.id}')" class="admin-btn small" style="background:red">X</button>
                </div>
            `;
            list.appendChild(row);
        });
    };

    // --- FUNGSI ACTION ADMIN (SINKRON KE FIREBASE) ---
    window.addNew = () => {
        const n = document.getElementById('addN').value;
        const p = parseInt(document.getElementById('addP').value);
        if(n && p) {
            products.push({ id: 'p'+Date.now(), name: n, oldPrice: p, newPrice: p, discount: 0, timerEnd: null, buttonText: '[ ORDER ]' });
            saveProducts();
        }
    };

    window.upName = (id, newName) => {
        const p = products.find(x => x.id === id);
        if(p) { p.name = newName; saveProducts(); }
    };

    window.delP = (id) => {
        products = products.filter(x => x.id !== id);
        saveProducts();
    };

    window.setD = (id) => {
        const d = parseFloat(document.getElementById(`d-${id}`).value) || 0;
        const m = parseInt(document.getElementById(`m-${id}`).value) || 0;
        const p = products.find(x => x.id === id);
        if(p) {
            p.newPrice = p.oldPrice - (p.oldPrice * d / 100);
            p.timerEnd = m > 0 ? new Date(Date.now() + m * 60000) : null;
            saveProducts();
        }
    };

    // --- TIMER PER DETIK ASLI ---
    setInterval(() => {
        products.forEach(p => {
            if (p.timerEnd) {
                const diff = new Date(p.timerEnd) - new Date();
                const el = document.getElementById(`timer-${p.id}`);
                if (el) {
                    if (diff <= 0) {
                        p.newPrice = p.oldPrice;
                        p.timerEnd = null;
                        saveProducts();
                    } else {
                        const m = Math.floor(diff/60000);
                        const s = Math.floor((diff%60000)/1000);
                        el.innerText = `⏱️ ${m}:${s.toString().padStart(2,'0')}`;
                        el.classList.remove('hidden');
                    }
                }
            }
        });
    }, 1000);
});
