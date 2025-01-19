document.getElementById('register-form').addEventListener('submit', function (e) {
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;
    let email = document.getElementById('email').value;
    let phone = document.getElementById('phone').value;

    // Password and Confirm Password validation
    if (password !== confirmPassword) {
        e.preventDefault();
        alert('Passwords do not match!');
        return false;
    }

    // Email format validation
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        e.preventDefault();
        alert('Please enter a valid email address!');
        return false;
    }

    // Phone number validation (just check if it's a number)
    let phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phone)) {
        e.preventDefault();
        alert('Please enter a valid phone number!');
        return false;
    }

    return true;
});
