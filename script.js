import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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

window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('show');

window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    window.toggleSidebar();
};

window.tabAdmin = (id) => {
    document.getElementById('tab_p').classList.add('hidden');
    document.getElementById('tab_e').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
    document.getElementById('btn_tab_p').classList.remove('bg-blue-600');
    document.getElementById('btn_tab_e').classList.remove('bg-blue-600');
    document.getElementById('btn_' + id).classList.add('bg-blue-600');
};

window.openAdmin = async () => {
    const { value: pass } = await Swal.fire({
        title: 'PASS ADMIN', background: '#080b12', color: '#fff',
        input: 'password', confirmButtonColor: '#2563eb'
    });
    if (pass === 'zmt') {
        document.getElementById('modal_admin').classList.remove('hidden');
        window.toggleSidebar();
    } else if (pass) { Swal.fire('Salah!', '', 'error'); }
};
window.closeAdmin = () => document.getElementById('modal_admin').classList.add('hidden');

window.saveP = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const dIn = document.querySelectorAll('.d-in');
    const pIn = document.querySelectorAll('.p-in');
    let prices = [];
    dIn.forEach((d, i) => { if(d.value) prices.push(`${d.value} | ${pIn[i].value}`); });
    if(name && prices.length > 0) {
        push(ref(db, 'products'), { name, tag, prices: prices.join(',') });
        Swal.fire('Berhasil!', '', 'success');
        document.getElementById('p_name').value = '';
        dIn.forEach(i => i.value = ''); pIn.forEach(i => i.value = '');
    }
};

window.saveE = () => {
    const t = document.getElementById('e_title').value;
    const l = document.getElementById('e_link').value;
    if(t && l) {
        push(ref(db, 'events'), { title: t, link: l });
        Swal.fire('Event Ditambah!', '', 'success');
        document.getElementById('e_title').value = '';
        document.getElementById('e_link').value = '';
    }
};

window.hapusItem = (path) => {
    Swal.fire({
        title: 'Hapus?', icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus'
    }).then(r => { if(r.isConfirmed) remove(ref(db, path)); });
};

onValue(ref(db, '/'), (snap) => {
    const data = snap.val(); if(!data) return;
    const home = document.getElementById('page_home');
    home.innerHTML = '';
    for(let id in data.products){
        const p = data.products[id];
        const list = p.prices.split(',').map(l => `
            <div class="price-box">
                <span class="text-[11px] font-black text-blue-500 uppercase tracking-widest">${l}</span>
                <div class="flex flex-col gap-2">
                    <button onclick="buy('${p.name}','${l}',1)" class="btn-buy btn-wa1"><i class="fab fa-whatsapp"></i> BUY VIA WA 1</button>
                    <button onclick="buy('${p.name}','${l}',2)" class="btn-buy btn-wa2"><i class="fab fa-whatsapp"></i> BUY VIA WA 2</button>
                </div>
            </div>`).join('');
        home.innerHTML += `
            <div class="card-z">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <span class="text-[8px] font-black text-blue-600 tracking-widest uppercase">${p.tag}</span>
                        <h3 class="text-xl font-black italic uppercase">${p.name}</h3>
                    </div>
                    <button onclick="hapusItem('products/${id}')" class="text-red-500/20 hover:text-red-500"><i class="fas fa-trash-alt"></i></button>
                </div>
                ${list}
            </div>`;
    }

    const ev = document.getElementById('page_event');
    ev.innerHTML = '<h2 class="text-xl font-black text-center text-blue-500 mb-8 uppercase italic">Event & Downloads</h2>';
    for(let id in data.events){
        const e = data.events[id];
        ev.innerHTML += `
            <div class="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/5 mb-4">
                <span class="font-bold text-sm uppercase italic">${e.title}</span>
                <div class="flex gap-4 items-center">
                    <a href="${e.link}" target="_blank" class="text-blue-500 text-2xl active:scale-90 transition"><i class="fas fa-circle-down"></i></a>
                    <button onclick="hapusItem('events/${id}')" class="text-red-500/20 hover:text-red-500"><i class="fas fa-trash-can"></i></button>
                </div>
            </div>`;
    }
});

window.buy = (n, p, w) => {
    const num = w === 1 ? '6289653938936' : '6285721057014';
    window.open(`https://wa.me/${num}?text=Order%20%3A%20${n}%0APaket%20%3A%20${p}`, '_blank');
};