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

// --- KEEP LOGIN LOGIC ---
window.onload = () => {
    if (localStorage.getItem('zmt_auth') === 'true') {
        isAdmin = true;
        updateUIAdmin();
    }
};

function updateUIAdmin() {
    document.getElementById('admin_tag').classList.toggle('hidden', !isAdmin);
    document.getElementById('spacer').classList.toggle('hidden', isAdmin);
    document.getElementById('btn_logout_sidebar').classList.toggle('hidden', !isAdmin);
    document.getElementById('btn_login_sidebar').classList.toggle('hidden', isAdmin);
}

window.logoutAdmin = () => {
    isAdmin = false;
    localStorage.removeItem('zmt_auth');
    updateUIAdmin();
    Swal.fire('Logged Out', 'Sesi admin berakhir', 'info').then(() => location.reload());
};

// --- NAVIGATION ---
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('show');
window.zoomQR = () => document.getElementById('modal_qr').classList.remove('hidden');

window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    window.toggleSidebar();
};

window.tabAdmin = (id) => {
    ['tab_p', 'tab_e', 'tab_manage'].forEach(t => document.getElementById(t).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('[id^="btn_tab_"]').forEach(b => b.classList.remove('bg-blue-600'));
    document.getElementById('btn_' + id).classList.add('bg-blue-600');
};

// --- AUTH ---
window.openAdmin = async () => {
    if(isAdmin) { document.getElementById('modal_admin').classList.remove('hidden'); return; }
    const { value: login } = await Swal.fire({
        title: 'ADMIN LOGIN', background: '#0f172a', color: '#fff',
        html: `<input id="u" class="swal2-input" placeholder="User"><input id="p" type="password" class="swal2-input" placeholder="Pass">`,
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if (login && login[0] === 'Zmt' && login[1] === 'zmt') {
        isAdmin = true;
        localStorage.setItem('zmt_auth', 'true');
        updateUIAdmin();
        document.getElementById('modal_admin').classList.remove('hidden');
        window.toggleSidebar();
    } else if(login) { Swal.fire('Error', 'User/Pass Salah', 'error'); }
};

window.closeAdmin = () => {
    document.getElementById('modal_admin').classList.add('hidden');
    document.getElementById('edit_id').value = '';
};

// --- DATA ---
window.saveP = () => {
    const id = document.getElementById('edit_id').value;
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const dIn = document.querySelectorAll('.d-in');
    const pIn = document.querySelectorAll('.p-in');
    let prices = [];
    
    // Auto Format Logic: Ketik 1 & 35 jadi "1 Day | 35K"
    dIn.forEach((d, i) => { 
        if(d.value) prices.push(`${d.value} Day | ${pIn[i].value}K`); 
    });

    if(name && prices.length > 0) {
        const data = { name, tag, prices: prices.join(',') };
        if(id) update(ref(db, `products/${id}`), data);
        else push(ref(db, 'products'), data);
        closeAdmin();
        Swal.fire('Berhasil!', '', 'success');
    }
};

window.editItem = (id, n, t, p) => {
    tabAdmin('tab_p');
    document.getElementById('edit_id').value = id;
    document.getElementById('p_name').value = n;
    document.getElementById('p_tag').value = t;
    document.getElementById('save_btn').innerText = 'Update Produk';
};

window.hapusItem = (path) => {
    Swal.fire({ title: 'Hapus?', showCancelButton: true }).then(r => { if(r.isConfirmed) remove(ref(db, path)); });
};

onValue(ref(db, '/'), (snap) => {
    const data = snap.val(); if(!data) return;
    const home = document.getElementById('page_home');
    home.innerHTML = '';
    const adminList = document.getElementById('admin_list_produk');
    adminList.innerHTML = '';

    for(let id in data.products){
        const p = data.products[id];
        const list = p.prices.split(',').map(l => `
            <div class="price-item">
                <span class="text-sm font-black text-blue-400 block mb-5 text-center uppercase italic tracking-widest">${l}</span>
                <div class="space-y-3">
                    <button onclick="buy('${p.name}','${l}',1)" class="btn-buy btn-wa1"><i class="fab fa-whatsapp"></i> BUY VIA WA 1</button>
                    <button onclick="buy('${p.name}','${l}',2)" class="btn-buy btn-wa2"><i class="fab fa-whatsapp"></i> BUY VIA WA 2</button>
                </div>
            </div>`).join('');
        
        home.innerHTML += `
            <div class="card-z">
                <div class="mb-6">
                    <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">${p.tag}</span>
                    <h3 class="text-3xl font-black italic text-white uppercase leading-none">${p.name}</h3>
                </div>
                ${list}
            </div>`;

        adminList.innerHTML += `
            <div class="bg-black/40 p-4 rounded-full flex justify-between items-center border border-white/5">
                <span class="text-xs font-bold px-4">${p.name}</span>
                <div class="flex gap-4 px-4">
                    <button onclick="editItem('${id}','${p.name}','${p.tag}','${p.prices}')" class="text-blue-500"><i class="fas fa-edit"></i></button>
                    <button onclick="hapusItem('products/${id}')" class="text-red-500"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
    }
});

window.buy = (n, p, w) => {
    const num = w === 1 ? '6289653938936' : '6285721057014';
    window.open(`https://wa.me/${num}?text=Order%20%3A%20${n}%0APaket%20%3A%20${p}`, '_blank');
};