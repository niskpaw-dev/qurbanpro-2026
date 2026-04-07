// =====================================================================
// SISTEM QURBANPRO 2026 - JAVASCRIPT MASTER FILE
// DIBANGUNKAN OLEH: NISKALA PAWAKA
// =====================================================================

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. LOGIK JAM UNDUR ---
    const tarikhTutup = new Date("May 24, 2026 23:59:59").getTime();
    const timerInterval = setInterval(function() {
        const sekarang = new Date().getTime();
        const jarak = tarikhTutup - sekarang;

        const hari = Math.floor(jarak / (1000 * 60 * 60 * 24));
        const jam = Math.floor((jarak % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minit = Math.floor((jarak % (1000 * 60 * 60)) / (1000 * 60));
        const saat = Math.floor((jarak % (1000 * 60)) / 1000);

        const timerElemen = document.getElementById("countdownTimer");
        if (jarak < 0) {
            clearInterval(timerInterval);
            if(timerElemen) timerElemen.innerHTML = "PENDAFTARAN TELAH DITUTUP";
            document.getElementById("submitBtn").disabled = true;
        } else {
            if(timerElemen) timerElemen.innerHTML = `${hari} Hari, ${jam} Jam, ${minit} Minit, ${saat} Saat`;
        }
    }, 1000);

    // --- 2. LOGIK PENGIRAAN & STATISTIK LIVE ---
    const pesertaInputs = document.querySelectorAll('.peserta-input');
    const jumlahBayarInput = document.getElementById('jumlah_bayar');
    const liveCounterText = document.getElementById('liveCounterText');
    const bakiSlotText = document.getElementById('bakiSlotText');
    const PESERTA_SEDIA_ADA = 142;

    function kemaskiniSistem() {
        let jumlahPesertaBaru = 0;
        pesertaInputs.forEach(input => {
            if (input.value.trim() !== "") jumlahPesertaBaru++;
        });

        const total = jumlahPesertaBaru * 900;
        if(jumlahBayarInput) jumlahBayarInput.value = total;

        if(liveCounterText) liveCounterText.innerText = PESERTA_SEDIA_ADA + jumlahPesertaBaru;
        if(bakiSlotText) {
            let baki = 7 - (jumlahPesertaBaru % 7);
            if(jumlahPesertaBaru > 0 && jumlahPesertaBaru % 7 === 0) baki = 0;
            bakiSlotText.innerText = baki;
        }
    }

    pesertaInputs.forEach(input => {
        input.addEventListener('input', kemaskiniSistem);
    });

    // --- 3. PAPARAN DINAMIK ---
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
    radioKehadiran.forEach(radio => {
        radio.addEventListener('change', function() {
            boxWakil.style.display = (this.value === 'Wakil') ? 'block' : 'none';
            document.getElementById('nama_wakil').required = (this.value === 'Wakil');
        });
    });

    // --- 4. LOGIK HANTAR BORANG (MATCHING GAS CODE) ---
    const form = document.getElementById('qurbanForm');
    const scriptURL = "https://script.google.com/macros/s/AKfycbxvrjqzs3k_DoeI2hFNqUI6SUDlFYqGKH8obWW0WJ2eHSp2_LG9E8IWYFyI9jYNC7y5/exec"; 

    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (jumlahBayarInput.value == 0) {
                Swal.fire({
                    title: 'Perhatian!',
                    text: 'Sila masukkan sekurang-kurangnya SATU NAMA PESERTA.',
                    icon: 'warning',
                    background: '#050b0a', color: '#e2f1ec', confirmButtonColor: '#00ff88',
                    customClass: { popup: 'cyber-popup' }
                });
                return;
            }

            Swal.fire({
                title: 'Sistem Memproses...',
                text: 'Menjana dokumen rasmi. Sila tunggu sebentar.',
                allowOutsideClick: false,
                background: '#050b0a', color: '#e2f1ec',
                didOpen: () => { Swal.showLoading(); },
                customClass: { popup: 'cyber-popup' }
            });

            // GATHER DATA - PADAN DENGAN "var data = JSON.parse(e.postData.contents)" DI GAS
            const dataForm = {
                nama: document.getElementById('nama').value,
                ic: document.getElementById('ic').value,
                telefon: document.getElementById('telefon').value,
                alamat: document.getElementById('alamat').value,
                
                // 7 Peserta Berasingan
                peserta_1: document.querySelector('input[name="peserta_1"]').value,
                peserta_2: document.querySelector('input[name="peserta_2"]').value,
                peserta_3: document.querySelector('input[name="peserta_3"]').value,
                peserta_4: document.querySelector('input[name="peserta_4"]').value,
                peserta_5: document.querySelector('input[name="peserta_5"]').value,
                peserta_6: document.querySelector('input[name="peserta_6"]').value,
                peserta_7: document.querySelector('input[name="peserta_7"]').value,

                agihan: document.querySelector('input[name="agihan"]:checked').value,
                kaedah_bayar: modBayaran.value,
                jumlah: jumlahBayarInput.value,
                kehadiran: document.querySelector('input[name="kehadiran"]:checked').value,
                nama_wakil: document.getElementById('nama_wakil').value
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
                        text: 'Pendaftaran Qurban berjaya direkodkan.',
                        icon: 'success',
                        background: '#050b0a', color: '#00ff88',
                        showCancelButton: true,
                        confirmButtonText: `📥 Muat Turun ${result.jenisDokumen}`,
                        cancelButtonText: 'Tutup',
                        customClass: {
                            popup: 'cyber-popup',
                            confirmButton: 'swal2-confirm cyber-confirm',
                            cancelButton: 'swal2-cancel cyber-cancel'
                        },
                        buttonsStyling: false
                    }).then((action) => {
                        if (action.isConfirmed) window.open(result.pdfUrl, '_blank');
                        
                        // WhatsApp Logic
                        if (dataForm.kaedah_bayar !== "Tunai") {
                            let nomborBendahari = "60133787248";
                            let mesej = `Assalamualaikum Bendahari. Saya ${dataForm.nama} telah mendaftar Qurban 2026 berjumlah RM${dataForm.jumlah}. Link Resit: ${result.pdfUrl}`;
                            window.open(`https://wa.me/${nomborBendahari}?text=${encodeURIComponent(mesej)}`, '_blank');
                        }
                    });

                    form.reset(); 
                    kemaskiniSistem();
                    bankInfo.style.display = 'none'; 
                    boxWakil.style.display = 'none'; 
                } else {
                    throw new Error(result.message);
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Ralat!',
                    text: 'Gagal menghubungi server: ' + error.message,
                    background: '#050b0a', color: '#ff4444',
                    customClass: { popup: 'cyber-popup' }
                });
            });
        });
    }
});