// =====================================================================
// SISTEM QURBANPRO 2026 - MASTER JAVASCRIPT FILE
// DIBANGUNKAN OLEH: NISKALA PAWAKA
// Ciri: Live Counter, Frontend PDF Generator (Invois/Resit Auto-Switch)
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
            btnSubmit.style.background = "#95a5a6";
            btnSubmit.style.cursor = "not-allowed";
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

async function dapatkanStatistikLive() {
    try {
        const fetchURL = scriptURL + "?action=getLive";
        const response = await fetch(fetchURL, { 
            method: 'GET',
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        
        const data = await response.json();
        PESERTA_TERKUMPUL_LIVE = data.count || 0; 
        
        if(liveCounterText) liveCounterText.innerText = PESERTA_TERKUMPUL_LIVE;
        kiraJumlah(); 
    } catch (error) {
        console.error("Gagal ambil data live:", error);
        if(liveCounterText) liveCounterText.innerText = "0";
    }
}

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
        if (this.value === 'Online Transfer') {
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


// --- 4. LOGIK HANTAR BORANG & JANA PDF ---
const form = document.getElementById('qurbanForm');

if(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        if (jumlahBayarInput.value == 0 || jumlahBayarInput.value == "") {
            Swal.fire('Perhatian!', 'Sila masukkan sekurang-kurangnya NAMA SATU PESERTA qurban di Bahagian B.', 'warning');
            return; 
        }

        Swal.fire({
            title: 'Sistem Sedang Memproses...',
            text: 'Menghantar data dan menjana dokumen anda. Sila tunggu sebentar...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const kaedah_bayar = document.getElementById('kaedah_bayar').value;
        const nama = document.getElementById('nama').value;
        const emelVal = document.getElementById('emel') ? document.getElementById('emel').value : "";
        
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
            emel: emelVal,
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
                
                // --- JANAAN PDF BERDASARKAN KAEDAH BAYARAN ---
                let tarikhSemasa = new Date().toLocaleString("ms-MY", {timeZone: "Asia/Kuala_Lumpur"});
                let jenisFail = "Resit";
                let tajukDokumen = "RESIT PENDAFTARAN QURBAN 2026";

                if (kaedah_bayar === "Tunai") {
                    jenisFail = "Invois";
                    tajukDokumen = "INVOIS PENDAFTARAN QURBAN 2026";
                }

                // Masukkan data ke dalam templat HTML
                document.getElementById('tajuk_dokumen').innerText = tajukDokumen; 
                document.getElementById('r_nama').innerText = nama;
                document.getElementById('r_ic').innerText = document.getElementById('ic').value;
                document.getElementById('r_tarikh').innerText = tarikhSemasa;
                document.getElementById('r_kaedah').innerText = kaedah_bayar;
                document.getElementById('r_jumlah').innerText = jumlahBayarInput.value;

                const resitElemen = document.getElementById('resitKandungan');
                const opsyenPDF = {
                    margin:       0.5,
                    filename:     jenisFail + '_Qurban_' + nama.replace(/ /g, "_") + '.pdf',
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2 },
                    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
                };

                html2pdf().set(opsyenPDF).from(resitElemen).save().then(() => {
                    
                    Swal.fire({
                        title: 'Alhamdulillah!',
                        text: `${jenisFail} rasmi telah dimuat turun ke dalam peranti anda.`,
                        icon: 'success',
                        confirmButtonText: 'Tutup & Teruskan'
                    }).then(() => {
                        dapatkanStatistikLive(); // Kemaskini Kaunter

                        // Logik WhatsApp Bendahari
                        let nomborBendahari = "60133787248"; 
                        let ayatWhatsApp = `Assalamualaikum Bendahari. Saya ${nama} telah mendaftar Qurban 2026 secara web dan telah memuat turun ${jenisFail} saya. Mohon pengesahan. Terima kasih.`;
                        let urlWhatsApp = `https://wa.me/${nomborBendahari}?text=${encodeURIComponent(ayatWhatsApp)}`;
                        window.open(urlWhatsApp, '_blank');
                    });

                    form.reset(); 
                    kiraJumlah(); 
                    if(bankInfo) bankInfo.style.display = 'none'; 
                    if(boxWakil) boxWakil.style.display = 'none'; 
                });

            } else {
                Swal.fire('Ralat!', 'Pendaftaran tidak berjaya: ' + result.message, 'error');
            }
        })
        .catch(error => {
            Swal.fire('Ralat Sistem!', 'Sila cuba sebentar lagi atau hubungi AJK.', 'error');
            console.error('Error Fetch:', error.message);
        });
    });
}
