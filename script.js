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
const dbRef = ref(db, 'zmt_products_v2');

let products = [];
let offset = 0;

// === SIMPAN KE FIREBASE ===
function saveToFirebase() {
    set(dbRef, products);
}

// === LOAD DARI FIREBASE ===
onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    products = data || [];
    renderProducts();
    if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) {
        renderAdminUI();
    }
});

// === JAM REALTIME ===
function updateClock() {
    const now = new Date();
    const adjusted = new Date(now.getTime() + offset * 60000);
    document.getElementById('clock').innerText = adjusted.toLocaleTimeString('id-ID');
    document.getElementById('date').innerText = adjusted.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
setInterval(updateClock, 1000);

// === RENDER PRODUK KE USER ===
function renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    const now = new Date().getTime();

    products.forEach(p => {
        let isExpired = p.timerEnd && now > p.timerEnd;
        let currentPrice = isExpired ? p.oldPrice : p.newPrice;
        let timeLeft = p.timerEnd ? p.timerEnd - now : 0;

        const card = document.createElement('div');
        card.className = 'product';
        card.innerHTML = `
            <div class="product-name">${p.name}</div>
            <div class="product-price">
                <span class="old-price">Rp ${p.oldPrice.toLocaleString()}</span>
                <span class="new-price">Rp ${currentPrice.toLocaleString()}</span>
            </div>
            ${(!isExpired && timeLeft > 0) ? `<div class="timer-badge" id="timer-${p.id}">⏱️ Loading...</div>` : ''}
            <button class="order-btn" onclick="window.orderWhatsApp('${p.name}')">${p.buttonText || '[ ORDER ]'}</button>
        `;
        grid.appendChild(card);
    });
}

// === TIMER COUNTDOWN ===
setInterval(() => {
    const now = new Date().getTime();
    products.forEach(p => {
        if (p.timerEnd && now < p.timerEnd) {
            const el = document.getElementById(`timer-${p.id}`);
            if (el) {
                const diff = p.timerEnd - now;
                const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                el.innerText = `⏱️ ${h}:${m}:${s}`;
            }
        } else if (p.timerEnd && now >= p.timerEnd) {
            // Auto reset harga kalau waktu habis
            p.newPrice = p.oldPrice;
            p.timerEnd = null;
            saveToFirebase();
        }
    });
}, 1000);

// === ADMIN UI RENDER ===
function renderAdminUI() {
    const container = document.getElementById('adminPanelBody');
    container.innerHTML = `
        <div class="admin-section">
            <div style="display:flex; gap:5px; margin-bottom:10px;">
                <input type="text" id="addName" placeholder="Nama Produk" style="flex:2; padding:5px;">
                <input type="number" id="addPrice" placeholder="Harga" style="flex:1; padding:5px;">
                <button class="admin-btn" onclick="window.handleMenuAdd()">TAMBAH</button>
            </div>
        </div>
        <div class="admin-section">
            <h3>DAFTAR EDIT</h3>
            ${products.map(p => `
                <div class="admin-row">
                    <span>${p.name}</span>
                    <div style="display:flex; gap:5px;">
                        <input type="number" id="disc-${p.id}" placeholder="%" style="width:40px;">
                        <input type="number" id="min-${p.id}" placeholder="Min" style="width:40px;">
                        <button class="admin-btn" onclick="window.handleMenuDisc('${p.id}')">SET</button>
                        <button class="admin-btn" style="background:red; color:white;" onclick="window.handleMenuDel('${p.id}')">X</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// === GLOBAL FUNCTIONS (Biar bisa dipanggil dari HTML) ===
window.orderWhatsApp = (name) => {
    window.open(`https://wa.me/6289653938936?text=Bang+beli+${name}`, '_blank');
};

window.handleMenuAdd = () => {
    const name = document.getElementById('addName').value;
    const price = parseInt(document.getElementById('addPrice').value);
    if (name && price) {
        products.push({ id: 'id' + Date.now(), name, oldPrice: price, newPrice: price, timerEnd: null, buttonText: '[ ORDER ]' });
        saveToFirebase();
    }
};

window.handleMenuDel = (id) => {
    products = products.filter(p => p.id !== id);
    saveToFirebase();
};

window.handleMenuDisc = (id) => {
    const disc = parseInt(document.getElementById(`disc-${id}`).value) || 0;
    const mins = parseInt(document.getElementById(`min-${id}`).value) || 0;
    const p = products.find(p => p.id === id);
    if (p) {
        p.newPrice = p.oldPrice - (p.oldPrice * disc / 100);
        p.timerEnd = new Date().getTime() + (mins * 60000);
        saveToFirebase();
    }
};

// === LOGIN LOGIC ===
document.getElementById('adminProfileBtn').onclick = () => document.getElementById('loginModal').classList.remove('hidden');
document.getElementById('closeModalBtn').onclick = () => document.getElementById('loginModal').classList.add('hidden');
document.getElementById('loginBtn').onclick = () => {
    if (document.getElementById('username').value === 'ZeroXitAndro' && document.getElementById('password').value === 'ROBB15') {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('adminPanelContainer').classList.remove('hidden');
        renderAdminUI();
    } else {
        alert('Salah bang!');
    }
};
document.getElementById('logoutBtn').onclick = () => document.getElementById('adminPanelContainer').classList.add('hidden');