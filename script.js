document.addEventListener('DOMContentLoaded', function() {
    // Add image utility functions at the start
    function normalizeImagePath(imagePath) {
        const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        // If it's already an absolute URL, return as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        // If it starts with 'images/', just append to base URL
        if (imagePath.startsWith('images/')) {
            return new URL(imagePath, baseUrl).href;
        }
        // Otherwise, assume it's in images folder
        return new URL(`images/${imagePath}`, baseUrl).href;
    }

    function handleImageError(img, fallbackText) {
        console.warn(`Image failed to load: ${img.src}`);
        img.onerror = null; // Prevent infinite loop
        img.src = `https://placehold.co/200x200/FFDADA/333?text=${encodeURIComponent(fallbackText || 'Image Not Found')}`;
    }

    // Add global image error handler
    document.querySelectorAll('img').forEach(img => {
        const originalSrc = img.src;
        const altText = img.alt || 'Image';
        img.onerror = () => handleImageError(img, altText);
        // Normalize image path
        if (!img.src.startsWith('data:') && !img.src.startsWith('http')) {
            img.src = normalizeImagePath(originalSrc);
            console.log(`Normalized image path: ${originalSrc} -> ${img.src}`);
        }
    });

    // ========== MENU TOGGLE (HAMBURGER) LOGIC ==========
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (menuToggle && mobileNav) {
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
    } else {
        console.warn("Menu toggle button or mobile navigation (#mobile-nav) not found.");
    }


    // ========== PRODUCT SLIDER LOGIC ==========
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const sliderContainer = document.querySelector('.slider-container');
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.product-item'); // Assuming .product-item is the slide element
    const prevButton = document.querySelector('.prev-btn');
    const nextButton = document.querySelector('.next-btn');

    if (slider && slides.length > 0 && sliderContainer) {
        let currentSlide = 0;
        let isTransitioning = false;
        let autoPlayInterval;

        // Thiết lập kích thước ban đầu cho slider
        function setSliderDimensions() {
            const containerWidth = sliderContainer.offsetWidth;

            // Ensure slides have the correct width relative to the container
             slides.forEach(slide => {
                 slide.style.width = `${containerWidth}px`;
             });

            // Set the total width of the slider container to fit all slides side-by-side
            slider.style.width = `${containerWidth * slides.length}px`;


            // Cập nhật vị trí của slider sau khi resize
            moveToSlide(currentSlide, false); // false for no animation on resize
        }

        function moveToSlide(index, animate = true) {
            if (isTransitioning && animate) return; // Prevent rapid clicks if animating

            // Handle index wrapping (looping)
            if (index >= slides.length) {
                index = 0;
            } else if (index < 0) {
                index = slides.length - 1;
            }

            currentSlide = index;
            const offset = -currentSlide * sliderContainer.offsetWidth; // Calculate the translation distance

            if (animate) {
                isTransitioning = true;
                slider.style.transition = 'transform 0.5s ease-in-out'; // Smooth transition
            } else {
                slider.style.transition = 'none'; // No transition for instant jump (like on resize)
            }

            slider.style.transform = `translateX(${offset}px)`; // Apply the translation

            if (animate) {
                // Reset transition state after animation completes
                setTimeout(() => {
                    isTransitioning = false;
                }, 500); // Match transition duration
            }
        }

        // Initialize dimensions and start auto-play
        setSliderDimensions();

        // Event listeners for navigation buttons
        if (prevButton) {
             prevButton.addEventListener('click', () => {
                 clearInterval(autoPlayInterval); // Pause auto-play on manual interaction
                 moveToSlide(currentSlide - 1);
                 startAutoPlay(); // Restart auto-play after a delay
             });
        }

        if (nextButton) {
             nextButton.addEventListener('click', () => {
                 clearInterval(autoPlayInterval); // Pause auto-play on manual interaction
                 moveToSlide(currentSlide + 1);
                 startAutoPlay(); // Restart auto-play after a delay
             });
        }


        // Handle window resize
        window.addEventListener('resize', setSliderDimensions);

        // Auto play function
        function startAutoPlay() {
            clearInterval(autoPlayInterval); // Clear any existing interval
            autoPlayInterval = setInterval(() => {
                moveToSlide(currentSlide + 1);
            }, 5000); // Change slide every 5 seconds
        }

        // Start autoplay initially
        startAutoPlay();

        // Pause autoplay when hovering over the slider wrapper
        if (sliderWrapper) {
            sliderWrapper.addEventListener('mouseenter', () => {
                clearInterval(autoPlayInterval);
            });

            // Resume autoplay when not hovering
            sliderWrapper.addEventListener('mouseleave', () => {
                startAutoPlay();
            });
        }


    } else {
        console.warn("Product slider elements not found or no slides available.");
         // Optionally hide slider buttons if slider is not functional
         if (prevButton) prevButton.style.display = 'none';
         if (nextButton) nextButton.style.display = 'none';
    }


    // ========== COUNTDOWN TIMER LOGIC ==========
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    // const hoursLeftElement = document.getElementById('hours-left'); // This ID is not in the HTML
    const discountForm = document.getElementById('myForm');
    const countdownDisplayContainer = document.getElementById('countdown-timer-display');

    if (hoursElement && minutesElement && secondsElement && discountForm && countdownDisplayContainer) {
        // ***** Duration changed to 3 hours *****
        const countdownDurationHours = 3; // Duration in hours
        // **************************************

        let targetTimeString = localStorage.getItem('countdownTargetTime');
        let targetTime;

        // Check if a target time exists and is still in the future
        if (targetTimeString) {
            targetTime = parseInt(targetTimeString, 10);
            // If stored time is in the past (with a small buffer), set a new target time
            if (isNaN(targetTime) || targetTime < new Date().getTime() - 10000) {
                targetTime = new Date().getTime() + countdownDurationHours * 60 * 60 * 1000;
                localStorage.setItem('countdownTargetTime', targetTime);
            }
        } else {
            // Set initial timer if none exists
            targetTime = new Date().getTime() + countdownDurationHours * 60 * 60 * 1000;
            localStorage.setItem('countdownTargetTime', targetTime);
        }

        let countdownInterval; // Define interval variable

        function updateCountdown() {
            const now = new Date().getTime();
            const timeRemaining = targetTime - now;

            // --- Timer Expired ---
            if (timeRemaining <= 0) {
                clearInterval(countdownInterval); // Stop the interval
                // Update display message
                countdownDisplayContainer.innerHTML = "<p style='font-size: 1.2em; font-weight: bold; color: #FFCCCC;'>Ưu đãi đã kết thúc!</p>";

                // Disable the form button and inputs
                const formButton = discountForm.querySelector('button[type="submit"]');
                if (formButton) {
                    formButton.disabled = true;
                    formButton.textContent = "Đã Hết Hạn";
                    formButton.style.backgroundColor = '#aaa';
                    formButton.style.cursor = 'not-allowed';
                }
                const inputs = discountForm.querySelectorAll('input');
                inputs.forEach(input => input.disabled = true);

                // Clean up localStorage
                localStorage.removeItem('countdownTargetTime');
                return; // Exit the function
            }

            // --- Timer Running ---
            // Calculate hours, minutes, seconds
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            // Update display elements with leading zeros
            hoursElement.textContent = String(hours).padStart(2, '0');
            minutesElement.textContent = String(minutes).padStart(2, '0');
            secondsElement.textContent = String(seconds).padStart(2, '0');

            // The hoursLeftElement is not in the HTML, so this part is commented out
            // if (hoursLeftElement) {
            //     const hoursLeft = Math.ceil(timeRemaining / (1000 * 60 * 60));
            //     hoursLeftElement.textContent = hoursLeft;
            // }
        }

        // Initial call to display timer immediately
        updateCountdown();
        // Start the interval timer
        countdownInterval = setInterval(updateCountdown, 1000);
    } else {
        console.warn("Countdown timer elements, discount form, or display container not found.");
         // Optionally hide elements if setup fails
         if (countdownDisplayContainer) countdownDisplayContainer.style.display = 'none';
         const formNote = document.querySelector('.form-note'); // Assuming .form-note is near the form
         if (formNote) formNote.style.display = 'none';
    }


    // ========== DISCOUNT FORM HANDLING LOGIC ==========
    const theDiscountForm = document.getElementById("myForm");

    if (theDiscountForm) {
        theDiscountForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const submitButton = theDiscountForm.querySelector('button[type="submit"]');

            // Get form values
            var name = document.getElementById("name").value.trim();
            var email = document.getElementById("email").value.trim();
            var phone = document.getElementById("phone").value.trim();
            const emailInput = document.getElementById("email");

            // Generate unique discount code with name initials
            const initials = name.split(' ').map(word => word[0]).join('');
            const discountCode = `TNL-${initials}${Date.now().toString().slice(-6)}`;

            // Show confirmation dialog
            const confirmationDialog = document.querySelector('.confirmation-dialog');
            const confirmationOverlay = document.querySelector('.confirmation-dialog-overlay');
            const discountCodeElement = document.getElementById('discount-code');

            // Update discount code display
            if (discountCodeElement) {
                discountCodeElement.textContent = discountCode;
            }

            // Show dialog with animation
            confirmationDialog.classList.add('show');
            confirmationOverlay.classList.add('show');

            // Setup copy button functionality
            const copyButton = confirmationDialog.querySelector('.copy-code-btn');
            if (copyButton) {
                copyButton.addEventListener('click', function() {
                    navigator.clipboard.writeText(discountCode);
                    this.innerHTML = '<i class="fas fa-check"></i>Đã sao chép';
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-copy"></i>Sao chép mã';
                    }, 2000);
                });
            }

            // Setup close button functionality
            const closeButton = confirmationDialog.querySelector('.close-confirmation');
            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    confirmationDialog.classList.remove('show');
                    confirmationOverlay.classList.remove('show');
                });
            }

            // Close dialog when clicking overlay
            confirmationOverlay.addEventListener('click', function() {
                confirmationDialog.classList.remove('show');
                confirmationOverlay.classList.remove('show');
            });

            // Rest of the existing form submission code...
            // Prepare data object for Google Sheet
            var data = {
                name: name,
                email: email,
                phone: phone,
                discountCode: discountCode,
                formSource: 'Discount Registration TNL Page'
            };

            // First, send data to Google Sheet
            fetch("https://script.google.com/macros/s/AKfycbxrnCxZ7WfxLyU7S7RorgGqPikF6Ag169Q-9mIgUw46ka4zcO53j4zpoinwbkuLcCXglg/exec", {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(() => {
                // After successful sheet submission, send email
                return fetch("https://script.google.com/macros/s/[YOUR_EMAIL_WEBAPP_ID]/exec", {
                    method: "POST",
                    mode: "no-cors",
                    body: JSON.stringify({
                        to: email,
                        name: name,
                        discountCode: discountCode
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            })
            .then(() => {
                alert(`
                    Đăng ký thành công!
                    
                    - Thông tin của bạn đã được ghi nhận
                    - Mã giảm giá đã được gửi tới email của bạn
                    - Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất
                    
                    Cảm ơn bạn đã quan tâm tới TNL!
                `);
                theDiscountForm.reset();
            })
            .catch(error => {
                console.error("Lỗi khi gửi form:", error);
                alert("Có lỗi xảy ra khi gửi thông tin, vui lòng thử lại.");
            })
            .finally(() => {
                if (submitButton) {
                    const timerIsActive = localStorage.getItem('countdownTargetTime') && 
                        parseInt(localStorage.getItem('countdownTargetTime'), 10) > new Date().getTime();
                    if (timerIsActive) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Nhận tư vấn ngay';
                        submitButton.style.backgroundColor = '';
                        submitButton.style.cursor = '';
                    } else {
                        submitButton.disabled = true;
                        submitButton.textContent = "Đã Hết Hạn";
                        submitButton.style.backgroundColor = '#aaa';
                        submitButton.style.cursor = 'not-allowed';
                    }
                }
            });
        });
    } else {
        console.warn("Form with id='myForm' not found.");
    }


    // ========== CHAT BOX TOGGLE LOGIC ==========
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');

    if (chatToggle && chatWindow && closeChat) {
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.add('open');
            chatToggle.style.display = 'none'; // Hide the toggle button
            // Optional: Focus on input field when opened
            const chatInputEl = chatWindow.querySelector('.chat-input input');
            if(chatInputEl) chatInputEl.focus();
        });

        closeChat.addEventListener('click', () => {
            chatWindow.classList.remove('open'); // Remove active class for transition
             // Wait for close animation to finish before showing toggle button again
             setTimeout(() => {
                 chatToggle.style.display = 'flex'; // Show the toggle button
             }, 300); // Match the transition duration in CSS
        });
    } else { console.warn("Chat box elements not found."); }


    // ========== UPDATE COPYRIGHT YEAR ==========
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        try {
            yearSpan.textContent = new Date().getFullYear();
        } catch (e) {
            console.warn("Could not get current date for copyright year:", e);
            // Fallback: Keep the default year from HTML if error occurs
        }
    }

    // ========== CART MANAGEMENT (for Cart Page, if implemented) ==========
    // This section is for a full cart page (TRANG GIỎ HÀNG.html)
    // The 'Mua Ngay' button logic below bypasses this cart.
    let cart = JSON.parse(localStorage.getItem('tnl-cart')) || []; // Using 'tnl-cart' as one key found

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
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
        updateCartCount();
        // Optional: Show a confirmation message or mini-cart preview
    }

    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            // Use the 'tnl-cart' key for this count
            const currentCart = JSON.parse(localStorage.getItem('tnl-cart')) || [];
            const totalItems = currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    // Update cart count on page load
    updateCartCount();

    // Note: The event listener on .btn-buy that redirects to checkout with URL params
    // is removed to avoid conflict with the onclick="muaNgay()" calls in the HTML.
    // If you need both "Add to Cart" and "Buy Now", you should have separate buttons
    // and event handlers for each. The current HTML uses onclick="muaNgay()".

    // ========== DIRECT CHECKOUT FUNCTION (Called by onclick="muaNgay()" in HTML) ==========
    // This function is triggered when the "Mua Ngay" button is clicked.
    // It stores the single product for direct checkout and redirects.
    window.muaNgay = function(product) {
        try {
            // Normalize image path
            const normalizedImagePath = normalizeImagePath(product.image);
            console.log('Product image path:', product.image);
            console.log('Normalized image path:', normalizedImagePath);
            
            const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: normalizedImagePath,
                quantity: 1
            };
            
            console.log('Adding to cart:', cartItem);
            
            localStorage.setItem('tnl-cart', JSON.stringify([cartItem]));
            window.location.href = 'Thanh toán/cart.html';
        } catch (error) {
            console.error('Error in muaNgay:', error);
            alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
        }
    }

    // ========== CART MODAL LOGIC (If you have a cart modal on the main page) ==========
    // Assuming the cart icon in the header triggers this modal.
    const headerCartLink = document.querySelector('.header-cart a'); // Link around the cart icon
    const cartModalOverlay = document.querySelector('.cart-modal-overlay');
    const cartModal = document.querySelector('.cart-modal');
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    const cartModalItemsContainer = document.querySelector('.cart-modal-items'); // Container for items in modal
    const cartModalTotalElement = document.querySelector('.cart-modal-total'); // Total element in modal

    if (headerCartLink && cartModalOverlay && cartModal && cartCloseBtn && cartModalItemsContainer && cartModalTotalElement) {

        // Function to render items in the cart modal
        function renderCartModalItems() {
             const currentCart = JSON.parse(localStorage.getItem('tnl-cart')) || []; // Use the main cart key
             cartModalItemsContainer.innerHTML = ''; // Clear current items
             let modalSubtotal = 0;

             if (currentCart.length === 0) {
                 cartModalItemsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Giỏ hàng trống.</p>';
             } else {
                 currentCart.forEach(item => {
                     const itemTotal = (item.price || 0) * (item.quantity || 1); // Ensure price and quantity are numbers
                     modalSubtotal += itemTotal;

                     const itemHTML = `
                         <div class="cart-modal-item" data-product-id="${item.id}">
                             <img src="${normalizeImagePath(item.image)}" 
                                  alt="${item.name}" 
                                  onerror="handleImageError(this, '${item.name}')"
                                  style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
                             <div class="item-details">
                                 <div class="item-name">${item.name || 'Sản phẩm không tên'}</div>
                                 <div class="item-price">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)} x ${item.quantity || 1}</div>
                             </div>
                             <button class="remove-item-btn" data-product-id="${item.id}">&times;</button>
                         </div>
                     `;
                     cartModalItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
                 });
             }

             // Update modal total
             cartModalTotalElement.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(modalSubtotal);
        }

        // Add event listener to the cart icon link to open the modal
        headerCartLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior (going to TRANG THÊM GIỎ HÀNG.html)
            renderCartModalItems(); // Render items before opening
            cartModalOverlay.style.display = 'block'; // Show the overlay
            setTimeout(() => {
                cartModal.classList.add('active'); // Add active class for transition
            }, 10); // Small delay to allow display: block to take effect
        });

        // Add event listener to close button
        cartCloseBtn.addEventListener('click', () => {
            cartModal.classList.remove('active'); // Remove active class for transition
            setTimeout(() => {
                cartModalOverlay.style.display = 'none'; // Hide overlay after transition
            }, 300); // Match CSS transition duration
        });

        // Close modal when clicking outside the modal content
        cartModalOverlay.addEventListener('click', (e) => {
            if (e.target === cartModalOverlay) {
                 cartModal.classList.remove('active');
                 setTimeout(() => {
                     cartModalOverlay.style.display = 'none';
                 }, 300);
            }
        });

        // Handle remove item button clicks within the modal (using event delegation)
        cartModalItemsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-item-btn')) {
                const productIdToRemove = e.target.dataset.productId;
                let currentCart = JSON.parse(localStorage.getItem('tnl-cart')) || [];
                currentCart = currentCart.filter(item => item.id !== productIdToRemove);
                localStorage.setItem('tnl-cart', JSON.stringify(currentCart));
                updateCartCount(); // Update header count
                renderCartModalItems(); // Re-render modal content
            }
        });

        // Handle checkout button in modal (Redirect to cart page for full checkout flow)
        const modalCheckoutButton = document.querySelector('.cart-modal-checkout');
        if(modalCheckoutButton) {
             modalCheckoutButton.addEventListener('click', () => {
                 // Redirect to the full cart page where checkout can be finalized
                 window.location.href = 'Thanh toán/cart.html'; // Assuming this is your full cart page
             });
        }

    } else {
        console.warn("Cart modal elements not found. Cart modal functionality disabled.");
    }


    // =========================================================
    // ========== CHECKOUT PAGE SPECIFIC LOGIC (moved here) ====
    // =========================================================
    // This code runs ONLY when the user is on the checkout page.
    // Check if the current page URL includes 'TRANG THANH TOÁN.html'
    if (window.location.pathname.includes('TRANG THANH TOÁN.html')) {
        console.log("Executing checkout page specific logic."); // Debug log

        // Function to display product(s) in the order summary
        function displayCheckoutProducts() {
            const checkoutProductsContainer = document.getElementById('checkout-products');
            // Read from checkout-cart key
            const checkoutItems = JSON.parse(localStorage.getItem('checkout-cart')) || [];

            console.log("Retrieved checkout-cart from localStorage:", checkoutItems); // Debug log

            if (!checkoutProductsContainer) {
                 console.error("Checkout products container (#checkout-products) not found.");
                 return;
            }

            checkoutProductsContainer.innerHTML = ''; // Clear existing content
            let subtotal = 0;

            if (checkoutItems.length === 0) {
                 checkoutProductsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Không có sản phẩm nào trong đơn hàng.</p>';
                 console.log("checkout-cart is empty."); // Debug log
            } else {
                 console.log("Rendering products in checkout summary..."); // Debug log
                 checkoutItems.forEach((item, index) => {
                     console.log(`Processing item ${index}:`, item); // Debug log for each item
                     // Ensure item properties are valid before using
                     const itemName = item.name || 'Sản phẩm không tên';
                     const itemPrice = item.price ? parseFloat(item.price) : 0; // Ensure price is number
                     const itemQuantity = item.quantity ? parseInt(item.quantity) : 1; // Ensure quantity is number
                     const itemImage = item.image || ''; // Ensure image is string

                     const itemTotal = itemPrice * itemQuantity;
                     subtotal += itemTotal;

                     const productHTML = `
                         <div class="product-item">
                             <img src="${itemImage}" alt="${itemName}" class="product-image"
                                  onerror="this.onerror=null; this.src='../images/default-product.jpg';"> <div class="product-info">
                                 <h4>${itemName}</h4>
                                 <div class="product-price">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemPrice)}</div>
                                 <div class="product-quantity">Số lượng: ${itemQuantity}</div>
                             </div>
                         </div>
                     `;
                     checkoutProductsContainer.insertAdjacentHTML('beforeend', productHTML);
                 });
            }

            // Update initial totals (subtotal, shipping, total)
            updateOrderTotals(subtotal, 0, 0); // Initial call with 0 shipping/discount
        }

        // Function to update order summary totals
        let currentShippingCost = 0; // Track selected shipping cost
        let currentDiscountValue = 0; // Track applied discount amount
        let currentSubtotal = 0; // Track subtotal

        function updateOrderTotals(sub = currentSubtotal, shipping = currentShippingCost, discount = currentDiscountValue) {
            currentSubtotal = sub;
            currentShippingCost = shipping;
            currentDiscountValue = discount;

            const total = currentSubtotal + currentShippingCost - currentDiscountValue;

            const subtotalElement = document.getElementById('subtotal');
            const shippingCostElement = document.getElementById('shipping-cost');
            const discountAmountElement = document.getElementById('discount-amount'); // Needs to exist in HTML
            const totalElement = document.getElementById('total');
            const discountLine = document.getElementById('discount-line'); // Needs to exist in HTML

            if (subtotalElement) {
                 subtotalElement.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentSubtotal);
            }
            if (shippingCostElement) {
                 shippingCostElement.textContent = currentShippingCost === 0 ? 'Miễn phí' :
                     new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentShippingCost);
            }
            if (discountAmountElement && discountLine) {
                 if (currentDiscountValue > 0) {
                     discountAmountElement.textContent = `-${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentDiscountValue)}`;
                     discountLine.style.display = 'flex';
                 } else {
                     discountLine.style.display = 'none';
                 }
            }
            if (totalElement) {
                 totalElement.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
            }
        }

        // Call the display function when the checkout page loads
        displayCheckoutProducts();


        // ========== CHECKOUT PAGE: Payment method selection ==========
        const paymentMethods = document.querySelectorAll('.payment-method');
        const bankInfoSection = document.getElementById('bank-info-section'); // Needs to exist in HTML

        if (paymentMethods.length > 0 && bankInfoSection) {
            // Hide bank info by default (handled by inline style in HTML)
            // bankInfoSection.style.display = 'none';

            paymentMethods.forEach(method => {
                method.addEventListener('click', function() {
                    // Remove 'active' from all methods
                    paymentMethods.forEach(m => m.classList.remove('active'));
                    // Add 'active' to the clicked method
                    this.classList.add('active');

                    // Show/hide bank info based on selection
                    if (this.dataset.method === 'bank') {
                        bankInfoSection.style.display = 'flex'; // Use flex as per your CSS
                    } else {
                        bankInfoSection.style.display = 'none';
                    }
                });
            });
             // Set initial active state based on default active class in HTML
             const initialActivePayment = document.querySelector('.payment-method.active');
             if(initialActivePayment && initialActivePayment.dataset.method === 'bank') {
                 bankInfoSection.style.display = 'flex';
             } else {
                 bankInfoSection.style.display = 'none';
             }

        } else { console.warn("Payment methods or bank info section not found on checkout page."); }


        // ========== CHECKOUT PAGE: Shipping option selection ==========
        const shippingOptions = document.querySelectorAll('.shipping-option');
        const shippingCosts = {
            'free': 0,
            'express': 50000,
            'special': 100000
        };

        if (shippingOptions.length > 0) {
            shippingOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remove 'active' from all options
                    shippingOptions.forEach(opt => opt.classList.remove('active'));
                    // Add 'active' to the clicked option
                    this.classList.add('active');
                    // Check the corresponding radio button
                    const radioInput = this.querySelector('input[type="radio"]');
                    if (radioInput) radioInput.checked = true;

                    // Update shipping cost and totals
                    const shippingType = radioInput ? radioInput.value : 'free'; // Default to free if radio not found
                    currentShippingCost = shippingCosts[shippingType] !== undefined ? shippingCosts[shippingType] : 0; // Use 0 if type not found
                    updateOrderTotals(currentSubtotal, currentShippingCost, currentDiscountValue);
                });
            });
             // Set initial active state and update totals based on default checked radio in HTML
             const initialCheckedShipping = document.querySelector('.shipping-option input[type="radio"]:checked');
             if(initialCheckedShipping) {
                 const shippingType = initialCheckedShipping.value;
                 currentShippingCost = shippingCosts[shippingType] !== undefined ? shippingCosts[shippingType] : 0;
                 // Add active class to the parent div
                 const parentOption = initialCheckedShipping.closest('.shipping-option');
                 if(parentOption) parentOption.classList.add('active');
             }
             // Update totals based on initial state - this is already handled by displayCheckoutProducts calling updateOrderTotals

        } else { console.warn("Shipping options not found on checkout page."); }


        // ========== CHECKOUT PAGE: Discount code handling ==========
        const discountBtn = document.getElementById('apply-discount');
        const discountInput = document.getElementById('discount-code');
        const discountMessage = document.getElementById('discount-message');
        // discountLine and discountAmount are used in updateOrderTotals

        const discountCodes = {
            'TNL2024': 0.1, // 10% off
            'WELCOME': 0.15, // 15% off
            'VIP': 0.2 // 20% off
        };

        if (discountBtn && discountInput && discountMessage) {
            discountBtn.addEventListener('click', function() {
                const code = discountInput.value.trim().toUpperCase();
                let discountRate = discountCodes[code];

                if (discountRate !== undefined) {
                    currentDiscountValue = currentSubtotal * discountRate; // Calculate discount amount
                    discountMessage.style.color = '#28a745';
                    discountMessage.textContent = `Mã giảm giá "${code}" đã được áp dụng!`;
                } else {
                    currentDiscountValue = 0; // No discount
                    discountMessage.style.color = '#dc3545';
                    discountMessage.textContent = 'Mã giảm giá không hợp lệ!';
                }
                discountMessage.style.display = 'block';
                updateOrderTotals(currentSubtotal, currentShippingCost, currentDiscountValue); // Update totals
            });
        } else { console.warn("Discount elements not found on checkout page."); }


        // ========== CHECKOUT PAGE: Generate Order Number and Copy Buttons ==========
        const orderNumberElement = document.getElementById('order-number');
        const orderCodeElement = document.getElementById('order-code'); // The parent span
        const popupOrderCodeElement = document.getElementById('popup-order-code'); // In the success popup

        if (orderNumberElement && orderCodeElement) {
             // Generate a simple order number (timestamp based)
             const orderNumber = Date.now().toString().slice(-8); // Last 8 digits of timestamp
             orderNumberElement.textContent = orderNumber; // Update the span inside order-code

             const orderCode = `TNL-${orderNumber}`; // Full order code

             // Update the data-copy attribute for the order code copy button
             // Assuming the copy button is the next sibling of the order-code span
             const orderCodeCopyButton = orderCodeElement.nextElementSibling;
             if (orderCodeCopyButton && orderCodeCopyButton.classList.contains('copy-button')) {
                 orderCodeCopyButton.dataset.copy = orderCode;
             }

             // Update the order code in the success popup
             if(popupOrderCodeElement) {
                 popupOrderCodeElement.textContent = orderCode;
             }


             // Add event listeners to all copy buttons on the page
             document.querySelectorAll('.copy-button').forEach(button => {
                 button.addEventListener('click', function() {
                     const textToCopy = this.dataset.copy;
                     if (textToCopy) {
                         navigator.clipboard.writeText(textToCopy).then(() => {
                             // Optional: Provide visual feedback
                             const originalText = this.innerHTML;
                             this.innerHTML = '<i class="fas fa-check"></i> Đã sao chép!';
                             setTimeout(() => {
                                 this.innerHTML = originalText;
                             }, 2000);
                         }).catch(err => {
                             console.error('Could not copy text: ', err);
                             alert('Không thể sao chép tự động. Vui lòng sao chép thủ công.');
                         });
                     } else {
                          console.warn("No text defined for copy button:", button);
                     }
                 });
             });
        } else { console.warn("Order number or order code elements not found on checkout page."); }


        // ========== CHECKOUT PAGE: Form submission and Success Popup ==========
        const checkoutForm = document.getElementById('payment-form');
        const successPopup = document.getElementById('success-popup'); // Needs to exist in HTML

        if (checkoutForm && successPopup) {
            checkoutForm.addEventListener('submit', function(e) {
                e.preventDefault(); // Prevent actual form submission

                // Basic validation (browser handles 'required', could add more here)
                if (!checkoutForm.checkValidity()) {
                     alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
                     return;
                }

                // Gather form data (for potential backend processing later)
                const formData = new FormData(checkoutForm);
                const orderDetails = {
                    name: formData.get('name'), // Need name attributes on form controls
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address'), // Need name attribute on textarea
                    shipping: formData.get('shipping'), // Name attribute on shipping radios
                    paymentMethod: document.querySelector('.payment-method.active')?.dataset.method, // Get from active payment method
                    items: JSON.parse(localStorage.getItem('checkout-cart')) || [],
                    subtotal: currentSubtotal,
                    shippingCost: currentShippingCost,
                    discountAmount: currentDiscountValue,
                    total: currentSubtotal + currentShippingCost - currentDiscountValue,
                    orderCode: document.getElementById('order-code')?.textContent // Get generated order code
                    // Add other relevant data
                };

                console.log("Order Details:", orderDetails); // Log details for debugging

                // --- Simulate Order Processing (Replace with actual backend call) ---
                // In a real application, you would send 'orderDetails' to your server here.
                // For this example, we'll just simulate success.
                // Example using fetch:
                /*
                fetch('/your-backend-order-endpoint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderDetails)
                })
                .then(response => response.json())
                .then(data => {
                    // Handle success response from backend
                    console.log('Order placed successfully:', data);
                    // Show success popup
                    document.getElementById('popup-order-code').textContent = orderDetails.orderCode; // Use the generated code
                    successPopup.style.display = 'block';

                    // Clear checkout cart from localStorage
                    localStorage.removeItem('checkout-cart');
                    // If you also use a main cart, you might clear that too if the order is complete
                    // localStorage.removeItem('tnl-cart');

                    // Redirect after a delay
                    setTimeout(() => {
                        window.location.href = '../index.html'; // Redirect to homepage
                    }, 5000); // Redirect after 5 seconds

                })
                .catch(error => {
                    // Handle errors
                    console.error('Error placing order:', error);
                    alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
                });
                */
                // --- End Simulation ---

                // --- Simulation (remove in production) ---
                console.log("Simulating order placement...");
                // Show success popup
                document.getElementById('popup-order-code').textContent = orderDetails.orderCode; // Use the generated code
                successPopup.style.display = 'block';

                // Clear checkout cart from localStorage
                localStorage.removeItem('checkout-cart');
                 // If you also use a main cart, you might clear that too if the order is complete
                 // localStorage.removeItem('tnl-cart');


                // Redirect after a delay
                setTimeout(() => {
                    window.location.href = '../index.html'; // Redirect to homepage
                }, 5000); // Redirect after 5 seconds
                // --- End Simulation ---
            });
        } else { console.warn("Checkout form or success popup not found on checkout page."); }

        // ========== CHECKOUT PAGE: Back to Home Button ==========
        // This button is already in the HTML and links to ../index.html
        // No JS needed for this button unless adding extra behavior.


    } // End of CHECKOUT PAGE SPECIFIC LOGIC

    initializeChat();

}); // End DOMContentLoaded Listener

