// Gantian kod pada fail script.js anda

// ... (Bahagian 1: Timer kekal sama) ...

// --- 2. LOGIK PENGIRAAN AUTOMATIK & STATISTIK LIVE ---
const pesertaInputs = document.querySelectorAll('.peserta-input');
const jumlahBayarInput = document.getElementById('jumlah_bayar');
const liveCounterText = document.getElementById('liveCounterText');
const bakiSlotText = document.getElementById('bakiSlotText');
const PESERTA_SEDIA_ADA = 142; // Anda boleh ubah angka asas ini

pesertaInputs.forEach(input => {
    input.addEventListener('input', kiraJumlah);
});

function kiraJumlah() {
    let jumlahPesertaBaru = 0;
    pesertaInputs.forEach(input => {
        if (input.value.trim() !== "") {
            jumlahPesertaBaru++;
        }
    });

    // Kemaskini RM
    const total = jumlahPesertaBaru * 900;
    if(jumlahBayarInput) jumlahBayarInput.value = total;

    // KEMASKINI STATISTIK CYBER (Tambahan supaya counter bergerak)
    if(liveCounterText) liveCounterText.innerText = PESERTA_SEDIA_ADA + jumlahPesertaBaru;
    if(bakiSlotText) {
        let baki = 7 - (jumlahPesertaBaru % 7);
        if(jumlahPesertaBaru > 0 && jumlahPesertaBaru % 7 === 0) baki = 0;
        bakiSlotText.innerText = baki;
    }
}

// --- 3. PAPARAN DINAMIK (MAKLUMAT BANK & WAKIL) ---
const modBayaran = document.getElementById('kaedah_bayar');
const bankInfo = document.getElementById('bank_info');

if(modBayaran) {
    modBayaran.addEventListener('change', function() {
        // Ditambah 'ToyyibPay' sekali supaya info bank muncul jika perlu
        if (this.value === 'Online Transfer' || this.value === 'ToyyibPay') {
            bankInfo.style.display = 'block';
        } else {
            bankInfo.style.display = 'none';
        }
    });
}

// ... (Logik radioKehadiran kekal sama) ...

// --- 4. LOGIK HANTAR BORANG ---
// Pastikan baris scriptURL ini diletakkan pembetulan tanda petikan:
const scriptURL = "https://script.google.com/macros/s/AKfycbxIVvtjNDkmbVUvgxtr3v6IC72Gi_kc_qtSxzZ4gNEadduip2t2pP6wtSBKIiJy-nC3/exec"; 

// ... (Selebihnya kod fetch anda sudah betul) ...