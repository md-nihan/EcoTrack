// API Base URL - Auto-detect environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `${window.location.protocol}//${window.location.host}/api`;

// ========== Utility Functions ==========
function showAlert(message, type = 'error') {
    const alertElement = document.getElementById('alertMessage');
    alertElement.className = `alert ${type}`;
    alertElement.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    alertElement.style.display = 'flex';

    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}

function togglePassword(inputId = 'password') {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling?.querySelector('i') || 
                   input.parentElement?.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        if (button) button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        if (button) button.className = 'fas fa-eye';
    }
}

function setLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner"></span> Processing...';
    } else {
        button.disabled = false;
        // Restore original text based on button
        if (buttonId === 'loginBtn') {
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        } else if (buttonId === 'registerBtn') {
            button.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    }
}

// ========== Login Handler ==========
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validation
        if (!email || !password) {
            showAlert('Please fill in all fields', 'error');
            return;
        }

        setLoading('loginBtn', true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showAlert(data.message || 'Login failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('Server error. Please try again later.', 'error');
        } finally {
            setLoading('loginBtn', false);
        }
    });
}

// ========== Register Handler ==========
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();

        // Validation
        if (!username || !email || !password) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        if (username.length < 3) {
            showAlert('Username must be at least 3 characters', 'error');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            showAlert('Please enter a valid email address', 'error');
            return;
        }

        setLoading('registerBtn', true);

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    firstName,
                    lastName
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showAlert('Account created successfully! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showAlert(data.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('Server error. Please try again later.', 'error');
        } finally {
            setLoading('registerBtn', false);
        }
    });
}

// ========== Check Authentication ==========
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    
    // If on dashboard and no token, redirect to login
    if (currentPage === 'dashboard.html' && !token) {
        window.location.href = 'login.html';
    }
    
    // If on login/register and has token, redirect to dashboard
    if ((currentPage === 'login.html' || currentPage === 'register.html') && token) {
        window.location.href = 'dashboard.html';
    }
}

// Check authentication on page load
checkAuth();

// ========== Password Strength Indicator ==========
const passwordInput = document.getElementById('password');
if (passwordInput && document.getElementById('registerForm')) {
    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        const strength = calculatePasswordStrength(password);
        
        // You can add a visual strength indicator here
        console.log('Password strength:', strength);
    });
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    return strength; // 0-5 scale
}

// ========== Social Login Handlers ==========
const googleLoginButtons = document.querySelectorAll('.btn-social.google');
const facebookLoginButtons = document.querySelectorAll('.btn-social.facebook');

googleLoginButtons.forEach(button => {
    button.addEventListener('click', () => {
        showAlert('Google Sign-in is not yet configured. Please use email registration.', 'error');
        // TODO: Implement Google OAuth
        // window.location.href = `${API_URL}/auth/google`;
    });
});

facebookLoginButtons.forEach(button => {
    button.addEventListener('click', () => {
        showAlert('Facebook Sign-in is not yet configured. Please use email registration.', 'error');
        // TODO: Implement Facebook OAuth
        // window.location.href = `${API_URL}/auth/facebook`;
    });
});

// ========== Form Animation ==========
document.addEventListener('DOMContentLoaded', () => {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            group.style.transition = 'all 0.5s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});
