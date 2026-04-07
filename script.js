// =====================================================================
// SISTEM QURBANPRO 2026 - JAVASCRIPT MASTER FILE (LIVE & AUTOCRAT)
// DIBANGUNKAN OLEH: NISKALA PAWAKA
// =====================================================================

// ⚠️ LETAKKAN URL WEB APP GOOGLE APPS SCRIPT YANG TERBARU DI SINI ⚠️
const scriptURL = "https://script.google.com/macros/s/AKfycbzv1nKzCUlly-jA4AHO317rB9TuFJ9v5mRYsmkqB_Y_f6kJqJRg1kMghTK6escjTFYc/exec";

// --- 1. LOGIK JAM UNDUR (TARIKH TUTUP: 24 MEI 2026) ---
const tarikhTutup = new Date("May 24, 2026 23:59:59").getTime();

const timerInterval = setInterval(function() {
    const sekarang = new Date().getTime();
    const jarak = tarikhTutup - sekarang;

    const hari = Math.floor(jarak / (1000 * 60 * 60 * 24));
    const jam = Math.floor((jarak % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minit = Math.floor((jarak % (1000 * 60 * 60)) / (1000 * 60));
    const saat = Math.floor((jarak % (1000 * 60)) / 1000);

    const timerElemen = document.getElementById("countdownTimer");
    const btnSubmit = document.getElementById("submitBtn");

    if (jarak < 0) {
        clearInterval(timerInterval);
        if(timerElemen) timerElemen.innerHTML = "PENDAFTARAN TELAH DITUTUP";
        
        if(btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerText = "SISTEM DITUTUP";
            btnSubmit.style.background = "rgba(255, 68, 68, 0.1)";
            btnSubmit.style.color = "#ff4444";
            btnSubmit.style.borderColor = "#ff4444";
            btnSubmit.style.cursor = "not-allowed";
            btnSubmit.style.boxShadow = "none";
        }
    } else {
        if(timerElemen) {
            timerElemen.innerHTML = `${hari} Hari, ${jam} Jam, ${minit} Minit, ${saat} Saat`;
        }
    }
}, 1000);


// --- 2. LOGIK PENGIRAAN AUTOMATIK & STATISTIK LIVE ---
const pesertaInputs = document.querySelectorAll('.peserta-input');
const jumlahBayarInput = document.getElementById('jumlah_bayar');
const liveCounterText = document.getElementById('liveCounterText');
const bakiSlotText = document.getElementById('bakiSlotText');

let PESERTA_TERKUMPUL_LIVE = 0;

// Fungsi untuk panggil data Live dari Google Sheets
async function dapatkanStatistikLive() {
    try {
        const response = await fetch(scriptURL);
        const data = await response.json();
        PESERTA_TERKUMPUL_LIVE = data.count || 0; // Guna 0 jika tiada data
        
        if(liveCounterText) liveCounterText.innerText = PESERTA_TERKUMPUL_LIVE;
        kiraJumlah(); // Kemaskini matematik bila data masuk
    } catch (error) {
        console.error("Gagal ambil data live:", error);
        if(liveCounterText) liveCounterText.innerText = "0";
    }
}

// Jalankan ketika website dimuatkan
window.onload = function() {
    dapatkanStatistikLive();
};

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

    const total = jumlahPesertaBaru * 900;
    if(jumlahBayarInput) jumlahBayarInput.value = total;

    // Gabung data LIVE dan nama yang sedang ditaip
    const jumlahKini = PESERTA_TERKUMPUL_LIVE + jumlahPesertaBaru;
    if(liveCounterText) liveCounterText.innerText = jumlahKini;
    
    if(bakiSlotText) {
        let baki = 7 - (jumlahKini % 7);
        if (jumlahKini > 0 && jumlahKini % 7 === 0) baki = 0; 
        bakiSlotText.innerText = baki;
    }
}


// --- 3. PAPARAN DINAMIK (MAKLUMAT BANK & WAKIL) ---
const modBayaran = document.getElementById('kaedah_bayar');
const bankInfo = document.getElementById('bank_info');

if(modBayaran) {
    modBayaran.addEventListener('change', function() {
        if (this.value === 'Online Transfer' || this.value === 'ToyyibPay') {
            bankInfo.style.display = 'block';
        } else {
            bankInfo.style.display = 'none';
        }
    });
}

const radioKehadiran = document.querySelectorAll('input[name="kehadiran"]');
const boxWakil = document.getElementById('box_wakil');
const inputWakil = document.getElementById('nama_wakil');

radioKehadiran.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'Wakil') {
            boxWakil.style.display = 'block';
            inputWakil.required = true;
        } else {
            boxWakil.style.display = 'none';
            inputWakil.required = false;
            inputWakil.value = ""; 
        }
    });
});


