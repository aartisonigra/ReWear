-- ReWear Database Schema
-- This file contains the complete database structure for the ReWear platform

-- Users table for authentication and user management
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    points INT DEFAULT 100,
    profile_image VARCHAR(255),
    location VARCHAR(100),
    bio TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Categories table for item categorization
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Tops', 'T-shirts, blouses, sweaters, and other upper body clothing'),
('Bottoms', 'Pants, jeans, skirts, shorts, and lower body clothing'),
('Dresses', 'All types of dresses and one-piece garments'),
('Outerwear', 'Jackets, coats, blazers, and outer garments'),
('Shoes', 'All types of footwear'),
('Accessories', 'Bags, jewelry, scarves, and other accessories');

-- Items table for clothing listings
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    size VARCHAR(20) NOT NULL,
    condition_type ENUM('new', 'like-new', 'good', 'fair') NOT NULL,
    point_value INT,
    allow_swaps BOOLEAN DEFAULT TRUE,
    allow_points BOOLEAN DEFAULT TRUE,
    status ENUM('pending', 'approved', 'rejected', 'swapped', 'redeemed', 'removed') DEFAULT 'pending',
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    tags TEXT, -- JSON array of tags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_point_value (point_value),
    FULLTEXT idx_search (title, description, tags)
);

-- Item images table for multiple photos per item
CREATE TABLE IF NOT EXISTS item_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    
    INDEX idx_item_id (item_id),
    INDEX idx_is_primary (is_primary)
);

-- Swaps table for tracking item exchanges
CREATE TABLE IF NOT EXISTS swaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    owner_id INT NOT NULL,
    requester_item_id INT,
    owner_item_id INT NOT NULL,
    swap_type ENUM('direct', 'points') NOT NULL,
    points_used INT NULL,
    status ENUM('pending', 'accepted', 'declined', 'completed', 'cancelled') DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (requester_item_id) REFERENCES items(id),
    FOREIGN KEY (owner_item_id) REFERENCES items(id),
    
    INDEX idx_requester_id (requester_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Wishlist table for users to save items they're interested in
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_wishlist (user_id, item_id),
    INDEX idx_user_id (user_id),
    INDEX idx_item_id (item_id)
);

-- Reviews table for user feedback on swaps
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    swap_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewed_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (swap_id) REFERENCES swaps(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_id) REFERENCES users(id),
    
    UNIQUE KEY unique_review (swap_id, reviewer_id),
    INDEX idx_reviewed_id (reviewed_id),
    INDEX idx_rating (rating)
);

-- Reports table for flagging inappropriate content
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    item_id INT,
    user_id INT,
    reason ENUM('inappropriate', 'spam', 'fake', 'offensive', 'other') NOT NULL,
    description TEXT,
    status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Notifications table for user notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('swap_request', 'swap_accepted', 'swap_declined', 'swap_completed', 'item_approved', 'item_rejected', 'points_earned', 'general') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id INT, -- Can reference swap_id, item_id, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Point transactions table for tracking point changes
CREATE TABLE IF NOT EXISTS point_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount INT NOT NULL, -- Positive for earning, negative for spending
    type ENUM('signup_bonus', 'swap_completed', 'item_listed', 'item_redeemed', 'admin_adjustment') NOT NULL,
    description TEXT,
    related_id INT, -- Can reference swap_id, item_id, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- Sessions table for user session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);

-- Admin logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type ENUM('user', 'item', 'swap', 'report') NOT NULL,
    target_id INT NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_id) REFERENCES users(id),
    
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Create a default admin user (password: admin123)
-- In production, change this password immediately!
INSERT INTO users (name, email, password_hash, role, points) VALUES
('Admin User', 'admin@rewear.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1000);

-- Create some sample users for development
INSERT INTO users (name, email, password_hash, role, points, location, bio) VALUES
('Sarah Johnson', 'sarah@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 150, 'New York, NY', 'Fashion enthusiast passionate about sustainable living'),
('Mike Chen', 'mike@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 220, 'Los Angeles, CA', 'Designer and eco-conscious consumer'),
('Emma Wilson', 'emma@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 180, 'Chicago, IL', 'Love finding unique pieces and sharing my style');

-- Views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.points,
    COUNT(DISTINCT i.id) as items_listed,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as swaps_completed,
    AVG(r.rating) as avg_rating,
    COUNT(DISTINCT r.id) as total_reviews
FROM users u
LEFT JOIN items i ON u.id = i.user_id AND i.status NOT IN ('rejected', 'removed')
LEFT JOIN swaps s ON (u.id = s.requester_id OR u.id = s.owner_id)
LEFT JOIN reviews r ON u.id = r.reviewed_id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.email, u.points;

CREATE VIEW item_details AS
SELECT 
    i.*,
    c.name as category_name,
    u.name as user_name,
    u.location as user_location,
    COUNT(DISTINCT w.id) as wishlist_count,
    GROUP_CONCAT(img.filename ORDER BY img.order_index) as image_files
FROM items i
JOIN categories c ON i.category_id = c.id
JOIN users u ON i.user_id = u.id
LEFT JOIN wishlist w ON i.id = w.item_id
LEFT JOIN item_images img ON i.id = img.item_id
WHERE i.status = 'approved'
GROUP BY i.id;

-- Triggers for automatic point management
DELIMITER //

CREATE TRIGGER after_swap_completed
AFTER UPDATE ON swaps
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Give points to both users for successful swap
        INSERT INTO point_transactions (user_id, amount, type, description, related_id)
        VALUES 
            (NEW.requester_id, SUCCESSFUL_SWAP_POINTS, 'swap_completed', 'Points earned from successful swap', NEW.id),
            (NEW.owner_id, SUCCESSFUL_SWAP_POINTS, 'swap_completed', 'Points earned from successful swap', NEW.id);
        
        -- Update user points
        UPDATE users SET points = points + SUCCESSFUL_SWAP_POINTS WHERE id = NEW.requester_id;
        UPDATE users SET points = points + SUCCESSFUL_SWAP_POINTS WHERE id = NEW.owner_id;
        
        -- Update item status
        UPDATE items SET status = 'swapped' WHERE id = NEW.requester_item_id OR id = NEW.owner_item_id;
    END IF;
END//

CREATE TRIGGER after_item_approved
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Give points for listing approved item
        INSERT INTO point_transactions (user_id, amount, type, description, related_id)
        VALUES (NEW.user_id, ITEM_LISTING_POINTS, 'item_listed', 'Points earned for approved item listing', NEW.id);
        
        -- Update user points
        UPDATE users SET points = points + ITEM_LISTING_POINTS WHERE id = NEW.user_id;
    END IF;
END//

CREATE TRIGGER after_user_signup
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    -- Give signup bonus points
    INSERT INTO point_transactions (user_id, amount, type, description)
    VALUES (NEW.id, SIGNUP_BONUS_POINTS, 'signup_bonus', 'Welcome bonus points');
END//

DELIMITER ;

-- Indexes for better performance
CREATE INDEX idx_items_search ON items(status, created_at DESC);
CREATE INDEX idx_swaps_user_status ON swaps(requester_id, owner_id, status);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_point_transactions_user_date ON point_transactions(user_id, created_at DESC);

-- Full-text search index for items
ALTER TABLE items ADD FULLTEXT(title, description);

-- Clean up old sessions procedure
DELIMITER //
CREATE PROCEDURE CleanupExpiredSessions()
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END//
DELIMITER ;

-- Event to automatically clean up expired sessions daily
CREATE EVENT IF NOT EXISTS cleanup_sessions
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO CALL CleanupExpiredSessions();