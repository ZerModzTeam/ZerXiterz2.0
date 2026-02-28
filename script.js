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

// --- KEEP LOGIN ---
window.onload = () => {
    if (localStorage.getItem('zmt_logged') === 'true') {
        isAdmin = true;
        showAdminElements();
    }
};

function showAdminElements() {
    document.getElementById('admin_indicator').classList.remove('hidden');
    document.getElementById('spacer').classList.add('hidden');
    document.getElementById('btn_logout').classList.remove('hidden');
    document.getElementById('btn_login').classList.add('hidden');
}

window.logoutAdmin = () => {
    localStorage.removeItem('zmt_logged');
    location.reload();
};

// --- CORE FUNCTIONS ---
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('show');
window.zoomQR = () => document.getElementById('modal_qr').classList.remove('hidden');

window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    window.toggleSidebar();
};

window.showRules = () => {
    Swal.fire({
        title: 'RULES PAYMENT',
        html: `<div class="text-left text-xs space-y-3 p-2">
            <p>1. TRANSFER KE QRIS DI ATAS</p>
            <p>2. SETELAH TF WAJIB CEK DETAIL (TANPA CEK DETAIL = HANGUS)</p>
            <p>3. KIRIM BUKTI KE ADMIN VIA WA (JANGAN DI GRUP)</p>
        </div>`,
        confirmButtonText: 'PAHAM',
        confirmButtonColor: '#2563eb'
    });
};

window.tabAdmin = (id) => {
    ['tab_p', 'tab_e', 'tab_manage'].forEach(t => document.getElementById(t).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('[id^="btn_tab_"]').forEach(b => b.classList.remove('bg-blue-600'));
    document.getElementById('btn_' + id).classList.add('bg-blue-600');
};

// --- ADMIN ACTIONS ---
window.openAdmin = async () => {
    if(isAdmin) { document.getElementById('modal_admin').classList.remove('hidden'); return; }
    const { value: login } = await Swal.fire({
        title: 'LOGIN ADMIN',
        html: `<input id="u" class="swal2-input" placeholder="User"><input id="p" type="password" class="swal2-input" placeholder="Pass">`,
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if (login && login[0] === 'Zmt' && login[1] === 'zmt') {
        localStorage.setItem('zmt_logged', 'true');
        location.reload();
    }
};

window.closeAdmin = () => document.getElementById('modal_admin').classList.add('hidden');

window.saveP = () => {
    const id = document.getElementById('edit_id').value;
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const dIn = document.querySelectorAll('.d-in');
    const pIn = document.querySelectorAll('.p-in');
    let prices = [];
    dIn.forEach((d, i) => { if(d.value) prices.push(`${d.value} Day | ${pIn[i].value}K`); });

    if(name && prices.length > 0) {
        const data = { name, tag, prices: prices.join(',') };
        if(id) update(ref(db, `products/${id}`), data);
        else push(ref(db, 'products'), data);
        location.reload();
    }
};

window.hapusItem = (path) => {
    Swal.fire({ title: 'Hapus?', showCancelButton: true }).then(r => { if(r.isConfirmed) remove(ref(db, path)); });
};

// --- DATA LISTENER ---
onValue(ref(db, '/'), (snap) => {
    const data = snap.val(); if(!data) return;
    const home = document.getElementById('page_home');
    const adminList = document.getElementById('tab_manage');
    home.innerHTML = ''; adminList.innerHTML = '';

    for(let id in data.products){
        const p = data.products[id];
        const list = p.prices.split(',').map(l => `
            <div class="price-box">
                <span class="text-xs font-black text-blue-400 block mb-4 text-center uppercase tracking-widest">${l}</span>
                <div class="space-y-2">
                    <button onclick="buy('${p.name}','${l}',1)" class="btn-buy btn-wa1"><i class="fab fa-whatsapp"></i> BUY VIA WA 1</button>
                    <button onclick="buy('${p.name}','${l}',2)" class="btn-buy btn-wa2"><i class="fab fa-whatsapp"></i> BUY VIA WA 2</button>
                </div>
            </div>`).join('');
        
        home.innerHTML += `<div class="card-z">
            <span class="text-[9px] font-black text-blue-500 uppercase tracking-widest">${p.tag}</span>
            <h3 class="text-2xl font-black italic text-white uppercase mb-6">${p.name}</h3>
            ${list}
        </div>`;

        if(isAdmin) {
            adminList.innerHTML += `<div class="bg-black/40 p-4 rounded-full flex justify-between items-center mb-2">
                <span class="text-xs font-bold ml-4">${p.name}</span>
                <button onclick="hapusItem('products/${id}')" class="text-red-500 mr-4"><i class="fas fa-trash"></i></button>
            </div>`;
        }
    }
});

window.buy = (n, p, w) => {
    const num = w === 1 ? '6289653938936' : '6285721057014';
    window.open(`https://wa.me/${num}?text=Order%20%3A%20${n}%0APaket%20%3A%20${p}`, '_blank');
};