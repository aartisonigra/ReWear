// Admin Panel functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    initializeAdminSidebar();
    loadAdminData();
});

function initializeAdmin() {
    // Check if user is admin (in a real app, check admin privileges)
    if (!isAdminLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize user menu
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', toggleUserMenu);
    }
    
    // Close user menu when clicking outside
    document.addEventListener('click', function(event) {
        const userMenu = document.querySelector('.user-menu');
        const dropdown = document.getElementById('user-dropdown');
        
        if (dropdown && !userMenu.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
}

function isAdminLoggedIn() {
    // In a real app, check for admin authentication
    return localStorage.getItem('demo_admin') === 'logged_in';
}

function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('show');
}

function logout() {
    localStorage.removeItem('demo_admin');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function initializeAdminSidebar() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const adminSections = document.querySelectorAll('.admin-section');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Update active sidebar item
            sidebarItems.forEach(si => si.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            adminSections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            // Load section-specific data
            loadAdminSectionData(targetSection);
        });
    });
}

// Sample data for admin panel
const pendingItemsData = [
    {
        id: 1,
        title: "Vintage Leather Jacket",
        category: "Outerwear",
        size: "M",
        condition: "Good",
        points: 180,
        user: "John Smith",
        date: "2025-01-15",
        images: ["https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400"],
        description: "Classic vintage leather jacket in good condition. Minor wear on sleeves but overall excellent quality."
    },
    {
        id: 2,
        title: "Designer High Heels",
        category: "Shoes",
        size: "8",
        condition: "Like New",
        points: 220,
        user: "Maria Garcia",
        date: "2025-01-14",
        images: ["https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400"],
        description: "Barely worn designer high heels. Perfect for special occasions. No visible wear or damage."
    },
    {
        id: 3,
        title: "Casual Summer Top",
        category: "Tops",
        size: "S",
        condition: "Good",
        points: 45,
        user: "Emily Chen",
        date: "2025-01-13",
        images: ["https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=400"],
        description: "Light and breezy summer top. Perfect for warm weather. Some minor pilling but still in great shape."
    }
];

const usersData = [
    {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        itemsListed: 12,
        swapsCompleted: 8,
        status: "active",
        joinDate: "2024-12-01"
    },
    {
        id: 2,
        name: "Mike Chen",
        email: "mike.chen@email.com",
        itemsListed: 6,
        swapsCompleted: 4,
        status: "active",
        joinDate: "2024-11-15"
    },
    {
        id: 3,
        name: "Emma Wilson",
        email: "emma.wilson@email.com",
        itemsListed: 15,
        swapsCompleted: 12,
        status: "active",
        joinDate: "2024-10-20"
    }
];

let currentReviewItem = null;

function loadAdminData() {
    updatePendingCount();
    loadAdminSectionData('pending');
}

function updatePendingCount() {
    const pendingCount = document.getElementById('pending-count');
    if (pendingCount) {
        pendingCount.textContent = pendingItemsData.length;
    }
}

function loadAdminSectionData(section) {
    switch (section) {
        case 'pending':
            loadPendingItems();
            break;
        case 'approved':
            loadApprovedItems();
            break;
        case 'rejected':
            loadRejectedItems();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'reports':
            loadReportsData();
            break;
    }
}

function loadPendingItems() {
    const container = document.getElementById('pending-items');
    container.innerHTML = '';
    
    pendingItemsData.forEach(item => {
        const itemCard = createAdminItemCard(item, 'pending');
        container.appendChild(itemCard);
    });
}

function loadApprovedItems() {
    const container = document.getElementById('approved-items');
    container.innerHTML = '';
    
    // Sample approved items (in a real app, this would come from API)
    const approvedItems = [
        {
            id: 4,
            title: "Cotton T-Shirt",
            category: "Tops",
            size: "M",
            condition: "Good",
            points: 40,
            user: "Lisa Brown",
            date: "2025-01-12",
            images: ["https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=400"],
            approvedDate: "2025-01-13"
        }
    ];
    
    approvedItems.forEach(item => {
        const itemCard = createAdminItemCard(item, 'approved');
        container.appendChild(itemCard);
    });
}

