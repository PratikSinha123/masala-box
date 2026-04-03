// Make menuData dynamic
let menuData = [];
let cart = [];
let currentCategory = 'All';
let searchTerm = '';
let settingsData = { deliveryFee: 0 };
let currentServiceType = 'Delivery';

document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Connects to the server

    // Common Elements
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    // Menu Elements
    const menuGrid = document.getElementById('interactiveMenuGrid');
    const searchInput = document.getElementById('menuSearch');
    const cartContainer = document.getElementById('cartItemsContainer');
    const cartSummary = document.getElementById('cartSummary');
    const cartTotalVal = document.getElementById('cartTotalVal');
    const btnCheckout = document.getElementById('btnCheckout');
    const emptyCartMsg = document.getElementById('emptyCartMessage');

    // Checkout Modal Elements
    const checkoutForm = document.getElementById('checkoutForm');
    const coType = document.getElementById('coType');
    const coAddressGroup = document.getElementById('coAddressGroup');

    // Init Menu Fetch
    if (menuGrid) {
        // Fetch Settings & Menu concurrently
        Promise.all([
            fetch('/api/menu').then(r => r.json()),
            fetch('/api/settings').then(r => r.json())
        ]).then(([menu, settings]) => {
            menuData = menu;
            settingsData = settings || { deliveryFee: 0 };
            renderMenu();
            renderCart(); // re-render just in case
        });

        // Listen for live updates!
        socket.on('menuUpdated', (updatedMenu) => {
            menuData = updatedMenu;
            renderMenu();
        });

        socket.on('settingsUpdated', (updatedSettings) => {
            settingsData = updatedSettings;
            renderCart(); // recalculate total live if admin updates fee while ordering!
        });

        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            renderMenu();
        });

        window.filterMenu = (cat) => {
            currentCategory = cat;
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            event.target.closest('.pill').classList.add('active');
            renderMenu();
        };

        window.addToCart = (id) => {
            const item = menuData.find(m => m.id === id);
            cart.push(item);
            renderCart();
        };

        window.removeFromCart = (index) => {
            cart.splice(index, 1);
            renderCart();
        };

        window.openCheckout = () => {
            if(cart.length === 0) return;
            document.getElementById('checkoutModal').style.display = 'flex';
            updateBillSummary(); // Calculate Split totals upon opening
        };

        window.closeCheckout = () => {
            document.getElementById('checkoutModal').style.display = 'none';
        };

        window.setServiceType = (type) => {
            currentServiceType = type;
            document.getElementById('coType').value = type;
            
            const btnDel = document.getElementById('btnDelivery');
            const btnPick = document.getElementById('btnPickup');
            const addressGroup = document.getElementById('coAddressGroup');
            
            if (type === 'Pickup') {
                btnPick.classList.add('active');
                btnDel.classList.remove('active');
                addressGroup.style.display = 'none';
                document.getElementById('coAddress').removeAttribute('required');
            } else {
                btnDel.classList.add('active');
                btnPick.classList.remove('active');
                addressGroup.style.display = 'block';
                document.getElementById('coAddress').setAttribute('required', 'true');
            }
            
            renderCart();
            updateBillSummary();
        };
        
        function updateBillSummary() {
            const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
            const deliveryFee = currentServiceType === 'Delivery' ? (settingsData.deliveryFee || 0) : 0;
            const finalTotal = subtotal + deliveryFee;
            
            document.getElementById('coSubtotalVal').innerText = `₹${subtotal}`;
            
            if (currentServiceType === 'Delivery') {
                document.getElementById('coDeliveryRow').style.display = 'flex';
                document.getElementById('coDeliveryFeeVal').innerText = `₹${deliveryFee}`;
            } else {
                document.getElementById('coDeliveryRow').style.display = 'none';
            }
            
            document.getElementById('coFinalTotalVal').innerText = `₹${finalTotal}`;
        }

        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = currentServiceType;
            const name = document.getElementById('coName').value;
            const phone = document.getElementById('coPhone').value;
            const address = document.getElementById('coAddress').value;
            
            // Format cart items
            const itemString = cart.map(i => i.name).join(', ');
            
            try {
                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, name, phone, items: itemString, address })
                });
                const data = await res.json();
                
                if (data.success) {
                    showToast(`Order placed! ID: #${data.order.id.slice(-6)}`);
                    cart = [];
                    renderCart();
                    window.closeCheckout();
                    checkoutForm.reset();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Rendering Helpers
    function renderMenu() {
        if(!menuGrid) return;
        const filtered = menuData.filter(m => {
            const matchCat = currentCategory === 'All' || m.category === currentCategory;
            const matchSearch = m.name.toLowerCase().includes(searchTerm) || m.desc.toLowerCase().includes(searchTerm);
            return matchCat && matchSearch;
        });

        if (filtered.length === 0) {
            menuGrid.innerHTML = `
                <div style="text-align:center; color:#888; grid-column:1/-1; padding-top: 4rem;">
                    <span style="font-size:3rem; display:block; margin-bottom:1rem;">🔍</span>
                    <p style="font-size: 1.2rem;">No items found.</p>
                </div>`;
            return;
        }

        menuGrid.innerHTML = filtered.map(m => `
            <div class="menu-item-card" onclick="addToCart(${m.id})">
                <div>
                    <h4 class="menu-item-title">${m.name}</h4>
                    <p class="menu-item-desc">${m.desc}</p>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; border-top: 1px solid #E8E0D5; padding-top: 1rem;">
                    <span style="color:var(--primary); font-weight:700; font-size:1.3rem;">₹${m.price}</span>
                    <span style="color:#FDFBF8; background:var(--secondary); padding:0.4rem 1rem; border-radius:20px; font-size:0.9rem; font-weight:600; text-transform:uppercase;">+ Add</span>
                </div>
            </div>
        `).join('');
    }

    function renderCart() {
        if (cart.length === 0) {
            cartContainer.innerHTML = '';
            cartContainer.appendChild(emptyCartMsg);
            cartSummary.style.display = 'none';
            btnCheckout.disabled = true;
            btnCheckout.style.opacity = '0.5';
            btnCheckout.style.cursor = 'not-allowed';
            btnCheckout.style.background = 'transparent';
            btnCheckout.style.border = '2px solid #C5A880';
            btnCheckout.style.color = '#C5A880';
            return;
        }

        let total = cart.reduce((sum, item) => sum + item.price, 0);
        let activeDeliveryFee = 0;
        
        if (currentServiceType === 'Delivery') {
            activeDeliveryFee = settingsData.deliveryFee || 0;
            total += activeDeliveryFee;
        }

        cartTotalVal.innerHTML = activeDeliveryFee > 0 
            ? `₹${total} <br><span style="font-size:0.8rem; color:#7A695C; font-weight:400; display:block; text-align:right;">(Includes ₹${activeDeliveryFee} Delivery Fee)</span>` 
            : `₹${total}`;

        cartContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div>
                    <div style="font-weight:600; font-size:1.1rem; margin-bottom:0.2rem;">${item.name}</div>
                    <div style="font-size:1rem; color:#C5A880;">₹${item.price}</div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})" title="Remove item">✕</button>
            </div>
        `).join('');

        cartSummary.style.display = 'block';
        btnCheckout.disabled = false;
        btnCheckout.style.opacity = '1';
        btnCheckout.style.cursor = 'pointer';
        btnCheckout.style.background = '#C5A880';
        btnCheckout.style.color = '#FDFBF8';
        btnCheckout.style.border = 'none';
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
