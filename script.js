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

// --- NAV & UI ---
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('show');
window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    window.toggleSidebar();
};

window.tabAdmin = (id) => {
    document.getElementById('tab_produk').classList.add('hidden');
    document.getElementById('tab_event').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
    const btns = document.querySelectorAll('[onclick^="tabAdmin"]');
    btns.forEach(b => b.classList.remove('bg-blue-600'));
    event.target.classList.add('bg-blue-600');
};

// --- AUTH ---
window.openAdmin = async () => {
    const { value: login } = await Swal.fire({
        title: 'VERIFIKASI ZMT', background: '#0a0f1d', color: '#fff',
        html: `<input id="u" class="swal2-input" placeholder="User"><input id="p" type="password" class="swal2-input" placeholder="Pass">`,
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if (login && login[0] === 'Zmt' && login[1] === 'zmt') {
        document.getElementById('modal_admin').classList.remove('hidden');
        window.toggleSidebar();
    } else if (login) { Swal.fire('Error', 'Sandi Salah!', 'error'); }
};
window.closeAdmin = () => document.getElementById('modal_admin').classList.add('hidden');

// --- DATABASE ACTION ---
window.saveProduct = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const dIn = document.querySelectorAll('.d-in');
    const pIn = document.querySelectorAll('.p-in');
    let prices = [];
    dIn.forEach((d, i) => { if(d.value) prices.push(`${d.value} | ${pIn[i].value}`); });
    if(name && prices.length > 0) {
        push(ref(db, 'products'), { name, tag, prices: prices.join(',') });
        Swal.fire('Berhasil', 'Produk Ditambahkan!', 'success');
        document.getElementById('p_name').value = '';
        dIn.forEach(d => d.value = ''); pIn.forEach(p => p.value = '');
    }
};

window.saveEvent = () => {
    const title = document.getElementById('ev_title').value;
    const link = document.getElementById('ev_link').value;
    if(title && link) {
        push(ref(db, 'events'), { title, link }).then(() => {
            document.getElementById('ev_title').value = '';
            document.getElementById('ev_link').value = '';
        });
    }
};

window.delItem = (path) => {
    Swal.fire({
        title: 'Hapus?', text: 'Data tidak bisa balik lagi!', icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus!'
    }).then((res) => { if(res.isConfirmed) remove(ref(db, path)); });
};

// --- RENDER REALTIME ---
onValue(ref(db, '/'), (snap) => {
    const data = snap.val(); if (!data) return;

    // Render Produk
    const home = document.getElementById('page_home');
    home.innerHTML = '';
    for (let id in data.products) {
        const p = data.products[id];
        const list = p.prices.split(',').map(l => `
            <div class="price-row">
                <span class="text-[11px] font-bold text-gray-400">${l}</span>
                <div class="flex gap-2">
                    <button onclick="buy('${p.name}','${l}',1)" class="wa-btn wa1"><i class="fab fa-whatsapp"></i> WA 1</button>
                    <button onclick="buy('${p.name}','${l}',2)" class="wa-btn wa2"><i class="fab fa-whatsapp"></i> WA 2</button>
                </div>
            </div>`).join('');
        home.innerHTML += `
            <div class="product-card">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <span class="text-[8px] font-black uppercase text-blue-500 tracking-widest">${p.tag}</span>
                        <h3 class="text-xl font-black italic uppercase text-white">${p.name}</h3>
                    </div>
                    <button onclick="delItem('products/${id}')" class="text-red-500/30 hover:text-red-500 transition"><i class="fas fa-trash-can"></i></button>
                </div>
                <div>${list}</div>
            </div>`;
    }

    // Render Event
    const evMain = document.getElementById('page_event');
    const evAdmin = document.getElementById('admin_event_list');
    evMain.innerHTML = '<h2 class="text-2xl font-black text-blue-500 italic mb-8">EVENT & DOWNLOADS</h2>';
    evAdmin.innerHTML = '';
    for (let id in data.events) {
        const ev = data.events[id];
        evMain.innerHTML += `<a href="${ev.link}" target="_blank" class="block p-6 bg-white/5 border border-white/5 rounded-[2rem] text-left font-bold hover:bg-blue-600/10 transition-all flex justify-between items-center">
            ${ev.title} <i class="fas fa-circle-down text-blue-500"></i>
        </a>`;
        evAdmin.innerHTML += `<div class="flex justify-between p-3 bg-white/5 rounded-xl text-xs"><span>${ev.title}</span> <button onclick="delItem('events/${id}')" class="text-red-500"><i class="fas fa-trash"></i></button></div>`;
    }
});

window.buy = (n, p, w) => {
    const num = w === 1 ? '6289653938936' : '6285721057014';
    window.open(`https://wa.me/${num}?text=Halo%20Admin%20ZMT%20Store!%0AOrder%20%3A%20${n}%0APaket%20%3A%20${p}`, '_blank');
};