// --- 4. LOGIK HANTAR BORANG ---
const form = document.getElementById('qurbanForm');

if(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        // Elak hantar borang kosong
        if (jumlahBayarInput.value == 0 || jumlahBayarInput.value == "") {
            Swal.fire({
                title: 'Perhatian!',
                text: 'Sila masukkan sekurang-kurangnya NAMA SATU PESERTA qurban di Bahagian B.',
                icon: 'warning',
                customClass: { popup: 'cyber-popup', confirmButton: 'swal2-confirm cyber-confirm' }
            });
            return; 
        }

        Swal.fire({
            title: 'Sistem Sedang Memproses...',
            text: 'Menghantar data pendaftaran anda. Sila tunggu sebentar...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            customClass: { popup: 'cyber-popup' }
        });

        const kaedah_bayar = document.getElementById('kaedah_bayar').value;
        const nama = document.getElementById('nama').value;
        
        let kehadiranElemen = document.querySelector('input[name="kehadiran"]:checked');
        let kehadiran = kehadiranElemen ? kehadiranElemen.value : "";
        let namaWakil = kehadiran === "Wakil" ? document.getElementById('nama_wakil').value : "Tiada";
        
        function getSafeValue(selector) {
            let el = document.querySelector(selector);
            return el ? el.value.trim() : "";
        }

        const dataForm = {
            nama: nama,
            ic: document.getElementById('ic').value,
            telefon: document.getElementById('telefon').value,
            alamat: document.getElementById('alamat').value,
            
            peserta_1: getSafeValue('input[name="peserta_1"]'),
            peserta_2: getSafeValue('input[name="peserta_2"]'),
            peserta_3: getSafeValue('input[name="peserta_3"]'),
            peserta_4: getSafeValue('input[name="peserta_4"]'),
            peserta_5: getSafeValue('input[name="peserta_5"]'),
            peserta_6: getSafeValue('input[name="peserta_6"]'),
            peserta_7: getSafeValue('input[name="peserta_7"]'),

            agihan: document.querySelector('input[name="agihan"]:checked').value,
            kaedah_bayar: kaedah_bayar,
            jumlah: jumlahBayarInput.value,
            kehadiran: kehadiran,                 
            nama_wakil: namaWakil                 
        };

        fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(dataForm) 
        })
        .then(response => response.json())
        .then(result => {
            if (result.result === "success") {
                Swal.fire({
                    title: 'Alhamdulillah!',
                    text: 'Pendaftaran Qurban anda berjaya direkodkan. Pihak Masjid akan menghubungi anda dan menghantar resit rasmi tidak lama lagi.',
                    icon: 'success',
                    confirmButtonText: 'Tutup & Teruskan',
                    customClass: {
                        popup: 'cyber-popup',
                        confirmButton: 'swal2-confirm cyber-confirm'
                    }
                }).then(() => {
                    // Refresh data Live Counter supaya ia tambah serta merta lepas hantar borang
                    dapatkanStatistikLive();

                    if (kaedah_bayar === "Online Transfer") {
                        let nomborBendahari = "60133787248"; 
                        let ayatWhatsApp = `Assalamualaikum Bendahari. Saya ${nama} telah mendaftar Qurban 2026 dan telah membuat pembayaran Online Transfer. Mohon semakan pihak masjid. Terima kasih.`;
                        let urlWhatsApp = `https://wa.me/${nomborBendahari}?text=${encodeURIComponent(ayatWhatsApp)}`;
                        window.open(urlWhatsApp, '_blank');
                    }
                });

                form.reset(); 
                kiraJumlah(); 
                if(bankInfo) bankInfo.style.display = 'none'; 
                if(boxWakil) boxWakil.style.display = 'none'; 

            } else {
                Swal.fire({
                    title: 'Ralat!', 
                    text: 'Pendaftaran tidak berjaya: ' + result.message, 
                    icon: 'error',
                    customClass: { popup: 'cyber-popup', confirmButton: 'swal2-confirm cyber-confirm' }
                });
            }
        })
        .catch(error => {
            Swal.fire({
                title: 'Ralat Sistem!', 
                text: 'Sila cuba sebentar lagi atau hubungi AJK.', 
                icon: 'error',
                customClass: { popup: 'cyber-popup', confirmButton: 'swal2-confirm cyber-confirm' }
            });
            console.error('Error Fetch:', error.message);
        });
    });
}