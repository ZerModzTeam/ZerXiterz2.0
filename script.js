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

window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('show');
window.zoomQR = () => document.getElementById('modal_qr').classList.remove('hidden');

window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    window.toggleSidebar();
};

window.tabAdmin = (id) => {
    document.getElementById('tab_p').classList.add('hidden');
    document.getElementById('tab_e').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
    document.getElementById('btn_tab_p').classList.toggle('bg-blue-600', id==='tab_p');
    document.getElementById('btn_tab_e').classList.toggle('bg-blue-600', id==='tab_e');
};

window.openAdmin = async () => {
    const { value: login } = await Swal.fire({
        title: 'VERIFIKASI ADMIN', background: '#0f172a', color: '#fff',
        html: `<input id="u" class="swal2-input" placeholder="User"><input id="p" type="password" class="swal2-input" placeholder="Pass">`,
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if (login && login[0] === 'Zmt' && login[1] === 'zmt') {
        isAdmin = true;
        document.getElementById('status_admin').classList.remove('hidden');
        document.getElementById('modal_admin').classList.remove('hidden');
        Swal.fire('Welcome Admin!', '', 'success');
    } else if(login) { Swal.fire('Gagal!', 'User/Pass Salah', 'error'); }
};

window.closeAdmin = () => {
    document.getElementById('modal_admin').classList.add('hidden');
    document.getElementById('edit_id').value = '';
    document.getElementById('save_btn').innerText = 'Upload Produk';
};

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
        Swal.fire('Berhasil!', '', 'success');
    }
};

window.editItem = (id, n, t, p) => {
    document.getElementById('edit_id').value = id;
    document.getElementById('p_name').value = n;
    document.getElementById('p_tag').value = t;
    const prs = p.split(',');
    const dIn = document.querySelectorAll('.d-in');
    const pIn = document.querySelectorAll('.p-in');
    prs.forEach((v, i) => {
        const parts = v.split('|');
        dIn[i].value = parts[0].trim();
        pIn[i].value = parts[1].trim();
    });
    document.getElementById('save_btn').innerText = 'Update Produk';
    document.getElementById('modal_admin').classList.remove('hidden');
};

window.hapusItem = (path) => {
    if(!isAdmin) return;
    Swal.fire({ title: 'Hapus?', showCancelButton: true }).then(r => { if(r.isConfirmed) remove(ref(db, path)); });
};

onValue(ref(db, '/'), (snap) => {
    const data = snap.val(); if(!data) return;
    const home = document.getElementById('page_home');
    home.innerHTML = '';
    for(let id in data.products){
        const p = data.products[id];
        const list = p.prices.split(',').map(l => `
            <div class="price-box">
                <span class="text-xs font-black text-blue-400 block mb-3 uppercase tracking-widest">${l}</span>
                <div class="space-y-2">
                    <button onclick="buy('${p.name}','${l}',1)" class="btn-buy btn-wa1"><i class="fab fa-whatsapp"></i> BUY VIA WA 1</button>
                    <button onclick="buy('${p.name}','${l}',2)" class="btn-buy btn-wa2"><i class="fab fa-whatsapp"></i> BUY VIA WA 2</button>
                </div>
            </div>`).join('');
        home.innerHTML += `
            <div class="card-z">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="text-[9px] font-black text-blue-500 tracking-widest uppercase">${p.tag}</span>
                        <h3 class="text-xl font-extrabold italic text-white uppercase">${p.name}</h3>
                    </div>
                    ${isAdmin ? `
                    <div class="flex gap-4">
                        <button onclick="editItem('${id}','${p.name}','${p.tag}','${p.prices}')" class="text-blue-500"><i class="fas fa-edit"></i></button>
                        <button onclick="hapusItem('products/${id}')" class="text-red-500"><i class="fas fa-trash"></i></button>
                    </div>` : ''}
                </div>
                ${list}
            </div>`;
    }
});

window.buy = (n, p, w) => {
    const num = w === 1 ? '6289653938936' : '6285721057014';
    window.open(`https://wa.me/${num}?text=Halo%20Admin%20ZMT%21%0AOrder%20%3A%20${n}%0APaket%20%3A%20${p}`, '_blank');
};