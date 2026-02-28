import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// KONFIGURASI FIREBASE LO
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
const dbRef = ref(db, 'zerModzProducts');

document.addEventListener('DOMContentLoaded', function() {
    // ===== DATA PRODUK AWAL (DEFAULT) =====
    const DEFAULT_PRODUCTS = [
        { id: 'p1', name: 'HOLO ALL CHAR FFM', oldPrice: 22000, newPrice: 22000, discount: 0, timerEnd: null, buttonText: '[ ORDER ]' },
        { id: 'p2', name: 'HOLO SENJATA FFM', oldPrice: 18000, newPrice: 18000, discount: 0, timerEnd: null, buttonText: '[ ORDER ]' },
        { id: 'p3', name: 'HOLO SENJATA FFB', oldPrice: 15000, newPrice: 15000, discount: 0, timerEnd: null, buttonText: '[ ORDER ]' }
    ];

    let products = [];
    let offset = parseInt(localStorage.getItem('zerModzOffset')) || 0;
    let timerInterval = null;

    // ===== LOAD DARI FIREBASE (REAL-TIME) =====
    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            products = data.map(p => {
                if (p.timerEnd) {
                    p.timerEnd = new Date(p.timerEnd);
                    if (p.timerEnd <= new Date()) {
                        p.timerEnd = null;
                        p.newPrice = p.oldPrice;
                        p.discount = 0;
                    }
                }
                return p;
            });
        } else {
            products = DEFAULT_PRODUCTS.map(p => ({...p}));
            saveProducts();
        }
        renderProducts();
        if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) {
            loadAdminPanel();
        }
    });

    // ===== SAVE KE FIREBASE =====
    function saveProducts() {
        try {
            const productsToSave = products.map(p => ({
                ...p,
                timerEnd: p.timerEnd ? p.timerEnd.toISOString() : null
            }));
            set(dbRef, productsToSave);
        } catch (e) {
            console.error('❌ Gagal save ke Firebase:', e);
        }
    }

    // ===== RESET KE DEFAULT =====
    window.resetToDefault = function() {
        if (confirm('Yakin reset ke data awal? Semua perubahan akan hilang!')) {
            products = DEFAULT_PRODUCTS.map(p => ({...p}));
            saveProducts();
        }
    };

    // ===== REAL TIME CLOCK =====
    function updateClock() {
        try {
            const now = new Date();
            const adjusted = new Date(now.getTime() + offset * 60000);
            const hours = adjusted.getHours().toString().padStart(2, '0');
            const mins = adjusted.getMinutes().toString().padStart(2, '0');
            const secs = adjusted.getSeconds().toString().padStart(2, '0');
            document.getElementById('clock').innerText = `${hours}:${mins}:${secs}`;
            const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
            document.getElementById('date').innerText = adjusted.toLocaleDateString('id-ID', options);
        } catch (e) { console.error('Clock error:', e); }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ===== FORMAT TIMER =====
    function formatTimeLeft(ms) {
        if (ms <= 0) return '00:00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // ===== UPDATE TIMER =====
    function startProductTimers() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            try {
                let needRender = false;
                let needSave = false;
                const now = new Date();
                
                products.forEach(product => {
                    if (product.timerEnd) {
                        const timeLeft = product.timerEnd - now;
                        if (timeLeft <= 0) {
                            product.newPrice = product.oldPrice;
                            product.discount = 0;
                            product.timerEnd = null;
                            needRender = true;
                            needSave = true;
                        }
                    }
                });
                
                if (needSave) saveProducts();
                if (needRender) renderProducts();
                else updateTimerDisplays();
            } catch (e) { console.error('Timer error:', e); }
        }, 1000);
    }

    function updateTimerDisplays() {
        try {
            const now = new Date();
            products.forEach(product => {
                if (product.timerEnd) {
                    const timeLeft = product.timerEnd - now;
                    const timerElement = document.querySelector(`#product-${product.id} .timer-badge`);
                    if (timerElement) {
                        if (timeLeft <= 0) timerElement.remove();
                        else timerElement.innerText = `⏱️ ${formatTimeLeft(timeLeft)}`;
                    }
                }
            });
        } catch (e) { console.error('Update timer display error:', e); }
    }

    // ===== FUNGSI WA ORDER =====
    window.handleOrder = function(productName, productPrice) {
        try {
            const phoneNumber = '6289653938936';
            const message = encodeURIComponent(`Halo kak saya mau order ${productName} (Rp ${productPrice.toLocaleString()})`);
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        } catch (e) { alert('Gagal membuka WhatsApp'); }
    }

    // ===== RENDER PRODUK =====
    function renderProducts() {
        try {
            const grid = document.getElementById('productGrid');
            if (!grid) return;
            grid.innerHTML = '';
            
            products.forEach(product => {
                if (!product || !product.id) return;
                const card = document.createElement('div');
                card.className = 'product';
                card.id = `product-${product.id}`;
                
                const discPercent = product.oldPrice > 0 ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100) : 0;
                let timerHtml = '';
                if (product.timerEnd) {
                    const timeLeft = product.timerEnd - new Date();
                    if (timeLeft > 0) timerHtml = `<div class="timer-badge">⏱️ ${formatTimeLeft(timeLeft)}</div>`;
                }

                const buttonText = product.buttonText || '[ ORDER ]';

                card.innerHTML = `
                    <div class="product-name">${product.name || 'Produk'}</div>
                    <div class="product-price">
                        <span class="old-price">Rp ${(product.oldPrice || 0).toLocaleString()}</span>
                        <span class="new-price">Rp ${(product.newPrice || 0).toLocaleString()}</span>
                    </div>
                    ${discPercent > 0 ? `<div class="discount-badge">DISKON ${discPercent}%</div>` : ''}
                    ${timerHtml}
                    <button class="order-btn" onclick="window.handleOrder('${product.name}', ${product.newPrice})">${buttonText}</button>
                `;
                grid.appendChild(card);
            });
        } catch (e) { console.error('Render error:', e); }
    }

    // ===== MODAL LOGIN =====
    const modal = document.getElementById('loginModal');
    const profileBtn = document.getElementById('adminProfileBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const loginBtn = document.getElementById('loginBtn');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');
    const adminPanelContainer = document.getElementById('adminPanelContainer');

    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            modal.classList.remove('hidden');
            username.value = ''; password.value = ''; loginMessage.innerText = '';
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (username.value === 'ZeroXitAndro' && password.value === 'ROBB15') {
                modal.classList.add('hidden');
                adminPanelContainer.classList.remove('hidden');
                loginMessage.innerText = '';
                loadAdminPanel();
            } else {
                loginMessage.innerText = '✗ Username/password salah';
            }
        });
    }

    // ===== LOAD ADMIN PANEL =====
    function loadAdminPanel() {
        try {
            const panelBody = document.getElementById('adminPanelBody');
            if (!panelBody) return;
            
            panelBody.innerHTML = `
                <div class="admin-section">
                    <div class="admin-section-title">➕ TAMBAH PRODUK</div>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                        <input type="text" id="newProductName" placeholder="Nama produk" style="flex:2; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                        <input type="number" id="newProductPrice" placeholder="Harga" style="flex:1; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                        <input type="text" id="newProductButton" placeholder="Teks button" value="[ ORDER ]" style="flex:1; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                        <button id="addProductBtn" class="admin-btn" style="padding:0.5rem 1.2rem;">TAMBAH</button>
                    </div>
                </div>
                
                <div class="admin-section">
                    <div class="admin-section-title">⏱️ OFFSET WAKTU</div>
                    <div class="admin-row">
                        <span class="admin-label">MENIT</span>
                        <div class="admin-control">
                            <input type="number" id="offsetInput" value="${offset}" min="-720" max="720">
                            <button id="applyOffsetBtn" class="admin-btn">TERAP</button>
                        </div>
                    </div>
                </div>
                
                <div class="admin-section">
                    <div class="admin-section-title">⚠️ RESET DATA</div>
                    <div style="display:flex; gap:0.5rem;">
                        <button id="resetToDefaultBtn" class="admin-btn warn" style="flex:1;">RESET KE AWAL</button>
                    </div>
                </div>
                
                <div class="admin-section">
                    <div class="admin-section-title">📦 DAFTAR PRODUK (${products.length})</div>
                    <div id="productListContainer" style="max-height:300px; overflow-y:auto;"></div>
                </div>
                
                <div class="admin-section">
                    <div class="admin-section-title">🏷️ DISKON + TIMER</div>
                    <div id="discountControlContainer"></div>
                </div>
                
                <div class="admin-section">
                    <div class="admin-section-title">💰 EDIT HARGA</div>
                    <div id="priceEditContainer"></div>
                </div>

                <div class="admin-section">
                    <div class="admin-section-title">✏️ EDIT NAMA PRODUK</div>
                    <div id="productNameEditContainer"></div>
                </div>

                <div class="admin-section">
                    <div class="admin-section-title">🔘 EDIT TEKS BUTTON</div>
                    <div id="buttonTextContainer"></div>
                </div>
            `;

            renderProductListForAdmin();
            renderDiscountControls();
            renderPriceControls();
            renderProductNameControls();
            renderButtonTextControls();

            // EVENT LISTENERS
            const applyOffsetBtn = document.getElementById('applyOffsetBtn');
            if (applyOffsetBtn) {
                applyOffsetBtn.addEventListener('click', function() {
                    const val = parseInt(document.getElementById('offsetInput').value, 10);
                    if (!isNaN(val)) {
                        offset = val;
                        localStorage.setItem('zerModzOffset', offset);
                        updateClock();
                    }
                });
            }

            const addProductBtn = document.getElementById('addProductBtn');
            if (addProductBtn) {
                addProductBtn.addEventListener('click', function() {
                    const name = document.getElementById('newProductName').value.trim();
                    const price = document.getElementById('newProductPrice').value;
                    const buttonText = document.getElementById('newProductButton').value.trim() || '[ ORDER ]';
                    if (name && price && !isNaN(price) && parseInt(price) > 0) {
                        addProduct(name, price, buttonText);
                    }
                });
            }

            const resetBtn = document.getElementById('resetToDefaultBtn');
            if (resetBtn) resetBtn.addEventListener('click', window.resetToDefault);

            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.addEventListener('click', () => adminPanelContainer.classList.add('hidden'));
            
        } catch (e) { console.error('Load admin panel error:', e); }
    }

    // ===== RENDER LIST PRODUK ADMIN =====
    function renderProductListForAdmin() {
        const container = document.getElementById('productListContainer');
        if (!container) return;
        container.innerHTML = '';
        if (!products || products.length === 0) {
            container.innerHTML = '<div style="color:white; padding:1rem; text-align:center;">Tidak ada produk</div>';
            return;
        }
        products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'product-list-item';
            item.innerHTML = `
                <span style="font-weight:bold;">${product.name || 'Tanpa nama'}</span>
                <span>Rp ${(product.oldPrice || 0).toLocaleString()}</span>
                <span style="color:#ff6b35;">${product.buttonText || '[ ORDER ]'}</span>
                <div><button class="admin-btn small" onclick="window.deleteProduct('${product.id}')">HAPUS</button></div>
            `;
            container.appendChild(item);
        });
    }

    // ===== RENDER KONTROL DISKON =====
    function renderDiscountControls() {
        const container = document.getElementById('discountControlContainer');
        if (!container) return;
        container.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${product.name ? product.name.substring(0, 15) : 'Produk'}...</span>
                <div style="display:flex; gap:0.3rem; flex-wrap:wrap;">
                    <input type="number" id="disc_${product.id}" placeholder="%" min="0" max="100" style="width:60px;" value="${product.discount || ''}">
                    <input type="number" id="timer_${product.id}" placeholder="menit" min="0" style="width:70px;" value="">
                    <input type="number" id="detik_${product.id}" placeholder="detik" min="0" max="59" style="width:70px;" value="">
                    <button class="admin-btn small" onclick="window.applyDiscTimer('${product.id}')">TERAP</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== RENDER EDIT HARGA =====
    function renderPriceControls() {
        const container = document.getElementById('priceEditContainer');
        if (!container) return;
        container.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${product.name ? product.name.substring(0, 15) : 'Produk'}...</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="number" id="price_${product.id}" placeholder="Harga" value="${product.oldPrice || 0}" style="width:80px;">
                    <button class="admin-btn small" onclick="window.updatePrice('${product.id}')">UBAH</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== RENDER EDIT NAMA PRODUK =====
    function renderProductNameControls() {
        const container = document.getElementById('productNameEditContainer');
        if (!container) return;
        container.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">ID: ${product.id}</span>
                <div style="display:flex; gap:0.3rem; flex:1; justify-content:flex-end;">
                    <input type="text" id="name_${product.id}" placeholder="Nama produk" value="${product.name || ''}" style="width:180px; background:black; border:2px solid white; color:white; padding:0.3rem 0.6rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.updateProductName('${product.id}')">UBAH</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== RENDER EDIT TEKS BUTTON =====
    function renderButtonTextControls() {
        const container = document.getElementById('buttonTextContainer');
        if (!container) return;
        container.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${product.name ? product.name.substring(0, 15) : 'Produk'}...</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="text" id="btn_${product.id}" placeholder="Teks button" value="${product.buttonText || '[ ORDER ]'}" style="width:120px; background:black; border:2px solid white; color:white; padding:0.3rem 0.6rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.updateButtonText('${product.id}')">UBAH</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== FUNGSI GLOBAL =====
    window.deleteProduct = functi