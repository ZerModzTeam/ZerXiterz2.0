import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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

// --- NAVIGATION ---
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('show');
window.switchPage = (p) => {
    document.getElementById('page_home').classList.toggle('hidden', p !== 'home');
    document.getElementById('page_event').classList.toggle('hidden', p !== 'event');
    window.toggleSidebar();
};

// --- ADMIN LOGIN ---
window.openAdmin = async () => {
    const { value: login } = await Swal.fire({
        title: 'ADMIN LOGIN', background: '#121826', color: '#fff',
        html: `<input id="u" class="swal2-input" placeholder="User"><input id="p" type="password" class="swal2-input" placeholder="Pass">`,
        preConfirm: () => [document.getElementById('u').value, document.getElementById('p').value]
    });
    if (login) {
        onValue(ref(db, 'admin'), (s) => {
            const a = s.val();
            if (a && login[0] === a.user && login[1] === a.pass) {
                document.getElementById('modal_admin').classList.remove('hidden');
            } else { Swal.fire('Error', 'Sandi Salah!', 'error'); }
        }, { onlyOnce: true });
    }
};
window.closeAdmin = () => document.getElementById('modal_admin').classList.add('hidden');

// --- SIMPAN PRODUK (MAKS 5 BARIS) ---
window.saveProduct = () => {
    const name = document.getElementById('p_name').value;
    const tag = document.getElementById('p_tag').value;
    const dInputs = document.querySelectorAll('.d-in');
    const pInputs = document.querySelectorAll('.p-in');
    
    let pricesArr = [];
    dInputs.forEach((d, i) => {
        if(d.value && pInputs[i].value) {
            pricesArr.push(`${d.value} | ${pInputs[i].value}`);
        }
    });

    if(name && pricesArr.length > 0) {
        push(ref(db, 'products'), { name, tag, prices: pricesArr.join(',') });
        Swal.fire('Berhasil', 'Produk masuk toko!', 'success');
        window.closeAdmin();
    }
};

// --- RENDER DATA REALTIME ---
onValue(ref(db, '/'), (snap) => {
    const data = snap.val(); if (!data) return;
    
    // Render Halaman Utama
    const home = document.getElementById('page_home');
    home.innerHTML = '';
    for (let id in data.products) {
        const p = data.products[id];
        const list = p.prices.split(',').map(l => `
            <div class="flex justify-between items-center bg-black/20 p-3 rounded-2xl mb-2 border border-white/5">
                <span class="text-[11px] font-bold text-gray-300">${l}</span>
                <div class="flex gap-2">
                    <button onclick="buy('${p.name}','${l}',1)" class="buy-btn bg-blue-600">WA 1</button>
                    <button onclick="buy('${p.name}','${l}',2)" class="buy-btn bg-green-600">WA 2</button>
                </div>
            </div>`).join('');

        home.innerHTML += `
            <div class="product-card">
                <span class="absolute top-4 right-4 bg-blue-600 text-[8px] px-2 py-0.5 rounded-full font-black uppercase">${p.tag}</span>
                <h3 class="text-xl font-black text-blue-500 mb-4 uppercase italic">${p.name}</h3>
                <div>${list}</div>
                <button onclick="delP('${id}')" class="mt-4 text-[9px] text-red-500 opacity-20 hover:opacity-100">Hapus</button>
            </div>`;
    }
    document.getElementById('cs_link').href = data.settings.cs;
});

window.delP = (id) => remove(ref(db, `products/${id}`));
window.buy = (n, p, w) => {
    const num = w === 1 ? '6289653938936' : '6285721057014';
    window.open(`https://wa.me/${num}?text=Order%20${n}%20 Paket%20${p}`, '_blank');
};