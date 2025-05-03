document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        validateLogin();
    });

    function validateLogin() {
        let isValid = true;

        // Validate Email
        if (emailInput.value.trim() === '') {
            showError('loginEmailError', 'Vui lòng nhập địa chỉ email.');
            isValid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError('loginEmailError', 'Địa chỉ email không hợp lệ.');
            isValid = false;
        } else {
            clearError('loginEmailError');
        }

        // Validate Password
        if (passwordInput.value === '') {
            showError('loginPasswordError', 'Vui lòng nhập mật khẩu.');
            isValid = false;
        } else {
            clearError('loginPasswordError');
        }

        if (isValid) {
            // Gửi dữ liệu đăng nhập đến máy chủ (thay thế bằng logic thực tế của bạn)
            console.log('Đăng nhập!', {
                email: emailInput.value,
                password: passwordInput.value
            });
            alert('Đăng nhập thành công! (Đây chỉ là mô phỏng)');
            // window.location.href = '/'; // Chuyển hướng sau khi đăng nhập thành công
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
