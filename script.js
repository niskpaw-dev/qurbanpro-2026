// =====================================================================
// SISTEM QURBANPRO 2026 - JAVASCRIPT MASTER FILE
// DIBANGUNKAN OLEH: NISKALA PAWAKA
// =====================================================================

// --- 1. LOGIK JAM UNDUR (TARIKH TUTUP: 24 MEI 2026) ---
const tarikhTutup = new Date("May 24, 2026 23:59:59").getTime();

const timerInterval = setInterval(function() {
    const sekarang = new Date().getTime();
    const jarak = tarikhTutup - sekarang;

    // Pengiraan masa
    const hari = Math.floor(jarak / (1000 * 60 * 60 * 24));
    const jam = Math.floor((jarak % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minit = Math.floor((jarak % (1000 * 60 * 60)) / (1000 * 60));
    const saat = Math.floor((jarak % (1000 * 60)) / 1000);

    const timerElemen = document.getElementById("countdownTimer");
    const btnSubmit = document.getElementById("submitBtn");

    if (jarak < 0) {
        clearInterval(timerInterval);
        timerElemen.innerHTML = "PENDAFTARAN TELAH DITUTUP";
        
        // Ubah rupa butang dan nyahaktifkan (Disable) jika dah tamat
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


// --- 2. LOGIK PENGIRAAN AUTOMATIK (RM900 / BAHAGIAN) ---
const pesertaInputs = document.querySelectorAll('.peserta-input');
const jumlahBayarInput = document.getElementById('jumlah_bayar');

// Dengar setiap kali pengguna menaip dalam kotak peserta
pesertaInputs.forEach(input => {
    input.addEventListener('input', kiraJumlah);
});

function kiraJumlah() {
    let jumlahPeserta = 0;
    pesertaInputs.forEach(input => {
        if (input.value.trim() !== "") {
            jumlahPeserta++;
        }
    });
    // Darab jumlah orang dengan RM 900
    const total = jumlahPeserta * 900;
    if(jumlahBayarInput) {
        jumlahBayarInput.value = total;
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
            inputWakil.required = true; // Wajibkan isi jika hantar wakil
        } else {
            boxWakil.style.display = 'none';
            inputWakil.required = false;
            inputWakil.value = ""; // Kosongkan semula
        }
    });
});


// --- 4. LOGIK HANTAR BORANG (DATABASE & PDF) ---
const form = document.getElementById('qurbanForm');

if(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Halang page dari refresh bila tekan Hantar
        
        // Keselamatan: Pastikan jumlah bayaran bukan 0 (mesti ada sekurang-kurangnya 1 peserta)
        if (jumlahBayarInput.value == 0 || jumlahBayarInput.value == "") {
            Swal.fire({
                title: 'Perhatian!',
                text: 'Sila masukkan sekurang-kurangnya NAMA SATU PESERTA qurban di Bahagian B.',
                icon: 'warning',
                customClass: { popup: 'cyber-popup', confirmButton: 'swal2-confirm cyber-confirm' }
            });
            return; // Hentikan fungsi jika kosong
        }

        // 1. Tunjukkan paparan "Loading" sebelum fetch berjalan
        Swal.fire({
            title: 'Sistem Sedang Memproses...',
            text: 'Menjana dokumen pendaftaran rasmi. Sila tunggu sebentar...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            customClass: { popup: 'cyber-popup' }
        });

        // 2. Kumpul data dari form
        const kaedah_bayar = document.getElementById('kaedah_bayar').value;
        const nama = document.getElementById('nama').value;
        
        // Tangkap Senarai Peserta Qurban
        let namaPeserta = [];
        pesertaInputs.forEach(input => {
            if (input.value.trim() !== "") {
                namaPeserta.push(input.value.trim());
            }
        });
        let senaraiPesertaQurban = namaPeserta.join(", "); // Contoh output: Ali, Abu, Ahmad

        // Tangkap Status Kehadiran & Nama Wakil
        let kehadiranElemen = document.querySelector('input[name="kehadiran"]:checked');
        let kehadiran = kehadiranElemen ? kehadiranElemen.value : "";
        let namaWakil = kehadiran === "Wakil" ? document.getElementById('nama_wakil').value : "Tiada";
        
        // Himpunkan semua data dalam satu objek
        const dataForm = {
            nama: nama,
            ic: document.getElementById('ic').value,
            telefon: document.getElementById('telefon').value,
            alamat: document.getElementById('alamat').value,
            peserta_qurban: senaraiPesertaQurban, // Data Baharu
            agihan: document.querySelector('input[name="agihan"]:checked').value,
            kaedah_bayar: kaedah_bayar,
            jumlah: jumlahBayarInput.value,
            kehadiran: kehadiran,                 // Data Baharu
            nama_wakil: namaWakil                 // Data Baharu
        };

        // 3. Hantar Data ke Apps Script
        const scriptURL = 'https://script.google.com/macros/s/AKfycbzEUBhdwQY4L7eRklbohtek8V_fx8xY4_YbeTeJe38AnlbuLRV0ozxp0Q8vB94T_D2Q/exec'; 

        fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(dataForm) 
        })
        .then(response => response.json())
        .then(result => {
            if (result.result === "success") {
                let pdfLink = result.pdfUrl;
                let docType = result.jenisDokumen; // "Invois" atau "Resit"

                Swal.fire({
                    title: 'Alhamdulillah!',
                    text: 'Pendaftaran Qurban anda berjaya direkodkan.',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: `📥 Muat Turun ${docType}`,
                    cancelButtonText: 'Tutup & Teruskan',
                    customClass: {
                        popup: 'cyber-popup',
                        confirmButton: 'swal2-confirm cyber-confirm',
                        cancelButton: 'swal2-cancel cyber-cancel'
                    }
                }).then((action) => {
                    // Jika pengguna klik butang Muat Turun
                    if (action.isConfirmed) {
                        window.open(pdfLink, '_blank');
                    }
                    
                    // Logik WhatsApp (Jika Online Transfer, lampirkan link PDF)
                    if (kaedah_bayar === "Online Transfer") {
                        let nomborBendahari = "60133787248"; // Nombor Bendahari Tuan
                        let ayatWhatsApp = `Assalamualaikum Bendahari. Saya ${nama} telah mendaftar Qurban 2026. Bersama ini saya lampirkan resit rasmi untuk rujukan pihak masjid: ${pdfLink}`;
                        let urlWhatsApp = `https://wa.me/${nomborBendahari}?text=${encodeURIComponent(ayatWhatsApp)}`;
                        
                        window.open(urlWhatsApp, '_blank');
                    }
                });

                // Kosongkan semula borang dan reset antaramuka
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