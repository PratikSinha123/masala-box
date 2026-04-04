let orders = [];
let reservations = [];
let menu = [];
let settings = {};

window.switchTab = function(targetId) {
    // Topbar titles
    const titles = {
        'dashboard-view': 'Dashboard',
        'orders-view': 'All Orders',
        'reservations-view': 'All Reservations',
        'menu-view': 'Menu Management',
        'settings-view': 'System Settings'
    };

    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        if(el.dataset.target === targetId) {
            el.classList.add('active');
            document.getElementById('topbar-title').innerText = titles[targetId] || 'Dashboard';
        }
    });

    // Toggle views
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
        if(el.id === targetId) el.classList.add('active');
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    const socket = io();

    // Elements
    const statOrders = document.getElementById('statOrders');
    const statReservations = document.getElementById('statReservations');
    const statRevenue = document.getElementById('statRevenue');
    
    const sideOrderCount = document.getElementById('sideOrderCount');
    const sideResCount = document.getElementById('sideResCount');
    
    const dashOrdersBody = document.getElementById('dashOrdersBody');
    const dashReservationsBody = document.getElementById('dashReservationsBody');
    const fullOrdersBody = document.getElementById('fullOrdersBody');
    const fullReservationsBody = document.getElementById('fullReservationsBody');
    
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    
    // Tab Switching
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            window.switchTab(item.dataset.target);
        });
    });

    // Refresh btn
    const refreshBtn = document.getElementById('refreshBtn');
    if(refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }

    function loadData() {
        return fetch('/api/data')
            .then(res => res.json())
            .then(data => {
                const newOrders = data.orders || [];
                const newReservations = data.reservations || [];
                const newMenu = data.menu || [];
                const newSettings = data.settings || {};
                
                let didOrdersChange = JSON.stringify(orders) !== JSON.stringify(newOrders);
                let didResChange = JSON.stringify(reservations) !== JSON.stringify(newReservations);
                let didMenuChange = JSON.stringify(menu) !== JSON.stringify(newMenu);
                let didSettingsChange = JSON.stringify(settings) !== JSON.stringify(newSettings);

                orders = newOrders;
                reservations = newReservations;
                menu = newMenu;
                settings = newSettings;
                
                if(didOrdersChange) renderOrders();
                if(didResChange) renderReservations();
                if(didMenuChange) renderMenuTable();
                if(didSettingsChange) renderSettings();
            })
            .catch(err => console.error("Data load error:", err));
    }

    // Initial load
    loadData();

    // 2-second auto refresh loop (Vercel Fallback for Sockets)
    setInterval(loadData, 2000);

    socket.on('newOrder', (order) => {
        orders.push(order);
        renderOrders();
        showToast('New Live Order Received!');
    });

    socket.on('newReservation', (reservation) => {
        reservations.push(reservation);
        renderReservations();
        showToast('New Table Reservation Received!');
    });

    socket.on('menuUpdated', (updatedMenu) => {
        menu = updatedMenu;
        renderMenuTable();
    });

    socket.on('settingsUpdated', (updatedSettings) => {
        settings = updatedSettings;
        renderSettings();
    });

    function getEmptyRow(cols, icon, text) {
        return `
        <tr class="empty-state-row">
            <td colspan="${cols}">
                <div class="empty-state">
                    <div class="empty-icon">${icon}</div>
                    <p>${text}</p>
                </div>
            </td>
        </tr>`;
    }

    function renderOrders() {
        statOrders.textContent = orders.length;
        sideOrderCount.textContent = orders.length;
        
        const rev = orders.length * 500;
        statRevenue.textContent = `₹${rev}`;

        if (orders.length === 0) {
            const empty = getEmptyRow(6, '📋', 'No orders yet');
            dashOrdersBody.innerHTML = empty;
            fullOrdersBody.innerHTML = empty;
            return;
        }

        const rowsHtml = [...orders].reverse().map(o => `
            <tr>
                <td>#${o.id.slice(-6)}</td>
                <td>
                    <div style="font-weight: 500">${o.name}</div>
                    <div style="font-size: 0.85rem; color: #cf9b5b; margin-top: 0.2rem;">📞 ${o.phone || 'N/A'}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">${o.type || 'Online'}</div>
                </td>
                <td>${o.items || '-'}</td>
                <td>₹500</td>
                <td>
                    <select onchange="updateOrderStatus('${o.id}', this.value)" style="background: #2a2522; border: 1px solid #48413c; color: #fff; padding: 0.4rem; border-radius: 4px; outline: none; cursor: pointer; font-size: 0.85rem;">
                        <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Preparing" ${o.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Ready" ${o.status === 'Ready' ? 'selected' : ''}>Ready</option>
                        <option value="Complete" ${o.status === 'Complete' ? 'selected' : ''}>Order Complete</option>
                    </select>
                </td>
                <td><a href="#" style="color: var(--primary); font-size: 0.85rem; text-decoration: none;">Details</a></td>
            </tr>
        `).join('');

        // For dashboard, maybe show only top 5, but for now show all since it scrolls
        dashOrdersBody.innerHTML = rowsHtml;
        fullOrdersBody.innerHTML = rowsHtml;
    }

    function renderReservations() {
        statReservations.textContent = reservations.length;
        sideResCount.textContent = reservations.length;

        if (reservations.length === 0) {
            const empty = getEmptyRow(6, '📅', 'No reservations yet');
            dashReservationsBody.innerHTML = empty;
            fullReservationsBody.innerHTML = empty;
            return;
        }

        const rowsHtml = [...reservations].reverse().map(r => `
            <tr>
                <td>
                    <div style="font-weight: 500">${r.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted)">${r.email}</div>
                </td>
                <td>
                    <div>${r.date}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted)">${r.time}</div>
                </td>
                <td>${r.guests} Person(s)</td>
                <td>${r.phone || '-'}</td>
                <td><span class="status-badge ${r.status || 'Confirmed'}">${r.status || 'Confirmed'}</span></td>
                <td><a href="/api/reservations/${r.id}/csv" download="Reservation-${r.id}.csv" style="color: var(--primary); font-size: 0.85rem; text-decoration: none;">CSV</a></td>
            </tr>
        `).join('');

        dashReservationsBody.innerHTML = rowsHtml;
        fullReservationsBody.innerHTML = rowsHtml;
    }

    // MENU LOGIC
    function renderMenuTable() {
        const fullMenuBody = document.getElementById('fullMenuBody');
        if (!fullMenuBody) return;
        
        if (menu.length === 0) {
            fullMenuBody.innerHTML = getEmptyRow(5, '🍽️', 'Menu is empty');
            return;
        }

        fullMenuBody.innerHTML = menu.map(m => `
            <tr>
                <td>#${m.id}</td>
                <td>${m.name}</td>
                <td>${m.category}</td>
                <td>
                    <input type="number" id="menu-price-${m.id}" value="${m.price}" style="width:70px; padding:0.4rem; background: #2a2522; border: 1px solid #48413c; color:#fff; border-radius:4px;">
                </td>
                <td>
                    <button onclick="updateMenuPrice(${m.id})" style="padding:0.4rem 0.8rem; background:var(--primary); border:none; color:#fff; border-radius:4px; cursor:pointer;">Save</button>
                </td>
            </tr>
        `).join('');
    }

    window.updateMenuPrice = async function(id) {
        const newPrice = document.getElementById(`menu-price-${id}`).value;
        try {
            await fetch(`/api/menu/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: newPrice })
            });
            showToast('Menu price updated!');
        } catch (err) {
            console.error(err);
        }
    };

    const addMenuItemForm = document.getElementById('addMenuItemForm');
    if (addMenuItemForm) {
        addMenuItemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('newItemName').value,
                category: document.getElementById('newItemCat').value,
                price: parseInt(document.getElementById('newItemPrice').value),
                desc: document.getElementById('newItemDesc').value
            };
            
            try {
                await fetch('/api/menu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                addMenuItemForm.reset();
                showToast('New item added successfully!');
            } catch (err) {
                console.error(err);
            }
        });
    }

    window.updateOrderStatus = async (id, newStatus) => {
        try {
            await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            console.error('Failed to update order status', err);
        }
    };

    socket.on('orderUpdated', (updatedOrder) => {
        const idx = orders.findIndex(o => o.id === updatedOrder.id);
        if (idx !== -1) {
            orders[idx] = updatedOrder;
            renderOrders();
        }
    });

    // SETTINGS LOGIC
    const setDeliveryFee = document.getElementById('setDeliveryFee');
    const setBannerText = document.getElementById('setBannerText');
    const settingsForm = document.getElementById('settingsForm');

    function renderSettings() {
        if(setDeliveryFee && settings.deliveryFee) setDeliveryFee.value = settings.deliveryFee;
        if(setBannerText && settings.bannerText) setBannerText.value = settings.bannerText;
    }

    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        deliveryFee: parseInt(setDeliveryFee.value),
                        bannerText: setBannerText.value
                    })
                });
                showToast('Settings Saved!');
            } catch (err) {
                console.error(err);
            }
        });
    }

    function showToast(msg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
});
