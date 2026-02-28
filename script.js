import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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

// === GLOBAL HELPERS ===
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('-translate-x-full');
window.showSection = (section) => {
    document.getElementById('store_section').classList.toggle('hidden', section !== 'store');
    document.getElementById('event_section').classList.toggle('hidden', section !== 'event');
    toggleSidebar();
};

// === ADMIN AUTH ===
window.openLogin = async () => {
    const { value: loginData } = await Swal.fire({
        title: 'ADMIN LOGIN',
        background: '#0f172a',
        color: '#fff',
        html: `
            <input id="swal-user" class="swal2-input" placeholder="Username">
            <input id="swal-pass" type="password" class="swal2-input" placeholder="Password">
        `,
        preConfirm: () => [document.getElementById('swal-user').value, document.getElementById('swal-pass').value]
    });

    if (loginData) {
        onValue(ref(db, 'admin'), (snap) => {
            const data = snap.val();
            if (loginData[0] === data.user && loginData[1] === data.pass) {
                document.getElementById('admin_modal').classList.remove('hidden');
                toggleSidebar();
            } else {
                Swal.fire('Gagal', 'Akun tidak valid!', 'error');
            }
        }, { onlyOnce: true });
    }
};
window.closeAdmin = () => document.getElementById('admin_modal').classList.add('hidden');

// === CRUD PRODUK ===
window.saveProduct = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const prices = document.getElementById('p_prices').value;
    if (name && prices) {
        push(ref(db, 'products'), { name, tag, prices });
        Swal.fire('Success', 'Produk Ditambahkan', 'success');
    }
};

window.deleteProduct = (id) => {
    Swal.fire({ title: 'Hapus?', icon: 'warning', showCancelButton: true }).then(res => {
        if(res.isConfirmed) remove(ref(db, `products/${id}`));
    });
};

// === SETTINGS & SOSMED ===
window.updateGeneralSettings = () => {
    update(ref(db, 'settings'), {
        wa1: document.getElementById('set_wa1').value,
        wa2: document.getElementById('set_wa2').value,
        cs: document.getElementById('set_cs').value
    });
    Swal.fire('Updated', 'Link WA & CS Berhasil Disimpan', 'success');
};

window.addSosmed = () => {
    const name = document.getElementById('sm_name').value;
    const icon = document.getElementById('sm_icon').value;
    const link = document.getElementById('sm_link').value;
    push(ref(db, 'sosmed'), { name, icon, link });
};

window.addEvent = () => {
    const title = document.getElementById('ev_title').value;
    const link = document.getElementById('ev_link').value;
    push(ref(db, 'events'), { title, link });
};

// === REALTIME RENDERER ===
onValue(ref(db, '/'), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Render Products
    const storeBox = document.getElementById('store_section');
    storeBox.innerHTML = '';
    for (let id in data.products) {
        const p = data.products[id];
        const priceLines = p.prices.split(',').map(l => `
            <div class="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <span class="text-sm font-bold text-gray-200">${l.trim()}</span>
                <div class="flex gap-2">
                    <button onclick="buy('${p.name}', '${l.trim()}', 1)" class="bg-blue-600 p-2 rounded text-[10px] font-black">WA 1</button>
                    <button onclick="buy('${p.name}', '${l.trim()}', 2)" class="bg-green-600 p-2 rounded text-[10px] font-black">WA 2</button>
                </div>
            </div>
        `).join('');

        storeBox.innerHTML += `
            <div class="product-card p-6 rounded-2xl relative">
                <span class="absolute -top-3 left-4 bg-blue-500 text-[10px] font-black px-3 py-1 rounded-full shadow-lg">${p.tag}</span>
                <button onclick="deleteProduct('${id}')" class="absolute -top-3 right-4 text-red-500 hover:scale-125 transition admin-only hidden"><i class="fas fa-trash"></i></button>
                <h3 class="text-xl font-black mb-4 tracking-wide text-blue-400 uppercase">${p.name}</h3>
                <div class="space-y-2">${priceLines}</div>
            </div>
        `;
    }

    // Render Sosmed & Events
    document.getElementById('sosmed_list').innerHTML = Object.values(data.sosmed || {}).map(s => `
        <a href="${s.link}" target="_blank" class="nav-link"><i class="${s.icon} w-8"></i> ${s.name}</a>
    `).join('');

    document.getElementById('event_list').innerHTML = Object.values(data.events || {}).map(e => `
        <div class="bg-slate-900 border border-purple-500/30 p-4 rounded-2xl flex justify-between items-center">
            <span class="font-bold">${e.title}</span>
            <a href="${e.link}" class="bg-purple-600 px-4 py-2 rounded-lg text-sm font-bold">DOWNLOAD</a>
        </div>
    `).join('');

    // Set WA & CS Global
    window.waData = data.settings;
    document.getElementById('cs_link').href = data.settings.cs;
});

window.buy = (name, price, waIdx) => {
    const num = waIdx === 1 ? window.waData.wa1 : window.waData.wa2;
    const msg = encodeURIComponent(`Halo ZMT Store!\n\nSaya mau order:\n📦 Produk: ${name}\n💳 Paket: ${price}\n\nTolong diproses ya, Admin!`);
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
};