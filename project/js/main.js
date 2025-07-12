// Main JavaScript for ReWear Landing Page

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeFeaturedItems();
    initializeModals();
    initializeForms();
});

function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
}

function initializeFeaturedItems() {
    const carousel = document.getElementById('items-carousel');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Sample featured items data
    const featuredItems = [
        {
            id: 1,
            title: "Vintage Denim Jacket",
            category: "Outerwear",
            size: "M",
            condition: "Good",
            points: 120,
            image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
            description: "Classic vintage denim jacket in excellent condition. Perfect for casual wear.",
            status: "Available"
        },
        {
            id: 2,
            title: "Floral Summer Dress",
            category: "Dresses",
            size: "S",
            condition: "Like New",
            points: 85,
            image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400",
            description: "Beautiful floral summer dress, barely worn. Perfect for warm weather.",
            status: "Available"
        },
        {
            id: 3,
            title: "Designer Sneakers",
            category: "Shoes",
            size: "9",
            condition: "Good",
            points: 200,
            image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
            description: "Comfortable designer sneakers with minimal wear. Great for everyday use.",
            status: "Available"
        },
        {
            id: 4,
            title: "Wool Winter Coat",
            category: "Outerwear",
            size: "L",
            condition: "New",
            points: 300,
            image: "https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400",
            description: "Brand new wool winter coat, never worn. Perfect for cold weather.",
            status: "Available"
        },
        {
            id: 5,
            title: "Casual Cotton T-Shirt",
            category: "Tops",
            size: "M",
            condition: "Good",
            points: 40,
            image: "https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=400",
            description: "Comfortable cotton t-shirt in great condition. Versatile and stylish.",
            status: "Available"
        },
        {
            id: 6,
            title: "Leather Handbag",
            category: "Accessories",
            size: "One Size",
            condition: "Like New",
            points: 150,
            image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400",
            description: "Elegant leather handbag with minimal use. Perfect for work or casual outings.",
            status: "Available"
        }
    ];
    
    if (carousel) {
        displayFeaturedItems(featuredItems);
    }
}

function displayFeaturedItems(items) {
    const carousel = document.getElementById('items-carousel');
    carousel.innerHTML = '';
    
    items.forEach(item => {
        const itemCard = createItemCard(item);
        carousel.appendChild(itemCard);
    });
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="item-image">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="item-status">${item.status}</div>
        </div>
        <div class="item-info">
            <h3 class="item-title">${item.title}</h3>
            <div class="item-meta">
                <span>${item.category}</span>
                <span>Size ${item.size}</span>
                <span>${item.condition}</span>
            </div>
            <p class="item-description">${item.description}</p>
            <div class="item-actions">
                <button class="btn btn-outline" onclick="requestSwap(${item.id})">
                    <i class="fas fa-exchange-alt"></i> Swap
                </button>
                <button class="btn btn-primary" onclick="redeemWithPoints(${item.id})">
                    <i class="fas fa-coins"></i> ${item.points} pts
                </button>
            </div>
        </div>
    `;
    
    card.addEventListener('click', function() {
        showItemDetail(item);
    });
    
    return card;
}

function requestSwap(itemId) {
    event.stopPropagation();
    showLoginRequired();
}

function redeemWithPoints(itemId) {
    event.stopPropagation();
    showLoginRequired();
}

function showItemDetail(item) {
    // This would open an item detail modal or navigate to item page
    console.log('Show item detail for:', item.title);
    showLoginRequired();
}

function showLoginRequired() {
    showNotification('Please log in to continue', 'info');
}

function initializeModals() {
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
            event.target.style.display = 'none';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const activeModal = document.querySelector('.modal.show');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

function showLogin() {
    const modal = document.getElementById('login-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Close signup modal if open
    const signupModal = document.getElementById('signup-modal');
    if (signupModal.classList.contains('show')) {
        closeModal('signup-modal');
    }
}

function showSignup() {
    const modal = document.getElementById('signup-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Close login modal if open
    const loginModal = document.getElementById('login-modal');
    if (loginModal.classList.contains('show')) {
        closeModal('login-modal');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function initializeForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // For demo purposes, simulate successful login
        if (email && password) {
            showNotification('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showNotification('Please fill in all fields', 'error');
        }
    }, 2000);
}

function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // For demo purposes, simulate successful signup
        if (name && email && password) {
            showNotification('Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showNotification('Please fill in all fields', 'error');
        }
    }, 2000);
}

function scrollToBrowse() {
    const browseSection = document.getElementById('browse');
    if (browseSection) {
        browseSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 5rem;
                right: 1rem;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 1001;
                animation: slideInRight 0.3s ease-out;
                min-width: 300px;
                border-left: 4px solid;
            }
            
            .notification-success {
                border-left-color: #10b981;
                color: #065f46;
            }
            
            .notification-error {
                border-left-color: #ef4444;
                color: #991b1b;
            }
            
            .notification-info {
                border-left-color: #3b82f6;
                color: #1e40af;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                margin-left: auto;
                color: inherit;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

// Global functions for button clicks
window.showLogin = showLogin;
window.showSignup = showSignup;
window.closeModal = closeModal;
window.scrollToBrowse = scrollToBrowse;