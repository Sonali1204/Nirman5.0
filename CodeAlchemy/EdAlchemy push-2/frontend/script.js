// Auth state management
let currentUser = null;
const API_BASE = 'http://localhost:5000/api';

// DOM Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userDropdown = document.getElementById('userDropdown');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

function initializeApp() {
    // Create auth buttons container if it doesn't exist
    const existingAuthButtons = document.querySelector('.auth-buttons');
    const ctaButtons = document.querySelector('.cta-buttons');
    
    if (!existingAuthButtons && ctaButtons) {
        const authButtonsContainer = document.createElement('div');
        authButtonsContainer.className = 'auth-buttons';
        ctaButtons.parentNode.insertBefore(authButtonsContainer, ctaButtons);
    }
}

function setupEventListeners() {
    // Modal triggers
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        if (btn.textContent.includes('Get Started') || btn.textContent.includes('Start Learning') || btn.textContent.includes('Start Now')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentUser) {
                    showNotification('Welcome back to EdAlchemy!', 'success');
                } else {
                    showLoginModal();
                }
            });
        }
        
        if (btn.textContent.includes('Try Demo')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showNotification('Demo mode activated! Explore EdAlchemy features.', 'info');
            });
        }
    });

    // Close modals
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });

    // Modal background close
    [loginModal, registerModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModals();
        });
    });

    // Auth form switches
    document.getElementById('showRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    document.getElementById('showLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Form submissions
    loginForm?.addEventListener('submit', handleLogin);
    registerForm?.addEventListener('submit', handleRegister);

    // User dropdown
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-avatar') && !e.target.closest('.user-dropdown')) {
            userDropdown.style.display = 'none';
        }
    });
}

// Auth functions
async function handleLogin(e) {
    e.preventDefault();
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    const formData = new FormData(loginForm);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            currentUser = result.user;
            updateUIForAuth();
            closeModals();
            showNotification(result.message || 'Login successful!', 'success');
            loginForm.reset();
        } else {
            showNotification(result.message || 'Login failed!', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    const formData = new FormData(registerForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        college: formData.get('college'),
        course: formData.get('course'),
        year: formData.get('year')
    };

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            currentUser = result.user;
            updateUIForAuth();
            closeModals();
            showNotification(result.message || 'Registration successful!', 'success');
            registerForm.reset();
        } else {
            showNotification(result.message || 'Registration failed!', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateUIForAuth();
    showNotification('Logged out successfully', 'info');
    userDropdown.style.display = 'none';
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            updateUIForAuth();
            
            // Verify token is still valid
            fetch(`${API_BASE}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(response => response.json())
              .then(result => {
                  if (!result.success) {
                      handleLogout();
                  }
              });
        } catch (error) {
            console.error('Error parsing user data:', error);
            handleLogout();
        }
    }
}

function updateUIForAuth() {
    const authButtonsContainer = document.querySelector('.auth-buttons');
    const originalButtons = document.querySelector('.cta-buttons');
    
    if (currentUser) {
        // User is logged in
        if (originalButtons) originalButtons.style.display = 'none';
        if (authButtonsContainer) {
            authButtonsContainer.innerHTML = `
                <div class="user-avatar" id="userAvatar" title="${currentUser.name}">
                    ${currentUser.name.charAt(0).toUpperCase()}
                </div>
            `;
            
            // Add user avatar event listener
            document.getElementById('userAvatar').addEventListener('click', toggleUserDropdown);
            
            // Update dropdown content
            document.getElementById('userName').textContent = currentUser.name;
            document.getElementById('userEmail').textContent = currentUser.email;
            
            // Add logout functionality
            document.getElementById('logoutLink').addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });
        }
    } else {
        // User is not logged in
        if (originalButtons) originalButtons.style.display = 'flex';
        if (authButtonsContainer) authButtonsContainer.innerHTML = '';
    }
}

function toggleUserDropdown() {
    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
}

function showLoginModal() {
    loginModal.style.display = 'block';
    registerModal.style.display = 'none';
}

function showRegisterModal() {
    registerModal.style.display = 'block';
    loginModal.style.display = 'none';
}

function closeModals() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Mobile menu functionality (keep your existing code)
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');
const ctaButtons = document.querySelector('.cta-buttons');

if (mobileMenu) {
    mobileMenu.addEventListener('click', function() {
        const isVisible = navLinks.style.display === 'flex';
        navLinks.style.display = isVisible ? 'none' : 'flex';
        if (ctaButtons) {
            ctaButtons.style.display = isVisible ? 'none' : 'flex';
        }
        
        if (window.innerWidth <= 768 && !isVisible) {
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.backgroundColor = 'var(--primary)';
            navLinks.style.padding = '20px';
            navLinks.style.gap = '20px';
            
            if (ctaButtons) {
                ctaButtons.style.flexDirection = 'column';
                ctaButtons.style.position = 'absolute';
                ctaButtons.style.top = '250px';
                ctaButtons.style.left = '0';
                ctaButtons.style.width = '100%';
                ctaButtons.style.padding = '20px';
                ctaButtons.style.gap = '15px';
            }
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
                if (ctaButtons) ctaButtons.style.display = 'none';
            }
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(10, 10, 18, 0.95)';
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
    } else {
        header.style.backgroundColor = 'rgba(10, 10, 18, 0.9)';
        header.style.boxShadow = 'none';
    }
});

// Add animation to elements when they come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .problem-item, .solution-item, .persona-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});