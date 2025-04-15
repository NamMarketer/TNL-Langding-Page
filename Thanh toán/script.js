document.addEventListener('DOMContentLoaded', function() {

    // ========== MENU TOGGLE (HAMBURGER) LOGIC ==========
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if (menuToggle && mobileNav) {
        // ... (giữ nguyên logic menu toggle) ...
        menuToggle.addEventListener('click', function() {
            const isActive = mobileNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
            const icon = menuToggle.querySelector('i');
            if (icon) { icon.className = isActive ? 'fas fa-times' : 'fas fa-bars'; }
        });
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNav.classList.contains('active')) {
                    mobileNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    const icon = menuToggle.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                }
            });
        });
        document.addEventListener('click', function(event) {
            if (!mobileNav.contains(event.target) && !menuToggle.contains(event.target)) {
                if (mobileNav.classList.contains('active')) {
                    mobileNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    const icon = menuToggle.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                }
            }
        });
    }

    // ========== PRODUCT SLIDER LOGIC ==========
    const sliderWrapper = document.querySelector('.slider-wrapper');
    if (sliderWrapper) {
        // ... (giữ nguyên logic slider) ...
        const sliderContainer = sliderWrapper.querySelector('.slider-container');
        const slider = sliderContainer ? sliderContainer.querySelector('.slider') : null;
        const originalSlides = slider ? Array.from(slider.querySelectorAll('.product-item')) : [];
        const prevButton = sliderWrapper.querySelector('.slider-btn.prev-btn');
        const nextButton = sliderWrapper.querySelector('.slider-btn.next-btn');
        if (slider && originalSlides.length > 0 && sliderContainer) {
            const originalTotalSlides = originalSlides.length;
            let isTransitioning = false;
            let autoSlideInterval;
            let allSlidesWithClones = [...originalSlides];
            let totalSlidesWithClones = originalTotalSlides;
            let currentSlideIndex = 0;
            if (originalTotalSlides > 1) {
                const firstClone = originalSlides[0].cloneNode(true);
                const lastClone = originalSlides[originalTotalSlides - 1].cloneNode(true);
                firstClone.classList.add('slide-clone');
                lastClone.classList.add('slide-clone');
                slider.appendChild(firstClone);
                slider.insertBefore(lastClone, slider.firstElementChild);
                allSlidesWithClones = Array.from(slider.querySelectorAll('.product-item'));
                totalSlidesWithClones = allSlidesWithClones.length;
                currentSlideIndex = 1;
            } else {
                 if(prevButton) prevButton.style.display = 'none';
                 if(nextButton) nextButton.style.display = 'none';
            }
            function centerSlide(index, smooth = true) { if (index < 0 || index >= totalSlidesWithClones || !allSlidesWithClones[index]) return; const csw = sliderContainer.offsetWidth; const tvp = index * csw; slider.style.transition = smooth ? 'transform 0.5s ease-in-out' : 'none'; slider.style.transform = `translateX(-${tvp}px)`; }
            function handleInfiniteLoopJump() { if (originalTotalSlides <= 1) return; let j = false; if (currentSlideIndex === 0) { currentSlideIndex = originalTotalSlides; j = true; } else if (currentSlideIndex === totalSlidesWithClones - 1) { currentSlideIndex = 1; j = true; } if (j) { setTimeout(() => { centerSlide(currentSlideIndex, false); isTransitioning = false; }, 10); } else { isTransitioning = false; } }
            function moveToSlide(targetIndex) { if (isTransitioning || originalTotalSlides <= 1) return; isTransitioning = true; currentSlideIndex = targetIndex; centerSlide(currentSlideIndex, true); const teh = (e) => { if (e.propertyName !== 'transform' || e.target !== slider) return; handleInfiniteLoopJump(); slider.removeEventListener('transitionend', teh); }; slider.addEventListener('transitionend', teh); setTimeout(() => { if (isTransitioning) { handleInfiniteLoopJump(); slider.removeEventListener('transitionend', teh); } }, 600); }
            function startAutoSlide() { stopAutoSlide(); if (originalTotalSlides <= 1) return; autoSlideInterval = setInterval(() => moveToSlide(currentSlideIndex + 1), 4000); }
            function stopAutoSlide() { clearInterval(autoSlideInterval); }
            if (originalTotalSlides > 1) { sliderWrapper.addEventListener('mouseenter', stopAutoSlide); sliderWrapper.addEventListener('mouseleave', startAutoSlide); if (prevButton) prevButton.addEventListener('click', () => { if (!isTransitioning) { stopAutoSlide(); moveToSlide(currentSlideIndex - 1); } }); if (nextButton) nextButton.addEventListener('click', () => { if (!isTransitioning) { stopAutoSlide(); moveToSlide(currentSlideIndex + 1); } }); let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => centerSlide(currentSlideIndex, false), 150); }); }
            requestAnimationFrame(() => { centerSlide(currentSlideIndex, false); if (originalTotalSlides > 1) { startAutoSlide(); if(prevButton) prevButton.style.display = 'flex'; if(nextButton) nextButton.style.display = 'flex'; } else { if(prevButton) prevButton.style.display = 'none'; if(nextButton) nextButton.style.display = 'none'; } });
        } else { if (prevButton) prevButton.style.display = 'none'; if (nextButton) nextButton.style.display = 'none'; }
    }

    // ========== COUNTDOWN TIMER LOGIC ==========
    // ** Lưu ý: Đổi thành const registrationForm = document.getElementById('myForm'); **
    const countdownDisplayContainer = document.getElementById('countdown-timer-display');
    if (countdownDisplayContainer) {
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        const hoursLeftElement = document.getElementById('hours-left');
        const discountFormForCountdown = document.getElementById('myForm'); // Sử dụng đúng ID form
        if (hoursElement && minutesElement && secondsElement && discountFormForCountdown) {
            // Đổi thành 3 giờ như yêu cầu trước đó
             const countdownDurationHours = 3; // Giữ nguyên 3 giờ
             let targetTimeString = localStorage.getItem('countdownTargetTime'); let targetTime;
             if (targetTimeString) { targetTime = parseInt(targetTimeString, 10); if (isNaN(targetTime) || targetTime < new Date().getTime() - 10000) { targetTime = new Date().getTime() + countdownDurationHours * 60 * 60 * 1000; localStorage.setItem('countdownTargetTime', targetTime); } } else { targetTime = new Date().getTime() + countdownDurationHours * 60 * 60 * 1000; localStorage.setItem('countdownTargetTime', targetTime); }
             let countdownInterval;
             function updateCountdown() { const now = new Date().getTime(); const timeRemaining = targetTime - now; if (timeRemaining <= 0) { clearInterval(countdownInterval); countdownDisplayContainer.innerHTML = "<p style='font-size: 1.2em; font-weight: bold; color: #FFCCCC;'>Ưu đãi đã kết thúc!</p>"; const fn = discountFormForCountdown.parentElement.querySelector('.form-note'); if (fn) fn.style.display = 'none'; const fb = discountFormForCountdown.querySelector('button[type="submit"]'); if (fb) { fb.disabled = true; fb.textContent = "Đã Hết Hạn"; fb.style.backgroundColor = '#aaa'; fb.style.cursor = 'not-allowed'; } const ins = discountFormForCountdown.querySelectorAll('input'); ins.forEach(i => i.disabled = true); localStorage.removeItem('countdownTargetTime'); return; } const h = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); const m = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)); const s = Math.floor((timeRemaining % (1000 * 60)) / 1000); hoursElement.textContent = String(h).padStart(2, '0'); minutesElement.textContent = String(m).padStart(2, '0'); secondsElement.textContent = String(s).padStart(2, '0'); if (hoursLeftElement) { const hl = Math.ceil(timeRemaining / (1000 * 60 * 60)); hoursLeftElement.textContent = hl; } }
             updateCountdown(); countdownInterval = setInterval(updateCountdown, 1000);
        } else { countdownDisplayContainer.style.display = 'none'; const fn = document.querySelector('.form-note'); if (fn) fn.style.display = 'none'; }
    }


    // ========== FORM HANDLING LOGIC ==========
    // ** Lưu ý: Đổi URL và ID input/form cho đúng **
    const URL_FORM_DANG_KY_UU_DAI = "https://script.google.com/macros/s/AKfycbxrnCxZ7WfxLyU7S7RorgGqPikF6Ag169Q-9mIgUw46ka4zcO53j4zpoinwbkuLcCXglg/exec"; // URL mới
    const URL_FORM_LIEN_HE_KHAC = "YOUR_OTHER_GOOGLE_SCRIPT_URL_HERE";
    const discountFormElem = document.getElementById("myForm"); // Đúng ID form
    if (discountFormElem) {
        // ... (giữ nguyên logic form đăng ký đã sửa) ...
        discountFormElem.addEventListener("submit", function(event) {
            event.preventDefault(); const sb = discountFormElem.querySelector('button[type="submit"]');
            const ni = document.getElementById("name"); // Đúng ID input
            const ei = document.getElementById("email"); // Đúng ID input
            const pi = document.getElementById("phone"); // Đúng ID input
            const n = ni ? ni.value.trim() : '';
            const e = ei ? ei.value.trim() : '';
            const p = pi ? pi.value.trim() : '';
            if (!e || !ei.checkValidity()) { alert("Vui lòng nhập địa chỉ email hợp lệ."); if (ei) ei.focus(); return; }
            if (sb) { sb.disabled = true; sb.textContent = 'Đang gửi...'; }
            var d = { name: n, email: e, phone: p, formSource: 'Discount Registration' }; // Thêm formSource nếu cần
            fetch(URL_FORM_DANG_KY_UU_DAI, { method: "POST", mode: "no-cors", body: JSON.stringify(d), headers: { "Content-Type": "application/json" } })
            .then(() => { alert("Thông tin đã được gửi!"); discountFormElem.reset(); }) // Thông báo mới
            .catch(err => { console.error("Lỗi:", err); alert("Có lỗi xảy ra, vui lòng thử lại."); }) // Thông báo mới
            .finally(() => { if (sb) { const tia = localStorage.getItem('countdownTargetTime') && parseInt(localStorage.getItem('countdownTargetTime'), 10) > new Date().getTime(); if (tia) { sb.disabled = false; sb.textContent = 'Submit'; } else { sb.disabled = true; sb.textContent = "Đã Hết Hạn"; sb.style.backgroundColor = '#aaa'; sb.style.cursor = 'not-allowed'; } } });
        });
    }
    // const heroCollectionForm = document.getElementById('hero-collection-form'); // Giữ nếu có form khác
    // if (heroCollectionForm && URL_FORM_LIEN_HE_KHAC !== "YOUR_OTHER_GOOGLE_SCRIPT_URL_HERE") { /* ... */ }


    // ========== CHAT BOX TOGGLE LOGIC ==========
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    if (chatToggle && chatWindow && closeChat) {
        // ... (giữ nguyên logic chat box) ...
        chatToggle.addEventListener('click', () => { chatWindow.classList.add('open'); chatToggle.style.display = 'none'; const ci = chatWindow.querySelector('.chat-input input'); if(ci) ci.focus(); });
        closeChat.addEventListener('click', () => { chatWindow.classList.remove('open'); setTimeout(() => { chatToggle.style.display = 'flex'; }, 300); });
    }

    // ========== UPDATE COPYRIGHT YEAR ==========
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        try { yearSpan.textContent = new Date().getFullYear(); }
        catch (e) { console.warn("Could not get current date"); /* Giữ nguyên năm mặc định */ }
    }

    // ========== HANDLE "BUY NOW" BUTTON CLICKS (Landing Page) ==========
    // (Code xử lý nút Mua Ngay đã thêm ở bước trước - giữ nguyên)
    const buyNowButtons = document.querySelectorAll('#product-showcase .slider .product-item .btn-buy');
    const paymentPageUrl = 'Thanh toán/TRANG THANH TOÁN.html'; // Đường dẫn đến trang thanh toán

    buyNowButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productItem = this.closest('.product-item');
            if (!productItem) { console.error("Could not find parent product item for button:", this); return; }
            let productName = productItem.dataset.productName;
            let productImage = productItem.dataset.productImage;
            let productPrice = productItem.dataset.productPrice || '0';
            if (!productName) { const nameElement = productItem.querySelector('h3'); productName = nameElement ? nameElement.textContent.trim() : 'Unknown Product'; }
            if (!productImage) { const imgElement = productItem.querySelector('img'); productImage = imgElement ? imgElement.getAttribute('src') : ''; }
             if (!productName || productName === 'Unknown Product') { console.warn("Product name could not be determined for:", productItem); return; }
            const encodedName = encodeURIComponent(productName);
            const encodedImage = encodeURIComponent(productImage);
            const encodedPrice = encodeURIComponent(productPrice);
            const finalUrl = `${paymentPageUrl}?name=${encodedName}&image=${encodedImage}&price=${encodedPrice}`;
            console.log("Redirecting to:", finalUrl);
            window.location.href = finalUrl;
        });
    });
    // ========== END HANDLE "BUY NOW" BUTTON CLICKS ==========


    // ========== CHECKOUT PAGE SPECIFIC LOGIC ==========
    const checkoutForm = document.getElementById('shipping-form'); // ID form checkout
    if (checkoutForm) {

        // ******** INSERTED CODE: READ URL PARAMS AND DISPLAY PRODUCT ********
        // Lấy các tham số từ URL
        const urlParams = new URLSearchParams(window.location.search);

        // Lấy giá trị của từng tham số (đã được tự động giải mã bởi URLSearchParams)
        const productName = urlParams.get('name');
        const productImage = urlParams.get('image');
        const productPrice = urlParams.get('price'); // Đây là giá trị chuỗi

        // Log để kiểm tra
        console.log("Checkout Page - Product Name:", productName);
        console.log("Checkout Page - Product Image:", productImage);
        console.log("Checkout Page - Product Price:", productPrice);

        // --- Hiển thị thông tin sản phẩm lên trang thanh toán ---
        // **QUAN TRỌNG:** Thay thế các ID ('#product-name-display', v.v.)
        // bằng ID thực tế của các phần tử HTML trên trang thanh toán của bạn.
        const nameDisplayElement = document.getElementById('product-name-display'); // Ví dụ ID
        const imageDisplayElement = document.getElementById('product-image-display'); // Ví dụ ID
        const priceDisplayElement = document.getElementById('product-price-display'); // Ví dụ ID hiển thị giá đơn lẻ
        const priceInputElement = document.getElementById('hidden-price-input'); // Ví dụ ID cho input ẩn giá trị số
        const summarySubtotalElem = document.getElementById('summary-subtotal'); // ID của phần Tạm tính trong tóm tắt
        const orderSummaryItemsContainer = document.getElementById('order-summary-items'); // ID container chứa item trong tóm tắt

        // --- Cập nhật phần hiển thị chi tiết sản phẩm (nếu có) ---
        if (productName && nameDisplayElement) {
            nameDisplayElement.textContent = productName;
        }
        if (productImage && imageDisplayElement) {
            imageDisplayElement.src = productImage;
            imageDisplayElement.alt = productName;
        }
        if (productPrice && priceDisplayElement) {
            const formattedPrice = parseFloat(productPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            priceDisplayElement.textContent = formattedPrice;
        }

        // --- Cập nhật Tóm tắt đơn hàng ---
        if (productName && orderSummaryItemsContainer) {
             // Xóa nội dung placeholder cũ (nếu có)
             orderSummaryItemsContainer.innerHTML = '';

             // Tạo HTML cho sản phẩm duy nhất này trong tóm tắt
             const itemHTML = `
                 <div class="summary-item">
                     <img src="${productImage || 'https://placehold.co/60x60/eee/ccc?text=IMG'}" alt="${productName}" class="summary-item-image">
                     <div class="summary-item-details">
                         <span class="summary-item-name">${productName}</span>
                         <span class="summary-item-quantity">SL: 1</span>
                     </div>
                     <span class="summary-item-price">${parseFloat(productPrice || '0').toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                 </div>
             `;
             orderSummaryItemsContainer.innerHTML = itemHTML; // Hiển thị sản phẩm này
        }

        // --- Cập nhật giá trị Tạm tính và Input ẩn (nếu cần) ---
         const numericPrice = parseFloat(productPrice || '0'); // Chuyển giá thành số

         if (summarySubtotalElem) {
            summarySubtotalElem.textContent = numericPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
         }
         if (priceInputElement) {
             priceInputElement.value = numericPrice; // Gán giá trị số vào input ẩn
         }
         // ******** END INSERTED CODE ********


        // ... (giữ nguyên logic trang checkout còn lại) ...
        const paymentRadios = document.querySelectorAll('input[name="payment_method"]'); const paymentContents = document.querySelectorAll('.payment-content'); const paymentDetailsContainer = document.getElementById('payment-details'); paymentRadios.forEach(r => { r.addEventListener('change', function() { const tid = this.getAttribute('data-target'); paymentContents.forEach(c => c.classList.remove('active')); const tc = document.getElementById(tid); if (tc) { tc.classList.add('active'); } }); }); const icp = document.querySelector('input[name="payment_method"]:checked'); if (icp) { icp.dispatchEvent(new Event('change')); }
        const provinceSelect = document.getElementById('checkout-province'); const districtSelect = document.getElementById('checkout-district'); if (provinceSelect && districtSelect) { provinceSelect.addEventListener('change', function() { const sp = this.value; districtSelect.innerHTML = '<option value="">-- Chọn Quận/Huyện --</option>'; if (sp === 'hcm') { districtSelect.innerHTML += '<option value="q1">Quận 1</option><option value="q3">Quận 3</option><option value="tb">Tân Bình</option>'; } else if (sp === 'dn') { districtSelect.innerHTML += '<option value="bh">Biên Hòa</option><option value="lk">Long Khánh</option>'; } else if (sp === 'hn') { districtSelect.innerHTML += '<option value="hbt">Hai Bà Trưng</option><option value="đd">Đống Đa</option><option value="tx">Thanh Xuân</option>'; } districtSelect.disabled = !sp; }); districtSelect.disabled = true; }
        const shippingRadios = document.querySelectorAll('input[name="shipping_method"]'); const summaryShippingCostElem = document.getElementById('summary-shipping'); const summaryGrandTotalElem = document.getElementById('summary-grand-total'); /* Subtotal lấy ở trên */ function formatCurrency(a) { return a.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); } function updateTotals() { const s = parseFloat(summarySubtotalElem?.textContent.replace(/[^0-9]/g, '') || '0'); const ss = document.querySelector('input[name="shipping_method"]:checked'); let sc = 0; if (ss) { const cs = ss.closest('.radio-label').querySelector('.shipping-cost'); if (cs) { sc = parseFloat(cs.textContent.replace(/[^0-9]/g, '')) || 0; } } const promoDiscountElem = document.getElementById('summary-discount'); const d = parseFloat(promoDiscountElem?.textContent.replace(/[^0-9]/g, '') || '0'); const gt = s + sc - d; if (summaryShippingCostElem) { summaryShippingCostElem.textContent = formatCurrency(sc); } if (summaryGrandTotalElem) { summaryGrandTotalElem.textContent = formatCurrency(gt); } } shippingRadios.forEach(r => { r.addEventListener('change', updateTotals); });
        const applyPromoButton = document.querySelector('.apply-promo-button'); const promoCodeInput = document.getElementById('promo-code'); const discountRow = document.querySelector('.discount-row'); const discountAmountElem = document.getElementById('summary-discount'); if (applyPromoButton && promoCodeInput) { applyPromoButton.addEventListener('click', function() { const c = promoCodeInput.value.trim().toUpperCase(); if (!c) return; let ad = 0; if (c === 'TNL20') { ad = 50000; alert('Áp dụng mã giảm giá TNL20 thành công!'); if (discountRow) discountRow.style.display = 'flex'; if (discountAmountElem) discountAmountElem.textContent = `- ${formatCurrency(ad)}`; } else { alert('Mã giảm giá không hợp lệ hoặc đã hết hạn.'); if (discountRow) discountRow.style.display = 'none'; if (discountAmountElem) discountAmountElem.textContent = `- ${formatCurrency(0)}`; } updateTotals(); }); }
        // const orderSummaryItemsContainer = document.getElementById('order-summary-items'); // Đã lấy ở trên
        // if (orderSummaryItemsContainer) {
        //      // Logic hiển thị item đã được xử lý ở phần code chèn vào ở trên
        //     // orderSummaryItemsContainer.innerHTML = '<p style="text-align: center; color: #888;"><i>Giỏ hàng đang trống hoặc đang tải...</i></p>';
        //     /* TODO: Cần xử lý trường hợp người dùng đi từ trang giỏ hàng đến đây (có thể có nhiều item) */
        // }
        updateTotals(); // Gọi updateTotals sau khi đã cập nhật Tạm tính từ URL param
        checkoutForm.addEventListener('submit', function(event) { event.preventDefault(); const n = document.getElementById('checkout-name').value.trim(); const p = document.getElementById('checkout-phone').value.trim(); const a = document.getElementById('checkout-address').value.trim(); const pv = document.getElementById('checkout-province').value; const d = document.getElementById('checkout-district').value; if (!n || !p || !a || !pv || !d) { alert('Vui lòng điền đầy đủ thông tin giao hàng bắt buộc (*).'); return; } const pob = document.querySelector('.place-order-button'); if (pob) { pob.disabled = true; pob.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...'; } console.log('Form Data Submitted (Demo):', { name:n, phone:p, address:a, province:pv, district:d, notes: document.getElementById('checkout-notes').value.trim(), shippingMethod: document.querySelector('input[name="shipping_method"]:checked')?.value, paymentMethod: document.querySelector('input[name="payment_method"]:checked')?.value, // Thêm thông tin sản phẩm từ URL vào đây nếu cần gửi đi
         orderedItem: { name: productName, image: productImage, price: productPrice, quantity: 1 } }); alert('Placeholder: Đặt hàng thành công! (Đây là bản demo, chưa gửi dữ liệu đi đâu).'); setTimeout(() => { if (pob) { pob.disabled = false; pob.innerHTML = '<i class="fas fa-check-circle"></i> Đặt Hàng'; } /* checkoutForm.submit(); */ }, 2000); }); // Thêm dấu } bị thiếu
    } // Đóng if (checkoutForm)


    // ========== CART PAGE SPECIFIC LOGIC ==========
    const cartPageContainer = document.querySelector('.cart-page-container');
    if (cartPageContainer) { // Chỉ chạy code này nếu ở trang giỏ hàng
        // ... (giữ nguyên logic trang cart) ...
        const cartItemsContainer = document.querySelector('.cart-items'); // ul chứa các li.cart-item
        const subtotalElement = document.querySelector('.subtotal-amount'); // span hiển thị tạm tính
        const itemCountElement = document.getElementById('cart-item-count'); // span đếm số sản phẩm ở tiêu đề
        const headerCartCount = document.querySelector('.header-actions .cart-count'); // Sửa selector cho đúng
        function formatCurrency(amount) { return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); }
        function updateCartSummary() { let subtotal = 0; let totalQuantity = 0; const items = cartItemsContainer ? cartItemsContainer.querySelectorAll('.cart-item') : []; items.forEach(item => { let priceText = item.querySelector('.cart-item-price span')?.textContent; if (!priceText) { priceText = item.querySelector('.item-price-mobile')?.textContent; } const price = parseFloat(priceText?.replace(/[^0-9]/g, '')) || 0; const quantityInput = item.querySelector('.quantity-input'); const quantity = parseInt(quantityInput?.value) || 0; if (!isNaN(price) && !isNaN(quantity) && quantity > 0) { subtotal += price * quantity; totalQuantity += quantity; } }); if (subtotalElement) { subtotalElement.textContent = formatCurrency(subtotal); } const productLineCount = items.length; if (itemCountElement) { itemCountElement.textContent = productLineCount; } if (headerCartCount) { headerCartCount.textContent = totalQuantity; } const cartSummarySection = document.querySelector('.cart-summary'); const cartTable = document.querySelector('.cart-table'); const emptyCartMessage = cartPageContainer.querySelector('.cart-empty'); if (items.length === 0) { if (cartTable) cartTable.style.display = 'none'; if (cartSummarySection) cartSummarySection.style.display = 'none'; if (!emptyCartMessage) { const emptyDiv = document.createElement('div'); emptyDiv.className = 'cart-empty'; emptyDiv.innerHTML = '<h2>GIỎ HÀNG CỦA BẠN ĐANG TRỐNG</h2><p>Hãy thêm sản phẩm vào giỏ hàng nhé!</p><a href="index.html" class="btn btn-primary">Tiếp tục mua sắm</a>'; cartPageContainer.appendChild(emptyDiv); } else { emptyCartMessage.style.display = 'block'; } } else { if (cartTable) cartTable.style.display = 'table'; if (cartSummarySection) cartSummarySection.style.display = 'block'; if (emptyCartMessage) emptyCartMessage.style.display = 'none'; } }
        if (cartItemsContainer) { cartItemsContainer.addEventListener('click', (event) => { const target = event.target; const cartItem = target.closest('.cart-item'); if (!cartItem) return; const quantityInput = cartItem.querySelector('.quantity-input'); if (!quantityInput) return; let currentValue = parseInt(quantityInput.value); if (target.classList.contains('plus-btn')) { currentValue++; quantityInput.value = currentValue; updateCartSummary(); } else if (target.classList.contains('minus-btn')) { if (currentValue > 1) { currentValue--; quantityInput.value = currentValue; updateCartSummary(); } } const removeButton = target.closest('.remove-item-btn'); if (removeButton) { if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) { cartItem.remove(); updateCartSummary(); /* TODO: Update localStorage */ } } }); cartItemsContainer.addEventListener('change', (event) => { if (event.target.classList.contains('quantity-input')) { let value = parseInt(event.target.value); if (isNaN(value) || value < 1) { event.target.value = 1; } updateCartSummary(); /* TODO: Update localStorage */ } }); }
        const applyPromoButtonCart = document.querySelector('#cart-promo-code + .apply-promo-button'); if (applyPromoButtonCart) { applyPromoButtonCart.addEventListener('click', function() { alert('Placeholder: Xử lý áp dụng mã giảm giá.'); }); } const addGiftWrapButton = document.querySelector('.add-gift-wrap-button'); if (addGiftWrapButton) { addGiftWrapButton.addEventListener('click', function() { alert('Placeholder: Xử lý thêm gói quà.'); }); }
        function loadCartItems() { console.log("Placeholder: Load cart items from localStorage here."); if (cartItemsContainer) { updateCartSummary(); } } loadCartItems();
    } // End if(cartPageContainer)

    // ========== END CART PAGE SPECIFIC LOGIC ==========


    // ========== SHOPPING CART MODAL LOGIC (Landing Page) ==========
    // TODO: Add logic for opening/closing cart modal, adding items, etc.
    // This will interact with the cart page logic via localStorage.


}); // End DOMContentLoaded Listener