function loadRejectedItems() {
    const container = document.getElementById('rejected-items');
    container.innerHTML = '<p class="text-gray-500">No rejected items</p>';
}

function loadUsersData() {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    
    usersData.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div>
                    <div class="font-medium">${user.name}</div>
                    <div class="text-sm text-gray-500">Joined ${formatDate(user.joinDate)}</div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.itemsListed}</td>
            <td>${user.swapsCompleted}</td>
            <td><span class="user-status ${user.status}">${user.status}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="viewUserDetails(${user.id})">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadReportsData() {
    const container = document.getElementById('reported-items');
    container.innerHTML = '<p class="text-gray-500">No reported items</p>';
}

function createAdminItemCard(item, type) {
    const card = document.createElement('div');
    card.className = 'admin-item-card';
    
    const actionsHTML = type === 'pending' ? `
        <button class="btn btn-primary" onclick="reviewItem(${item.id})">
            <i class="fas fa-eye"></i> Review
        </button>
        <button class="btn btn-success" onclick="quickApprove(${item.id})">
            <i class="fas fa-check"></i> Approve
        </button>
        <button class="btn btn-danger" onclick="quickReject(${item.id})">
            <i class="fas fa-times"></i> Reject
        </button>
    ` : type === 'approved' ? `
        <button class="btn btn-outline" onclick="viewApprovedItem(${item.id})">
            <i class="fas fa-eye"></i> View
        </button>
        <button class="btn btn-danger" onclick="removeItem(${item.id})">
            <i class="fas fa-trash"></i> Remove
        </button>
    ` : `
        <button class="btn btn-outline" onclick="viewRejectedItem(${item.id})">
            <i class="fas fa-eye"></i> View
        </button>
    `;
    
    card.innerHTML = `
        <div class="admin-item-image">
            <img src="${item.images[0]}" alt="${item.title}" loading="lazy">
        </div>
        <div class="admin-item-info">
            <h3 class="admin-item-title">${item.title}</h3>
            <div class="admin-item-meta">
                <span>${item.category} • Size ${item.size}</span>
                <span>${item.points} points</span>
            </div>
            <p class="admin-item-description">${item.description.substring(0, 100)}...</p>
            <div class="admin-item-user">
                <small>Listed by ${item.user} on ${formatDate(item.date)}</small>
            </div>
            <div class="admin-item-actions">
                ${actionsHTML}
            </div>
        </div>
    `;
    
    return card;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Admin action functions
function reviewItem(itemId) {
    const item = pendingItemsData.find(i => i.id === itemId);
    if (item) {
        currentReviewItem = item;
        showReviewModal(item);
    }
}

function showReviewModal(item) {
    const modal = document.getElementById('review-modal');
    
    // Populate modal with item data
    document.getElementById('review-title').textContent = item.title;
    document.getElementById('review-category').textContent = item.category;
    document.getElementById('review-size').textContent = item.size;
    document.getElementById('review-condition').textContent = item.condition;
    document.getElementById('review-points').textContent = item.points;
    document.getElementById('review-description-text').textContent = item.description;
    document.getElementById('review-user-name').textContent = `${item.user} (${formatDate(item.date)})`;
    
    // Set main image
    const mainImage = document.getElementById('review-main-image');
    mainImage.src = item.images[0];
    
    // Set thumbnails
    const thumbnailsContainer = document.getElementById('review-thumbnails');
    thumbnailsContainer.innerHTML = '';
    
    item.images.forEach((image, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.innerHTML = `<img src="${image}" alt="Thumbnail ${index + 1}">`;
        thumbnail.addEventListener('click', function() {
            mainImage.src = image;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
        thumbnailsContainer.appendChild(thumbnail);
    });
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function approveItem() {
    if (currentReviewItem) {
        showNotification(`${currentReviewItem.title} approved successfully!`, 'success');
        
        // Remove from pending items
        const index = pendingItemsData.findIndex(item => item.id === currentReviewItem.id);
        if (index > -1) {
            pendingItemsData.splice(index, 1);
        }
        
        closeModal('review-modal');
        loadPendingItems();
        updatePendingCount();
        currentReviewItem = null;
    }
}

function rejectItem() {
    if (currentReviewItem) {
        showNotification(`${currentReviewItem.title} rejected`, 'info');
        
        // Remove from pending items
        const index = pendingItemsData.findIndex(item => item.id === currentReviewItem.id);
        if (index > -1) {
            pendingItemsData.splice(index, 1);
        }
        
        closeModal('review-modal');
        loadPendingItems();
        updatePendingCount();
        currentReviewItem = null;
    }
}

function quickApprove(itemId) {
    const item = pendingItemsData.find(i => i.id === itemId);
    if (item) {
        showNotification(`${item.title} approved successfully!`, 'success');
        
        // Remove from pending items
        const index = pendingItemsData.findIndex(i => i.id === itemId);
        if (index > -1) {
            pendingItemsData.splice(index, 1);
        }
        
        loadPendingItems();
        updatePendingCount();
    }
}

function quickReject(itemId) {
    const item = pendingItemsData.find(i => i.id === itemId);
    if (item) {
        showNotification(`${item.title} rejected`, 'info');
        
        // Remove from pending items
        const index = pendingItemsData.findIndex(i => i.id === itemId);
        if (index > -1) {
            pendingItemsData.splice(index, 1);
        }
        
        loadPendingItems();
        updatePendingCount();
    }
}

function removeItem(itemId) {
    if (confirm('Are you sure you want to remove this item?')) {
        showNotification('Item removed successfully', 'success');
        loadApprovedItems();
    }
}

function viewUserDetails(userId) {
    const user = usersData.find(u => u.id === userId);
    if (user) {
        showNotification(`User details for ${user.name}`, 'info');
    }
}

function viewApprovedItem(itemId) {
    showNotification('Item details would open here', 'info');
}

function viewRejectedItem(itemId) {
    showNotification('Item details would open here', 'info');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Add admin-specific styles
const adminStyles = `
    .admin-item-description {
        color: #6b7280;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        line-height: 1.4;
    }
    
    .admin-item-user {
        margin-bottom: 1rem;
    }
    
    .admin-item-user small {
        color: #9ca3af;
        font-size: 0.75rem;
    }
    
    .admin-item-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .admin-item-actions .btn {
        font-size: 0.75rem;
        padding: 0.375rem 0.75rem;
        justify-content: center;
    }
    
    .btn-sm {
        font-size: 0.75rem;
        padding: 0.375rem 0.75rem;
    }
    
    .text-gray-500 {
        color: #6b7280;
        text-align: center;
        padding: 2rem;
        font-style: italic;
    }
    
    @media (max-width: 768px) {
        .admin-item-actions {
            flex-direction: row;
            flex-wrap: wrap;
        }
        
        .admin-item-actions .btn {
            flex: 1;
            min-width: 80px;
        }
    }
`;

// Add styles to document
if (!document.querySelector('#admin-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'admin-styles';
    styleSheet.textContent = adminStyles;
    document.head.appendChild(styleSheet);
}

// Set demo admin as logged in for development
localStorage.setItem('demo_admin', 'logged_in');

// Utility function for notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
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
            
            .notification-success { border-left-color: #10b981; color: #065f46; }
            .notification-error { border-left-color: #ef4444; color: #991b1b; }
            .notification-info { border-left-color: #3b82f6; color: #1e40af; }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                margin-left: auto;
                color: inherit;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .notification-close:hover { opacity: 1; }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

// Global functions
window.toggleUserMenu = toggleUserMenu;
window.logout = logout;
window.reviewItem = reviewItem;
window.approveItem = approveItem;
window.rejectItem = rejectItem;
window.quickApprove = quickApprove;
window.quickReject = quickReject;
window.removeItem = removeItem;
window.viewUserDetails = viewUserDetails;
window.viewApprovedItem = viewApprovedItem;
window.viewRejectedItem = viewRejectedItem;
window.closeModal = closeModal;