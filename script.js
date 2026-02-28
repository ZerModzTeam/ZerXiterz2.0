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
    const savedLogin = localStorage.getItem('zmt_admin');
    if (savedLogin === 'true') {
        setAdminMode(true);
    }
};

function setAdminMode(status) {
    isAdmin = status;
    localStorage.setItem('zmt_admin', status);
    document.getElementById('admin_indicator').classList.toggle('hidden', !status);
    document.getElementById('spacer').classList.toggle('hidden', status);
    document.getElementById('btn_logout').classList.toggle('hidden', !status);
    document.getElementById('btn_login').classList.toggle('hidden', status);
}

window.logoutAdmin = () => {
    setAdminMode(false);
    Swal.fire('Logged Out', 'Akses admin dicabut', 'info');
    location.reload();
};

// --- NAVIGATION ---
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('show');
window.zoomQR = () => document.getElementById('modal_qr').classList.remove('hidden');

window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
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
        title: 'VERIFIKASI ADMIN', background: '#0f172a', color: '#fff',
        html: `<input id="u" class="swal2-input" placeholder="User"><input id="p" type="password" class="swal2-input" placeholder="Pass">`,
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if (login && login[0] === 'Zmt' && login[1] === 'zmt') {
        setAdminMode(true);
        document.getElementById('modal_admin').classList.remove('hidden');
        window.toggleSidebar();
    } else if(login) { Swal.fire('Gagal!', 'Akses Ditolak', 'error'); }
};

window.closeAdmin = () => {
    document.getElementById('modal_admin').classList.add('hidden');
    document.getElementById('edit_id').value = '';
    document.getElementById('save_btn').innerText = 'Upload Produk';
};

// --- DATA ACTIONS ---
window.saveP = () => {
    const id = document.getElementById('edit_id').value;
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const dIn = document.querySelectorAll('.d-in');
    const pIn = document.querySelectorAll('.p-in');
    let prices = [];
    dIn.forEach((d, i) => { if(d.value) prices.push(`${d.value} | ${pIn[i].value}`); });

    if(name && prices.length > 0) {
        const data = { name, tag, prices: prices.join(',') };
        if(id) update(ref(db, `products/${id}`), data);
        else push(ref(db, 'products'), data);
        closeAdmin();
        Swal.fire('Sukses!', 'Produk tersimpan', 'success');
    }
};

window.saveE = () => {
    const t = document.getElementById('e_title').value;
    const l = document.getElementById('e_link').value;
    if(t && l) {
        push(ref(db, 'events'), { title: t, link: l });
        Swal.fire('Event Ditambah!', '', 'success');
    }
};

window.editItem = (id, n, t, p) => {
    tabAdmin('tab_p');
    document.getElementById('edit_id').value = id;
    document.getElementById('p_name').value = n;
    document.getElementById('p_tag').value = t;
    const prs = p.split(',');
    const dIn = document.querySelectorAll('.d-in');
    const pIn = document.querySelectorAll('.p-in');
    prs.forEach((v, i) => {
        if(dIn[i]) {
            const pts = v.split('|');
            dIn[i].value = pts[0].trim();
            pIn[i].value = pts[1].trim();
        }
    });
    document.getElementById('save_btn').innerText = 'Update Produk';
};

window.hapusItem = (path) => {
    Swal.fire({ title: 'Hapus?', icon: 'warning', showCancelButton: true }).then(r => { 
        if(r.isConfirmed) remove(ref(db, path)); 
    });
};

// --- RENDER ---
onValue(ref(db, '/'), (snap) => {
    const data = snap.val(); if(!data) return;
    
    // Render Home
    const home = document.getElementById('page_home');
    home.innerHTML = '';
    const adminList = document.getElementById('admin_list_produk');
    adminList.innerHTML = '';

    for(let id in data.products){
        const p = data.products[id];
        const list = p.prices.split(',').map(l => `
            <div class="price-box">
                <span class="text-[11px] font-black text-blue-400 block mb-4 uppercase tracking-[0.2em] text-center">${l}</span>
                <div class="space-y-2.5">
                    <button onclick="buy('${p.name}','${l}',1)" class="btn-buy btn-wa1"><i class="fab fa-whatsapp"></i> BUY VIA WA 1</button>
                    <button onclick="buy('${p.name}','${l}',2)" class="btn-buy btn-wa2"><i class="fab fa-whatsapp"></i> BUY VIA WA 2</button>
                </div>
            </div>`).join('');
        
        home.innerHTML += `
            <div class="card-z">
                <div class="mb-5">
                    <span class="text-[9px] font-black text-blue-500 tracking-widest uppercase">${p.tag}</span>
                    <h3 class="text-2xl font-black italic text-white uppercase">${p.name}</h3>
                </div>
                ${list}
            </div>`;

        // Render Admin List (Edit/Hapus)
        adminList.innerHTML += `
            <div class="bg-black/40 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                <span class="text-xs font-bold uppercase">${p.name}</span>
                <div class="flex gap-3">
                    <button onclick="editItem('${id}','${p.name}','${p.tag}','${p.prices}')" class="text-blue-500"><i class="fas fa-edit"></i></button>
                    <button onclick="hapusItem('products/${id}')" class="text-red-500"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
    }

    // Render Event
    const ev = document.getElementById('page_event');
    ev.innerHTML = '<h2 class="text-xl font-black text-center text-blue-500 mb-8 uppercase italic">Downloads</h2>';
    for(let id in data.events){
        const e = data.events[id];
        ev.innerHTML += `
            <div class="flex justify-between items-center bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                <span class="font-bold text-xs uppercase italic">${e.title}</span>
                <div class="flex gap-4 items-center">
                    <a href="${e.link}" target="_blank" class="text-blue-500 text-2xl"><i class="fas fa-circle-down"></i></a>
                    ${isAdmin ? `<button onclick="hapusItem('events/${id}')" class="text-red-500/30"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            </div>`;
    }
});

window.buy = (n, p, w) => {
    const num = w === 1 ? '6289653938936' : '6285721057014';
    window.open(`https://wa.me/${num}?text=Halo%20Admin%20ZMT%21%0AOrder%3A%20${n}%0APaket%3A%20${p}`, '_blank');
};