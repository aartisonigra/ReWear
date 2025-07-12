// Browse Items functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeBrowse();
    initializeFilters();
    initializeSearch();
    loadItems();
});

function initializeBrowse() {
    // Check if user is logged in
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

function initializeFilters() {
    const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    const clearFiltersBtn = document.querySelector('.clear-filters');
    
    // Add event listeners to filter checkboxes
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            applyFilters();
        });
    });
    
    // Clear all filters
    clearFiltersBtn.addEventListener('click', clearFilters);
}

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // Search functionality with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 500);
    });
    
    // Sort functionality
    sortSelect.addEventListener('change', function() {
        applyFilters();
    });
    
    // Load more functionality
    loadMoreBtn.addEventListener('click', function() {
        loadMoreItems();
    });
}

// Sample items data
const allItems = [
    {
        id: 1,
        title: "Vintage Denim Jacket",
        category: "outerwear",
        size: "m",
        condition: "good",
        points: 120,
        image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
        description: "Classic vintage denim jacket in excellent condition. Perfect for casual wear.",
        user: "Sarah Johnson",
        date: "2025-01-15",
        allowSwap: true,
        allowPoints: true,
        tags: ["vintage", "casual", "denim"]
    },
    {
        id: 2,
        title: "Floral Summer Dress",
        category: "dresses",
        size: "s",
        condition: "like-new",
        points: 85,
        image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400",
        description: "Beautiful floral summer dress, barely worn. Perfect for warm weather.",
        user: "Emma Wilson",
        date: "2025-01-14",
        allowSwap: true,
        allowPoints: true,
        tags: ["floral", "summer", "feminine"]
    },
    {
        id: 3,
        title: "Designer Sneakers",
        category: "shoes",
        size: "9",
        condition: "good",
        points: 200,
        image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
        description: "Comfortable designer sneakers with minimal wear. Great for everyday use.",
        user: "Mike Chen",
        date: "2025-01-13",
        allowSwap: false,
        allowPoints: true,
        tags: ["designer", "comfortable", "sneakers"]
    },
    {
        id: 4,
        title: "Wool Winter Coat",
        category: "outerwear",
        size: "l",
        condition: "new",
        points: 300,
        image: "https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400",
        description: "Brand new wool winter coat, never worn. Perfect for cold weather.",
        user: "Lisa Brown",
        date: "2025-01-12",
        allowSwap: true,
        allowPoints: true,
        tags: ["wool", "winter", "warm"]
    },
    {
        id: 5,
        title: "Casual Cotton T-Shirt",
        category: "tops",
        size: "m",
        condition: "good",
        points: 40,
        image: "https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=400",
        description: "Comfortable cotton t-shirt in great condition. Versatile and stylish.",
        user: "Anna Davis",
        date: "2025-01-11",
        allowSwap: true,
        allowPoints: false,
        tags: ["cotton", "casual", "comfortable"]
    },
    {
        id: 6,
        title: "Leather Handbag",
        category: "accessories",
        size: "one-size",
        condition: "like-new",
        points: 150,
        image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400",
        description: "Elegant leather handbag with minimal use. Perfect for work or casual outings.",
        user: "Rachel Green",
        date: "2025-01-10",
        allowSwap: true,
        allowPoints: true,
        tags: ["leather", "elegant", "handbag"]
    },
    {
        id: 7,
        title: "High-Waisted Jeans",
        category: "bottoms",
        size: "s",
        condition: "good",
        points: 75,
        image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400",
        description: "Trendy high-waisted jeans in excellent condition. Flattering fit.",
        user: "Mia Thompson",
        date: "2025-01-09",
        allowSwap: true,
        allowPoints: true,
        tags: ["high-waisted", "trendy", "denim"]
    },
    {
        id: 8,
        title: "Silk Blouse",
        category: "tops",
        size: "m",
        condition: "like-new",
        points: 95,
        image: "https://images.pexels.com/photos/1472443/pexels-photo-1472443.jpeg?auto=compress&cs=tinysrgb&w=400",
        description: "Luxurious silk blouse, perfect for professional or formal occasions.",
        user: "Sophie Clark",
        date: "2025-01-08",
        allowSwap: false,
        allowPoints: true,
        tags: ["silk", "professional", "luxury"]
    }
];

let currentItems = [];
let displayedItems = [];
let itemsPerPage = 6;
let currentPage = 1;

function loadItems() {
    currentItems = [...allItems];
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const sortOption = document.getElementById('sort-select').value;
    
    // Get selected filters
    const selectedCategories = getSelectedFilterValues('category');
    const selectedSizes = getSelectedFilterValues('size');
    const selectedConditions = getSelectedFilterValues('condition');
    const selectedExchangeTypes = getSelectedFilterValues('exchange-type');
    
    // Filter items
    let filteredItems = allItems.filter(item => {
        // Search filter
        const matchesSearch = !searchTerm || 
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        // Category filter
        const matchesCategory = selectedCategories.length === 0 || 
            selectedCategories.includes(item.category);
        
        // Size filter
        const matchesSize = selectedSizes.length === 0 || 
            selectedSizes.includes(item.size);
        
        // Condition filter
        const matchesCondition = selectedConditions.length === 0 || 
            selectedConditions.includes(item.condition);
        
        // Exchange type filter
        const matchesExchange = selectedExchangeTypes.length === 0 ||
            (selectedExchangeTypes.includes('swap') && item.allowSwap) ||
            (selectedExchangeTypes.includes('points') && item.allowPoints);
        
        return matchesSearch && matchesCategory && matchesSize && 
               matchesCondition && matchesExchange;
    });
    
    // Sort items
    filteredItems = sortItems(filteredItems, sortOption);
    
    currentItems = filteredItems;
    currentPage = 1;
    displayedItems = [];
    
    displayItems();
}

