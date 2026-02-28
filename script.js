import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// KONFIGURASI FIREBASE ASIA SINGAPORE
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
const productsRef = ref(db, 'products');

document.addEventListener('DOMContentLoaded', function() {
    let products = [];
    let offset = parseInt(localStorage.getItem('zerModzOffset')) || 0;

    // AMBIL DATA REAL-TIME DARI FIREBASE
    onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            products = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                timerEnd: data[key].timerEnd ? new Date(data[key].timerEnd) : null
            }));
        }
        renderProducts();
        if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) {
            loadAdminPanel();
        }
    });

    // CLOCK REAL TIME
    function updateClock() {
        const now = new Date();
        const adjusted = new Date(now.getTime() + offset * 60000);
        document.getElementById('clock').innerText = adjusted.toLocaleTimeString('id-ID', { hour12: false });
        document.getElementById('date').innerText = adjusted.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    setInterval(updateClock, 1000);

    // RENDER PRODUK KE HALAMAN
    function renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        grid.innerHTML = '';

        products.forEach(p => {
            const disc = p.oldPrice > 0 ? Math.round(((p.oldPrice - p.newPrice) / p.oldPrice) * 100) : 0;
            const card = document.createElement('div');
            card.className = 'product';
            card.innerHTML = `
                <div class="product-name">${p.name}</div>
                <div class="product-price">
                    <span class="old-price">Rp ${p.oldPrice.toLocaleString()}</span>
                    <span class="new-price">Rp ${p.newPrice.toLocaleString()}</span>
                </div>
                ${disc > 0 ? `<div class="discount-badge">DISKON ${disc}%</div>` : ''}
                <div id="t-${p.id}" class="timer-badge ${p.timerEnd ? '' : 'hidden'}">⏱️ 00:00:00</div>
                <button class="order-btn" onclick="window.order('${p.name}', ${p.newPrice})">${p.buttonText || '[ ORDER ]'}</button>
            `;
            grid.appendChild(card);
        });
    }

    // ORDER WHATSAPP
    window.order = (name, price) => {
        const msg = encodeURIComponent(`Halo kak saya mau order ${name} (Rp ${price.toLocaleString()})`);
        window.open(`https://wa.me/6289653938936?text=${msg}`, '_blank');
    };

    // LOGIN ADMIN
    document.getElementById('loginBtn').onclick = () => {
        if (document.getElementById('username').value === 'ZeroXitAndro' && 
            document.getElementById('password').value === 'ROBB15') {
            document.getElementById('loginModal').classList.add('hidden');
            document.getElementById('adminPanelContainer').classList.remove('hidden');
            loadAdminPanel();
        }
    };

    // KONTROL ADMIN (DENGAN FIREBASE UPDATE)
    function loadAdminPanel() {
        const body = document.getElementById('adminPanelBody');
        body.innerHTML = `
            <div class="admin-section">
                <div>TAMBAH PRODUK</div>
                <input type="text" id="addName" placeholder="Nama">
                <input type="number" id="addPrice" placeholder="Harga">
                <button onclick="window.addNew()">TAMBAH</button>
            </div>
            <div id="adminItems"></div>
        `;
        
        const items = document.getElementById('adminItems');
        products.forEach(p => {
            const row = document.createElement('div');
            row.className = 'admin-section';
            row.innerHTML = `
                <div class="admin-row">
                    <span>${p.name}</span>
                    <button onclick="window.del('${p.id}')">HAPUS</button>
                </div>
                <input type="number" id="d-${p.id}" placeholder="Diskon %" style="width:60px">
                <input type="number" id="m-${p.id}" placeholder="Menit" style="width:60px">
                <button onclick="window.setDisc('${p.id}')">SET DISKON</button>
            `;
            items.appendChild(row);
        });
    }

    // FUNGSI GLOBAL UNTUK ADMIN
    window.addNew = () => {
        const n = document.getElementById('addName').value;
        const p = parseInt(document.getElementById('addPrice').value);
        if(n && p) set(ref(db, 'products/p' + Date.now()), { name: n, oldPrice: p, newPrice: p, discount: 0, buttonText: '[ ORDER ]' });
    };

    window.del = (id) => remove(ref(db, `products/${id}`));

    window.setDisc = (id) => {
        const p = products.find(x => x.id === id);
        const d = parseFloat(document.getElementById(`d-${id}`).value) || 0;
        const m = parseInt(document.getElementById(`m-${id}`).value) || 0;
        const nPrice = Math.round(p.oldPrice - (p.oldPrice * d / 100));
        const tEnd = m > 0 ? new Date(Date.now() + m * 60000).toISOString() : null;
        update(ref(db, `products/${id}`), { discount: d, newPrice: nPrice, timerEnd: tEnd });
    };

    // LOGIC TIMER PER DETIK
    setInterval(() => {
        products.forEach(p => {
            if (p.timerEnd) {
                const diff = p.timerEnd - new Date();
                const el = document.getElementById(`t-${p.id}`);
                if (el) {
                    if (diff <= 0) {
                        update(ref(db, `products/${p.id}`), { newPrice: p.oldPrice, discount: 0, timerEnd: null });
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