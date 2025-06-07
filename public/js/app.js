// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const message = document.getElementById('message');

const showLoginBtn = document.getElementById('showLogin');
const showRegisterBtn = document.getElementById('showRegister');
const showDashboardBtn = document.getElementById('showDashboard');
const logoutBtn = document.getElementById('logoutBtn');

const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');

// State management
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        checkAuthAndShowDashboard();
    } else {
        showLogin();
    }
    
    // Event listeners
    showLoginBtn.addEventListener('click', showLogin);
    showRegisterBtn.addEventListener('click', showRegister);
    showDashboardBtn.addEventListener('click', showDashboard);
    logoutBtn.addEventListener('click', logout);
    
    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);
    
    document.getElementById('refreshProfile').addEventListener('click', loadUserProfile);
});

// Navigation functions
function showLogin() {
    hideAll();
    loginForm.classList.remove('hidden');
    setActiveNav('showLogin');
}

function showRegister() {
    hideAll();
    registerForm.classList.remove('hidden');
    setActiveNav('showRegister');
}

function showDashboard() {
    hideAll();
    dashboard.classList.remove('hidden');
    setActiveNav('showDashboard');
    loadUserProfile();
}

function hideAll() {
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    dashboard.classList.add('hidden');
    hideMessage();
}

function setActiveNav(activeId) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(activeId).classList.add('active');
}

function showAuthenticatedNav() {
    showDashboardBtn.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    showLoginBtn.classList.add('hidden');
    showRegisterBtn.classList.add('hidden');
}

function showUnauthenticatedNav() {
    showDashboardBtn.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    showLoginBtn.classList.remove('hidden');
    showRegisterBtn.classList.remove('hidden');
}

// Message functions
function showMessage(text, type = 'success') {
    const messageText = message.querySelector('.message-text');
    const messageIcon = message.querySelector('.message-icon');

    messageText.textContent = text;
    messageIcon.innerHTML = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';

    message.className = `message ${type}`;
    message.classList.remove('hidden');

    setTimeout(() => {
        hideMessage();
    }, 5000);
}

function hideMessage() {
    message.classList.add('hidden');
}

// Password toggle function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password i');

    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
}

// Button loading state
function setButtonLoading(button, loading) {
    const span = button.querySelector('span');
    const loader = button.querySelector('.btn-loader');

    if (loading) {
        button.disabled = true;
        span.style.opacity = '0';
        loader.classList.remove('hidden');
    } else {
        button.disabled = false;
        span.style.opacity = '1';
        loader.classList.add('hidden');
    }
}

// API functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`/api${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Auth functions
async function handleLogin(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        authToken = data.data.accessToken;
        localStorage.setItem('authToken', authToken);

        showMessage('Welcome back! Login successful.', 'success');
        showAuthenticatedNav();
        showDashboard();

    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ firstName, lastName, email, password })
        });

        showMessage('🎉 Account created successfully! Please login with your credentials.', 'success');
        showLogin();

        // Clear form
        registerFormElement.reset();

    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

async function logout() {
    try {
        if (authToken) {
            await apiCall('/auth/logout', { method: 'POST' });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        showUnauthenticatedNav();
        showLogin();
        showMessage('Logged out successfully!', 'success');
    }
}

async function checkAuthAndShowDashboard() {
    try {
        await loadUserProfile();
        showAuthenticatedNav();
        showDashboard();
    } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
        authToken = null;
        showUnauthenticatedNav();
        showLogin();
    }
}

async function loadUserProfile() {
    try {
        const data = await apiCall('/users/profile');
        currentUser = data.data.user;

        document.getElementById('userInfo').innerHTML = `
            <p><strong>👤 Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
            <p><strong>📧 Email:</strong> ${currentUser.email}</p>
            <p><strong>📅 Member since:</strong> ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
            <p><strong>🕒 Last login:</strong> ${currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'First time!'}</p>
            <p><strong>✨ Status:</strong> ${currentUser.isVerified ? '✅ Verified' : '⏳ Pending verification'}</p>
        `;

        // Update account status
        document.getElementById('accountStatus').textContent = currentUser.isActive ? 'Active' : 'Inactive';

    } catch (error) {
        showMessage('Failed to load profile: ' + error.message, 'error');
        throw error;
    }
}

// Make functions globally available
window.togglePassword = togglePassword;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.hideMessage = hideMessage;
