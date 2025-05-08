// API manzil
const API_BASE_URL = 'https://dummyjson.com';


const productForm = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const productIdInput = document.getElementById('product-id');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const priceInput = document.getElementById('price');
const categoryInput = document.getElementById('category');
const thumbnailInput = document.getElementById('thumbnail');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const productsList = document.getElementById('products-list');
const searchInput = document.getElementById('search');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');


let products = [];
let filteredProducts = [];
let isEditing = false;

// Fetch - hamma mahsulotlar
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=20`);
        const data = await response.json();
        products = data.products;
        filteredProducts = [...products];
        renderProducts();
    } catch (error) {
        showNotification('Failed to fetch products', true);
        console.error('Error:', error);
    }
}

// Mahsulotlarni Renderlash
function renderProducts() {
    if (filteredProducts.length === 0) {
        productsList.innerHTML = '<div class="loading">Mahsulot topilmadi 😶‍🌫️</div>';
        return;
    }

    productsList.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.thumbnail}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/150'">
            </div>
            <div class="product-details">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <span class="product-category">${product.category}</span>
                <div class="product-actions">
                    <button class="edit-btn" data-id="${product.id}">Edit</button>
                    <button class="delete-btn" data-id="${product.id}">Delete</button>
                </div>
            </div>
        </div>
    `).join('');

    
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
}

// Add a new product
async function addProduct(productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        const newProduct = await response.json();
        products.unshift(newProduct);
        filteredProducts = [...products];
        renderProducts();
        showNotification('Product added successfully');
    } catch (error) {
        showNotification('Failed to add product', true);
        console.error('Error:', error);
    }
}

// Update a product
async function updateProduct(id, productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });


        const updatedProduct = await response.json();
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct };
            filteredProducts = [...products];
            renderProducts();
            showNotification('Product updated successfully');
        }
    } catch (error) {
        showNotification('Failed to update product', true);
        console.error('Error:', error);
    }
}

// Delete a product
async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;

    try {
        await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
        });
        
        products = products.filter(p => p.id != id);
        filteredProducts = filteredProducts.filter(p => p.id != id);
        renderProducts();
        showNotification('Product deleted successfully');
    } catch (error) {
        showNotification('Failed to delete product', true);
        console.error('Error:', error);
    }
}

// Edit a product
function editProduct(id) {
    const product = products.find(p => p.id == id);
    if (!product) return;

    isEditing = true;
    productIdInput.value = product.id;
    titleInput.value = product.title;
    descriptionInput.value = product.description;
    priceInput.value = product.price;
    categoryInput.value = product.category;
    thumbnailInput.value = product.thumbnail;

    formTitle.textContent = 'Edit Product';
    submitBtn.textContent = 'Update';
    cancelBtn.classList.remove('hidden');
}

// Reset form
function resetForm() {
    isEditing = false;
    productForm.reset();
    productIdInput.value = '';
    formTitle.textContent = 'Add Product';
    submitBtn.textContent = 'Add';
    cancelBtn.classList.add('hidden');
}

// Filter products
function filterProducts(searchTerm) {
    if (!searchTerm) {
        filteredProducts = [...products];
    } else {
        searchTerm = searchTerm.toLowerCase();
        filteredProducts = products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    renderProducts();
}

// Show notification
function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    notification.classList.toggle('error', isError);
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', fetchProducts);

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const productData = {
        title: titleInput.value,
        description: descriptionInput.value,
        price: parseFloat(priceInput.value),
        category: categoryInput.value,
        thumbnail: thumbnailInput.value,
    };
    
    if (isEditing) {
        updateProduct(productIdInput.value, productData);
    } else {
        addProduct(productData);
    }
    
    resetForm();
});

cancelBtn.addEventListener('click', resetForm);

searchInput.addEventListener('input', (e) => {
    filterProducts(e.target.value);
});


fetchProducts();
