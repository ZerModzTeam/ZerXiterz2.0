import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDCOuLRN2VNULW1T2P-43GkXBUqpCHqQSY",
    authDomain: "zmtstore-92963.firebaseapp.com",
    databaseURL: "https://zmtstore-92963-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "zmtstore-92963",
    storageBucket: "zmtstore-92963.firebasestorage.app",
    messagingSenderId: "761749645893",
    appId: "1:761749645893:web:b320961b1a672c3191d12c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, 'zmt_products_dual');

let products = [];
const ADMIN_1 = "6289653938936";
const ADMIN_2 = "6285721057014";

// === FIREBASE SYNC ===
onValue(dbRef, (snapshot) => {
    products = snapshot.val() || [];
    renderProducts();
    if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) renderAdminUI();
});

function save() { set(dbRef, products); }

// === CLOCK ===
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('id-ID');
    document.getElementById('date').innerText = now.toLocaleDateString('id-ID', {weekday:'short', day:'numeric', month:'short'});
}, 1000);

// === RENDER PRODUK ===
function renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    const now = new Date().getTime();

    products.forEach(p => {
        const isPromo = p.timerEnd && now < p.timerEnd;
        const currentPrice = isPromo ? p.newPrice : p.oldPrice;

        const card = document.createElement('div');
        card.className = 'product';
        card.innerHTML = `
            <div class="product-name">${p.name}</div>
            <div class="price-tag">
                <div class="old-price">Rp ${p.oldPrice.toLocaleString()}</div>
                <div class="new-price">Rp ${currentPrice.toLocaleString()}</div>
            </div>
            ${isPromo ? `<div class="timer-badge" id="t-${p.id}">⏱️ 00:00:00</div>` : ''}
            <div class="order-group">
                <button class="btn-order a1" onclick="window.order('${p.name}', 1)">ADMIN 1</button>
                <button class="btn-order a2" onclick="window.order('${p.name}', 2)">ADMIN 2</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// === TIMER LOGIC ===
setInterval(() => {
    const now = new Date().getTime();
    products.forEach(p => {
        if (p.timerEnd && now < p.timerEnd) {
            const el = document.getElementById(`t-${p.id}`);
            if (el) {
                const diff = p.timerEnd - now;
                const h = Math.floor(diff/3600000).toString().padStart(2,'0');
                const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
                const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
                el.innerText = `⏱️ ${h}:${m}:${s}`;
            }
        }
    });
}, 1000);

// === ACTIONS ===
window.order = (name, target) => {
    const num = target === 1 ? ADMIN_1 : ADMIN_2;
    const text = encodeURIComponent(`Halo Admin ${target}, saya mau beli: ${name}`);
    window.open(`https://wa.me/${num}?text=${text}`, '_blank');
};

window.addMenu = () => {
    const n = document.getElementById('inName').value;
    const p = parseInt(document.getElementById('inPrice').value);
    if(n && p) {
        products.push({ id: 'id'+Date.now(), name: n, oldPrice: p, newPrice: p, timerEnd: null });
        save();
    }
};

window.delMenu = (id) => { products = products.filter(p => p.id !== id); save(); };

window.setPromo = (id) => {
    const d = parseInt(document.getElementById(`d-${id}`).value) || 0;
    const m = parseInt(document.getElementById(`m-${id}`).value) || 0;
    const p = products.find(x => x.id === id);
    if(p) {
        p.newPrice = p.oldPrice - (p.oldPrice * d / 100);
        p.timerEnd = new Date().getTime() + (m * 60000);
        save();
    }
};

// === ADMIN UI ===
function renderAdminUI() {
    const body = document.getElementById('adminPanelBody');
    body.innerHTML = `
        <div class="admin-section">
            <input type="text" id="inName" placeholder="Nama Barang">
            <input type="number" id="inPrice" placeholder="Harga">
            <button onclick="window.addMenu()">TAMBAH BARANG</button>
        </div>
        <div class="admin-section">
            ${products.map(p => `
                <div class="admin-row">
                    <span>${p.name}</span>
                    <div>
                        <input type="number" id="d-${p.id}" placeholder="%" style="width:40px">
                        <input type="number" id="m-${p.id}" placeholder="Min" style="width:40px">
                        <button class="admin-btn" onclick="window.setPromo('${p.id}')">SET</button>
                        <button class="admin-btn" style="background:red" onclick="window.delMenu('${p.id}')">X</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// === LOGIN UI ===
document.getElementById('adminProfileBtn').onclick = () => document.getElementById('loginModal').classList.remove('hidden');
document.getElementById('closeModalBtn').onclick = () => document.getElementById('loginModal').classList.add('hidden');
document.getElementById('loginBtn').onclick = () => {
    if(document.getElementById('username').value === 'ZeroXitAndro' && document.getElementById('password').value === 'ROBB15') {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('adminPanelContainer').classList.remove('hidden');
        renderAdminUI();
    }
};
document.getElementById('logoutBtn').onclick = () => document.getElementById('adminPanelContainer').classList.add('hidden');
