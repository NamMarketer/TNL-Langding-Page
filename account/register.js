document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');

    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        validateRegistration();
    });

    function validateRegistration() {
        let isValid = true;

        // Validate Name
        if (nameInput.value.trim() === '') {
            showError('nameError', 'Vui lòng nhập họ và tên.');
            isValid = false;
        } else {
            clearError('nameError');
        }

        // Validate Email
        if (emailInput.value.trim() === '') {
            showError('emailError', 'Vui lòng nhập địa chỉ email.');
            isValid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError('emailError', 'Địa chỉ email không hợp lệ.');
            isValid = false;
        } else {
            clearError('emailError');
        }

        // Validate Password
        if (passwordInput.value === '') {
            showError('passwordError', 'Vui lòng nhập mật khẩu.');
            isValid = false;
        } else if (passwordInput.value.length < 6) {
            showError('passwordError', 'Mật khẩu phải có ít nhất 6 ký tự.');
            isValid = false;
        } else {
            clearError('passwordError');
        }

        // Validate Confirm Password
        if (confirmPasswordInput.value === '') {
            showError('confirmPasswordError', 'Vui lòng xác nhận mật khẩu.');
            isValid = false;
        } else if (confirmPasswordInput.value !== passwordInput.value) {
            showError('confirmPasswordError', 'Mật khẩu xác nhận không khớp.');
            isValid = false;
        } else {
            clearError('confirmPasswordError');
        }

        if (isValid) {
            // Gửi dữ liệu đăng ký đến máy chủ (thay thế bằng logic thực tế của bạn)
            console.log('Đăng ký thành công!', {
                name: nameInput.value,
                email: emailInput.value,
                password: passwordInput.value
            });
            alert('Đăng ký thành công! (Đây chỉ là mô phỏng)');
            // window.location.href = '/'; // Chuyển hướng sau khi đăng ký thành công
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});