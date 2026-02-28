document.addEventListener('DOMContentLoaded', function() {
    // ===== DATA PRODUK AWAL =====
    let products = [
        {
            id: 'p1',
            name: 'HOLO ALL CHAR FFM',
            oldPrice: 22000,
            newPrice: 22000,
            discount: 0,
            timerEnd: null,
            buttonText: '[ ORDER ]'
        },
        {
            id: 'p2',
            name: 'HOLO SENJATA FFM',
            oldPrice: 18000,
            newPrice: 18000,
            discount: 0,
            timerEnd: null,
            buttonText: '[ ORDER ]'
        },
        {
            id: 'p3',
            name: 'HOLO SENJATA FFB',
            oldPrice: 15000,
            newPrice: 15000,
            discount: 0,
            timerEnd: null,
            buttonText: '[ ORDER ]'
        }
    ];

    // ===== VARIABEL GLOBAL =====
    let offset = 0;
    let timerInterval = null;

    // ===== REAL TIME CLOCK =====
    function updateClock() {
        const now = new Date();
        const adjusted = new Date(now.getTime() + offset * 60000);
        const hours = adjusted.getHours().toString().padStart(2, '0');
        const mins = adjusted.getMinutes().toString().padStart(2, '0');
        const secs = adjusted.getSeconds().toString().padStart(2, '0');
        document.getElementById('clock').innerText = `${hours}:${mins}:${secs}`;
        const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
        document.getElementById('date').innerText = adjusted.toLocaleDateString('id-ID', options);
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ===== FORMAT TIMER (JAM:MENIT:DETIK) =====
    function formatTimeLeft(ms) {
        if (ms <= 0) return '00:00:00';
        
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // ===== UPDATE SEMUA TIMER PRODUK (SETIAP DETIK) =====
    function startProductTimers() {
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            let needRender = false;
            const now = new Date();
            
            products.forEach(product => {
                if (product.timerEnd) {
                    const timeLeft = product.timerEnd - now;
                    
                    if (timeLeft <= 0) {
                        product.newPrice = product.oldPrice;
                        product.discount = 0;
                        product.timerEnd = null;
                        needRender = true;
                    }
                }
            });
            
            if (needRender) {
                renderProducts();
            } else {
                updateTimerDisplays();
            }
        }, 1000);
    }

    // ===== UPDATE TAMPILAN TIMER =====
    function updateTimerDisplays() {
        const now = new Date();
        
        products.forEach(product => {
            if (product.timerEnd) {
                const timeLeft = product.timerEnd - now;
                const timerElement = document.querySelector(`#product-${product.id} .timer-badge`);
                
                if (timerElement) {
                    if (timeLeft <= 0) {
                        timerElement.remove();
                    } else {
                        timerElement.innerText = `⏱️ ${formatTimeLeft(timeLeft)}`;
                    }
                }
            }
        });
    }

    // ===== RENDER PRODUK =====
    function renderProducts() {
        const grid = document.getElementById('productGrid');
        grid.innerHTML = '';
        
        products.forEach(product => {
            if (product.timerEnd && new Date() > product.timerEnd) {
                product.newPrice = product.oldPrice;
                product.discount = 0;
                product.timerEnd = null;
            }

            const card = document.createElement('div');
            card.className = 'product';
            card.id = `product-${product.id}`;
            
            const discPercent = product.oldPrice > 0 ? 
                Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100) : 0;
            
            let timerHtml = '';
            if (product.timerEnd) {
                const timeLeft = product.timerEnd - new Date();
                if (timeLeft > 0) {
                    timerHtml = `<div class="timer-badge">⏱️ ${formatTimeLeft(timeLeft)}</div>`;
                }
            }

            const buttonText = product.buttonText || '[ ORDER ]';

            card.innerHTML = `
                <div class="product-name">${product.name}</div>
                <div class="product-price">
                    <span class="old-price">Rp ${product.oldPrice.toLocaleString()}</span>
                    <span class="new-price">Rp ${product.newPrice.toLocaleString()}</span>
                </div>
                ${discPercent > 0 ? `<div class="discount-badge">DISKON ${discPercent}%</div>` : ''}
                ${timerHtml}
                <button class="order-btn" data-product="${product.name}">${buttonText}</button>
            `;
            
            grid.appendChild(card);
        });

        document.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const phoneNumber = '6289653938936';
                const message = encodeURIComponent('bang aku mau beli holo badan');
                window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
            });
        });
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

    profileBtn.addEventListener('click', function() {
        modal.classList.remove('hidden');
        username.value = '';
        password.value = '';
        loginMessage.innerText = '';
    });

    closeBtn.addEventListener('click', function() {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

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

    // ===== LOAD ADMIN PANEL =====
    function loadAdminPanel() {
        const panelBody = document.getElementById('adminPanelBody');
        panelBody.innerHTML = `
            <!-- TAMBAH PRODUK -->
            <div class="admin-section">
                <div class="admin-section-title">➕ TAMBAH PRODUK</div>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    <input type="text" id="newProductName" placeholder="Nama produk" style="flex:2; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                    <input type="number" id="newProductPrice" placeholder="Harga" style="flex:1; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                    <input type="text" id="newProductButton" placeholder="Teks button" value="[ ORDER ]" style="flex:1; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                    <button id="addProductBtn" class="admin-btn" style="padding:0.5rem 1.2rem;">TAMBAH</button>
                </div>
            </div>
            
            <!-- OFFSET WAKTU -->
            <div class="admin-section">
                <div class="admin-section-title">⏱️ OFFSET WAKTU</div>
                <div class="admin-row">
                    <span class="admin-label">MENIT</span>
                    <div class="admin-control">
                        <input type="number" id="offsetInput" value="0" min="-720" max="720">
                        <button id="applyOffsetBtn" class="admin-btn">TERAP</button>
                    </div>
                </div>
            </div>
            
            <!-- DAFTAR PRODUK -->
            <div class="admin-section">
                <div class="admin-section-title">📦 DAFTAR PRODUK</div>
                <div id="productListContainer" style="max-height:300px; overflow-y:auto;"></div>
            </div>
            
            <!-- DISKON + TIMER -->
            <div class="admin-section">
                <div class="admin-section-title">🏷️ DISKON + TIMER</div>
                <div id="discountControlContainer"></div>
            </div>
            
            <!-- EDIT HARGA -->
            <div class="admin-section">
                <div class="admin-section-title">💰 EDIT HARGA</div>
                <div id="priceEditContainer"></div>
            </div>

            <!-- EDIT NAMA PRODUK -->
            <div class="admin-section">
                <div class="admin-section-title">✏️ EDIT NAMA PRODUK</div>
                <div id="productNameEditContainer"></div>
            </div>

            <!-- EDIT TEKS BUTTON -->
            <div class="admin-section">
                <div class="admin-section-title">🔘 EDIT TEKS BUTTON</div>
                <div id="buttonTextContainer"></div>
            </div>
            
            <!-- RESET -->
            <div class="admin-section">
                <button id="resetAllBtn" class="admin-btn warn" style="width:100%; padding:0.8rem;">RESET SEMUA PRODUK</button>
            </div>
        `;

        renderProductListForAdmin();
        renderDiscountControls();
        renderPriceControls();
        renderProductNameControls();  // <-- EDIT NAMA PRODUK
        renderButtonTextControls();

        // Event listeners
        document.getElementById('applyOffsetBtn').addEventListener('click', function() {
            const val = parseInt(document.getElementById('offsetInput').value, 10);
            if (!isNaN(val)) offset = val;
            updateClock();
        });

        document.getElementById('addProductBtn').addEventListener('click', function() {
            const name = document.getElementById('newProductName').value.trim();
            const price = document.getElementById('newProductPrice').value;
            const buttonText = document.getElementById('newProductButton').value.trim() || '[ ORDER ]';
            
            if (name && price && !isNaN(price) && parseInt(price) > 0) {
                addProduct(name, price, buttonText);
                document.getElementById('newProductName').value = '';
                document.getElementById('newProductPrice').value = '';
                document.getElementById('newProductButton').value = '[ ORDER ]';
                loadAdminPanel();
            }
        });

        document.getElementById('resetAllBtn').addEventListener('click', function() {
            products = products.map(p => ({
                ...p,
                newPrice: p.oldPrice,
                discount: 0,
                timerEnd: null
            }));
            renderProducts();
            loadAdminPanel();
        });

        document.getElementById('logoutBtn').addEventListener('click', function() {
            adminPanelContainer.classList.add('hidden');
        });
    }

    // ===== RENDER LIST PRODUK UNTUK ADMIN =====
    function renderProductListForAdmin() {
        const container = document.getElementById('productListContainer');
        if (!container) return;
        
        container.innerHTML = '';
        products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'product-list-item';
            item.innerHTML = `
                <span style="font-weight:bold;">${product.name}</span>
                <span>Rp ${product.oldPrice.toLocaleString()}</span>
                <span style="color:#ff6b35;">${product.buttonText || '[ ORDER ]'}</span>
                <div>
                    <button class="admin-btn small" onclick="window.deleteProduct('${product.id}')">HAPUS</button>
                </div>
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
                <span class="admin-label">${product.name.substring(0, 15)}...</span>
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

    // ===== RENDER KONTROL EDIT HARGA =====
    function renderPriceControls() {
        const container = document.getElementById('priceEditContainer');
        if (!container) return;
        
        container.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${product.name.substring(0, 15)}...</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="number" id="price_${product.id}" placeholder="Harga" value="${product.oldPrice}" style="width:80px;">
                    <button class="admin-btn small" onclick="window.updatePrice('${product.id}')">UBAH</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== RENDER KONTROL EDIT NAMA PRODUK =====
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
                    <input type="text" id="name_${product.id}" placeholder="Nama produk" value="${product.name}" style="width:180px; background:black; border:2px solid white; color:white; padding:0.3rem 0.6rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.updateProductName('${product.id}')">UBAH</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== RENDER KONTROL EDIT TEKS BUTTON =====
    function renderButtonTextControls() {
        const container = document.getElementById('buttonTextContainer');
        if (!container) return;
        
        container.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${product.name.substring(0, 15)}...</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="text" id="btn_${product.id}" placeholder="Teks button" value="${product.buttonText || '[ ORDER ]'}" style="width:120px; background:black; border:2px solid white; color:white; padding:0.3rem 0.6rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.updateButtonText('${product.id}')">UBAH</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== FUNGSI GLOBAL =====
    window.deleteProduct = function(productId) {
        products = products.filter(p => p.id !== productId);
        renderProducts();
        loadAdminPanel();
    };

    window.applyDiscTimer = function(productId) {
        const discInput = document.getElementById(`disc_${productId}`);
        const timerInput = document.getElementById(`timer_${productId}`);
        const detikInput = document.getElementById(`detik_${productId}`);
        
        const disc = discInput ? discInput.value : 0;
        const menit = timerInput ? parseInt(timerInput.value) || 0 : 0;
        const detik = detikInput ? parseInt(detikInput.value) || 0 : 0;
        
        const product = products.find(p => p.id === productId);
        if (product) {
            const discPercent = parseFloat(disc);
            if (!isNaN(discPercent) && discPercent >= 0) {
                product.discount = discPercent;
                product.newPrice = discPercent >= 100 ? 0 : 
                    Math.round(product.oldPrice - (product.oldPrice * discPercent / 100));
                
                if (menit > 0 || detik > 0) {
                    const totalMs = (menit * 60 + detik) * 1000;
                    product.timerEnd = new Date(new Date().getTime() + totalMs);
                }
                
                renderProducts();
                loadAdminPanel();
            }
        }
    };

    window.updatePrice = function(productId) {
        const priceInput = document.getElementById(`price_${productId}`);
        if (priceInput) {
            const newPrice = parseInt(priceInput.value);
            if (!isNaN(newPrice) && newPrice > 0) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    product.oldPrice = newPrice;
                    if (!product.timerEnd) {
                        product.newPrice = newPrice;
                    }
                    renderProducts();
                    loadAdminPanel();
                }
            }
        }
    };

    // ===== FUNGSI EDIT NAMA PRODUK =====
    window.updateProductName = function(productId) {
        const nameInput = document.getElementById(`name_${productId}`);
        if (nameInput) {
            const newName = nameInput.value.trim();
            if (newName) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    product.name = newName;
                    renderProducts();
                    loadAdminPanel();
                }
            }
        }
    };

    window.updateButtonText = function(productId) {
        const btnInput = document.getElementById(`btn_${productId}`);
        if (btnInput) {
            const newText = btnInput.value.trim() || '[ ORDER ]';
            const product = products.find(p => p.id === productId);
            if (product) {
                product.buttonText = newText;
                renderProducts();
                loadAdminPanel();
            }
        }
    };

    function addProduct(name, price, buttonText = '[ ORDER ]') {
        const newId = 'p' + Date.now() + Math.random().toString(36).substr(2, 4);
        products.push({
            id: newId,
            name: name,
            oldPrice: parseInt(price),
            newPrice: parseInt(price),
            discount: 0,
            timerEnd: null,
            buttonText: buttonText
        });
        renderProducts();
    }

    // ===== MULAI TIMER PRODUK =====
    startProductTimers();

    // ===== RENDER AWAL =====
    renderProducts();
});