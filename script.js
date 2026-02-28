import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// KONFIGURASI FIREBASE LU
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

// --- SIDEBAR FIX ---
window.toggleSidebar = () => {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('show');
    document.body.classList.toggle('stop-scroll');
};

window.switchPage = (page) => {
    document.getElementById('page_home').classList.toggle('hidden', page !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', page !== 'event');
    window.toggleSidebar();
};

// --- AUTH ---
window.openAdmin = async () => {
    const { value: login } = await Swal.fire({
        title: 'ADMIN LOGIN',
        background: '#121826', color: '#fff',
        html: `<input id="u" class="swal2-input" placeholder="User"><input id="p" type="password" class="swal2-input" placeholder="Pass">`,
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });

    if (login) {
        onValue(ref(db, 'admin'), (snap) => {
            const a = snap.val();
            if (a && login[0] === a.user && login[1] === a.pass) {
                document.getElementById('modal_admin').classList.remove('hidden');
                window.toggleSidebar();
            } else {
                Swal.fire('Error', 'Sandi Salah!', 'error');
            }
        }, { onlyOnce: true });
    }
};

window.closeAdmin = () => document.getElementById('modal_admin').classList.add('hidden');

// --- DATABASE RENDER ---
onValue(ref(db, '/'), (snap) => {
    const data = snap.val();
    if (!data) return;

    // Produk
    const home = document.getElementById('page_home');
    home.innerHTML = '';
    for (let id in data.products) {
        const p = data.products[id];
        const prices = p.prices.split(',').map(l => `
            <div class="flex justify-between items-center bg-black/20 p-3 rounded-xl mb-2">
                <span class="text-[11px] font-bold">${l.trim()}</span>
                <div class="flex gap-2">
                    <button onclick="buy('${p.name}','${l.trim()}',1)" class="bg-blue-600 px-3 py-1 rounded text-[10px] font-bold">WA 1</button>
                    <button onclick="buy('${p.name}','${l.trim()}',2)" class="bg-green-600 px-3 py-1 rounded text-[10px] font-bold">WA 2</button>
                </div>
            </div>`).join('');

        home.innerHTML += `
            <div class="card-product">
                <span class="absolute top-3 right-3 bg-blue-500 text-[8px] px-2 py-1 rounded font-black">${p.tag}</span>
                <h3 class="text-lg font-black text-blue-400 mb-4 uppercase">${p.name}</h3>
                <div>${prices}</div>
                <button onclick="delP('${id}')" class="mt-4 text-[9px] text-red-500 opacity-30 hover:opacity-100">Hapus</button>
            </div>`;
    }

    // Sosmed
    const sos = document.getElementById('sosmed_container');
    sos.innerHTML = '';
    for (let id in data.sosmed) {
        const s = data.sosmed[id];
        sos.innerHTML += `<a href="${s.link}" target="_blank" class="nav-btn"><i class="${s.icon} w-8"></i> ${s.name}</a>`;
    }

    window.wa1 = data.settings.wa1;
    window.wa2 = data.settings.wa2;
    document.getElementById('cs_link').href = data.settings.cs;
});

window.addProduct = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const prices = document.getElementById('p_prices').value;
    if(name && prices) push(ref(db, 'products'), { name, tag, prices });
};

window.delP = (id) => remove(ref(db, `products/${id}`));

window.buy = (n, p, w) => {
    const num = w === 1 ? window.wa1 : window.wa2;
    window.open(`https://wa.me/${num}?text=Order%20${n}%20 Paket%20${p}`, '_blank');
};