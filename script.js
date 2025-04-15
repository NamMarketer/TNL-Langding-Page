document.addEventListener('DOMContentLoaded', function() {

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
    const sliderContainer = sliderWrapper ? sliderWrapper.querySelector('.slider-container') : null;
    const slider = sliderContainer ? sliderContainer.querySelector('.slider') : null;
    const originalSlides = slider ? Array.from(slider.querySelectorAll('.product-item')) : [];
    const prevButton = sliderWrapper ? sliderWrapper.querySelector('.slider-btn.prev-btn') : null;
    const nextButton = sliderWrapper ? sliderWrapper.querySelector('.slider-btn.next-btn') : null;

    if (slider && originalSlides.length > 0 && sliderContainer && sliderWrapper) {
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
            currentSlideIndex = 0;
        }

        function centerSlide(index, smooth = true) {
            if (index < 0 || index >= totalSlidesWithClones || !allSlidesWithClones[index]) {
                console.error("Invalid slide index or slide element not found:", index);
                return;
            }
            // Recalculate width inside function for responsiveness
            const currentSlideWidth = sliderContainer.offsetWidth;
            const translateValuePx = index * currentSlideWidth;

            slider.style.transition = smooth ? 'transform 0.5s ease-in-out' : 'none';
            slider.style.transform = `translateX(-${translateValuePx}px)`;
        }


        function handleInfiniteLoopJump() {
            if (originalTotalSlides <= 1) return; // No jump needed for single slide or no slides

            let jumped = false;
            // If we are at the last clone (visually the first item)
            if (currentSlideIndex === 0) {
                currentSlideIndex = originalTotalSlides; // Go to the actual last original slide's index in the 'allSlidesWithClones' array
                jumped = true;
            // If we are at the first clone (visually the last item)
            } else if (currentSlideIndex === totalSlidesWithClones - 1) {
                currentSlideIndex = 1; // Go to the actual first original slide's index (which is index 1 after adding lastClone at the beginning)
                jumped = true;
            }

            // If a jump occurred, reposition instantly without animation
            if (jumped) {
                 // Use a tiny timeout to ensure the jump happens after the transition potentially ends
                 setTimeout(() => {
                    centerSlide(currentSlideIndex, false); // Jump without transition
                    isTransitioning = false; // Allow next move immediately after jump
                }, 10); // Small delay might help consistency
            } else {
                // If no jump, just unlock transitioning state
                 isTransitioning = false;
            }
       }

        function moveToSlide(targetIndex) {
            // Prevent action if already transitioning or only one slide
            if (isTransitioning || originalTotalSlides <= 1) return;

            isTransitioning = true;
            currentSlideIndex = targetIndex;
            centerSlide(currentSlideIndex, true); // Always move smoothly

            // --- Reliable Transition End Handling ---
            const transitionEndHandler = (event) => {
                 // Ensure the event is for the transform property and the slider itself
                 if (event.propertyName !== 'transform' || event.target !== slider) return;
                 handleInfiniteLoopJump(); // Check if a jump is needed after transition
                 slider.removeEventListener('transitionend', transitionEndHandler); // Clean up listener
            };
            slider.addEventListener('transitionend', transitionEndHandler);

             // Fallback timer in case transitionend doesn't fire (e.g., interrupted transition)
            setTimeout(() => {
                if (isTransitioning) { // Check if still transitioning (transitionend didn't fire)
                    // console.warn("TransitionEnd event fallback triggered.");
                    handleInfiniteLoopJump(); // Force jump check
                    slider.removeEventListener('transitionend', transitionEndHandler); // Clean up listener
                 }
             }, 600); // Duration slightly longer than CSS transition
        }

        function startAutoSlide() {
            stopAutoSlide(); // Clear any existing interval
            if (originalTotalSlides <= 1) return; // Don't auto-slide if only one item
            autoSlideInterval = setInterval(() => {
                moveToSlide(currentSlideIndex + 1); // Move to the next slide
            }, 4000); // 4 seconds interval
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        // --- Event Binding ---
        if (originalTotalSlides > 1) {
            // Pause on hover
            sliderWrapper.addEventListener('mouseenter', stopAutoSlide);
            sliderWrapper.addEventListener('mouseleave', startAutoSlide);

            // Button Clicks
            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    if (isTransitioning) return; // Prevent rapid clicks
                    stopAutoSlide(); // Stop auto slide on manual interaction
                    moveToSlide(currentSlideIndex - 1);
                    // Optional: restartAutoSlide(); // Restart auto slide after manual click
                });
            } else { console.warn("Previous button not found for event binding."); }

            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    if (isTransitioning) return; // Prevent rapid clicks
                    stopAutoSlide(); // Stop auto slide on manual interaction
                    moveToSlide(currentSlideIndex + 1);
                    // Optional: restartAutoSlide(); // Restart auto slide after manual click
                });
            } else { console.warn("Next button not found for event binding."); }

            // Recalculate position on window resize (debounced)
            let resizeTimer;
            window.addEventListener('resize', () => {
                 clearTimeout(resizeTimer);
                 resizeTimer = setTimeout(() => {
                     centerSlide(currentSlideIndex, false); // Recenter instantly on resize
                 }, 150); // Debounce timeout
             });
        }

        // --- Initialization ---
        // Use requestAnimationFrame for smoother initial rendering
        requestAnimationFrame(() => {
            centerSlide(currentSlideIndex, false); // Set initial position without animation
            if (originalTotalSlides > 1) {
                startAutoSlide(); // Start auto-sliding if more than one slide
                // Ensure buttons are visible if needed (might have been hidden if initially 1 slide)
                if(prevButton) prevButton.style.display = 'flex';
                if(nextButton) nextButton.style.display = 'flex';
            } else {
                 // Ensure buttons are hidden if only one slide
                 if(prevButton) prevButton.style.display = 'none';
                 if(nextButton) nextButton.style.display = 'none';
            }
        });

    } else {
        console.warn("Slider initialization failed: Required elements not found or no slides present.");
        // Ensure buttons are hidden if slider fails to initialize
        if (prevButton) prevButton.style.display = 'none';
        if (nextButton) nextButton.style.display = 'none';
    }


    // ========== COUNTDOWN TIMER LOGIC ==========
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const hoursLeftElement = document.getElementById('hours-left');
    const discountForm = document.getElementById('myForm'); // Target the form for disabling later
    const countdownDisplayContainer = document.getElementById('countdown-timer-display');

    if (hoursElement && minutesElement && secondsElement && discountForm && countdownDisplayContainer) {
        // ***** Duration changed to 3 hours *****
        const countdownDurationHours = 3; // Duration in hours (CHANGED FROM 12)
        // **************************************

        let targetTimeString = localStorage.getItem('countdownTargetTime');
        let targetTime;

        if (targetTimeString) {
            targetTime = parseInt(targetTimeString, 10);
            if (isNaN(targetTime) || targetTime < new Date().getTime() - 10000) { // Allow a small buffer
                targetTime = new Date().getTime() + countdownDurationHours * 60 * 60 * 1000;
                localStorage.setItem('countdownTargetTime', targetTime);
            }
        } else {
            // Set initial timer if none exists
            targetTime = new Date().getTime() + countdownDurationHours * 60 * 60 * 1000;
            localStorage.setItem('countdownTargetTime', targetTime);
        }

        let countdownInterval; // Define interval variable in this scope

        function updateCountdown() {
            const now = new Date().getTime();
            const timeRemaining = targetTime - now;

            // --- Timer Expired ---
            if (timeRemaining <= 0) {
                clearInterval(countdownInterval); // Stop the interval
                // Update display message
                if (countdownDisplayContainer) {
                    countdownDisplayContainer.innerHTML = "<p style='font-size: 1.2em; font-weight: bold; color: #FFCCCC;'>Ưu đãi đã kết thúc!</p>";
                }
                // Hide the "hours left" note
                const formNote = discountForm.parentElement.querySelector('.form-note');
                if (formNote) formNote.style.display = 'none';

                // Disable the form button
                const formButton = discountForm.querySelector('button[type="submit"]');
                if (formButton) {
                    formButton.disabled = true;
                    formButton.textContent = "Đã Hết Hạn";
                    formButton.style.backgroundColor = '#aaa'; // Visually indicate disabled state
                    formButton.style.cursor = 'not-allowed';
                }
                // Disable form inputs
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

            // Update the "hours left" span (optional)
            if (hoursLeftElement) {
                const hoursLeft = Math.ceil(timeRemaining / (1000 * 60 * 60)); // Round up hours
                hoursLeftElement.textContent = hoursLeft;
            }
        }

        // Initial call to display timer immediately
        updateCountdown();
        // Start the interval timer
        countdownInterval = setInterval(updateCountdown, 1000); // Assign interval to the variable
    } else {
        console.warn("Countdown timer elements, discount form, or display container not found.");
         // Optionally hide elements if setup fails
          if (countdownDisplayContainer) countdownDisplayContainer.style.display = 'none';
          const formNote = document.querySelector('.form-note');
          if (formNote) formNote.style.display = 'none';
    }


    // ========== FORM HANDLING LOGIC ==========
    // --- Handle Discount Form (#myForm) ---
    const theDiscountForm = document.getElementById("myForm"); // Use specific variable name

    if (theDiscountForm) {
        theDiscountForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent default HTML form submission
            const submitButton = theDiscountForm.querySelector('button[type="submit"]');

            // Get form values using correct IDs from HTML
            var name = document.getElementById("name").value.trim();
            var email = document.getElementById("email").value.trim();
            var phone = document.getElementById("phone").value.trim();
            const emailInput = document.getElementById("email"); // For validation check

            // Basic validation (HTML5 'required' attribute handles empty fields, check email format)
            if (!email || !emailInput.checkValidity()) {
                 alert("Vui lòng nhập địa chỉ email hợp lệ.");
                 if (emailInput) emailInput.focus(); // Focus on the invalid field
                 return; // Stop submission
            }

            // Disable button during submission (integration from old logic)
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Đang gửi...';
            }

            // Prepare data object to send
            var data = {
                name: name,
                email: email,
                phone: phone,
                // Optional: You might want to add a source identifier if you use the same script for multiple forms
                // formSource: 'Discount Registration TNL Page'
            };

            // ***** Using new fetch with no-cors *****
            fetch("https://script.google.com/macros/s/AKfycbxrnCxZ7WfxLyU7S7RorgGqPikF6Ag169Q-9mIgUw46ka4zcO53j4zpoinwbkuLcCXglg/exec", { // NEW URL PROVIDED BY USER
                method: "POST",
                mode: "no-cors", // ADDED AS REQUESTED BY USER
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(() => {
                // NOTE: With 'no-cors', we CANNOT read the actual response from GAS.
                // We assume success if the request itself doesn't throw an error.
                alert("Thông tin đã được gửi!"); // Use the new success message
                theDiscountForm.reset(); // Clear the form fields
            })
            .catch(error => {
                // Handle network errors or other issues with the fetch request
                console.error("Lỗi:", error); // Use the new console error log
                alert("Có lỗi xảy ra, vui lòng thử lại."); // Use the new error message
            })
            .finally(() => {
                 // Re-enable the button AFTER the request finishes (success or error)
                 // Keep the existing button re-enabling logic from the OLD code to handle timer expiration
                 if (submitButton) {
                     const timerIsActive = localStorage.getItem('countdownTargetTime') && parseInt(localStorage.getItem('countdownTargetTime'), 10) > new Date().getTime();
                     if (timerIsActive) {
                         submitButton.disabled = false;
                         // Reset text to the original button text from HTML
                         submitButton.textContent = 'Submit';
                     } else {
                         // Keep it disabled if timer expired while submitting
                         submitButton.disabled = true;
                         submitButton.textContent = "Đã Hết Hạn";
                         submitButton.style.backgroundColor = '#aaa';
                         submitButton.style.cursor = 'not-allowed';
                     }
                 }
            });
            // *******************************************
        });
    } else {
        console.warn("Form with id='myForm' not found.");
    }

    // --- Handle Other Contact Form (Placeholder - Keep if you have other forms) ---
    /*
    const URL_FORM_LIEN_HE_KHAC = "YOUR_OTHER_GOOGLE_SCRIPT_URL_HERE";
    // ... existing commented out code for other forms ...
    */


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
            chatWindow.classList.remove('open'); // Remove class to hide window
             // Wait for close animation to finish before showing toggle button again
             setTimeout(() => {
                chatToggle.style.display = 'flex'; // Show the toggle button
            }, 300); // Match the transition duration in CSS (.chat-window)
        });
    } else { console.warn("Chat box elements not found."); }


    // ========== UPDATE COPYRIGHT YEAR ==========
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        try {
            // Get current year from client's system
            yearSpan.textContent = new Date().getFullYear();
        } catch (e) {
            console.warn("Could not get current date for copyright year.");
            // Fallback: Keep the default year from HTML if error occurs
        }
    }

    // ========== HANDLE "BUY NOW" BUTTON CLICKS ==========
    const buyNowButtons = document.querySelectorAll('.btn-buy');

    buyNowButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productItem = this.closest('.product-item');
            if (!productItem) {
                console.error("Could not find product item");
                return;
            }
            
            let productName = productItem.dataset.productName;
            let productImage = productItem.dataset.productImage;
            let productPrice = productItem.dataset.productPrice;
            
            if (!productName || !productImage || !productPrice) {
                if (!productName) {
                    const nameElement = productItem.querySelector('h3');
                    productName = nameElement ? nameElement.textContent.trim() : 'Unknown Product';
                }
                if (!productImage) {
                    const imgElement = productItem.querySelector('img');
                    productImage = imgElement ? imgElement.getAttribute('src') : '';
                }
            }
            
            if (!productName || productName === 'Unknown Product') {
                console.error("Product name could not be determined");
                return;
            }
            
            // Use URLSearchParams to properly encode the parameters
            const params = new URLSearchParams();
            params.append('name', productName);
            params.append('image', productImage);
            params.append('price', productPrice);
            
            window.location.href = `Thanh toán/TRANG THANH TOÁN.html?${params.toString()}`;
        });
    });

    // ========== CART MANAGEMENT ==========
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
        updateCartCount();
    }

    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-buy')) {
            const productCard = e.target.closest('[data-product-info]');
            if (productCard) {
                const productInfo = JSON.parse(productCard.dataset.productInfo);
                const params = new URLSearchParams({
                    name: productInfo.name,
                    price: productInfo.price,
                    image: productInfo.image,
                    id: productInfo.id
                });
                window.location.href = `Thanh toán/TRANG THANH TOÁN.html?${params.toString()}`;
            }
        }
    });

    updateCartCount();

    // ========== CART MODAL LOGIC ==========
    const cartToggle = document.getElementById('cartToggle');
    const cartModal = document.querySelector('.cart-modal-overlay');
    const cartCloseBtn = document.querySelector('.cart-close-btn');

    if (cartToggle && cartModal && cartCloseBtn) {
        cartToggle.addEventListener('click', (e) => {
            e.preventDefault();
            cartModal.style.display = 'block';
            setTimeout(() => {
                document.querySelector('.cart-modal').classList.add('active');
            }, 10);
        });

        cartCloseBtn.addEventListener('click', () => {
            document.querySelector('.cart-modal').classList.remove('active');
            setTimeout(() => {
                cartModal.style.display = 'none';
            }, 300);
        });

        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                document.querySelector('.cart-modal').classList.remove('active');
                setTimeout(() => {
                    cartModal.style.display = 'none';
                }, 300);
            }
        });
    }

    // ========== DIRECT CHECKOUT FUNCTION ==========
    function muaNgay(product) {
        // Save product to localStorage for checkout
        localStorage.setItem('checkout-product', JSON.stringify(product));
        // Redirect to checkout page
        window.location.href = 'Thanh toán/TRANG THANH TOÁN.html';
    }

}); // End DOMContentLoaded Listener