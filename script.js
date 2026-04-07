// =====================================================================
// SISTEM QURBANPRO 2026 - MASTER JAVASCRIPT
// =====================================================================

// ⚠️ GANTI DENGAN URL WEB APP GAS ANDA YANG TERBARU ⚠️
const scriptURL = "https://script.google.com/macros/s/AKfycbzv1nKzCUlly-jA4AHO317rB9TuFJ9v5mRYsmkqB_Y_f6kJqJRg1kMghTK6escjTFYc/exec";

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. COUNTDOWN TIMER ---
    const tarikhTutup = new Date("May 24, 2026 23:59:59").getTime();
    setInterval(function() {
        const kini = new Date().getTime();
        const jarak = tarikhTutup - kini;
        const hari = Math.floor(jarak / (1000 * 60 * 60 * 24));
        const jam = Math.floor((jarak % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minit = Math.floor((jarak % (1000 * 60 * 60)) / (1000 * 60));
        const saat = Math.floor((jarak % (1000 * 60)) / 1000);

        const timerElemen = document.getElementById("countdownTimer");
        if (jarak < 0) {
            timerElemen.innerHTML = "PENDAFTARAN DITUTUP";
            document.getElementById("submitBtn").disabled = true;
        } else {
            timerElemen.innerHTML = `${hari} HARI, ${jam} JAM, ${minit} MINIT, ${saat} SAAT`;
        }
    }, 1000);

    // --- 2. LIVE STATISTICS & ANIMATED COUNTER ---
    let PESERTA_LIVE_BASE = 0;

    async function fetchLiveStats() {
        try {
            const response = await fetch(scriptURL + "?action=getLive");
            const data = await response.json();
            PESERTA_LIVE_BASE = data.count || 0;
            updateDisplay(0);
        } catch (e) { console.log("Gagal ambil data live"); }
    }
    fetchLiveStats();

    function animateNumber(id, target) {
        const obj = document.getElementById(id);
        let current = parseInt(obj.innerText) || 0;
        if(current === target) return;
        const step = target > current ? 1 : -1;
        const timer = setInterval(() => {
            current += step;
            obj.innerText = current;
            if(current === target) clearInterval(timer);
        }, 30);
    }

    function updateDisplay(newInputs) {
        const total = PESERTA_LIVE_BASE + newInputs;
        animateNumber("liveCounterText", total);
        let baki = 7 - (total % 7);
        if (total > 0 && total % 7 === 0) baki = 0;
        animateNumber("bakiSlotText", baki);
    }

    // --- 3. AUTO CALCULATION ---
    const pesertaInputs = document.querySelectorAll('.peserta-input');
    const jumlahBayarInput = document.getElementById('jumlah_bayar');

    pesertaInputs.forEach(input => {
        input.addEventListener('input', () => {
            let count = 0;
            pesertaInputs.forEach(i => { if(i.value.trim() !== "") count++; });
            jumlahBayarInput.value = count * 900;
            updateDisplay(count);
        });
    });

    // --- 4. DYNAMIC UI TOGGLES ---
    document.getElementById('kaedah_bayar').addEventListener('change', function() {
        document.getElementById('bank_info').style.display = (this.value === 'Online Transfer' || this.value === 'ToyyibPay') ? 'block' : 'none';
    });

    document.querySelectorAll('input[name="kehadiran"]').forEach(r => {
        r.addEventListener('change', function() {
            document.getElementById('box_wakil').style.display = (this.value === 'Wakil') ? 'block' : 'none';
        });
    });

    // --- 5. SUBMISSION & PDF GENERATION ---
    const form = document.getElementById('qurbanForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (jumlahBayarInput.value == 0) {
            Swal.fire({ icon: 'warning', title: 'Ralat!', text: 'Sila masukkan nama peserta.', background: '#050b0a', color: '#e2f1ec' });
            return;
        }

        Swal.fire({
            title: 'MEMPROSES PENDAFTARAN',
            text: 'Menghantar data ke server masjid...',
            background: '#050b0a', color: '#00ff88',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => { Swal.showLoading(); }
        });

        const dataForm = {
            nama: document.getElementById('nama').value,
            ic: document.getElementById('ic').value,
            telefon: document.getElementById('telefon').value,
            alamat: document.getElementById('alamat').value,
            peserta_1: document.querySelector('input[name="peserta_1"]').value,
            peserta_2: document.querySelector('input[name="peserta_2"]').value,
            peserta_3: document.querySelector('input[name="peserta_3"]').value,
            peserta_4: document.querySelector('input[name="peserta_4"]').value,
            peserta_5: document.querySelector('input[name="peserta_5"]').value,
            peserta_6: document.querySelector('input[name="peserta_6"]').value,
            peserta_7: document.querySelector('input[name="peserta_7"]').value,
            agihan: document.querySelector('input[name="agihan"]:checked').value,
            kaedah_bayar: document.getElementById('kaedah_bayar').value,
            jumlah: jumlahBayarInput.value,
            kehadiran: document.querySelector('input[name="kehadiran"]:checked').value,
            nama_wakil: document.getElementById('nama_wakil').value
        };

        fetch(scriptURL, { method: 'POST', body: JSON.stringify(dataForm) })
        .then(res => res.json())
        .then(res => {
            if (res.result === "success") {
                // Generate PDF Content
                const tarikh = new Date().toLocaleString("ms-MY");
                const jenis = (dataForm.kaedah_bayar === "Tunai") ? "INVOIS" : "RESIT";
                
                document.getElementById('tajuk_dokumen').innerText = `${jenis} PENDAFTARAN RASMI`;
                document.getElementById('r_nama').innerText = dataForm.nama.toUpperCase();
                document.getElementById('r_ic').innerText = dataForm.ic;
                document.getElementById('r_tarikh').innerText = tarikh;
                document.getElementById('r_kaedah').innerText = dataForm.kaedah_bayar;
                document.getElementById('r_jumlah').innerText = parseFloat(dataForm.jumlah).toFixed(2);

                const opt = {
                    margin: 0.5,
                    filename: `${jenis}_${dataForm.nama.replace(/ /g,"_")}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                };

                html2pdf().set(opt).from(document.getElementById('resitKandungan')).save().then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'BERJAYA!',
                        text: `${jenis} anda telah dijana secara automatik.`,
                        confirmButtonText: 'TUTUP',
                        background: '#050b0a', color: '#00ff88'
                    }).then(() => {
                        // WhatsApp
                        const mesej = `Assalamualaikum Bendahari. Saya ${dataForm.nama} telah mendaftar Qurban 2026 (RM${dataForm.jumlah}). Invois/Resit telah dijana secara automatik.`;
                        window.open(`https://wa.me/60133787248?text=${encodeURIComponent(mesej)}`, '_blank');
                        location.reload();
                    });
                });
            }
        });
    });
});