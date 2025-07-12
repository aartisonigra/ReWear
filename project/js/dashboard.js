// Dashboard JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadUserData();
    initializeSidebar();
    initializeTabs();
    loadDashboardData();
});

function initializeDashboard() {
    // Check if user is logged in (in a real app, check authentication)
    if (!isUserLoggedIn()) {
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

function isUserLoggedIn() {
    // In a real app, check for valid session/token
    return localStorage.getItem('demo_user') === 'logged_in';
}

function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('show');
}

function logout() {
    localStorage.removeItem('demo_user');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function loadUserData() {
    // Simulate loading user data
    const userData = {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        points: 150,
        location: 'New York, NY',
        bio: 'Fashion enthusiast passionate about sustainable living'
    };
    
    // Update UI with user data
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = userData.name;
    }
    
    const pointsElement = document.getElementById('user-points');
    if (pointsElement) {
        pointsElement.textContent = userData.points;
    }
    
    // Load profile form data
    loadProfileForm(userData);
}

function loadProfileForm(userData) {
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileLocation = document.getElementById('profile-location');
    const profileBio = document.getElementById('profile-bio');
    
    if (profileName) profileName.value = userData.name;
    if (profileEmail) profileEmail.value = userData.email;
    if (profileLocation) profileLocation.value = userData.location;
    if (profileBio) profileBio.value = userData.bio;
    
    // Handle profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

function handleProfileUpdate(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showNotification('Profile updated successfully!', 'success');
    }, 1500);
}

function initializeSidebar() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Update active sidebar item
            sidebarItems.forEach(si => si.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            dashboardSections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            // Load section-specific data
            loadSectionData(targetSection);
        });
    });
}

function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(tb => tb.classList.remove('active'));
            this.classList.add('active');
            
            // Show target tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(`${targetTab}-swaps`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Load tab-specific data
            loadSwapsData(targetTab);
        });
    });
}

function loadDashboardData() {
    loadOverviewData();
    loadMyItemsData();
    loadSwapsData('pending');
}

function loadOverviewData() {
    // Update stats
    document.getElementById('total-items').textContent = '12';
    document.getElementById('total-swaps').textContent = '8';
    document.getElementById('wishlist-items').textContent = '5';
    
    // Load recent activity
    loadRecentActivity();
}

