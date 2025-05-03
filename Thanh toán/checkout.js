document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('payment-form');
    const checkoutProducts = document.getElementById('checkout-products');

    // Load products from cart
    function loadCheckoutItems() {
        const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
        
        if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
            window.location.href = 'cart.html';
            return;
        }
    
        // Hiển thị sản phẩm
        checkoutProducts.innerHTML = checkoutData.items.map(item => `
            <div class="product-item">
                <img src="${item.image}" alt="${item.name}" class="product-image">
                <div class="product-info">
                    <h4>${item.name}</h4>
                    <div class="price">${formatCurrency(item.price)}</div>
                    <div class="quantity">Số lượng: ${item.quantity}</div>
                    <div class="item-total">Tổng: ${formatCurrency(item.price * item.quantity)}</div>
                </div>
            </div>
        `).join('');
    
        // Cập nhật tổng tiền
        updateOrderSummary(checkoutData.totals);
    }

    // Form validation
    function validateForm() {
        let isValid = true;
        clearErrors();

        const name = form.querySelector('[name="name"]').value.trim();
        const email = form.querySelector('[name="email"]').value.trim();
        const phone = form.querySelector('[name="phone"]').value.trim();
        const address = form.querySelector('[name="address"]').value.trim();

        if (!name) showError('name', 'Vui lòng nhập họ tên');
        if (!email) showError('email', 'Vui lòng nhập email');
        if (!phone) showError('phone', 'Vui lòng nhập số điện thoại');
        if (!address) showError('address', 'Vui lòng nhập địa chỉ');

        return isValid;
    }

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!validateForm()) return;

        const formData = new FormData(this);
        showLoadingState();

        try {
            // Send order data to server
            const response = await submitOrder(formData);
            
            if (response.success) {
                showSuccessPopup({
                    orderNumber: response.orderNumber,
                    email: formData.get('email')
                });
                clearCart();
            }
        } catch (error) {
            showError('submit', 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            hideLoadingState();
        }
    });

    // Initialize page
    loadCheckoutItems();
    setupEventListeners();
});