// Note: The global muaNgay function is defined outside DOMContentLoaded
// so it can be called by onclick attributes in the HTML.
// All other logic is inside DOMContentLoaded as it relies on the DOM being ready.

// Cart Modal Functions
const cartModal = {
    init() {
        this.overlay = document.querySelector('.cart-modal-overlay');
        this.modal = document.querySelector('.cart-modal');
        this.closeBtn = document.querySelector('.cart-close-btn');
        this.bindEvents();
    },

    bindEvents() {
        // Toggle cart modal
        document.querySelector('.header-cart').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.show();
        });

        // Close on button click
        this.closeBtn.addEventListener('click', () => this.hide());
        
        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hide();
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hide();
        });

        // Prevent closing when clicking inside modal
        this.modal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    },

    show() {
        this.overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.updateCartDisplay();
    },

    hide() {
        this.overlay.classList.remove('show');
        document.body.style.overflow = '';
    },

    updateCartDisplay() {
        const cart = JSON.parse(localStorage.getItem('tnl-cart')) || [];
        const itemsContainer = document.querySelector('.cart-modal-items');
        const totalElement = document.querySelector('.cart-modal-total');

        if (cart.length === 0) {
            itemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h4>Giỏ hàng trống</h4>
                    <p>Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
                </div>
            `;
            totalElement.textContent = '0₫';
            return;
        }

        let html = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-price">${this.formatCurrency(item.price)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="cartModal.updateQuantity('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="cartModal.updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <button onclick="cartModal.removeItem('${item.id}')" class="remove-item">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        itemsContainer.innerHTML = html;
        totalElement.textContent = this.formatCurrency(total);
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    },

    updateQuantity(id, change) {
        const cart = JSON.parse(localStorage.getItem('tnl-cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === id);
        
        if (itemIndex > -1) {
            cart[itemIndex].quantity = Math.max(1, cart[itemIndex].quantity + change);
            localStorage.setItem('tnl-cart', JSON.stringify(cart));
            this.updateCartDisplay();
        }
    },

    removeItem(id) {
        const cart = JSON.parse(localStorage.getItem('tnl-cart')) || [];
        const itemElement = document.querySelector(`.cart-item[data-id="${id}"]`);
        
        if (itemElement) {
            itemElement.style.transform = 'translateX(100%)';
            itemElement.style.opacity = '0';
            
            setTimeout(() => {
                const updatedCart = cart.filter(item => item.id !== id);
                localStorage.setItem('tnl-cart', JSON.stringify(updatedCart));
                this.updateCartDisplay();
            }, 300);
        }
    }
};

// Initialize cart modal
document.addEventListener('DOMContentLoaded', () => cartModal.init());

// Products database
const products = [
    {
        id: 'NAST-01',
        name: 'Nhẫn Ánh Sao Hội Tụ',
        price: 6500000,
        image: 'images/nhan-anh-sao-hoi-tu.jpg',
        description: 'Nhẫn vàng 18K đính đá sapphire',
        url: 'Bài viết liên quan/Nhẫn Ánh Sao Hội Tụ.html'
    },
    {
        id: 'DCNHR-01',
        name: 'Dây chuyền Nữ hoàng Ruby',
        price: 2800000,
        image: 'images/day-chuyen-nu-hoang-ruby.jpg.jpg',
        url: 'Bài viết liên quan/Dây chuyền Nữ Hoàng Ruby.html'
    },
    {
        id: 'VTTDH-01',
        name: 'Vòng Tay Tâm Điểm Hồng',
        price: 1950000,
        image: 'images/vong-tay-tam-diem-hong.jpg.jpg',
        url: 'Bài viết liên quan/Vòng Tay Tâm Điểm Hồng.html'
    },
    {
        id: 'DCHN-01',
        name: 'Dây chuyền hồng ngọc',
        price: 2500000,
        image: 'images/day-chuyen-hong-ngoc.jpg',
        url: 'Bài viết liên quan/Dây chuyển hồng ngọc.html'
    },
    {
        id: 'NAS-01',
        name: 'Nhẫn Ánh Sao',
        price: 5500000,
        image: 'images/nhan-anh-sao.jpg.jpg',
        url: 'Bài viết liên quan/Nhẫn.html'
    },
    {
        id: 'VKH-01',
        name: 'Vòng Kết Hồng',
        price: 1800000,
        image: 'images/vong-ket-hong.jpg.jpg',
        url: 'Bài viết liên quan/VKH (Vòng Kết Hồng).html'
    }
];

// Add service and policy pages database
const servicePages = [
    {
        id: 'guide',
        name: 'Hướng dẫn mua hàng',
        description: 'Thông tin chi tiết về quy trình mua hàng tại TNL',
        type: 'Dịch vụ',
        url: 'Hỗ trợ khách hàng/Hướng dẫn mua hàng.html'
    },
    {
        id: 'faq',
        name: 'Câu hỏi thường gặp',
        description: 'Giải đáp các thắc mắc phổ biến của khách hàng',
        type: 'Dịch vụ',
        url: 'Hỗ trợ khách hàng/Câu hỏi thường gặp.html'
    },
    {
        id: 'support',
        name: 'Hỗ trợ trực tuyến',
        description: 'Kênh hỗ trợ khách hàng trực tuyến 24/7',
        type: 'Dịch vụ',
        url: 'Hỗ trợ khách hàng/Hỗ trợ trực tuyến.html'
    },
    {
        id: 'warranty',
        name: 'Chính sách bảo hành',
        description: 'Thông tin về chế độ bảo hành sản phẩm',
        type: 'Chính sách',
        url: 'Chính sách/CHÍNH SÁCH BẢO HÀNH.html'
    },
    {
        id: 'return',
        name: 'Chính sách đổi trả',
        description: 'Quy định về đổi trả sản phẩm',
        type: 'Chính sách',
        url: 'Chính sách/Đổi trả.html'
    },
    {
        id: 'privacy',
        name: 'Chính sách bảo mật',
        description: 'Chính sách bảo mật thông tin khách hàng',
        type: 'Chính sách',
        url: 'Chính sách/CHÍNH SÁCH BẢO MẬT THÔNG TIN.html'
    }
];

// Add this function after products database
function removeVietnameseTones(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}

// Update search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchButton = document.getElementById('search-button');

    function selectFirstResult() {
        const firstResult = searchResults.querySelector('.search-result-item');
        if (firstResult && searchResults.style.display === 'block') {
            const itemUrl = firstResult.dataset.url;
            if (itemUrl) {
                window.location.href = itemUrl;
                searchResults.style.display = 'none';
                searchInput.value = '';
            }
        }
    }

    // Add click handler for search button
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        selectFirstResult();
    });

    function performSearch(query) {
        query = query.toLowerCase().trim();
        const normalizedQuery = removeVietnameseTones(query);
        
        if (query === '') {
            searchResults.style.display = 'none';
            return;
        }

        // Search in both products and service/policy pages with normalized text
        const productResults = products.filter(product => {
            const normalizedName = removeVietnameseTones(product.name.toLowerCase());
            const normalizedDesc = product.description ? removeVietnameseTones(product.description.toLowerCase()) : '';
            
            return normalizedName.includes(normalizedQuery) ||
                   normalizedDesc.includes(normalizedQuery) ||
                   product.name.toLowerCase().includes(query) ||
                   (product.description?.toLowerCase().includes(query));
        });

        const serviceResults = servicePages.filter(page => {
            const normalizedName = removeVietnameseTones(page.name.toLowerCase());
            const normalizedDesc = removeVietnameseTones(page.description.toLowerCase());
            const normalizedType = removeVietnameseTones(page.type.toLowerCase());
            
            return normalizedName.includes(normalizedQuery) ||
                   normalizedDesc.includes(normalizedQuery) ||
                   normalizedType.includes(normalizedQuery) ||
                   page.name.toLowerCase().includes(query) ||
                   page.description.toLowerCase().includes(query) ||
                   page.type.toLowerCase().includes(query);
        });

        displayResults([...productResults, ...serviceResults]);
    }

    function displayResults(results) {
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">Không tìm thấy kết quả</div>';
            searchResults.style.display = 'block';
            return;
        }

        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.dataset.url = item.url;

            if (item.price !== undefined) {
                // Product display
                resultItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="search-result-info">
                        <h4>${item.name}</h4>
                        <p>${item.price.toLocaleString('vi-VN')}₫</p>
                        <a href="${item.url}" class="view-article">Xem bài viết</a>
                    </div>
                `;
            } else {
                // Service/Policy page display
                resultItem.innerHTML = `
                    <div class="search-result-info service-info">
                        <h4>${item.name}</h4>
                        <p class="result-type">${item.type}</p>
                        <p class="result-desc">${item.description}</p>
                    </div>
                `;
            }
            
            resultItem.addEventListener('click', () => {
                window.location.href = item.url;
                searchResults.style.display = 'none';
                searchInput.value = '';
            });

            searchResults.appendChild(resultItem);
        });

        searchResults.style.display = 'block';
    }

    // Add keydown event for Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission if in a form
            selectFirstResult();
        }
    });

    // Event listeners
    searchInput.addEventListener('input', (e) => performSearch(e.target.value));
    searchButton.addEventListener('click', () => performSearch(searchInput.value));

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });
});

