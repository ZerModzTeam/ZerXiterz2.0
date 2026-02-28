import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDCOuLRN2VNULW1T2P-43GkXBUqpCHqQSY",
    authDomain: "zmtstore-92963.firebaseapp.com",
    databaseURL: "https://zmtstore-92963-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "zmtstore-92963"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let isAdmin = false;

// 1. GENERATOR BINTANG
const starField = document.getElementById('starField');
for(let i=0; i<100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 'px';
    star.style.width = size; star.style.height = size;
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDuration = (Math.random() * 80 + 40) + 's';
    starField.appendChild(star);
}

// 2. FUNGSI GARIS 3 (SIDEBAR)
window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('active');
};

// 3. CEK LOGIN SAAT REFRESH
window.onload = () => {
    if(localStorage.getItem('zmt_auth') === 'true') {
        isAdmin = true;
        document.getElementById('admin_tag').classList.remove('hidden');
        document.getElementById('lgt_btn').classList.remove('hidden');
        document.getElementById('lgn_btn').classList.add('hidden');
        document.getElementById('spacer').classList.add('hidden');
    }
};

// 4. ADMIN LOGIN & LOGOUT
window.openAdmin = async () => {
    if(isAdmin) return document.getElementById('modal_admin').classList.remove('hidden');
    const { value: login } = await Swal.fire({
        title: 'ADMIN LOGIN',
        background: '#0f172a',
        color: '#fff',
        html: '<input id="u" class="swal2-input kapsul-in" style="border-radius:20px" placeholder="Username"><input id="p" type="password" style="border-radius:20px" class="swal2-input kapsul-in" placeholder="Password">',
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if(login && login[0] === 'Zmt' && login[1] === 'zmt') {
        localStorage.setItem('zmt_auth', 'true');
        location.reload();
    }
};

window.logoutAdmin = () => { localStorage.removeItem('zmt_auth'); location.reload(); };
window.closeAdmin = () => document.getElementById('modal_admin').classList.add('hidden');

// 5. RULES & QRIS ZOOM
window.showRules = () => {
    Swal.fire({
        title: 'RULES PAYMENT',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
        html: `<div class="text-left text-xs space-y-4 p-2 leading-relaxed">
            <p>1. TRANSFER KE QRIS DI ATAS</p>
            <p>2. WAJIB CEK DETAIL SETELAH TF (TANPA CEK = HANGUS)</p>
            <p>3. KIRIM BUKTI KE WA ADMIN, JANGAN DI GRUP!</p>
        </div>`
    });
};

window.zoomQR = () => Swal.fire({ imageUrl: 'qris_clean.png', imageWidth: 350, showConfirmButton: false, background: '#0f172a' });

// 6. DATABASE OPERATION
window.saveP = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const d = document.getElementById('p_day').value;
    const p = document.getElementById('p_price').value;
    if(name && d && p) {
        push(ref(db, 'products'), { name, tag, prices: `${d} Day | ${p}K` });
        document.getElementById('p_name').value = '';
        Swal.fire('Berhasil!', 'Produk terunggah', 'success');
    }
};

window.delP = (id) => {
    if(confirm('Hapus produk ini?')) remove(ref(db, `products/${id}`));
};

onValue(ref(db, 'products'), (snap) => {
    const home = document.getElementById('page_home');
    const list = document.getElementById('admin_list');
    home.innerHTML = ''; list.innerHTML = '';
    snap.forEach(child => {
        const item = child.val();
        home.innerHTML += `
            <div class="card-z">
                <span class="text-[9px] font-black text-blue-500 uppercase tracking-widest">${item.tag}</span>
                <h1 class="text-3xl font-black italic mb-6 uppercase leading-none">${item.name}</h1>
                <div class="price-container text-center">
                    <span class="text-blue-400 font-black italic uppercase text-sm mb-5 block">${item.prices}</span>
                    <button onclick="window.open('https://wa.me/6289653938936?text=Order%20${item.name}')" class="btn-buy btn-wa1"><i class="fab fa-whatsapp"></i> BUY VIA WA 1</button>
                    <button onclick="window.open('https://wa.me/6285721057014?text=Order%20${item.name}')" class="btn-buy btn-wa2"><i class="fab fa-whatsapp"></i> BUY VIA WA 2</button>
                </div>
            </div>`;
        if(isAdmin) {
            list.innerHTML += `<div class="bg-black/40 p-4 rounded-full flex justify-between px-6 border border-white/5 mb-2">
                <span class="text-xs font-bold">${item.name}</span>
                <button onclick="delP('${child.key}')" class="text-red-500"><i class="fas fa-trash"></i></button>
            </div>`;
        }
    });
});

window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    toggleSidebar();
};