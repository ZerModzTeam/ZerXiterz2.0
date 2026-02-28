import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// KONFIGURASI FIREBASE LU
const firebaseConfig = {
    apiKey: "AIzaSyDCOuLRN2VNULW1T2P-43GkXBUqpCHqQSY",
    authDomain: "zmtstore-92963.firebaseapp.com",
    databaseURL: "https://zmtstore-92963-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "zmtstore-92963"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let isAdmin = localStorage.getItem('zmt_auth') === 'true';

// Bintang Animasi
const starField = document.getElementById('starField');
for(let i=0; i<80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random()*3+'px';
    s.style.width = size; s.style.height = size;
    s.style.left = Math.random()*100+'%';
    s.style.top = Math.random()*100+'%';
    s.style.animationDuration = (Math.random()*50+50)+'s';
    starField.appendChild(s);
}

// Fungsi Navigasi & Sidebar
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('active');
window.closeAdmin = () => document.getElementById('modal_admin').classList.remove('active');

window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    toggleSidebar();
};

// Admin Logic
if(isAdmin) {
    document.getElementById('admin_tag').classList.remove('hidden');
    document.getElementById('lgt_btn').classList.remove('hidden');
    document.getElementById('lgn_btn').classList.add('hidden');
}

window.openAdmin = async () => {
    if(isAdmin) return document.getElementById('modal_admin').classList.add('active');
    const { value: login } = await Swal.fire({
        title: 'ADMIN VVIP', background: '#0f172a', color: '#fff',
        html: '<input id="u" class="swal2-input" style="border-radius:50px" placeholder="User"><input id="p" type="password" style="border-radius:50px" class="swal2-input" placeholder="Pass">',
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if(login && login[0] === 'Zmt' && login[1] === 'zmt') {
        localStorage.setItem('zmt_auth', 'true');
        location.reload();
    }
};

window.logoutAdmin = () => { localStorage.removeItem('zmt_auth'); location.reload(); };

// CRUD Database
window.saveP = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const durs = document.querySelectorAll('.d-in');
    const prcs = document.querySelectorAll('.p-in');
    let data = [];
    durs.forEach((d, i) => { if(d.value) data.push(d.value + " Day | " + prcs[i].value + "K"); });
    
    if(name && data.length > 0) {
        push(ref(db, 'products'), { name, tag, prices: data.join(',') });
        Swal.fire('Sukses!', 'Produk terupload', 'success');
        closeAdmin();
    }
};

onValue(ref(db, 'products'), (snap) => {
    const home = document.getElementById('page_home');
    const admList = document.getElementById('admin_list');
    home.innerHTML = ''; admList.innerHTML = '';
    
    snap.forEach(child => {
        const item = child.val();
        const priceArr = item.prices.split(',');
        let priceHtml = '';
        
        priceArr.forEach(p => {
            priceHtml += `
                <div class="price-row">
                    <span class="p-info">${p}</span>
                    <button onclick="window.open('https://wa.me/6289653938936?text=Order%20${item.name}%20${p}')" class="buy-btn wa1">BUY WA 1</button>
                    <button onclick="window.open('https://wa.me/6285721057014?text=Order%20${item.name}%20${p}')" class="buy-btn wa2">BUY WA 2</button>
                </div>`;
        });

        home.innerHTML += `
            <div class="p-card">
                <span class="p-tag">${item.tag}</span>
                <h1 class="p-name">${item.name}</h1>
                ${priceHtml}
            </div>`;

        if(isAdmin) {
            admList.innerHTML += `
                <div style="display:flex; justify-content:space-between; padding:15px; background:#000; border-radius:20px; margin-bottom:8px; font-size:11px; border:1px solid #ffffff05">
                    ${item.name} <i onclick="remove(ref(db,'products/${child.key}'))" class="fas fa-trash" style="color:#ef4444; cursor:pointer"></i>
                </div>`;
        }
    });
});

// Extra UI
window.zoomQR = () => Swal.fire({ imageUrl: 'qris_clean.png', imageWidth: 350, showConfirmButton: false, background: '#0f172a' });
window.showRules = () => Swal.fire({ 
    title: 'PAYMENT RULES', background: '#0f172a', color: '#fff',
    html: '<div style="text-align:left; font-size:12px; line-height:2">1. Scan QRIS di atas<br>2. Masukkan nominal harga paket<br>3. Kirim bukti transfer ke WA Admin</div>' 
});