// Chatbox functionality
const chatFAQs = {
    greetings: ['xin chào', 'hello', 'hi', 'chào'],
    products: ['sản phẩm', 'giá', 'mua hàng', 'trang sức'],
    shipping: ['giao hàng', 'vận chuyển', 'ship', 'thời gian'],
    payment: ['thanh toán', 'trả góp', 'chuyển khoản', 'tiền'],
    warranty: ['bảo hành', 'đổi trả', 'sửa chữa'],
    contact: ['liên hệ', 'địa chỉ', 'số điện thoại', 'email']
};

const chatResponses = {
    greetings: 'Xin chào quý khách! TNL rất vui được hỗ trợ bạn. Bạn cần tư vấn về vấn đề gì ạ?',
    products: 'TNL có đa dạng sản phẩm trang sức từ nhẫn, dây chuyền đến vòng tay. Giá từ 1.8tr đến 6.5tr. Bạn có thể xem chi tiết tại mục Sản Phẩm Nổi Bật.',
    shipping: 'TNL giao hàng toàn quốc, thời gian từ 1-3 ngày. Miễn phí giao hàng cho đơn từ 2 triệu. Bạn sẽ nhận được SMS theo dõi đơn hàng.',
    payment: 'Chúng tôi chấp nhận thanh toán qua: \n- Thẻ Visa/Mastercard\n- Chuyển khoản\n- Ví MoMo\n- COD (thanh toán khi nhận hàng)',
    warranty: 'TNL cam kết:\n- Bảo hành 12 tháng\n- Đổi size miễn phí\n- Làm sạch miễn phí trọn đời\n- Đổi trả trong 7 ngày',
    contact: 'Bạn có thể liên hệ TNL qua:\n- Hotline: 0123 456 789\n- Email: TNL@gmail.com\n- Địa chỉ: Thành phố Biên Hòa, Tỉnh Đồng Nai',
    default: 'Xin lỗi, tôi chưa hiểu rõ câu hỏi. Bạn có thể nói rõ hơn hoặc chọn một trong các chủ đề: sản phẩm, giao hàng, thanh toán, bảo hành, liên hệ.'
};

