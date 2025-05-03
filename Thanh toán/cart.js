// js/cart.js

// Quản lý giỏ hàng
const TNLCart = {
    items: [],

    // Lấy giỏ hàng từ localStorage
    getCart() {
        return JSON.parse(localStorage.getItem('tnl-cart')) || [];
    },

    // Lưu giỏ hàng vào localStorage
    saveCart() {
        localStorage.setItem('tnl-cart', JSON.stringify(this.items));
    },

    // Thêm sản phẩm vào giỏ hàng
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
    },

    // Cập nhật số lượng sản phẩm
    updateQuantity(productId, change) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, item.quantity + change);
            this.saveCart();
            this.updateCartDisplay();
        }
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    },

    // Tính tổng tiền giỏ hàng
    calculateTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Format giá tiền theo định dạng VND
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    },

    // Cập nhật hiển thị giỏ hàng
    updateCartDisplay() {
        const cartCount = document.querySelectorAll('.cart-count, .header-cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCount.forEach(count => {
            if (count) {
                count.textContent = totalItems;
                count.style.display = totalItems > 0 ? 'block' : 'none';
            }
        });

        const cartItemsList = document.querySelector('.cart-items');
        const cartTotal = document.querySelector('.final-amount');
        const subtotalAmount = document.querySelector('.subtotal-amount');
        
        // Cập nhật danh sách sản phẩm
        if (cartItemsList) {
            if (this.items.length === 0) {
                cartItemsList.innerHTML = `
                    <div class="cart-empty">
                        <i class="fas fa-shopping-bag"></i>
                        <h2>Giỏ hàng của bạn trống</h2>
                        <p>Hãy thêm các sản phẩm yêu thích vào giỏ hàng và quay lại đây nhé!</p>
                        <a href="../index.html#product-showcase" class="btn btn-primary">Tiếp tục mua sắm</a>
                    </div>`;
            } else {
                cartItemsList.innerHTML = this.items.map(item => `
                    <li class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-info">
                            <h3>${item.name}</h3>
                            <div class="item-price">${this.formatPrice(item.price)}</div>
                            <div class="quantity-controls">
                                <button class="quantity-btn minus" onclick="TNLCart.updateQuantity('${item.id}', -1)">-</button>
                                <input type="number" value="${item.quantity}" min="1" 
                                       onchange="TNLCart.updateQuantity('${item.id}', parseInt(this.value) - ${item.quantity})">
                                <button class="quantity-btn plus" onclick="TNLCart.updateQuantity('${item.id}', 1)">+</button>
                            </div>
                        </div>
                        <button class="remove-item" onclick="TNLCart.removeItem('${item.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </li>
                `).join('');
            }
        }

        // Cập nhật tổng tiền
        const total = this.calculateTotal();
        if (subtotalAmount) subtotalAmount.textContent = this.formatPrice(total);
        if (cartTotal) cartTotal.textContent = this.formatPrice(total);
    },

    // Khởi tạo giỏ hàng
    init() {
        this.items = JSON.parse(localStorage.getItem('tnl-cart')) || [];
        this.updateCartDisplay();
        
        // Thêm event listener cho nút checkout
        const checkoutButton = document.querySelector('.checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                const cart = this.items;
                if (cart.length === 0) {
                    alert('Giỏ hàng của bạn đang trống!');
                    return;
                }
                // Lưu giỏ hàng hiện tại để trang thanh toán có thể truy cập
                localStorage.setItem('checkout-cart', JSON.stringify(cart));
                window.location.href = 'TRANG THANH TOÁN.html';
            });
        }
    }
};

// Khởi tạo giỏ hàng khi trang web được load
document.addEventListener('DOMContentLoaded', () => {
    TNLCart.init();
});

function updateCart() {
    const cartItems = JSON.parse(localStorage.getItem('tnl-cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Giỏ hàng trống</h2>
                <p>Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
            </div>
        `;
        return;
    }

    cartCount.textContent = `${cartItems.length} sản phẩm`;
    
    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="custom-checkbox item-checkbox" onclick="toggleItemSelection('${item.id}')"></div>
            <img src="../${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-price">${formatPrice(item.price)}</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
            <div class="item-total">
                ${formatPrice(item.price * item.quantity)}
            </div>
            <button class="remove-item" onclick="removeItem('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    updateTotals();
}

function proceedToCheckout() {
    const selectedItems = getSelectedItems();
    
    if (selectedItems.length === 0) {
        alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
        return;
    }

    // Tính tổng tiền các sản phẩm được chọn
    const subtotal = selectedItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);
    
    // Tạo object chứa thông tin thanh toán
    const checkoutData = {
        items: selectedItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            subtotal: item.price * item.quantity
        })),
        totals: {
            subtotal: subtotal,
            discount: 0,
            shipping: 0,
            total: subtotal
        }
    };

    // Lưu vào localStorage để trang thanh toán có thể truy cập
    localStorage.setItem('checkout-items', JSON.stringify(checkoutData));
    
    // Chuyển hướng đến trang thanh toán
    window.location.href = 'TRANG THANH TOÁN.html';
}