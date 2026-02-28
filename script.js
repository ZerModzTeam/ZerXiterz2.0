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

// Sidebar Toggle Fixed
window.toggleSidebar = () => {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('-translate-x-full');
    sb.classList.toggle('translate-x-0');
};

window.showSection = (section) => {
    document.getElementById('store_section').classList.toggle('hidden', section !== 'store');
    document.getElementById('event_section').classList.toggle('hidden', section !== 'event');
    window.toggleSidebar();
};

// Auth Admin
window.openLogin = async () => {
    const { value: login } = await Swal.fire({
        title: 'ADMIN LOGIN',
        background: '#0f172a', color: '#fff',
        html: `<input id="sw-u" class="swal2-input" placeholder="User"><input id="sw-p" type="password" class="swal2-input" placeholder="Pass">`,
        preConfirm: () => [document.getElementById('sw-u').value, document.getElementById('sw-p').value]
    });
    if (login) {
        onValue(ref(db, 'admin'), (snap) => {
            const a = snap.val();
            if (login[0] === a.user && login[1] === a.pass) {
                document.getElementById('admin_modal').classList.remove('hidden');
                window.toggleSidebar();
            } else { Swal.fire('Error', 'Sandi Salah!', 'error'); }
        }, { onlyOnce: true });
    }
};
window.closeAdmin = () => document.getElementById('admin_modal').classList.add('hidden');

// CRUD & Data Render
onValue(ref(db, '/'), (snap) => {
    const data = snap.val(); if(!data) return;
    
    // Render Products
    const store = document.getElementById('store_section');
    store.innerHTML = '';
    for (let id in data.products) {
        const p = data.products[id];
        const prices = p.prices.split(',').map(l => `
            <div class="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg mb-2">
                <span class="text-xs font-bold">${l.trim()}</span>
                <div class="flex gap-1">
                    <button onclick="buy('${p.name}','${l.trim()}',1)" class="bg-blue-600 px-2 py-1 rounded text-[10px]">WA 1</button>
                    <button onclick="buy('${p.name}','${l.trim()}',2)" class="bg-green-600 px-2 py-1 rounded text-[10px]">WA 2</button>
                </div>
            </div>`).join('');
        store.innerHTML += `
            <div class="product-card p-6 rounded-2xl relative">
                <span class="absolute -top-2 left-4 bg-blue-600 text-[10px] px-2 py-1 rounded-full font-bold">${p.tag}</span>
                <button onclick="delP('${id}')" class="absolute top-2 right-2 text-red-500 admin-btn hidden"><i class="fas fa-trash"></i></button>
                <h3 class="text-lg font-black text-blue-400 mb-4 uppercase">${p.name}</h3>
                <div>${prices}</div>
            </div>`;
    }
    window.waData = data.settings;
    document.getElementById('cs_link').href = data.settings.cs;
});

window.saveProduct = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const prices = document.getElementById('p_prices').value;
    if(name && prices) push(ref(db, 'products'), { name, tag, prices });
};

window.delP = (id) => remove(ref(db, `products/${id}`));

window.updateGeneralSettings = () => {
    update(ref(db, 'settings'), {
        wa1: document.getElementById('set_wa1').value,
        wa2: document.getElementById('set_wa2').value,
        cs: document.getElementById('set_cs').value
    });
};

window.buy = (n, p, w) => {
    const num = w === 1 ? window.waData.wa1 : window.waData.wa2;
    window.open(`https://wa.me/${num}?text=Order%20${n}%20${p}`, '_blank');
};