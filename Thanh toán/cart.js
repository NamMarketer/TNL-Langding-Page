let cart = JSON.parse(localStorage.getItem('tnl-cart')) || [];

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    localStorage.setItem('tnl-cart', JSON.stringify(cart));
    updateCartUI();
    showCartNotification();
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
    
    updateCartModal();
    updateCartDisplay();
}

function updateCartModal() {
    const cartModal = document.querySelector('.cart-modal-items');
    if (!cartModal) return;

    if (cart.length === 0) {
        cartModal.innerHTML = '<p class="empty-cart">Giỏ hàng trống</p>';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-modal-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-modal-item-details">
                    <h4>${item.name}</h4>
                    <p>${formatPrice(item.price)} × ${item.quantity}</p>
                </div>
                <div class="cart-modal-item-actions">
                    <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    <button onclick="removeFromCart('${item.id}')" class="remove-item">×</button>
                </div>
            </div>
        `;
    });

    cartModal.innerHTML = html;
    document.querySelector('.cart-modal-total').textContent = formatPrice(total);
}

function updateCartDisplay() {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <h2>Giỏ hàng trống</h2>
                <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                <a href="index.html" class="button-primary">Tiếp tục mua sắm</a>
            </div>`;
        document.querySelector('.checkout-button').style.display = 'none';
        return;
    }

    let html = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        html += `
            <li class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <div class="item-price-mobile">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-quantity">
                    <div class="quantity-selector">
                        <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="quantity-btn">-</button>
                        <input type="number" value="${item.quantity}" min="1" 
                               onchange="updateQuantity('${item.id}', this.value)"
                               class="quantity-input">
                        <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="quantity-btn">+</button>
                    </div>
                </div>
                <div class="cart-item-price">${formatPrice(itemTotal)}</div>
                <div class="cart-item-actions">
                    <button onclick="removeFromCart('${item.id}')" class="item-action-btn remove-item-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>`;
    });

    cartItems.innerHTML = html;

    // Update totals
    const shippingCost = 25000;
    const total = subtotal + shippingCost;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping-cost').textContent = formatPrice(shippingCost);
    document.getElementById('final-amount').textContent = formatPrice(total);
    document.querySelector('.checkout-button').style.display = 'block';
}

function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = 'Đã thêm vào giỏ hàng!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('tnl-cart', JSON.stringify(cart));
        updateCartUI();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('tnl-cart', JSON.stringify(cart));
    updateCartUI();
}

function formatPrice(price) {
    return price.toLocaleString('vi-VN') + '₫';
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }
    window.location.href = 'Thanh toán/TRANG THANH TOÁN.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateCartUI);
