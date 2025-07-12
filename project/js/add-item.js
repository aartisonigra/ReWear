// Add Item functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeAddItem();
    initializeImageUpload();
    initializeFormHandling();
});

function initializeAddItem() {
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

function initializeImageUpload() {
    const uploadArea = document.getElementById('image-upload');
    const fileInput = document.getElementById('item-images');
    const preview = document.getElementById('image-preview');
    
    let uploadedFiles = [];
    
    // Click to upload
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        handleFileUpload(files);
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        handleFileUpload(files);
    });
    
    function handleFileUpload(files) {
        // Filter image files
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        // Check total file limit
        if (uploadedFiles.length + imageFiles.length > 5) {
            showNotification('Maximum 5 images allowed', 'error');
            return;
        }
        
        imageFiles.forEach(file => {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showNotification('Image size should be less than 5MB', 'error');
                return;
            }
            
            uploadedFiles.push(file);
            createImagePreview(file);
        });
        
        updateUploadArea();
    }
    
    function createImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="preview-remove" onclick="removeImage(this, '${file.name}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            preview.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    }
    
    function updateUploadArea() {
        if (uploadedFiles.length >= 5) {
            uploadArea.style.display = 'none';
        } else {
            uploadArea.style.display = 'block';
            const placeholder = uploadArea.querySelector('.upload-placeholder');
            placeholder.querySelector('span').textContent = `Upload up to ${5 - uploadedFiles.length} more photos`;
        }
    }
    
    // Global function to remove images
    window.removeImage = function(button, fileName) {
        const previewItem = button.parentElement;
        previewItem.remove();
        
        // Remove from uploadedFiles array
        uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
        updateUploadArea();
    };
}

function initializeFormHandling() {
    const form = document.getElementById('add-item-form');
    const allowPointsCheckbox = document.getElementById('allow-points');
    const pointValueGroup = document.getElementById('point-value-group');
    
    // Toggle point value field
    allowPointsCheckbox.addEventListener('change', function() {
        pointValueGroup.style.display = this.checked ? 'block' : 'none';
    });
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Auto-suggest point values based on category and condition
    const categorySelect = document.getElementById('item-category');
    const conditionSelect = document.getElementById('item-condition');
    const pointValueInput = document.getElementById('point-value');
    
    function updateSuggestedPoints() {
        const category = categorySelect.value;
        const condition = conditionSelect.value;
        
        if (category && condition) {
            const suggestedPoints = calculateSuggestedPoints(category, condition);
            pointValueInput.placeholder = `Suggested: ${suggestedPoints} points`;
        }
    }
    
    categorySelect.addEventListener('change', updateSuggestedPoints);
    conditionSelect.addEventListener('change', updateSuggestedPoints);
}

function calculateSuggestedPoints(category, condition) {
    const basePoints = {
        'tops': 40,
        'bottoms': 60,
        'dresses': 80,
        'outerwear': 120,
        'shoes': 100,
        'accessories': 50
    };
    
    const conditionMultiplier = {
        'new': 1.5,
        'like-new': 1.2,
        'good': 1.0,
        'fair': 0.7
    };
    
    const base = basePoints[category] || 50;
    const multiplier = conditionMultiplier[condition] || 1.0;
    
    return Math.round(base * multiplier);
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    
    // Validate required fields
    const requiredFields = ['item-title', 'item-category', 'item-size', 'item-condition', 'item-description'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#e5e7eb';
        }
    });
    
    // Check if at least one image is uploaded
    const uploadedFiles = document.querySelectorAll('.preview-item');
    if (uploadedFiles.length === 0) {
        showNotification('Please upload at least one image', 'error');
        isValid = false;
    }
    
    // Check exchange options
    const allowSwaps = document.getElementById('allow-swaps').checked;
    const allowPoints = document.getElementById('allow-points').checked;
    
    if (!allowSwaps && !allowPoints) {
        showNotification('Please select at least one exchange option', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Listing Item...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show success and redirect
        showNotification('Item listed successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }, 3000);
}

// Add drag-over styles
const addItemStyles = `
    .drag-over {
        border-color: #10b981 !important;
        background: #f0fdf4 !important;
    }
    
    .preview-item {
        position: relative;
        border-radius: 0.5rem;
        overflow: hidden;
        background: #f3f4f6;
    }
    
    .preview-item img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        display: block;
    }
    
    .preview-remove {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 1.5rem;
        height: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        transition: background-color 0.2s;
    }
    
    .preview-remove:hover {
        background: rgba(239, 68, 68, 0.9);
    }
    
    #point-value-group {
        display: none;
    }
    
    #point-value-group small {
        color: #6b7280;
        font-size: 0.75rem;
        margin-top: 0.25rem;
        display: block;
    }
`;

// Add styles to document
if (!document.querySelector('#add-item-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'add-item-styles';
    styleSheet.textContent = addItemStyles;
    document.head.appendChild(styleSheet);
}

// Utility function for notifications (reused from main.js)
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