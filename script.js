// --- KONFIGURASI SISTEM ---
// PERHATIAN: Masukkan URL Google Script (Web App) anda yang terkini di bawah
const scriptURL = "https://script.google.com/macros/s/AKfycbzEUBhdwQY4L7eRklbohtek8V_fx8xY4_YbeTeJe38AnlbuLRV0ozxp0Q8vB94T_D2Q/exec"; 
const noTelefonBendahari = "60133787248"; 

// Konfigurasi SweetAlert2 Tema Gelap/Futuristik
const cyberSwal = Swal.mixin({
    background: '#0a1914',
    color: '#00ff88',
    customClass: {
        popup: 'cyber-popup',
        confirmButton: 'cyber-confirm',
        cancelButton: 'cyber-cancel'
    }
});

document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.getElementById('qurbanForm');
    const submitBtn = document.getElementById('submitBtn');
    
    // 1. Logik UI untuk Maklumat Bank & Nama Wakil
    const kaedahBayar = document.getElementById('kaedah_bayar');
    const bankInfo = document.getElementById('bank_info');
    
    kaedahBayar.addEventListener('change', function() {
        bankInfo.style.display = (this.value === 'Online Transfer') ? 'block' : 'none';
    });

    const radiosKehadiran = document.querySelectorAll('input[name="kehadiran"]');
    const boxWakil = document.getElementById('box_wakil');
    const inputWakil = document.getElementById('nama_wakil');
    
    radiosKehadiran.forEach(radio => {
        radio.addEventListener('change', function() {
            if(this.value === 'Wakil') {
                boxWakil.style.display = 'block';
                inputWakil.setAttribute('required', 'required');
            } else {
                boxWakil.style.display = 'none';
                inputWakil.removeAttribute('required');
                inputWakil.value = '';
            }
        });
    });

    // 2. FUNGSI AUTO-FORMAT (MESRA PENGGUNA)
    const icInput = document.getElementById('ic');
    icInput.addEventListener('input', function(e) {
        let val = this.value.replace(/\D/g, ''); 
        if (val.length > 12) val = val.substring(0, 12); 
        if (val.length > 8) {
            this.value = val.substring(0,6) + '-' + val.substring(6,8) + '-' + val.substring(8);
        } else if (val.length > 6) {
            this.value = val.substring(0,6) + '-' + val.substring(6);
        } else {
            this.value = val;
        }
    });

    const telInput = document.getElementById('telefon');
    telInput.addEventListener('input', function(e) {
        let val = this.value.replace(/\D/g, '');
        if (val.length > 11) val = val.substring(0, 11);
        if (val.length > 3) {
            this.value = val.substring(0,3) + '-' + val.substring(3);
        } else {
            this.value = val;
        }
    });

    // 3. FUNGSI KIRAAN AUTOMATIK
    function kiraJumlah() {
        const inputs = document.querySelectorAll('.peserta-input');
        const kotakBayar = document.getElementById('jumlah_bayar');
        const hargaSatuBahagian = 900;
        let bilanganPeserta = 0;
        
        inputs.forEach(function(input) {
            if(input.value && input.value.trim() !== '') {
                bilanganPeserta++;
            }
        });
        
        if(bilanganPeserta > 0) {
            kotakBayar.value = bilanganPeserta * hargaSatuBahagian;
        } else {
            kotakBayar.value = '';
        }
    }

    const semuaInputPeserta = document.querySelectorAll('.peserta-input');
    semuaInputPeserta.forEach(function(input) {
        input.addEventListener('input', kiraJumlah);
        input.addEventListener('keyup', kiraJumlah);
        input.addEventListener('change', kiraJumlah);
    });

    kiraJumlah(); 

    // 4. FUNGSI LIVE COUNTER (TARIK DATA DARI GOOGLE SHEETS)
    const counterElement = document.getElementById('liveCounterText');
    
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end.toLocaleString('en-US'); 
            }
        };
        window.requestAnimationFrame(step);
    }

    fetch(scriptURL)
        .then(response => response.json())
        .then(data => {
            const jumlahTerkini = data.jumlah || 0;
            animateValue(counterElement, 0, jumlahTerkini, 2000);
        })
        .catch(error => {
            console.error('Ralat Live Counter:', error);
            counterElement.innerHTML = "-";
        });

    // 5. FUNGSI HANTAR DATA & PAYMENT ROUTING
    submitBtn.addEventListener('click', e => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            cyberSwal.fire({
                icon: 'warning',
                title: 'SISTEM AMARAN',
                text: 'SILA LENGKAPKAN SEMUA MEDAN DATA YANG DIPERLUKAN.',
                iconColor: '#ffcc00'
            });
            return;
        }

        cyberSwal.fire({
            title: 'TRANSMISI DATA',
            text: 'MENGHANTAR MAKLUMAT KE PANGKALAN DATA MKSLB...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let requestBody = new FormData(form);
        const modBayaran = document.getElementById('kaedah_bayar').value;
        const namaPengguna = document.getElementById('nama').value;
        const jumlahRinggit = document.getElementById('jumlah_bayar').value;

        fetch(scriptURL, { method: 'POST', body: requestBody })
            .then(response => {
                
                // ROUTING 1: ONLINE TRANSFER (Hantar WA)
                if (modBayaran === 'Online Transfer') {
                    cyberSwal.fire({
                        icon: 'success',
                        title: 'TRANSMISI BERJAYA',
                        text: 'DATA DIREKODKAN. SILA KLIK BUTANG DI BAWAH UNTUK MENGHANTAR RESIT WHATSAPP.',
                        iconColor: '#00ff88',
                        showCancelButton: true,
                        confirmButtonText: 'HANTAR RESIT',
                        cancelButtonText: 'TUTUP'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const teksWA = `Assalamualaikum Tuan Bendahari MKSLB. Saya *${namaPengguna}* telah mendaftar Qurban 2026. Jumlah bayaran adalah *RM${jumlahRinggit}*. Bersama ini saya sertakan bukti resit pembayaran pemindahan dalam talian saya. Terima kasih.`;
                            const pautanWA = `https://wa.me/${noTelefonBendahari}?text=${encodeURIComponent(teksWA)}`;
                            window.open(pautanWA, '_blank');
                        }
                        resetBorang();
                    });
                } 
                // ROUTING 2: TOYYIBPAY (Redirect Gateway)
                else if (modBayaran === 'ToyyibPay') {
                    cyberSwal.fire({
                        icon: 'success',
                        title: 'TRANSMISI BERJAYA',
                        text: 'DATA TELAH DIREKOD. SISTEM AKAN MEMBAWA ANDA KE TOYYIBPAY SEBENTAR LAGI...',
                        iconColor: '#00ff88',
                        showConfirmButton: false,
                        timer: 3500 
                    }).then(() => {
                        resetBorang();
                        window.location.href = "https://toyyibpay.com/Bayaran-Qurban-2026";
                    });
                } 
                // ROUTING 3: TUNAI (Biasa)
                else {
                    cyberSwal.fire({
                        icon: 'success',
                        title: 'TRANSMISI BERJAYA',
                        text: 'ALHAMDULILLAH, MAKLUMAT PENDAFTARAN QURBAN TELAH DITERIMA DAN DIREKODKAN KE DALAM SISTEM MKSLB.',
                        iconColor: '#00ff88',
                        confirmButtonText: 'SELESAI'
                    }).then(() => {
                        resetBorang();
                    });
                }
            })
            .catch(error => {
                cyberSwal.fire({
                    icon: 'error',
                    title: 'RALAT SISTEM',
                    text: 'TRANSMISI GAGAL. SILA SEMAK RANGKAIAN DAN CUBA LAGI.',
                    iconColor: '#ff3366'
                });
                console.error('Error!', error.message);
            });
            
            function resetBorang() {
                form.reset();
                document.getElementById('jumlah_bayar').value = '';
                bankInfo.style.display = 'none';
                boxWakil.style.display = 'none';
            }
    });
});