function getSelectedFilterValues(filterType) {
    const checkboxes = document.querySelectorAll(`.filter-option input[value*="${filterType === 'category' ? '' : filterType === 'size' ? '' : filterType === 'condition' ? '' : filterType === 'exchange-type' ? '' : ''}"]`);
    const values = [];
    
    // Get all checked checkboxes for the filter type
    document.querySelectorAll('.filter-option input[type="checkbox"]:checked').forEach(checkbox => {
        if (filterType === 'category' && ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'].includes(checkbox.value)) {
            values.push(checkbox.value);
        } else if (filterType === 'size' && ['xs', 's', 'm', 'l', 'xl', 'xxl'].includes(checkbox.value)) {
            values.push(checkbox.value);
        } else if (filterType === 'condition' && ['new', 'like-new', 'good', 'fair'].includes(checkbox.value)) {
            values.push(checkbox.value);
        } else if (filterType === 'exchange-type' && ['swap', 'points'].includes(checkbox.value)) {
            values.push(checkbox.value);
        }
    });
    
    return values;
}

function sortItems(items, sortOption) {
    switch (sortOption) {
        case 'newest':
            return items.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'oldest':
            return items.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'points-low':
            return items.sort((a, b) => a.points - b.points);
        case 'points-high':
            return items.sort((a, b) => b.points - a.points);
        default:
            return items;
    }
}

function displayItems() {
    const itemsGrid = document.getElementById('items-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // Get items to display
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = currentItems.slice(startIndex, endIndex);
    
    if (currentPage === 1) {
        itemsGrid.innerHTML = '';
        displayedItems = [];
    }
    
    displayedItems = [...displayedItems, ...itemsToShow];
    
    // Create item cards
    itemsToShow.forEach(item => {
        const itemCard = createBrowseItemCard(item);
        itemsGrid.appendChild(itemCard);
    });
    
    // Show/hide load more button
    const hasMoreItems = endIndex < currentItems.length;
    loadMoreBtn.style.display = hasMoreItems ? 'block' : 'none';
    
    // Update results count
    updateResultsCount();
}

function createBrowseItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="item-image">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="item-status">Available</div>
        </div>
        <div class="item-info">
            <h3 class="item-title">${item.title}</h3>
            <div class="item-meta">
                <span>${formatCategory(item.category)}</span>
                <span>Size ${item.size.toUpperCase()}</span>
                <span>${formatCondition(item.condition)}</span>
            </div>
            <p class="item-description">${item.description}</p>
            <div class="item-user">
                <small>Listed by ${item.user}</small>
            </div>
            <div class="item-actions">
                ${item.allowSwap ? `
                    <button class="btn btn-outline" onclick="requestSwap(${item.id})">
                        <i class="fas fa-exchange-alt"></i> Swap
                    </button>
                ` : ''}
                ${item.allowPoints ? `
                    <button class="btn btn-primary" onclick="redeemWithPoints(${item.id})">
                        <i class="fas fa-coins"></i> ${item.points} pts
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.btn')) {
            showItemDetail(item);
        }
    });
    
    return card;
}

function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatCondition(condition) {
    return condition.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function updateResultsCount() {
    const resultsText = `Showing ${displayedItems.length} of ${currentItems.length} items`;
    
    // Add results counter if it doesn't exist
    let counter = document.querySelector('.results-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.className = 'results-counter';
        const browseHeader = document.querySelector('.browse-header');
        browseHeader.appendChild(counter);
    }
    
    counter.textContent = resultsText;
}

function loadMoreItems() {
    currentPage++;
    displayItems();
}

function clearFilters() {
    // Uncheck all filter checkboxes
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear search
    document.getElementById('search-input').value = '';
    
    // Reset sort
    document.getElementById('sort-select').value = 'newest';
    
    // Apply filters (which will show all items)
    applyFilters();
}

// Item action functions
function requestSwap(itemId) {
    const item = allItems.find(i => i.id === itemId);
    showNotification(`Swap request sent for ${item.title}!`, 'success');
}

function redeemWithPoints(itemId) {
    const item = allItems.find(i => i.id === itemId);
    showNotification(`Redeemed ${item.title} for ${item.points} points!`, 'success');
}

function showItemDetail(item) {
    showNotification(`Item details for ${item.title}`, 'info');
    // In a real app, this would open a detailed modal or navigate to item page
}

// Add browse-specific styles
const browseStyles = `
    .item-user {
        margin-bottom: 1rem;
    }
    
    .item-user small {
        color: #9ca3af;
        font-size: 0.75rem;
    }
    
    .results-counter {
        color: #6b7280;
        font-size: 0.875rem;
        margin-left: auto;
    }
    
    .filter-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        padding: 0.25rem 0;
        transition: color 0.2s;
    }
    
    .filter-option:hover {
        color: #10b981;
    }
    
    .filter-option input[type="checkbox"] {
        width: auto;
        margin: 0;
        cursor: pointer;
    }
    
    .filter-option span {
        font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
        .browse-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
        }
        
        .results-counter {
            margin-left: 0;
            text-align: center;
        }
    }
`;

// Add styles to document
if (!document.querySelector('#browse-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'browse-styles';
    styleSheet.textContent = browseStyles;
    document.head.appendChild(styleSheet);
}

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