function initializeChat() {
    const chatBox = document.getElementById('chat-box');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = chatWindow.querySelector('.chat-body');
    const chatInput = chatWindow.querySelector('.chat-input input');
    const sendButton = chatWindow.querySelector('.chat-input button');
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.getElementById('close-chat');

    // Add suggested questions
    addSuggestedQuestions(chatBody);

    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        messageDiv.textContent = message;
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addSuggestedQuestions(container) {
        const faqList = document.createElement('div');
        faqList.className = 'faq-list';
        
        const questions = [
            'Sản phẩm & giá cả',
            'Chính sách giao hàng',
            'Phương thức thanh toán',
            'Chính sách bảo hành',
            'Thông tin liên hệ'
        ];
        
        questions.forEach(q => {
            const item = document.createElement('div');
            item.className = 'faq-item';
            item.textContent = q;
            item.addEventListener('click', () => {
                addMessage(q, true);
                handleUserInput(q);
            });
            faqList.appendChild(item);
        });

        container.appendChild(faqList);
    }

    function handleUserInput(input) {
        const lowerInput = input.toLowerCase();
        let response = chatResponses.default;

        // Check each category of questions
        for (const [category, keywords] of Object.entries(chatFAQs)) {
            if (keywords.some(keyword => lowerInput.includes(keyword))) {
                response = chatResponses[category];
                break;
            }
        }

        setTimeout(() => {
            addMessage(response);
        }, 500);
    }

    // Event listeners
    sendButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, true);
            chatInput.value = '';
            handleUserInput(message);
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    chatToggle.addEventListener('click', () => {
        chatWindow.classList.add('open');
        chatInput.focus();
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // ...existing DOMContentLoaded code...
    
    initializeChat();
});

