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

// Star Generator
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

// Global UI Functions
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('active');

window.switchPage = (page) => {
    document.getElementById('page_home').classList.toggle('hidden', page !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', page !== 'event');
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    toggleSidebar();
};

// Admin Session
window.onload = () => {
    if(localStorage.getItem('zmt_auth') === 'true') {
        isAdmin = true;
        document.getElementById('admin_tag').classList.remove('hidden');
        document.getElementById('lgt_btn').classList.remove('hidden');
        document.getElementById('lgn_btn').classList.add('hidden');
    }
};

window.openAdmin = async () => {
    if(isAdmin) return document.getElementById('modal_admin').classList.remove('hidden');
    const { value: login } = await Swal.fire({
        title: 'VVIP ACCESS', background: '#0f172a', color: '#fff',
        html: '<input id="u" class="swal2-input" style="border-radius:50px" placeholder="Username"><input id="p" type="password" style="border-radius:50px" class="swal2-input" placeholder="Password">',
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if(login && login[0] === 'Zmt' && login[1] === 'zmt') {
        localStorage.setItem('zmt_auth', 'true');
        location.reload();
    }
};

window.logoutAdmin = () => { localStorage.removeItem('zmt_auth'); location.reload(); };
window.closeAdmin = () => document.getElementById('modal_admin').classList.add('hidden');

// Database Operations
window.saveP = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const durs = document.querySelectorAll('.d-in');
    const prcs = document.querySelectorAll('.p-in');
    let prices = [];

    durs.forEach((d, i) => {
        if(d.value && prcs[i].value) prices.push(`${d.value} Day | ${prcs[i].value}K`);
    });

    if(name && prices.length > 0) {
        push(ref(db, 'products'), { name, tag, prices: prices.join(',') });
        Swal.fire('Uploaded!', '', 'success');
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
                <div class="price-box">
                    <span class="p-dur">${p}</span>
                    <button onclick="buy('${item.name}','${p}',1)" class="buy-btn wa1">BUY VIA WA 1</button>
                    <button onclick="buy('${item.name}','${p}',2)" class="buy-btn wa2">BUY VIA WA 2</button>
                </div>`;
        });

        home.innerHTML += `
            <div class="product-card">
                <span class="p-tag">${item.tag}</span>
                <h1 class="p-name">${item.name}</h1>
                ${priceHtml}
            </div>`;

        if(isAdmin) {
            admList.innerHTML += `
                <div style="display:flex; justify-content:space-between; padding:10px; background:#000; border-radius:10px; margin-bottom:5px">
                    <span style="font-size:10px">${item.name}</span>
                    <i onclick="remove(ref(db,'products/${child.key}'))" class="fas fa-trash" style="color:red; cursor:pointer"></i>
                </div>`;
        }
    });
});

window.buy = (name, price, wa) => {
    const num = wa === 1 ? '6289653938936' : '6285721057014';
    window.open(`https://wa.me/${num}?text=Halo%20Admin%2C%20mau%20order%20${name}%20paket%20${price}`);
};

window.zoomQR = () => Swal.fire({ imageUrl: 'qris_clean.png', imageWidth: 350, showConfirmButton: false, background: '#0f172a' });
window.showRules = () => Swal.fire({ 
    title: 'RULES PAYMENT', background: '#0f172a', color: '#fff',
    html: '<div style="text-align:left; font-size:12px">1. TF ke QRIS diatas<br>2. Cek detail TF (Telat = Hangus)<br>3. Kirim bukti ke WA Admin</div>'
});