function loadRecentActivity() {
    const activities = [
        {
            type: 'swap',
            icon: 'exchange-alt',
            title: 'Swap completed',
            description: 'Your vintage jacket was swapped for a floral dress',
            time: '2 hours ago'
        },
        {
            type: 'item',
            icon: 'plus',
            title: 'Item listed',
            description: 'Your designer sneakers are now live',
            time: '1 day ago'
        },
        {
            type: 'points',
            icon: 'coins',
            title: 'Points earned',
            description: 'Earned 50 points from successful swap',
            time: '2 days ago'
        },
        {
            type: 'request',
            icon: 'heart',
            title: 'Swap request',
            description: 'New swap request for your winter coat',
            time: '3 days ago'
        }
    ];
    
    const activityContainer = document.getElementById('recent-activity');
    if (activityContainer) {
        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-info">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }
}

function loadMyItemsData() {
    const items = [
        {
            id: 1,
            title: "Vintage Denim Jacket",
            category: "Outerwear",
            size: "M",
            condition: "Good",
            points: 120,
            image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
            status: "Active",
            views: 25,
            likes: 8
        },
        {
            id: 2,
            title: "Designer Sneakers",
            category: "Shoes",
            size: "9",
            condition: "Good",
            points: 200,
            image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
            status: "Active",
            views: 42,
            likes: 15
        },
        {
            id: 3,
            title: "Summer Dress",
            category: "Dresses",
            size: "S",
            condition: "Like New",
            points: 85,
            image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400",
            status: "Swapped",
            views: 18,
            likes: 6
        }
    ];
    
    const itemsContainer = document.getElementById('user-items');
    if (itemsContainer) {
        itemsContainer.innerHTML = items.map(item => createUserItemCard(item)).join('');
    }
}

function createUserItemCard(item) {
    const statusClass = item.status === 'Active' ? 'success' : item.status === 'Swapped' ? 'info' : 'warning';
    
    return `
        <div class="item-card">
            <div class="item-image">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="item-status ${statusClass}">${item.status}</div>
            </div>
            <div class="item-info">
                <h3 class="item-title">${item.title}</h3>
                <div class="item-meta">
                    <span>${item.category}</span>
                    <span>Size ${item.size}</span>
                    <span>${item.condition}</span>
                </div>
                <div class="item-stats">
                    <span><i class="fas fa-eye"></i> ${item.views} views</span>
                    <span><i class="fas fa-heart"></i> ${item.likes} likes</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-outline" onclick="editItem(${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-primary" onclick="viewItem(${item.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        </div>
    `;
}

function loadSwapsData(tab) {
    const swapsData = {
        pending: [
            {
                id: 1,
                type: 'incoming',
                item: 'Vintage Denim Jacket',
                otherItem: 'Leather Boots',
                user: 'Mike Chen',
                date: '2 days ago',
                image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400"
            },
            {
                id: 2,
                type: 'outgoing',
                item: 'Designer Sneakers',
                otherItem: 'Winter Scarf',
                user: 'Emma Wilson',
                date: '1 day ago',
                image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400"
            }
        ],
        active: [
            {
                id: 3,
                type: 'ongoing',
                item: 'Summer Dress',
                otherItem: 'Casual Blazer',
                user: 'Lisa Brown',
                date: '3 days ago',
                status: 'Shipping',
                image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400"
            }
        ],
        completed: [
            {
                id: 4,
                type: 'completed',
                item: 'Wool Sweater',
                otherItem: 'Denim Skirt',
                user: 'Anna Davis',
                date: '1 week ago',
                rating: 5,
                image: "https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400"
            }
        ]
    };
    
    const container = document.getElementById(`${tab}-swaps`);
    if (container && swapsData[tab]) {
        container.innerHTML = swapsData[tab].map(swap => createSwapCard(swap)).join('');
    }
}

function createSwapCard(swap) {
    return `
        <div class="swap-card">
            <div class="swap-image">
                <img src="${swap.image}" alt="${swap.item}" loading="lazy">
            </div>
            <div class="swap-info">
                <h4>${swap.item}</h4>
                <p>Swap with: <strong>${swap.otherItem}</strong></p>
                <p>User: ${swap.user}</p>
                <p>Date: ${swap.date}</p>
                ${swap.status ? `<p>Status: <span class="status">${swap.status}</span></p>` : ''}
                ${swap.rating ? `<p>Rating: ${'★'.repeat(swap.rating)}</p>` : ''}
            </div>
            <div class="swap-actions">
                ${getSwapActions(swap)}
            </div>
        </div>
    `;
}

function getSwapActions(swap) {
    switch (swap.type) {
        case 'incoming':
            return `
                <button class="btn btn-success" onclick="acceptSwap(${swap.id})">Accept</button>
                <button class="btn btn-outline" onclick="declineSwap(${swap.id})">Decline</button>
            `;
        case 'outgoing':
            return `
                <button class="btn btn-outline" onclick="cancelSwap(${swap.id})">Cancel</button>
            `;
        case 'ongoing':
            return `
                <button class="btn btn-primary" onclick="viewSwapDetails(${swap.id})">View Details</button>
            `;
        case 'completed':
            return `
                <button class="btn btn-outline" onclick="viewSwapDetails(${swap.id})">View Details</button>
            `;
        default:
            return '';
    }
}

function loadSectionData(section) {
    switch (section) {
        case 'overview':
            loadOverviewData();
            break;
        case 'my-items':
            loadMyItemsData();
            break;
        case 'swaps':
            loadSwapsData('pending');
            break;
        case 'profile':
            // Profile data already loaded
            break;
    }
}

// Swap action functions
function acceptSwap(swapId) {
    showNotification('Swap request accepted!', 'success');
    // Reload swaps data
    loadSwapsData('pending');
}

function declineSwap(swapId) {
    showNotification('Swap request declined', 'info');
    // Reload swaps data
    loadSwapsData('pending');
}

function cancelSwap(swapId) {
    showNotification('Swap request cancelled', 'info');
    // Reload swaps data
    loadSwapsData('pending');
}

function viewSwapDetails(swapId) {
    showNotification('Swap details would open here', 'info');
}

// Item action functions
function editItem(itemId) {
    showNotification('Edit functionality would open here', 'info');
}

function viewItem(itemId) {
    showNotification('Item details would open here', 'info');
}

// Add CSS for additional dashboard styles
const dashboardStyles = `
    .item-stats {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .item-stats i {
        margin-right: 0.25rem;
    }
    
    .swap-card {
        display: flex;
        gap: 1rem;
        background: white;
        padding: 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .swap-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .swap-image {
        width: 80px;
        height: 80px;
        border-radius: 0.5rem;
        overflow: hidden;
        flex-shrink: 0;
    }
    
    .swap-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .swap-info {
        flex: 1;
    }
    
    .swap-info h4 {
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #1f2937;
    }
    
    .swap-info p {
        margin-bottom: 0.25rem;
        color: #6b7280;
        font-size: 0.875rem;
    }
    
    .swap-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: end;
    }
    
    .swap-actions .btn {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        min-width: 100px;
    }
    
    .status {
        color: #10b981;
        font-weight: 500;
    }
    
    @media (max-width: 768px) {
        .swap-card {
            flex-direction: column;
        }
        
        .swap-actions {
            flex-direction: row;
            align-items: center;
        }
    }
`;

// Add styles to document
if (!document.querySelector('#dashboard-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'dashboard-styles';
    styleSheet.textContent = dashboardStyles;
    document.head.appendChild(styleSheet);
}

// Set demo user as logged in for development
localStorage.setItem('demo_user', 'logged_in');

// Global functions
window.toggleUserMenu = toggleUserMenu;
window.logout = logout;