document.addEventListener('DOMContentLoaded', function() {
    // Get selected items from localStorage
    const checkoutData = JSON.parse(localStorage.getItem('checkout-items')) || { items: [], totals: {} };
    const checkoutProductsContainer = document.getElementById('checkout-products');

    if (!checkoutProductsContainer) {
        console.error('Không tìm thấy container hiển thị sản phẩm');
        return;
    }

    function updateProductHTML(item) {
        return `
            <div class="product-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="product-image">
                <div class="product-info">
                    <h4>${item.name}</h4>
                    <div class="product-price">${formatCurrency(item.price)}</div>
                    <div class="quantity-badge">
                        <i class="fas fa-shopping-basket"></i>
                        Số lượng: ${item.quantity}
                    </div>
                    <div class="item-total">
                        Tổng: ${formatCurrency(item.price * item.quantity)}
                    </div>
                </div>
            </div>
        `;
    }

    function renderCheckoutItems() {
        // Lấy dữ liệu từ localStorage
        const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
        
        if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
            window.location.href = 'cart.html';
            return;
        }
    
        // Cập nhật tổng tiền ban đầu
        currentSubtotal = checkoutData.totals.subtotal;
        currentDiscountAmount = checkoutData.totals.discount || 0;
    
        // Hiển thị sản phẩm đã chọn
        checkoutProductsContainer.innerHTML = checkoutData.items.map(item => `
            <div class="product-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="product-image">
                <div class="product-info">
                    <h4>${item.name}</h4>
                    <div class="product-price">${formatCurrency(item.price)}</div>
                    <div class="quantity-badge">
                        <i class="fas fa-shopping-basket"></i>
                        Số lượng: ${item.quantity}
                    </div>
                    <div class="item-total">
                        <strong>Tổng tiền:</strong> ${formatCurrency(item.price * item.quantity)}
                    </div>
                </div>
            </div>
        `).join('');
    
        updateOrderTotals();
    }

    function updateOrderTotals() {
        // Cập nhật hiển thị các khoản tiền
        document.getElementById('subtotal').textContent = formatCurrency(currentSubtotal);
        document.getElementById('shipping-cost').textContent = 
            currentShippingCost === 0 ? 'Miễn phí' : formatCurrency(currentShippingCost);
        
        // Hiển thị giảm giá nếu có
        if (currentDiscountAmount > 0) {
            document.getElementById('discount-line').style.display = 'flex';
            document.getElementById('discount-amount').textContent = 
                `-${formatCurrency(currentDiscountAmount)}`;
        }
    
        // Tính và hiển thị tổng cộng
        const finalTotal = currentSubtotal + currentShippingCost - currentDiscountAmount;
        document.getElementById('total').textContent = formatCurrency(finalTotal);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    // Initialize page
    renderCheckoutItems();
    
    // Bind quantity control events
    bindQuantityControls();
    
    // Update totals
    updateOrderTotals(subtotal);

    function bindQuantityControls() {
        const quantityControls = document.querySelectorAll('.quantity-controls');
        
        quantityControls.forEach(control => {
            const minusBtn = control.querySelector('.minus');
            const plusBtn = control.querySelector('.plus');
            const input = control.querySelector('.quantity-input');
            const productItem = control.closest('.product-item');
            const productId = productItem.dataset.productId;

            minusBtn.addEventListener('click', () => updateQuantity(productId, -1));
            plusBtn.addEventListener('click', () => updateQuantity(productId, 1));
            input.addEventListener('change', () => {
                let value = parseInt(input.value);
                if (isNaN(value) || value < 1) value = 1;
                if (value > 99) value = 99;
                updateQuantity(productId, value, true);
            });
        });
    }

    function updateQuantity(productId, change, absolute = false) {
        const itemIndex = checkoutItems.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;

        if (absolute) {
            checkoutItems[itemIndex].quantity = change;
        } else {
            const newQty = (checkoutItems[itemIndex].quantity || 1) + change;
            if (newQty < 1) return;
            if (newQty > 99) return;
            checkoutItems[itemIndex].quantity = newQty;
        }

        // Update localStorage
        localStorage.setItem('checkout-cart', JSON.stringify(checkoutItems));

        // Re-render all items
        renderCheckoutItems();
    }

    // Globals for order totals
    let currentSubtotal = 0;
    let currentShippingCost = 0;
    let currentDiscountAmount = 0;

    // Valid discount codes and their values (%)
    const DISCOUNT_CODES = {
        'TNL2024': 10, // 10% off
        'WELCOME': 15, // 15% off
        'VIP': 20     // 20% off
    };

    // Payment method handling
    const paymentMethods = document.querySelectorAll('.payment-method');
    const bankInfoSection = document.getElementById('bank-info-section');

    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            // Add active to clicked method
            this.classList.add('active');

            // Toggle bank info section
            if (this.dataset.method === 'bank') {
                bankInfoSection.style.display = 'flex';
                // Update order note for bank transfer
                updateOrderNote();
            } else {
                bankInfoSection.style.display = 'none';
            }
        });
    });

    // Shipping method handling
    const shippingOptions = document.querySelectorAll('.shipping-option');
    const shippingCosts = {
        'free': 0,
        'express': 50000,
        'special': 100000
    };

    shippingOptions.forEach(option => {
        option.addEventListener('click', function() {
            const radioInput = this.querySelector('input[type="radio"]');
            if (radioInput) {
                radioInput.checked = true;
                shippingOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');

                // Update shipping cost and totals
                const shippingType = radioInput.value;
                currentShippingCost = shippingCosts[shippingType] || 0;
                updateOrderTotals();
            }
        });
    });

    // Discount code handling
    const discountBtn = document.getElementById('apply-discount');
    const discountInput = document.getElementById('discount-code');
    const discountMessage = document.getElementById('discount-message');

    discountBtn.addEventListener('click', function() {
        const code = discountInput.value.trim().toUpperCase();
        const discountPercentage = DISCOUNT_CODES[code];
        const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));

        if (discountPercentage) {
            const newDiscount = (checkoutData.totals.subtotal * discountPercentage) / 100;
            checkoutData.totals.discount = newDiscount;
            localStorage.setItem('checkout-items', JSON.stringify(checkoutData));
            
            discountMessage.textContent = `Mã giảm giá ${discountPercentage}% đã được áp dụng!`;
            discountMessage.style.color = '#28a745';
            updateOrderTotals();
        } else {
            discountMessage.textContent = 'Mã giảm giá không hợp lệ!';
            discountMessage.style.color = '#dc3545';
        }
        discountMessage.style.display = 'block';
    });

    // Update order totals
    function updateOrderTotals() {
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping-cost');
        const discountElement = document.getElementById('discount-amount');
        const totalElement = document.getElementById('total');
        const discountLine = document.getElementById('discount-line');

        // Format currency
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount);
        };

        // Update display
        subtotalElement.textContent = formatCurrency(currentSubtotal);
        shippingElement.textContent = currentShippingCost === 0 ? 'Miễn phí' : formatCurrency(currentShippingCost);

        if (currentDiscountAmount > 0) {
            discountLine.style.display = 'flex';
            discountElement.textContent = `-${formatCurrency(currentDiscountAmount)}`;
        } else {
            discountLine.style.display = 'none';
        }

        const finalTotal = currentSubtotal + currentShippingCost - currentDiscountAmount;
        totalElement.textContent = formatCurrency(finalTotal);

        // Update order note if bank transfer is selected
        updateOrderNote();
    }

    // Update order note for bank transfer
    function updateOrderNote() {
        const bankPayment = document.querySelector('.payment-method[data-method="bank"]');
        if (bankPayment && bankPayment.classList.contains('active')) {
            const orderNote = `TNL-${document.getElementById('order-number').textContent}`;
            const copyButtons = document.querySelectorAll('.copy-button[data-copy]');
            copyButtons.forEach(button => {
                if (button.closest('#order-code')) {
                    button.dataset.copy = orderNote;
                }
            });
        }
    }

    // Copy button functionality
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.dataset.copy;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        const originalHTML = this.innerHTML;
                        this.innerHTML = '<i class="fas fa-check"></i> Đã sao chép';
                        setTimeout(() => {
                            this.innerHTML = originalHTML;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Copy failed:', err);
                        alert('Không thể sao chép. Vui lòng sao chép thủ công.');
                    });
            }
        });
    });

    document.getElementById('payment-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Kiểm tra form validity
        if (!this.checkValidity()) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }
    
        // Kiểm tra phương thức vận chuyển
        const shippingMethod = document.querySelector('input[name="shipping"]:checked');
        if (!shippingMethod) {
            alert('Vui lòng chọn phương thức vận chuyển');
            return;
        }
    
        // Kiểm tra phương thức thanh toán
        const paymentMethod = document.querySelector('.payment-method.active');
        if (!paymentMethod) {
            alert('Vui lòng chọn phương thức thanh toán');
            return;
        }
    
        // Kiểm tra giỏ hàng
        const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
        if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
            alert('Không có sản phẩm trong giỏ hàng');
            window.location.href = 'cart.html';
            return;
        }
    
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    
        
    
    // Thêm hàm hiển thị loading overlay
    function showLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <i class="fas fa-spinner fa-spin fa-3x"></i>
                <p>Đang xử lý đơn hàng...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    try {
        const formData = new FormData(this);
        
        // Tạo đối tượng dữ liệu để gửi
        const sheetData = {
            'Timestamp': new Date().toLocaleString('vi-VN'),
            'Mã đơn hàng': `TNL-${generateOrderNumber()}`,
            'Họ tên': formData.get('name'),
            'Email': formData.get('email'),
            'Số điện thoại': formData.get('phone'),
            'Địa chỉ': formData.get('address'),
            'Phương thức vận chuyển': shippingMethod.parentElement.querySelector('strong').textContent,
            'Phí vận chuyển': document.getElementById('shipping-cost').textContent,
            'Phương thức thanh toán': paymentMethod.querySelector('div').textContent,
            'Sản phẩm': checkoutData.items.map(item => 
                `${item.name} (SL: ${item.quantity} x ${formatCurrency(item.price)})`
            ).join('\n'),
            'Tạm tính': document.getElementById('subtotal').textContent,
            'Giảm giá': document.getElementById('discount-amount').textContent,
            'Tổng tiền': document.getElementById('total').textContent,
            'Trạng thái': 'Đang xử lý'
        };

        // Hiển thị loading overlay
        showLoadingOverlay();

        // URL Google Apps Script
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQWE8ZLBCra2gLia8X3S9yaYFVE3xHZi6gxcimDQsSu6KpOH4Gngi44A1FrqAcSgTS/exec';
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(sheetData).toString()
        });

        // Đợi 2 giây để đảm bảo dữ liệu được gửi
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Ẩn loading overlay
        hideLoadingOverlay();

        // Hiển thị thông báo thành công
        showSuccessPopup({
            orderNumber: sheetData['Mã đơn hàng'],
            customerEmail: sheetData['Email']
        });

        // Xóa giỏ hàng
        localStorage.removeItem('checkout-items');
        localStorage.removeItem('tnl-cart');

        // Chuyển hướng sau 5 giây
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 5000);

    } catch (error) {
        console.error('Error:', error);
        hideLoadingOverlay();
        alert('Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại sau!');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Xác nhận đặt hàng';
    }
});
    // Thêm hàm ẩn loading overlay
    function hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    // Thêm CSS cho loading overlay
    const loadingStyles = `
        #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
    
        .loading-content {
            text-align: center;
            color: var(--primary-color);
        }
    
        .loading-content p {
            margin-top: 10px;
            font-size: 1.1em;
        }
    `;
    
    // Thêm styles vào document
    const style = document.createElement('style');
    style.textContent = loadingStyles;
    document.head.appendChild(style);

    // Form submission handling
    document.getElementById('payment-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 1. Kiểm tra form và dữ liệu
        if (!this.checkValidity()) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

        try {
            const formData = new FormData(this);
            const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
            
            // 2. Chuẩn bị dữ liệu gửi đi
            const orderData = {
                'Timestamp': new Date().toLocaleString('vi-VN'),
                'Mã đơn hàng': `TNL-${generateOrderNumber()}`,
                'Họ tên': formData.get('name'),
                'Email': formData.get('email'),
                'Số điện thoại': formData.get('phone'),
                'Địa chỉ': formData.get('address'),
                'Phương thức vận chuyển': document.querySelector('input[name="shipping"]:checked').parentElement.querySelector('strong').textContent,
                'Phí vận chuyển': document.getElementById('shipping-cost').textContent,
                'Phương thức thanh toán': document.querySelector('.payment-method.active').querySelector('div').textContent,
                'Sản phẩm': checkoutData.items.map(item => 
                    `${item.name} (SL: ${item.quantity} x ${formatCurrency(item.price)})`
                ).join('\n'),
                'Tạm tính': document.getElementById('subtotal').textContent,
                'Giảm giá': document.getElementById('discount-amount').textContent,
                'Tổng tiền': document.getElementById('total').textContent,
                'Trạng thái': 'Đang xử lý'
            };

            // 3. Gửi dữ liệu dạng application/x-www-form-urlencoded
            const params = new URLSearchParams();
            Object.keys(orderData).forEach(key => {
                params.append(key, orderData[key]);
            });

            console.log('Sending data:', Object.fromEntries(params));

            const SCRIPT_URL = 'YOUR_DEPLOYED_SCRIPT_URL';

            // 4. Thực hiện request với fetch
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });

            // 5. Đợi để đảm bảo dữ liệu được gửi
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 6. Hiển thị thông báo thành công
            showSuccessPopup({
                orderNumber: orderData['Mã đơn hàng'],
                customerEmail: orderData['Email']
            });

            // 7. Xóa giỏ hàng
            localStorage.removeItem('checkout-items');
            localStorage.removeItem('tnl-cart');

            // 8. Chuyển hướng sau 5 giây
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 5000);

        } catch (error) {
            console.error('Error details:', error);
            alert('Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại!');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Xác nhận đặt hàng';
        }
    });

    function showSuccessPopup(orderData) {
        // Tìm hoặc tạo popup nếu chưa có
        let popup = document.getElementById('success-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'success-popup';
            popup.className = 'success-popup';
            document.body.appendChild(popup);
        }

        // Cập nhật nội dung
        popup.innerHTML = `
            <h3><i class="fas fa-check-circle"></i> Đặt hàng thành công!</h3>
            <div class="order-details">
                <p><strong>Mã đơn hàng:</strong> ${orderData.orderNumber}</p>
                <p><strong>Email:</strong> ${orderData.customerEmail}</p>
                <p><strong>Trạng thái:</strong> <span class="status-badge">Đang xử lý</span></p>
            </div>
            <p>Chúng tôi sẽ sớm gửi email xác nhận đơn hàng của bạn.</p>
            <p class="note">Tự động chuyển về trang chủ sau 5 giây...</p>
        `;

        // Hiển thị popup
        popup.style.display = 'block';
        popup.classList.add('show');

        // Thêm hiệu ứng âm thanh (nếu có)
        try {
            const audio = new Audio('../sounds/success.mp3');
            audio.play();
        } catch(e) {
            console.log('Sound not available');
        }
    }

    function generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${year}${month}${day}${random}`;
    }

    // Initialize page
    function initializePage() {
        // Set initial totals
        const items = JSON.parse(localStorage.getItem('checkout-cart')) || [];
        currentSubtotal = items.reduce((sum, item) => 
            sum + (item.price * (item.quantity || 1)), 0);
        updateOrderTotals();

        // Generate order number
        const orderNumber = Date.now().toString().slice(-8);
        document.getElementById('order-number').textContent = orderNumber;
    }

    // Call initialization
    initializePage();

    // Initial render
    renderCheckoutItems();
    
    function calculateOrderTotal() {
        const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
        if (!checkoutData) return;
    
        const subtotal = checkoutData.totals.subtotal;
        const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
        const shippingCost = shippingCosts[shippingMethod] || 0;
        const discount = checkoutData.totals.discount || 0;
    
        currentSubtotal = subtotal;
        currentShippingCost = shippingCost;
        currentDiscountAmount = discount;
    
        const total = subtotal + shippingCost - discount;
    
        // Update totals display
        updateOrderTotals();
    
        // Store total for bank transfer
        localStorage.setItem('order-total', total);
        
        // Update bank transfer info if needed
        if (document.querySelector('.payment-method[data-method="bank"]').classList.contains('active')) {
            updateBankTransferInfo();
        }
    }
    
    function updateBankTransferInfo() {
        const total = localStorage.getItem('order-total');
        const orderNumber = document.getElementById('order-number').textContent;
        const bankInfo = {
            bankName: 'Vietcombank',
            accountNumber: '1234567890',
            accountName: 'CÔNG TY TNL JEWELRY',
            branch: 'TP.HCM',
            amount: formatCurrency(total),
            transferContent: `TNL-${orderNumber}`
        };
        document.getElementById('bank-account-number').textContent = bankInfo.accountNumber;
        document.getElementById('transfer-amount').textContent = bankInfo.amount;
        document.getElementById('order-code').textContent = bankInfo.transferContent;
    }

    // Update event listeners
    document.addEventListener('DOMContentLoaded', () => {
        renderCheckoutItems();
        calculateOrderTotal();

        // Add shipping method change listener
        document.querySelectorAll('input[name="shipping"]').forEach(input => {
            input.addEventListener('change', calculateOrderTotal);
        });
    });

    // Add shipping cost update handler
    document.querySelectorAll('.shipping-option').forEach(option => {
        option.addEventListener('click', function() {
            calculateOrderTotal();
        });
    });

    // Initialize calculations when page loads
    document.addEventListener('DOMContentLoaded', () => {
        calculateOrderTotal();
    });
});

// Thêm đoạn này vào đầu file, sau phần khai báo biến
const successPopupStyles = `
    .success-popup {
        opacity: 0;
        transition: all 0.3s ease-in-out;
    }

    .success-popup.show {
        opacity: 1;
        transform: translate(-50%, -50%) !important;
    }

    @keyframes slideIn {
        from {
            transform: translate(-50%, -60%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%);
            opacity: 1;
        }
    }