// JavaScript cho Popup Quảng Cáo
document.addEventListener('DOMContentLoaded', function() {
    const popupOverlay = document.getElementById('popup-overlay');
    const closePopupButton = document.getElementById('close-popup-button');
    let timer;

    // Hiển thị popup khi trang web được tải
    popupOverlay.style.display = 'block';

    // Đóng popup khi nhấp vào nút thoát
    closePopupButton.addEventListener('click', function() {
        popupOverlay.style.display = 'none';
        clearTimeout(timer); // Xóa bộ hẹn giờ tự động tắt nếu người dùng đóng
    });

    // Đóng popup khi nhấp ra ngoài khu vực popup
    popupOverlay.addEventListener('click', function(event) {
        if (event.target === popupOverlay) {
            popupOverlay.style.display = 'none';
            clearTimeout(timer); // Xóa bộ hẹn giờ tự động tắt nếu người dùng đóng
        }
    });

    // Tự động tắt popup sau 10 giây
    timer = setTimeout(function() {
        popupOverlay.style.display = 'none';
    }, 10000); // 10000 milliseconds = 10 giây
});
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
    }
}
// Trong file script.js hoặc một file JS riêng cho header
document.addEventListener('DOMContentLoaded', function() {
    const accountIconWrapper = document.querySelector('.header-account');
    const accountDropdown = document.querySelector('.account-dropdown');

    // Hàm để cập nhật dropdown khi đã đăng nhập
    function updateAccountDropdown(isLoggedIn, userData) {
        accountDropdown.innerHTML = ''; // Xóa nội dung hiện tại
        if (isLoggedIn) {
            const infoLink = document.createElement('a');
            infoLink.href = 'account/account-info.html';
            infoLink.classList.add('account-link');
            infoLink.textContent = 'Thông tin tài khoản';
            accountDropdown.appendChild(infoLink);

            const ordersLink = document.createElement('a');
            ordersLink.href = 'account/order-history.html';
            ordersLink.classList.add('account-link');
            ordersLink.textContent = 'Lịch sử đơn hàng';
            accountDropdown.appendChild(ordersLink);

            const logoutLink = document.createElement('a');
            logoutLink.href = 'account/login.html';
            logoutLink.classList.add('account-link');
            logoutLink.textContent = 'Đăng xuất';
            accountDropdown.appendChild(logoutLink);
        } else {
            const registerLink = document.createElement('a');
            registerLink.href = 'account/register.html';
            registerLink.classList.add('account-link');
            registerLink.textContent = 'Đăng Ký';
            accountDropdown.appendChild(registerLink);

            const loginLink = document.createElement('a');
            loginLink.href = 'account/login.html';
            loginLink.classList.add('account-link');
            loginLink.textContent = 'Đăng nhập';
            accountDropdown.appendChild(loginLink);
        }
    }

    // Gọi hàm này khi trang tải để kiểm tra trạng thái đăng nhập
    // (Bạn cần thay thế phần này bằng logic gọi API hoặc kiểm tra cookie/session)
    const isLoggedIn = checkUserLoggedIn(); // Hàm giả định kiểm tra trạng thái đăng nhập
    const userData = getUserData(); // Hàm giả định lấy thông tin người dùng nếu đã đăng nhập

    updateAccountDropdown(isLoggedIn, userData);
});

// Hàm giả định kiểm tra trạng thái đăng nhập (cần implement logic thực tế)
function checkUserLoggedIn() {
    // Ví dụ: Kiểm tra xem có cookie phiên người dùng hay không
    return document.cookie.includes('user_session');
}

// Hàm giả định lấy thông tin người dùng (cần implement logic thực tế)
function getUserData() {
    // Ví dụ: Lấy dữ liệu người dùng từ localStorage hoặc cookie
    return { name: 'Người dùng đã đăng nhập' };
}
