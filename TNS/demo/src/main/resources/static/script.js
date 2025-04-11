let cart = [];
let products = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupToastr();
    loadTheme();
});

// Toastr setup
function setupToastr() {
    toastr.options = {
        closeButton: true,
        progressBar: true,
        positionClass: "toast-bottom-right",
    };
}

// Theme toggling
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:8080/api/customer/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        toastr.error('Failed to load products');
    }
}

// Display products in grid
function displayProducts(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.imageUrl}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://placehold.co/400x320?text=No+Image'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">₹${product.price.toFixed(2)}</p>
                <p>${product.description || 'No description available'}</p>
                <div class="product-actions">
                    <button onclick="addToCart(${product.productId})" class="add-to-cart-btn">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button onclick="quickView(${product.productId})" class="quick-view-btn">
                        <i class="fas fa-eye"></i> Quick View
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}


// Search products
function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
    );
    displayProducts(filteredProducts);
}

// Filter and sort products
function applyFilters() {
    let filtered = [...products];
    const sortValue = document.getElementById('sort-select').value;
    const maxPrice = document.getElementById('price-range').value;

    // Apply price filter
    filtered = filtered.filter(product => product.price <= maxPrice);

    // Apply sorting
    switch(sortValue) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    displayProducts(filtered);
}

// Update price label to use Rupees
function updatePriceLabel(value) {
    document.getElementById('price-label').textContent = `₹${value}`;
    applyFilters();
}

// Cart functions
function addToCart(productId) {
    const product = products.find(p => p.productId === productId);
    if (!product) {
        toastr.error('Product not found');
        return;
    }
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartCount();
    toastr.success(`Added ${product.name} to cart`);
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function showCart() {
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="/api/placeholder/100/100" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
                    <p class="cart-item-total">Total: ₹${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateCartItemQuantity(${item.productId}, ${item.quantity - 1})"
                        class="quantity-btn" ${item.quantity === 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="updateCartItemQuantity(${item.productId}, ${item.quantity + 1})"
                        class="quantity-btn">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button onclick="removeFromCart(${item.productId})" class="remove-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItems.appendChild(itemElement);
        });
    }

    updateCartTotal();
    modal.style.display = 'block';
}

function hideCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = 'none';
}

function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.productId === productId);
    if (!item) return;

    item.quantity = newQuantity;
    updateCartCount();
    showCart(); // Refresh cart display
    toastr.info('Cart updated');
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.productId === productId);
    if (itemIndex === -1) return;

    const itemName = cart[itemIndex].name;
    cart.splice(itemIndex, 1);
    
    updateCartCount();
    showCart(); // Refresh cart display
    toastr.info(`Removed ${itemName} from cart`);
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

// Quick view functionality
function quickView(productId) {
    const product = products.find(p => p.productId === productId);
    if (!product) {
        toastr.error('Product not found');
        return;
    }

    const modal = document.getElementById('quick-view-modal');
    const content = document.getElementById('quick-view-content');
    
    content.innerHTML = `
        <div class="quick-view-details">
            <img src="${product.imageUrl}" 
                 alt="${product.name}" 
                 class="quick-view-image"
                 onerror="this.src='https://placehold.co/400x320?text=No+Image'">
            <div class="quick-view-info">
                <h2>${product.name}</h2>
                <p class="price">₹${product.price.toFixed(2)}</p>
                <p class="description">${product.description || 'No description available'}</p>
                <p class="stock">In Stock: ${product.stockQuantity}</p>
                <button onclick="addToCart(${product.productId})" class="add-to-cart-btn">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function showCart() {
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.imageUrl}" 
                     alt="${item.name}" 
                     class="cart-item-image"
                     onerror="this.src='https://placehold.co/100x100?text=No+Image'">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
                    <p class="cart-item-total">Total: ₹${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateCartItemQuantity(${item.productId}, ${item.quantity - 1})"
                        class="quantity-btn" ${item.quantity === 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="updateCartItemQuantity(${item.productId}, ${item.quantity + 1})"
                        class="quantity-btn">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button onclick="removeFromCart(${item.productId})" class="remove-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItems.appendChild(itemElement);
        });
    }

    updateCartTotal();
    modal.style.display = 'block';
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        toastr.warning('Your cart is empty');
        return;
    }
    
    // Here you would typically integrate with a payment gateway
    // For now, we'll just show a success message
    toastr.success('Order placed successfully!');
    cart = [];
    updateCartCount();
    hideCart();
}

function hideQuickView() {
    const modal = document.getElementById('quick-view-modal');
    modal.style.display = 'none';
}


// Close modals when clicking outside
window.onclick = function(event) {
    const cartModal = document.getElementById('cart-modal');
    const quickViewModal = document.getElementById('quick-view-modal');
    
    if (event.target === cartModal) {
        hideCart();
    }
    if (event.target === quickViewModal) {
        hideQuickView();
    }
}