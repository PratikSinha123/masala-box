document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Connects to the server

    // Reservation Elements
    const reserveForm = document.getElementById('reserveForm');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    // Reservation Submit
    if (reserveForm) {
        reserveForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('resName').value;
            const email = document.getElementById('resEmail').value;
            const date = document.getElementById('resDate').value;
            const time = document.getElementById('resTime').value;
            const guests = document.getElementById('resGuests').value;
            const phone = document.getElementById('resPhone').value;

            try {
                const res = await fetch('/api/reservations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, date, time, guests, phone })
                });
                const data = await res.json();
                
                if (data.success) {
                    const downloadHtml = `<a href="${data.csvUrl}" class="download-link" download="Reservation-${data.reservation.id}.csv">Download CSV</a>`;
                    showToast(`Table Reserved! ${downloadHtml}`, true);
                    reserveForm.reset();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Toast Logic
    let toastTimer;
    window.showToast = function(htmlMsg, isPersistent = false) {
        if(!toast) return;
        clearTimeout(toastTimer);
        
        toastMsg.innerHTML = htmlMsg;
        toast.classList.add('show');
        
        if (!isPersistent) {
            toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        } else {
            toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 10000);
        }
    }
});
