const scriptURL = "https://script.google.com/macros/s/AKfycbzv1nKzCUlly-jA4AHO317rB9TuFJ9v5mRYsmkqB_Y_f6kJqJRg1kMghTK6escjTFYc/exec";

document.addEventListener('DOMContentLoaded', function() {
    let PESERTA_ASAL = 0;

    // Timer logic
    const tarikhTutup = new Date("May 24, 2026 23:59:59").getTime();
    setInterval(() => {
        const jarak = tarikhTutup - new Date().getTime();
        document.getElementById("countdownTimer").innerHTML = Math.floor(jarak / (1000 * 60 * 60 * 24)) + " Hari lagi";
    }, 1000);

    // Ambil stats live
    async function getStats() {
        try {
            const res = await fetch(scriptURL + "?action=getLive");
            const data = await res.json();
            PESERTA_ASAL = data.count;
            updateUI(0);
        } catch(e) {}
    }
    getStats();

    function updateUI(inputCount) {
        const total = PESERTA_ASAL + inputCount;
        document.getElementById("liveCounterText").innerText = total;
        let baki = 7 - (total % 7);
        if (total > 0 && total % 7 === 0) baki = 0;
        document.getElementById("bakiSlotText").innerText = baki;
    }

    const inputs = document.querySelectorAll('.peserta-input');
    inputs.forEach(i => i.addEventListener('input', () => {
        let count = 0;
        inputs.forEach(v => { if(v.value.trim() !== "") count++; });
        document.getElementById('jumlah_bayar').value = count * 900;
        updateUI(count);
    }));

    document.getElementById('kaedah_bayar').addEventListener('change', function() {
        document.getElementById('bank_info').style.display = (this.value === 'Online Transfer') ? 'block' : 'none';
    });

    document.getElementById('qurbanForm').addEventListener('submit', function(e) {
        e.preventDefault();
        Swal.fire({ title: 'Menghantar...', background: '#050b0a', color: '#00ff88', didOpen: () => Swal.showLoading() });

        const formData = {
            nama: document.getElementById('nama').value,
            ic: document.getElementById('ic').value,
            telefon: document.getElementById('telefon').value,
            alamat: document.getElementById('alamat').value,
            peserta_1: document.querySelector('[name="peserta_1"]').value,
            peserta_2: document.querySelector('[name="peserta_2"]').value,
            peserta_3: document.querySelector('[name="peserta_3"]').value,
            peserta_4: document.querySelector('[name="peserta_4"]').value,
            kaedah_bayar: document.getElementById('kaedah_bayar').value,
            jumlah: document.getElementById('jumlah_bayar').value,
            agihan: "Sedekah", kehadiran: "Hadir" // Default values
        };

        fetch(scriptURL, { method: 'POST', body: JSON.stringify(formData) })
        .then(r => r.json())
        .then(res => {
            if(res.result === "success") {
                // PDF Logic
                document.getElementById('r_nama').innerText = formData.nama;
                document.getElementById('r_jumlah').innerText = formData.jumlah;
                html2pdf().from(document.getElementById('resitKandungan')).save().then(() => {
                    Swal.fire({ icon: 'success', title: 'Berjaya!', background: '#050b0a', color: '#00ff88' });
                    location.reload();
                });
            }
        });
    });
});
