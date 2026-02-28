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

// BINTANG GENERATOR
const starField = document.getElementById('starField');
for(let i=0; i<80; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 'px';
    star.style.width = size; star.style.height = size;
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDuration = (Math.random() * 50 + 50) + 's';
    starField.appendChild(star);
}

// TOGGLE SIDEBAR
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('active');

// ADMIN SESSION
window.onload = () => {
    if(localStorage.getItem('zmt_auth') === 'true') {
        isAdmin = true;
        document.getElementById('admin_tag').classList.remove('hidden');
        document.getElementById('lgt_btn').classList.remove('hidden');
        document.getElementById('lgn_btn').classList.add('hidden');
        document.getElementById('spacer').classList.add('hidden');
    }
};

window.openAdmin = async () => {
    if(isAdmin) return document.getElementById('modal_admin').classList.remove('hidden');
    const { value: login } = await Swal.fire({
        title: 'VVIP ACCESS',
        background: '#0f172a',
        color: '#fff',
        html: '<input id="u" class="swal2-input in-kapsul" style="border-radius:99px; margin-bottom:10px" placeholder="Username"><input id="p" type="password" style="border-radius:99px" class="swal2-input in-kapsul" placeholder="Password">',
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if(login && login[0] === 'Zmt' && login[1] === 'zmt') {
        localStorage.setItem('zmt_auth', 'true');
        location.reload();
    }
};

window.logoutAdmin = () => { localStorage.removeItem('zmt_auth'); location.reload(); };
window.closeAdmin = () => document.getElementById('modal_admin').classList.add('hidden');

// RULES & QRIS
window.showRules = () => {
    Swal.fire({
        title: 'RULES PAYMENT',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#2563eb',
        html: `<div class="text-left text-xs space-y-4 p-2 leading-relaxed italic">
            <p>1. TRANSFER KE QRIS DI ATAS</p>
            <p>2. WAJIB CEK DETAIL SETELAH TF (TELAT = HANGUS)</p>
            <p>3. KIRIM BUKTI KE WA ADMIN JANGAN DI GRUP</p>
        </div>`
    });
};

window.zoomQR = () => Swal.fire({ imageUrl: 'qris_clean.png', imageWidth: 350, showConfirmButton: false, background: '#0f172a' });

// DATABASE CORE
window.saveP = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const durInputs = document.querySelectorAll('.d-in');
    const prcInputs = document.querySelectorAll('.p-in');
    let priceData = [];

    durInputs.forEach((input, i) => {
        if(input.value && prcInputs[i].value) {
            priceData.push(`${input.value} Day | ${prcInputs[i].value}K`);
        }
    });

    if(name && priceData.length > 0) {
        push(ref(db, 'products'), { name, tag, prices: priceData.join(',') });
        document.getElementById('p_name').value = '';
        durInputs.forEach(i => i.value = '');
        prcInputs.forEach(i => i.value = '');
        Swal.fire('Success!', 'Produk ditambahkan', 'success');
    }
};

onValue(ref(db, 'products'), (snap) => {
    const home = document.getElementById('page_home');
    const adminList = document.getElementById('admin_list');
    home.innerHTML = ''; adminList.innerHTML = '';
    
    snap.forEach(child => {
        const item = child.val();
        const priceArray = item.prices.split(',');
        
        let priceHtml = '';
        priceArray.forEach(p => {
            priceHtml += `
                <div class="price-row">
                    <span class="price-text">${p}</span>
                    <button onclick="window.open('https://wa.me/6289653938936?text=Order%20${item.name}%20${p}')" class="btn-buy-kapsul wa1"><i class="fab fa-whatsapp"></i> BUY VIA WA 1</button>
                    <button onclick="window.open('https://wa.me/6285721057014?text=Order%20${item.name}%20${p}')" class="btn-buy-kapsul wa2"><i class="fab fa-whatsapp"></i> BUY VIA WA 2</button>
                </div>`;
        });

        home.innerHTML += `
            <div class="card-vvip">
                <span class="tag-vvip">${item.tag}</span>
                <h1 class="name-vvip text-white uppercase">${item.name}</h1>
                ${priceHtml}
            </div>`;

        if(isAdmin) {
            adminList.innerHTML += `
                <div class="bg-black/40 p-3 rounded-full flex justify-between px-5 border border-white/5">
                    <span class="text-[10px] font-bold">${item.name}</span>
                    <button onclick="remove(ref(db, 'products/${child.key}'))" class="text-red-500"><i class="fas fa-trash"></i></button>
                </div>`;
        }
    });
});

window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    if(window.innerWidth < 1024) toggleSidebar();
};