import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCOuLRN2VNULW1T2P-43GkXBUqpCHqQSY",
  authDomain: "zmtstore-92963.firebaseapp.com",
  databaseURL: "https://zmtstore-92963-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zmtstore-92963"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let isAdmin = false;

// --- FIX GARIS 3 & KEEP LOGIN ---
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('active');

window.onload = () => {
    if (localStorage.getItem('zmt_session') === 'active') {
        isAdmin = true;
        document.getElementById('admin_indicator').classList.remove('hidden');
        document.getElementById('btn_logout').classList.remove('hidden');
        document.getElementById('btn_login').classList.add('hidden');
        document.getElementById('spacer').classList.add('hidden');
    }
};

window.logoutAdmin = () => { localStorage.removeItem('zmt_session'); location.reload(); };

window.openAdmin = async () => {
    if(isAdmin) { document.getElementById('modal_admin').classList.remove('hidden'); return; }
    const { value: login } = await Swal.fire({
        title: 'LOGIN ADMIN', background: '#0f172a', color: '#fff',
        html: `<input id="u" class="swal2-input" placeholder="User"><input id="p" type="password" class="swal2-input" placeholder="Pass">`,
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if (login && login[0] === 'Zmt' && login[1] === 'zmt') { localStorage.setItem('zmt_session', 'active'); location.reload(); }
};

window.closeAdmin = () => document.getElementById('modal_admin').classList.add('hidden');
window.zoomQR = () => document.getElementById('modal_qr').classList.remove('hidden');

window.showRules = () => {
    Swal.fire({
        title: 'RULES PAYMENT', background: '#0f172a', color: '#fff', confirmButtonColor: '#2563eb',
        html: `<div class="text-left text-xs space-y-4 p-2 leading-relaxed">
            <p>1. TRANSFER KE QRIS DI PP GRUP INI</p>
            <p>2. SETELAH TF CEK DETAIL (TANPA CEK DETAIL = HANGUS)</p>
            <p>3. KIRIM BUKTI KE ADMIN VIA WA JANGAN DI GB</p>
        </div>`
    });
};

window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    window.toggleSidebar();
};

window.tabAdmin = (id) => {
    ['tab_p', 'tab_e', 'tab_manage'].forEach(t => document.getElementById(t).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('bg-blue-600'));
    document.getElementById('btn_' + id).classList.add('bg-blue-600');
};

window.saveP = () => {
    const id = document.getElementById('edit_id').value;
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const prices = [];
    document.querySelectorAll('.d-in').forEach((d, i) => {
        const p = document.querySelectorAll('.p-in')[i];
        if(d.value) prices.push(`${d.value} Day | ${p.value}K`);
    });
    if(name && prices.length > 0) {
        const data = { name, tag, prices: prices.join(',') };
        if(id) update(ref(db, `products/${id}`), data);
        else push(ref(db, 'products'), data);
        closeAdmin();
    }
};

onValue(ref(db, 'products'), (snap) => {
    const data = snap.val();
    const home = document.getElementById('page_home');
    const manage = document.getElementById('tab_manage');
    home.innerHTML = ''; manage.innerHTML = '';
    if(!data) return;

    for(let id in data){
        const p = data[id];
        const priceLines = p.prices.split(',').map(l => `
            <div class="price-item">
                <span class="text-sm font-black text-blue-400 block mb-5 text-center italic tracking-widest uppercase">${l}</span>
                <button onclick="buy('${p.name}','${l}',1)" class="btn-buy btn-wa1"><i class="fab fa-whatsapp"></i> BUY VIA WA 1</button>
                <button onclick="buy('${p.name}','${l}',2)" class="btn-buy btn-wa2"><i class="fab fa-whatsapp"></i> BUY VIA WA 2</button>
            </div>`).join('');
        
        home.innerHTML += `<div class="card-z">
            <span class="text-[9px] font-black text-blue-500 uppercase tracking-widest">${p.tag}</span>
            <h1 class="text-3xl font-black italic text-white uppercase mb-8 leading-none">${p.name}</h1>
            ${priceLines}
        </div>`;

        if(isAdmin) {
            manage.innerHTML += `<div class="bg-black/40 p-4 rounded-full flex justify-between items-center mb-2">
                <span class="text-xs font-bold px-4">${p.name}</span>
                <button onclick="hapusItem('${id}')" class="text-red-500 px-4"><i class="fas fa-trash"></i></button>
            </div>`;
        }
    }
});

window.hapusItem = (id) => remove(ref(db, `products/${id}`));
window.buy = (n, p, w) => {
    const num = w === 1 ? '6289653938936' : '6285721057014';
    window.open(`https://wa.me/${num}?text=Halo%20Admin%2C%20saya%20mau%20order%20${n}%20paket%20${p}`);
};