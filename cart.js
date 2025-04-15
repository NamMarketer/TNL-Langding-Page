let cart = JSON.parse(localStorage.getItem('tnl-cart')) || [];

function addToCart(product) {
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
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
    updateHeaderCart();
}

function thêmVàoGiỏ(sảnPhẩm) {
    const sảnPhẩmHiệnCó = cart.find(item => item.id === sảnPhẩm.id);
    if (sảnPhẩmHiệnCó) {
        sảnPhẩmHiệnCó.số_lượng += 1;
    } else {
        cart.push({
            id: sảnPhẩm.id,
            tên: sảnPhẩm.name,
            giá: sảnPhẩm.price,
            hình: sảnPhẩm.image,
            số_lượng: 1
        });
    }
    localStorage.setItem('tnl-cart', JSON.stringify(cart));
    cậpNhậtGiaoDiệnGiỏHàng();
    hiểnThịThôngBáoThêmVàoGiỏ();
}

function updateCartUI() {
    // Find cart count element in header
    const cartCount = document.querySelector('.header-cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }

    updateCartDisplay();
    updateHeaderCart();
}

function updateCartDisplay() {
    const cartContainer = document.querySelector('.cart-items');
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <h3>Giỏ hàng trống</h3>
                <p>Chưa có sản phẩm nào trong giỏ hàng</p>
            </div>`;
        document.querySelector('.checkout-btn')?.classList.add('disabled');
        return;
    }

    let html = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        html += `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="price">${formatPrice(item.price)}</div>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <div class="total">${formatPrice(itemTotal)}</div>
                    <button onclick="removeFromCart('${item.id}')" class="remove-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    // Add checkout button if items exist
    if (cart.length > 0) {
        html += `
            <div class="cart-summary">
                <div class="subtotal">
                    <span>Tổng tiền:</span> 
                    <span class="amount">${formatPrice(subtotal)}</span>
                </div>
                <button onclick="proceedToCheckout()" class="btn btn-primary checkout-btn">
                    Thanh toán tất cả
                </button>
            </div>
        `;
    }

    cartContainer.innerHTML = html;

    // Update total
    const totalElement = document.querySelector('.cart-total');
    if (totalElement) {
        totalElement.textContent = formatPrice(subtotal);
    }

    // Enable checkout button
    document.querySelector('.checkout-btn')?.classList.remove('disabled');
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity = newQuantity;
        localStorage.setItem('tnl-cart', JSON.stringify(cart));
        updateCartUI();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('tnl-cart', JSON.stringify(cart));
    updateCartUI();
    updateHeaderCart();
}

function formatPrice(price) {
    return price.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });
}

function checkout() {
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    // Prepare cart data for checkout
    const cartData = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    // Store checkout data
    localStorage.setItem('tnl-checkout', JSON.stringify(cartData));
    
    // Redirect to checkout page
    window.location.href = 'Thanh toán/TRANG THANH TOÁN.html';
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }
    
    // Prepare URL with cart data
    const params = new URLSearchParams();
    params.append('cart', JSON.stringify(cart));
    
    // Redirect to checkout page
    window.location.href = 'Thanh toán/TRANG THANH TOÁN.html?' + params.toString();
}

function đếnTrangThanhToán() {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }
    
    const params = new URLSearchParams();
    params.append('giohang', JSON.stringify(cart));
    window.location.href = 'Thanh toán/TRANG THANH TOÁN.html?' + params.toString();
}

function updateHeaderCart() {
    const headerCartCount = document.querySelector('.cart-count');
    const headerCartItems = document.querySelector('.header-cart-items');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (headerCartCount) {
        headerCartCount.textContent = totalItems;
        headerCartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
    
    // Update cart dropdown/popup content
    if (headerCartItems) {
        if (cart.length === 0) {
            headerCartItems.innerHTML = '<div class="empty-cart">Giỏ hàng trống</div>';
            return;
        }

        let html = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <div class="header-cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <div class="item-price">${formatPrice(item.price)} x ${item.quantity}</div>
                    </div>
                    <button onclick="removeFromCart('${item.id}')" class="remove-item">×</button>
                </div>
            `;
        });

        html += `
            <div class="header-cart-total">
                <span>Tổng cộng:</span>
                <span>${formatPrice(total)}</span>
            </div>
            <div class="header-cart-actions">
                <a href="giohang.html" class="btn btn-outline">Xem giỏ hàng</a>
                <a href="Thanh toán/TRANG THANH TOÁN.html" class="btn btn-primary">Thanh toán</a>
            </div>
        `;

        headerCartItems.innerHTML = html;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    updateHeaderCart();
});

function showCartNotification() {
    alert('Sản phẩm đã được thêm vào giỏ hàng!');
}
