import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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

// --- NAVIGASI ---
window.toggleSidebar = () => {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('-translate-x-full');
};

window.switchPage = (page) => {
    document.getElementById('page_home').classList.toggle('hidden', page !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', page !== 'event');
    window.toggleSidebar();
};

// --- AUTH ADMIN ---
window.openAdmin = async () => {
    const { value: login } = await Swal.fire({
        title: 'VERIFIKASI ADMIN',
        background: '#121826', color: '#fff',
        html: `
            <input id="u" class="swal2-input" placeholder="User">
            <input id="p" type="password" class="swal2-input" placeholder="Pass">
        `,
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });

    if (login) {
        onValue(ref(db, 'admin'), (snap) => {
            const a = snap.val();
            if (login[0] === a.user && login[1] === a.pass) {
                document.getElementById('modal_admin').classList.remove('hidden');
                window.toggleSidebar();
            } else {
                Swal.fire('Gagal', 'Akses Ditolak!', 'error');
            }
        }, { onlyOnce: true });
    }
};

window.closeAdmin = () => document.getElementById('modal_admin').classList.add('hidden');

// --- DATABASE CORE ---
onValue(ref(db, '/'), (snap) => {
    const data = snap.val();
    if (!data) return;

    // Render Produk
    const home = document.getElementById('page_home');
    home.innerHTML = '';
    for (let id in data.products) {
        const p = data.products[id];
        const prices = p.prices.split(',').map(l => `
            <div class="flex justify-between items-center bg-black/30 p-3 rounded-2xl mb-2 border border-white/5">
                <span class="text-xs font-bold">${l.trim()}</span>
                <div class="flex gap-2">
                    <button onclick="buy('${p.name}','${l.trim()}',1)" class="bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black">WA 1</button>
                    <button onclick="buy('${p.name}','${l.trim()}',2)" class="bg-green-600 px-3 py-1 rounded-lg text-[10px] font-black">WA 2</button>
                </div>
            </div>
        `).join('');

        home.innerHTML += `
            <div class="card-product">
                <span class="absolute top-4 right-4 bg-blue-500 text-[9px] px-3 py-1 rounded-full font-black">${p.tag}</span>
                <h3 class="text-xl font-black text-blue-500 mb-6 uppercase tracking-wider">${p.name}</h3>
                <div>${prices}</div>
                <button onclick="delP('${id}')" class="mt-4 text-red-500 text-[10px] opacity-20 hover:opacity-100 transition">Hapus Produk</button>
            </div>
        `;
    }

    // Render Sosmed
    const sosContainer = document.getElementById('sosmed_container');
    sosContainer.innerHTML = '';
    for (let id in data.sosmed) {
        const s = data.sosmed[id];
        sosContainer.innerHTML += `
            <a href="${s.link}" target="_blank" class="nav-item">
                <i class="${s.icon} w-8"></i> ${s.name}
            </a>
        `;
    }

    // Set WA Global
    window.wa1 = data.settings.wa1;
    window.wa2 = data.settings.wa2;
    document.getElementById('cs_link').href = data.settings.cs;
});

// --- ADMIN ACTIONS ---
window.addProduct = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const prices = document.getElementById('p_prices').value;
    if(name && prices) push(ref(db, 'products'), { name, tag, prices });
};

window.addSosmed = () => {
    const name = document.getElementById('sm_name').value;
    const icon = document.getElementById('sm_icon').value;
    const link = document.getElementById('sm_link').value;
    if(name && link) push(ref(db, 'sosmed'), { name, icon, link });
};

window.delP = (id) => remove(ref(db, `products/${id}`));

window.buy = (n, p, w) => {
    const num = w === 1 ? window.wa1 : window.wa2;
    const text = encodeURIComponent(`Halo ZMT Store!\nOrder: ${n}\nPaket: ${p}`);
    window.open(`https://wa.me/${num}?text=${text}`, '_blank');
};