`;

// Thêm style vào document
const styleSheet = document.createElement("style");
styleSheet.textContent = successPopupStyles;
document.head.appendChild(styleSheet);

// Sửa lại phần xử lý form submission
document.getElementById('payment-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Form submitted - starting validation');
    
    // 1. Validate form
    const name = this.querySelector('[name="name"]').value.trim();
    const email = this.querySelector('[name="email"]').value.trim();
    const phone = this.querySelector('[name="phone"]').value.trim();
    const address = this.querySelector('[name="address"]').value.trim();

    // Clear previous errors
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(err => err.remove());

    let isValid = true;
    if (!name) {
        showError(this.querySelector('[name="name"]'), 'Vui lòng nhập họ tên');
        isValid = false;
    }
    if (!email) {
        showError(this.querySelector('[name="email"]'), 'Vui lòng nhập email');
        isValid = false;
    }
    if (!phone) {
        showError(this.querySelector('[name="phone"]'), 'Vui lòng nhập số điện thoại');
        isValid = false;
    }
    if (!address) {
        showError(this.querySelector('[name="address"]'), 'Vui lòng nhập địa chỉ');
        isValid = false;
    }

    if (!isValid) {
        console.log('Form validation failed');
        return;
    }

    // 2. Show processing state
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    showLoadingOverlay();

    try {
        const formData = new FormData(this);
        const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
        const orderNumber = generateOrderNumber();

        // 3. Map data to Google Form entries
        const orderData = {
            'entry.123456789': name,
            'entry.987654321': email,
            'entry.456789123': phone, 
            'entry.789123456': address,
            'entry.321654987': document.querySelector('input[name="shipping"]:checked')
                .parentElement.querySelector('strong').textContent,
            'entry.147258369': document.querySelector('.payment-method.active')
                .querySelector('div').textContent,
            'entry.963852741': checkoutData.items.map(item => 
                `${item.name} (${item.quantity}x${formatCurrency(item.price)})`
            ).join('\n'),
            'entry.369258147': document.getElementById('subtotal').textContent,
            'entry.741852963': document.getElementById('shipping-cost').textContent,
            'entry.852963741': document.getElementById('discount-amount').textContent || '0₫',
            'entry.159357486': document.getElementById('total').textContent,
            'entry.753951842': `TNL-${orderNumber}`
        };

        console.log('Sending data to Google Form:', orderData);

        // 4. Submit to Google Form
        const FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQWE8ZLBCra2gLia8X3S9yaYFVE3xHZi6gxcimDQsSu6KpOH4Gngi44A1FrqAcSgTS/exec';

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(orderData).toString()
        });

        console.log('Response received:', response);

        // 5. Handle success
        hideLoadingOverlay();

        const successPopup = document.getElementById('success-popup');
        if (successPopup) {
            document.getElementById('popup-order-code').textContent = `TNL-${orderNumber}`;
            document.getElementById('popup-customer-email').textContent = email;
            successPopup.style.display = 'block';
            successPopup.classList.add('show');
        }

        // 6. Clear cart data
        localStorage.removeItem('checkout-items');
        localStorage.removeItem('tnl-cart');

        // 7. Redirect after delay
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 5000);

    } catch (error) {
        console.error('Submit error:', error);
        hideLoadingOverlay();
        alert('Có lỗi xảy ra khi gửi đơn hàng: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Xác nhận đặt hàng';
    }
});

// Thêm hàm hiển thị lỗi
function showError(input, message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.style.color = '#dc3545';
    error.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    input.parentElement.appendChild(error);
    input.style.borderColor = '#dc3545';
}

document.getElementById('payment-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Form submitted');

    // 1. Validate form
    const name = this.querySelector('[name="name"]').value.trim();
    const email = this.querySelector('[name="email"]').value.trim();
    const phone = this.querySelector('[name="phone"]').value.trim();
    const address = this.querySelector('[name="address"]').value.trim();

    // Clear previous errors
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(err => err.remove());

    let isValid = true;
    if (!name) {
        showError(this.querySelector('[name="name"]'), 'Vui lòng nhập họ tên');
        isValid = false;
    }
    if (!email) {
        showError(this.querySelector('[name="email"]'), 'Vui lòng nhập email');
        isValid = false;
    }
    if (!phone) {
        showError(this.querySelector('[name="phone"]'), 'Vui lòng nhập số điện thoại'); 
        isValid = false;
    }
    if (!address) {
        showError(this.querySelector('[name="address"]'), 'Vui lòng nhập địa chỉ');
        isValid = false;
    }

    if (!isValid) return;

    // 2. Show processing state 
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    showLoadingOverlay();

    try {
        const formData = new FormData(this);
        const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
        const orderNumber = generateOrderNumber();

        // 3. Prepare form data
        const orderData = {
            'entry.1': new Date().toLocaleString('vi-VN'),
            'entry.2': formData.get('name'),
            'entry.3': formData.get('email'), 
            'entry.4': formData.get('phone'),
            'entry.5': formData.get('address'),
            'entry.6': document.querySelector('input[name="shipping"]:checked')
                .parentElement.querySelector('strong').textContent,
            'entry.7': document.querySelector('.payment-method.active')
                .querySelector('div').textContent,
            'entry.8': checkoutData.items.map(item => 
                `${item.name} (${item.quantity}x${formatCurrency(item.price)})`
            ).join('\n'),
            'entry.9': document.getElementById('subtotal').textContent,
            'entry.10': document.getElementById('shipping-cost').textContent,
            'entry.11': document.getElementById('total').textContent,
            'entry.12': `TNL-${orderNumber}`,
            'entry.13': 'Đang xử lý'
        };

        console.log('Sending order data:', orderData);

        // 4. Send to Google Form
        const FORM_URL = 'https://script.google.com/macros/s/AKfycbzQWE8ZLBCra2gLia8X3S9yaYFVE3xHZi6gxcimDQsSu6KpOH4Gngi44A1FrqAcSgTS/exec';
        
        const response = await fetch(FORM_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(orderData).toString()
        });

        // 5. Success handling
        await new Promise(resolve => setTimeout(resolve, 2000));
        hideLoadingOverlay();

        // 6. Show success popup
        showSuccessMessage({
            orderNumber: `TNL-${orderNumber}`,
            customerName: name,
            customerEmail: email,
            total: document.getElementById('total').textContent
        });

        // 7. Clear cart
        localStorage.removeItem('checkout-items');
        localStorage.removeItem('tnl-cart');

        // 8. Redirect after delay
        setTimeout(() => {
            window.location.href = '../index.html';  
        }, 5000);

    } catch (error) {
        console.error('Submit error:', error);
        hideLoadingOverlay();
        alert('Có lỗi xảy ra khi gửi đơn hàng: ' + error.message);
        
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Xác nhận đặt hàng';
    }
});

function showSuccessMessage(data) {
    const popup = document.createElement('div');
    popup.className = 'success-popup';
    popup.innerHTML = `
        <h3><i class="fas fa-check-circle"></i> Đặt hàng thành công!</h3>
        <p>Cảm ơn ${data.customerName} đã mua sắm tại TNL Jewelry!</p>
        <div class="order-details">
            <p><strong>Mã đơn hàng:</strong> ${data.orderNumber}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Tổng tiền:</strong> ${data.total}</p>
            <p><strong>Trạng thái:</strong> <span class="status-badge">Đang xử lý</span></p>
        </div>
        <p class="note">Chúng tôi sẽ sớm gửi email xác nhận đến địa chỉ ${data.customerEmail}</p>
    `;
    document.body.appendChild(popup);

    // Auto remove after 5s
    setTimeout(() => {
        popup.remove();
    }, 5000);
};

document.getElementById('payment-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Form submission started');

    // Validation checks
    // ...existing validation code...

    try {
        const formData = new FormData(this);
        const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
        
        // Prepare the order data
        const orderData = {
            timestamp: new Date().toLocaleString('vi-VN'),
            orderNumber: `TNL-${generateOrderNumber()}`,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            shipping: document.querySelector('input[name="shipping"]:checked')
                .parentElement.querySelector('strong').textContent,
            shippingCost: document.getElementById('shipping-cost').textContent,
            payment: document.querySelector('.payment-method.active')
                .querySelector('div').textContent,
            products: checkoutData.items.map(item => 
                `${item.name} (${item.quantity}x${formatCurrency(item.price)})`
            ).join('\n'),
            subtotal: document.getElementById('subtotal').textContent,
            discount: document.getElementById('discount-amount').textContent || '0₫',
            total: document.getElementById('total').textContent,
            status: 'Đang xử lý'
        };

        console.log('Sending order data:', orderData);
        showLoadingOverlay();

        // Send to Google Apps Script
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQWE8ZLBCra2gLia8X3S9yaYFVE3xHZi6gxcimDQsSu6KpOH4Gngi44A1FrqAcSgTS/exec';
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        console.log('Response received');
        hideLoadingOverlay();
        
        // Show success message
        showSuccessMessage({
            orderNumber: orderData.orderNumber,
            customerName: orderData.name,
            customerEmail: orderData.email,
            total: orderData.total
        });

        // Clear cart and redirect
        localStorage.removeItem('checkout-items');
        localStorage.removeItem('tnl-cart');

        setTimeout(() => {
            window.location.href = '../index.html';
        }, 5000);

    } catch (error) {
        console.error('Submit error:', error);
        hideLoadingOverlay();
        alert('Có lỗi xảy ra khi gửi đơn hàng: ' + error.message);
    }
});
// ...existing code...

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('payment-form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submission started');

            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            const originalButtonText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            try {
                // Get form data
                const formData = new FormData(form);
                const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));

                if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
                    throw new Error('Không có sản phẩm trong giỏ hàng!');
                }

                // Create order code
                const orderCode = `TNL${new Date().getTime().toString().slice(-8)}`;

                // Format products list
                const productsList = checkoutData.items
                    .map(item => `${item.name} (${item.quantity}x${formatPrice(item.price)})`)
                    .join('\n');

                // Prepare data matching Apps Script structure
                const orderData = {
                    orderCode: orderCode,
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    shipping: document.querySelector('input[name="shipping"]:checked')
                        ?.parentElement.querySelector('strong').textContent,
                    shippingCost: document.getElementById('shipping-cost').textContent,
                    payment: document.querySelector('.payment-method.active')
                        ?.querySelector('div').textContent,
                    products: productsList,
                    subtotal: document.getElementById('subtotal').textContent,
                    discount: document.getElementById('discount-amount')?.textContent || '0₫',
                    total: document.getElementById('total').textContent
                };

                console.log('Sending data:', orderData);

                // Send to Google Apps Script
                const response = await fetch('https://script.google.com/macros/s/AKfycbzQWE8ZLBCra2gLia8X3S9yaYFVE3xHZi6gxcimDQsSu6KpOH4Gngi44A1FrqAcSgTS/exec', {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(orderData).toString()
                });

                // Wait for processing
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Show success message
                const successPopup = document.getElementById('success-popup');
                if (successPopup) {
                    document.getElementById('popup-order-code').textContent = orderData.orderCode;
                    document.getElementById('popup-customer-email').textContent = orderData.email;
                    successPopup.style.display = 'block';
                    successPopup.classList.add('show');

                    // Play success sound if available
                    const audio = new Audio('../sounds/success.mp3');
                    audio.play().catch(() => {});
                }

                // Clear cart data
                localStorage.removeItem('checkout-items');
                localStorage.removeItem('tnl-cart');

                // Redirect after 5 seconds
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 5000);

            } catch (error) {
                console.error('Submit error:', error);
                alert(error.message || 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại!');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalButtonText;
            }
        });
    }
});

// Helper function to format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// ...existing code...

document.getElementById('payment-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateForm(this)) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
            confirmButtonColor: '#FF9999'
        });
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    try {
        // ...existing data preparation code...

        // Hiển thị loading
        Swal.fire({
            title: 'Đang xử lý',
            html: 'Vui lòng đợi trong giây lát...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            }
        });

        // Gửi dữ liệu
        const response = await fetch('YOUR_GOOGLE_SCRIPT_URL', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(orderData).toString()
        });

        // Đóng loading và hiển thị thành công
        Swal.fire({
            icon: 'success',
            title: 'Đặt hàng thành công!',
            html: `
                <div style="text-align: left; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 10px 0;"><strong>Mã đơn hàng:</strong> ${orderData.orderNumber}</p>
                    <p style="margin: 10px 0;"><strong>Họ tên:</strong> ${orderData.name}</p>
                    <p style="margin: 10px 0;"><strong>Email:</strong> ${orderData.email}</p>
                    <p style="margin: 10px 0;"><strong>Số điện thoại:</strong> ${orderData.phone}</p>
                    <p style="margin: 10px 0;"><strong>Tổng tiền:</strong> ${orderData.total}</p>
                    <p style="margin: 10px 0; color: #28a745;">Đơn hàng của bạn đã được xác nhận!</p>
                </div>
            `,
            confirmButtonColor: '#FF9999',
            allowOutsideClick: false,
            timer: 5000,
            timerProgressBar: true
        }).then((result) => {
            localStorage.removeItem('checkout-items');
            localStorage.removeItem('tnl-cart');
            window.location.href = '../index.html';
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Có lỗi xảy ra!',
            text: 'Vui lòng thử lại sau.',
            confirmButtonColor: '#FF9999'
        });
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Xác nhận đặt hàng';
    }
});

// ...existing code...

document.addEventListener('DOMContentLoaded', function() {
    const checkoutData = loadCheckoutData();
    initializeShipping();
    initializePayment();
    updateOrderSummary();

    // Khởi tạo phương thức vận chuyển
    function initializeShipping() {
        const shippingOptions = document.querySelectorAll('.shipping-option');
        shippingOptions.forEach(option => {
            option.addEventListener('click', function() {
                shippingOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                const radio = this.querySelector('input[type="radio"]');
                radio.checked = true;
                updateShippingCost(radio.value);
            });
        });
    }

    // Khởi tạo phương thức thanh toán
    function initializePayment() {
        const paymentMethods = document.querySelectorAll('.payment-method');
        const bankInfoSection = document.getElementById('bank-info-section');

        paymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                paymentMethods.forEach(m => m.classList.remove('active'));
                this.classList.add('active');

                if (this.dataset.method === 'bank') {
                    bankInfoSection.style.display = 'block';
                    updateBankTransferInfo();
                } else {
                    bankInfoSection.style.display = 'none';
                }
            });
        });
    }

    // Cập nhật thông tin chuyển khoản
    function updateBankTransferInfo() {
        const orderTotal = document.getElementById('total').textContent;
        const orderCode = generateOrderCode();
        
        document.getElementById('transfer-amount').textContent = orderTotal;
        document.getElementById('order-code').textContent = orderCode;
        document.querySelector('[data-copy=""]').dataset.copy = orderCode;

        // Tạo mã QR động (giả lập)
        updateQRCode(orderTotal, orderCode);
    }

    // Xử lý nút copy
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.dataset.copy;
            navigator.clipboard.writeText(textToCopy)
                .then(() => showCopySuccess(this))
                .catch(() => alert('Không thể sao chép. Vui lòng sao chép thủ công.'));
        });
    });

    // Form submission
    document.getElementById('payment-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!validateForm()) return;

        showLoadingState();
        try {
            const orderData = collectOrderData();
            await submitOrder(orderData);
            showSuccessPopup(orderData);
            clearCart();
            redirectToHome();
        } catch (error) {
            showError('Có lỗi xảy ra khi xử lý đơn hàng');
        } finally {
            hideLoadingState();
        }
    });

    // Xử lý mã giảm giá
    document.getElementById('apply-discount').addEventListener('click', function() {
        const code = document.getElementById('discount-code').value.toUpperCase();
        const discountResult = applyDiscountCode(code);
        showDiscountResult(discountResult);
        updateOrderSummary();
    });
});

// Các hàm tiện ích
function showSuccessPopup(orderData) {
    const popup = document.getElementById('success-popup');
    popup.querySelector('#popup-order-code').textContent = orderData.orderCode;
    popup.querySelector('#popup-customer-email').textContent = orderData.email;
    
    popup.style.display = 'block';
    popup.classList.add('show');

    // Thêm âm thanh thông báo
    const audio = new Audio('../sounds/success.mp3');
    audio.play().catch(() => {});
}

function showLoadingState() {
    const submitBtn = document.querySelector('.btn-checkout');
    submitBtn.disabled = true;
    submitBtn.querySelector('.loading-text').style.display = 'inline-block';
    submitBtn.querySelector('span:not(.loading-text)').style.display = 'none';
}

// ...existing helper functions...

document.addEventListener('DOMContentLoaded', function() {
    // Constants and Utilities
    const DISCOUNT_CODES = {
        'TNL2024': { type: 'percent', value: 10 },
        'WELCOME': { type: 'percent', value: 15 },
        'VIP': { type: 'percent', value: 20 }
    };

    // Initialize elements
    const form = document.getElementById('payment-form');
    const shippingOptions = document.querySelectorAll('.shipping-option');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const bankInfoSection = document.getElementById('bank-info-section');
    const checkoutProducts = document.getElementById('checkout-products');

    // Load and display initial cart items
    function loadCheckoutItems() {
        const cartItems = JSON.parse(localStorage.getItem('tnl-cart')) || [];
        let subtotal = 0;
        
        if (cartItems.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        const productsHTML = cartItems.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return `
                <div class="product-item">
                    <img src="${item.image}" alt="${item.name}" class="product-image">
                    <div class="product-info">
                        <h4>${item.name}</h4>
                        <div class="price">${formatCurrency(item.price)}</div>
                        <div class="quantity">Số lượng: ${item.quantity}</div>
                        <div class="item-total">Tổng: ${formatCurrency(itemTotal)}</div>
                    </div>
                </div>
            `;
        }).join('');

        checkoutProducts.innerHTML = productsHTML;
        updateOrderSummary(subtotal);
    }

    // Shipping method selection
    shippingOptions.forEach(option => {
        option.addEventListener('click', function() {
            shippingOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                updateOrderSummary();
            }
        });
    });

    // Payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            if (this.dataset.method === 'bank') {
                bankInfoSection.style.display = 'block';
                updateBankInfo();
            } else {
                bankInfoSection.style.display = 'none';
            }
        });
    });

    // Form validation
    function validateForm() {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateInput(input) {
        const errorElement = input.parentElement.querySelector('.error-message');
        let isValid = true;
        let errorMessage = '';

        if (!input.value.trim()) {
            isValid = false;
            errorMessage = 'Vui lòng điền thông tin này';
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
            isValid = false;
            errorMessage = 'Email không hợp lệ';
        } else if (input.type === 'tel' && !isValidPhone(input.value)) {
            isValid = false;
            errorMessage = 'Số điện thoại không hợp lệ';
        }

        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = isValid ? 'none' : 'block';
        }
        
        input.classList.toggle('is-invalid', !isValid);
        return isValid;
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            showAlert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

        try {
            const orderData = collectOrderData();
            await processOrder(orderData);
            showSuccessPopup(orderData);
            clearCart();
            
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 5000);
        } catch (error) {
            showAlert('Có lỗi xảy ra khi xử lý đơn hàng');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Xác nhận đặt hàng';
        }
    });

    // Initialize page
    loadCheckoutItems();
    setupEventListeners();
});

// ... existing helper functions ...

function loadCheckoutItems() {
    // Lấy dữ liệu từ localStorage
    const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
    const checkoutProducts = document.getElementById('checkout-products');
    
    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    // Hiển thị sản phẩm
    checkoutProducts.innerHTML = checkoutData.items.map(item => `
        <div class="product-item">
            <img src="${item.image}" alt="${item.name}" class="product-image">
            <div class="product-details">
                <h4 class="product-name">${item.name}</h4>
                <div class="product-quantity">Số lượng: ${item.quantity}</div>
                <div class="product-price">${formatCurrency(item.price)} x ${item.quantity}</div>
                <div class="product-subtotal">Tổng: ${formatCurrency(item.price * item.quantity)}</div>
            </div>
        </div>
    `).join('');

    // Cập nhật tổng tiền
    updateOrderSummary({
        subtotal: checkoutData.totals.subtotal,
        shipping: checkoutData.totals.shipping || 0,
        discount: checkoutData.totals.discount || 0
    });
}

function updateOrderSummary(totals) {
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping-cost');
    const discountEl = document.getElementById('discount-amount');
    const totalEl = document.getElementById('total');
    const discountLine = document.getElementById('discount-line');

    subtotalEl.textContent = formatCurrency(totals.subtotal);
    shippingEl.textContent = totals.shipping > 0 ? formatCurrency(totals.shipping) : 'Miễn phí';

    if (totals.discount > 0) {
        discountLine.style.display = 'flex';
        discountEl.textContent = `-${formatCurrency(totals.discount)}`;
    } else {
        discountLine.style.display = 'none';
    }

    const finalTotal = totals.subtotal + (totals.shipping || 0) - (totals.discount || 0);
    totalEl.textContent = formatCurrency(finalTotal);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// ...existing code...

function loadCheckoutItems() {
    const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
    const checkoutProducts = document.getElementById('checkout-products');
    
    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    // Lưu dữ liệu vào biến global để sử dụng cho việc tính toán sau này
    window.checkoutItems = checkoutData.items;
    window.orderTotals = {
        subtotal: calculateSubtotal(checkoutData.items),
        shipping: 0,
        discount: 0
    };

    // Hiển thị sản phẩm
    checkoutProducts.innerHTML = checkoutData.items.map(item => `
        <div class="product-item">
            <img src="${item.image}" alt="${item.name}" class="product-image">
            <div class="product-info">
                <h4>${item.name}</h4>
                <div class="price">${formatCurrency(item.price)}</div>
                <div class="quantity">Số lượng: ${item.quantity}</div>
                <div class="item-total">Tổng: ${formatCurrency(item.price * item.quantity)}</div>
            </div>
        </div>
    `).join('');

    updateOrderSummary();
}

function calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateOrderSummary() {
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping-cost');
    const discountEl = document.getElementById('discount-amount');
    const totalEl = document.getElementById('total');
    const discountLine = document.getElementById('discount-line');

    // Cập nhật tạm tính
    subtotalEl.textContent = formatCurrency(window.orderTotals.subtotal);

    // Cập nhật phí ship
    shippingEl.textContent = window.orderTotals.shipping > 0 
        ? formatCurrency(window.orderTotals.shipping) 
        : 'Miễn phí';

    // Cập nhật giảm giá
    if (window.orderTotals.discount > 0) {
        discountLine.style.display = 'flex';
        discountEl.textContent = `-${formatCurrency(window.orderTotals.discount)}`;
    } else {
        discountLine.style.display = 'none';
    }

    // Tính và cập nhật tổng tiền
    const total = window.orderTotals.subtotal + window.orderTotals.shipping - window.orderTotals.discount;
    totalEl.textContent = formatCurrency(total);

    // Cập nhật số tiền chuyển khoản nếu đang hiển thị
    const transferAmount = document.getElementById('transfer-amount');
    if (transferAmount) {
        transferAmount.textContent = formatCurrency(total);
    }
}

// Xử lý khi thay đổi phương thức vận chuyển 
document.querySelectorAll('input[name="shippingMethod"]').forEach(input => {
    input.addEventListener('change', function() {
        const shippingCosts = {
            'standard': 0,
            'express': 50000,
            'special': 100000
        };
        
        window.orderTotals.shipping = shippingCosts[this.value] || 0;
        updateOrderSummary();
    });
});

// Xử lý mã giảm giá
document.getElementById('apply-discount').addEventListener('click', function() {
    const code = document.getElementById('discount-code').value.toUpperCase();
    const discountMessage = document.getElementById('discount-message');
    
    const discountCodes = {
        'TNL2024': 10,
        'WELCOME': 15, 
        'VIP': 20
    };

    if (discountCodes.hasOwnProperty(code)) {
        const discountPercent = discountCodes[code];
        const discountAmount = (window.orderTotals.subtotal * discountPercent) / 100;
        
        window.orderTotals.discount = discountAmount;
        discountMessage.textContent = `Áp dụng mã giảm giá ${discountPercent}% thành công!`;
        discountMessage.style.color = '#28a745';
    } else {
        window.orderTotals.discount = 0;
        discountMessage.textContent = 'Mã giảm giá không hợp lệ!';
        discountMessage.style.color = '#dc3545';
    }
    
    discountMessage.style.display = 'block';
    updateOrderSummary();
});

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// ...existing code...

// Biến global để lưu trữ thông tin tính toán
let orderTotals = {
    subtotal: 0,
    shipping: 0, 
    discount: 0,
    total: 0
};

// Hàm tải và hiển thị sản phẩm từ giỏ hàng
function loadCheckoutItems() {
    const checkoutData = JSON.parse(localStorage.getItem('checkout-items'));
    const checkoutProducts = document.getElementById('checkout-products');
    
    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    // Tính tổng tiền ban đầu
    orderTotals.subtotal = checkoutData.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);

    // Hiển thị sản phẩm
    checkoutProducts.innerHTML = checkoutData.items.map(item => `
        <div class="product-item">
            <img src="${item.image}" alt="${item.name}" class="product-image">
            <div class="product-info">
                <h4>${item.name}</h4>
                <div class="price">${formatCurrency(item.price)}</div>
                <div class="quantity">Số lượng: ${item.quantity}</div>
                <div class="item-total">Tổng: ${formatCurrency(item.price * item.quantity)}</div>
            </div>
        </div>
    `).join('');

    updateOrderSummary();
}

// Hàm cập nhật tổng tiền khi thay đổi phương thức vận chuyển
function updateShippingCost(shippingMethod) {
    const shippingCosts = {
        'standard': 0,
        'express': 50000,
        'special': 100000
    };
    
    orderTotals.shipping = shippingCosts[shippingMethod] || 0;
    updateOrderSummary();
}

// Hàm áp dụng mã giảm giá
function applyDiscountCode(code) {
    const discountCodes = {
        'TNL2024': 10, // Giảm 10%
        'WELCOME': 15, // Giảm 15%
        'VIP': 20      // Giảm 20%
    };

    const discountMessage = document.getElementById('discount-message');
    const discountPercent = discountCodes[code];

    if (discountPercent) {
        orderTotals.discount = (orderTotals.subtotal * discountPercent) / 100;
        discountMessage.textContent = `Đã áp dụng mã giảm giá ${discountPercent}%`;
        discountMessage.style.color = '#28a745';
    } else {
        orderTotals.discount = 0;
        discountMessage.textContent = 'Mã giảm giá không hợp lệ';
        discountMessage.style.color = '#dc3545';
    }

    updateOrderSummary();
}

// Hàm cập nhật hiển thị tổng tiền
function updateOrderSummary() {
    // Cập nhật tạm tính
    document.getElementById('subtotal').textContent = formatCurrency(orderTotals.subtotal);
    
    // Cập nhật phí vận chuyển
    document.getElementById('shipping-cost').textContent = 
        orderTotals.shipping > 0 ? formatCurrency(orderTotals.shipping) : 'Miễn phí';
    
    // Cập nhật giảm giá
    const discountLine = document.getElementById('discount-line');
    if (orderTotals.discount > 0) {
        discountLine.style.display = 'flex';
        document.getElementById('discount-amount').textContent = 
            `-${formatCurrency(orderTotals.discount)}`;
    } else {
        discountLine.style.display = 'none';
    }
    
    // Tính và cập nhật tổng tiền
    orderTotals.total = orderTotals.subtotal + orderTotals.shipping - orderTotals.discount;
    document.getElementById('total').textContent = formatCurrency(orderTotals.total);

    // Cập nhật số tiền trong phần thanh toán chuyển khoản nếu được chọn
    const transferAmount = document.getElementById('transfer-amount');
    if (transferAmount) {
        transferAmount.textContent = formatCurrency(orderTotals.total);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadCheckoutItems();

    // Xử lý thay đổi phương thức vận chuyển
    document.querySelectorAll('input[name="shippingMethod"]').forEach(input => {
        input.addEventListener('change', function() {
            updateShippingCost(this.value);
        });
    });

    // Xử lý nút áp dụng mã giảm giá
    document.getElementById('apply-discount')?.addEventListener('click', function() {
        const code = document.getElementById('discount-code').value.trim().toUpperCase();
        applyDiscountCode(code);
    });
});

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// ...existing code...

// Cập nhật URL Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQWE8ZLBCra2gLia8X3S9yaYFVE3xHZi6gxcimDQsSu6KpOH4Gngi44A1FrqAcSgTS/exec';

async function submitOrder(formData) {
    try {
        // Chuẩn bị dữ liệu đơn hàng
        const orderData = {
            timestamp: new Date().toLocaleString('vi-VN'),
            orderCode: generateOrderCode(),
            customerName: formData.get('name'),
            customerEmail: formData.get('email'),
            customerPhone: formData.get('phone'),
            customerAddress: formData.get('address'),
            shipping: getSelectedShipping(),
            payment: getSelectedPayment(),
            items: formatOrderItems(),
            subtotal: document.getElementById('subtotal').textContent,
            shippingCost: document.getElementById('shipping-cost').textContent,
            discount: document.getElementById('discount-amount')?.textContent || '0₫',
            total: document.getElementById('total').textContent,
            status: 'Đang xử lý'
        };

        showLoadingOverlay('Đang xử lý đơn hàng...');

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        // Đợi 2 giây để đảm bảo dữ liệu được gửi
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            success: true,
            orderNumber: orderData.orderCode,
            customerEmail: orderData.customerEmail
        };

    } catch (error) {
        console.error('Submit error:', error);
        throw new Error('Có lỗi xảy ra khi xử lý đơn hàng');
    } finally {
        hideLoadingOverlay();
    }
}

// Hàm hiển thị loading
function showLoadingOverlay(message = 'Đang xử lý...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <i class="fas fa-spinner fa-spin fa-3x"></i>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Hàm lấy thông tin shipping đã chọn
function getSelectedShipping() {
    const selectedOption = document.querySelector('input[name="shippingMethod"]:checked');
    if (!selectedOption) return null;
    
    const label = selectedOption.closest('.shipping-option').querySelector('strong').textContent;
    const price = selectedOption.closest('.shipping-option').querySelector('.shipping-price').textContent;
    
    return {
        method: selectedOption.value,
        label: label,
        price: price
    };
}

// Hàm lấy thông tin payment đã chọn
function getSelectedPayment() {
    const selectedMethod = document.querySelector('.payment-method.active');
    return selectedMethod ? selectedMethod.querySelector('div').textContent : null;
}

// Hàm format danh sách sản phẩm
function formatOrderItems() {
    const items = JSON.parse(localStorage.getItem('checkout-items')).items;
    return items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
    }));
}

// Thêm event listener cho form
document.getElementById('payment-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateForm(this)) {
        showError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.querySelector('.loading-text').style.display = 'inline-block';

    try {
        const formData = new FormData(this);
        const result = await submitOrder(formData);
        
        if (result.success) {
            showSuccessPopup({
                orderNumber: result.orderNumber,
                customerEmail: result.customerEmail
            });
            
            // Xóa giỏ hàng
            localStorage.removeItem('checkout-items');
            localStorage.removeItem('tnl-cart');

            // Chuyển về trang chủ sau 5 giây
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 5000);
        }
    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('.loading-text').style.display = 'none';
    }
});

// ...existing code...

function showSuccessPopup(orderData) {
    const popup = document.getElementById('success-popup');
    if (popup) {
        // Cập nhật thông tin đơn hàng
        document.getElementById('popup-order-code').textContent = orderData.orderNumber;
        document.getElementById('popup-customer-email').textContent = orderData.customerEmail;
        document.getElementById('popup-customer-email-2').textContent = orderData.customerEmail;
        
        // Hiển thị popup
        popup.style.display = 'block';
        popup.classList.add('show');

        // Bắt đầu đếm ngược
        let countdown = 5;
        const countdownElement = document.getElementById('countdown');
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        // Thêm hiệu ứng âm thanh thông báo
        try {
            const audio = new Audio('../sounds/success.mp3');
            audio.play();
        } catch(e) {
            console.log('Sound not available');
        }
    }
}

// ...existing code...

document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    
    // Định nghĩa chi phí vận chuyển
    const SHIPPING_COSTS = {
        'standard': 0,
        'express': 50000,
        'special': 100000
    };

    // Cập nhật khi chọn phương thức vận chuyển
    const shippingOptions = document.querySelectorAll('.shipping-option');
    shippingOptions.forEach(option => {
        option.addEventListener('click', function() {
            const shippingMethod = this.querySelector('input[type="radio"]').value;
            updateShippingCost(shippingMethod);
        });
    });

    function updateShippingCost(method) {
        const shippingCost = SHIPPING_COSTS[method] || 0;
        const subtotalAmount = parseFloat(document.getElementById('subtotal').textContent.replace(/[^\d]/g, ''));
        const discountAmount = parseFloat(document.getElementById('discount-amount')?.textContent.replace(/[^\d]/g, '') || 0);

        // Cập nhật hiển thị phí vận chuyển
        document.getElementById('shipping-cost').textContent = 
            shippingCost === 0 ? 'Miễn phí' : formatCurrency(shippingCost);

        // Tính tổng tiền mới
        const totalAmount = subtotalAmount + shippingCost - discountAmount;
        document.getElementById('total').textContent = formatCurrency(totalAmount);

        // Cập nhật số tiền trong phần thanh toán chuyển khoản nếu được chọn
        const transferAmount = document.getElementById('transfer-amount');
        if (transferAmount) {
            transferAmount.textContent = formatCurrency(totalAmount);
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    // Khởi tạo với phương thức vận chuyển mặc định
    const defaultShipping = document.querySelector('input[name="shippingMethod"]:checked');
    if (defaultShipping) {
        updateShippingCost(defaultShipping.value);
    }

    // ...existing code...
});
