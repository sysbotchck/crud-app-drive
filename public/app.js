// API Base URL
const API_URL = 'http://localhost:3000/api/items';

// State
let items = [];
let editingItemId = null;

// DOM Elements
const itemForm = document.getElementById('item-form');
const nameInput = document.getElementById('name');
const imageUrlInput = document.getElementById('imageUrl');
const driveUrlInput = document.getElementById('driveUrl');
const itemIdInput = document.getElementById('item-id');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const itemsGrid = document.getElementById('items-grid');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const itemCount = document.getElementById('item-count');
const toast = document.getElementById('toast');
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

let itemToDelete = null;

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    setupEventListeners();
});

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    itemForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', resetForm);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);

    // Close modal on background click
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

// ========================================
// API Functions
// ========================================
async function loadItems() {
    try {
        showLoading();
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Error al cargar los recursos');
        }

        items = await response.json();
        renderItems();
        hideLoading();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar los recursos', 'error');
        hideLoading();
    }
}

async function createItem(itemData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });

        if (!response.ok) {
            throw new Error('Error al crear el recurso');
        }

        const newItem = await response.json();
        items.unshift(newItem);
        renderItems();
        showToast('✅ Recurso creado exitosamente', 'success');
        resetForm();
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al crear el recurso', 'error');
    }
}

async function updateItem(id, itemData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el recurso');
        }

        const updatedItem = await response.json();
        const index = items.findIndex(item => item._id === id);
        if (index !== -1) {
            items[index] = updatedItem;
        }
        renderItems();
        showToast('✅ Recurso actualizado exitosamente', 'success');
        resetForm();
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al actualizar el recurso', 'error');
    }
}

async function deleteItem(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el recurso');
        }

        items = items.filter(item => item._id !== id);
        renderItems();
        showToast('✅ Recurso eliminado exitosamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al eliminar el recurso', 'error');
    }
}

// ========================================
// Form Handlers
// ========================================
function handleSubmit(e) {
    e.preventDefault();

    const itemData = {
        name: nameInput.value.trim(),
        imageUrl: imageUrlInput.value.trim(),
        driveUrl: driveUrlInput.value.trim()
    };

    if (editingItemId) {
        updateItem(editingItemId, itemData);
    } else {
        createItem(itemData);
    }
}

function resetForm() {
    itemForm.reset();
    editingItemId = null;
    itemIdInput.value = '';
    formTitle.innerHTML = '<span class="icon">✨</span> Crear Nuevo Recurso';
    submitBtn.innerHTML = '<span class="icon">💾</span> Guardar Recurso';
    cancelBtn.style.display = 'none';
}

function editItem(id) {
    const item = items.find(item => item._id === id);
    if (!item) return;

    editingItemId = id;
    itemIdInput.value = id;
    nameInput.value = item.name;
    imageUrlInput.value = item.imageUrl;
    driveUrlInput.value = item.driveUrl;

    formTitle.innerHTML = '<span class="icon">✏️</span> Editar Recurso';
    submitBtn.innerHTML = '<span class="icon">💾</span> Actualizar Recurso';
    cancelBtn.style.display = 'inline-flex';

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// ========================================
// Delete Modal
// ========================================
function showDeleteModal(id) {
    itemToDelete = id;
    deleteModal.classList.add('show');
}

function closeDeleteModal() {
    itemToDelete = null;
    deleteModal.classList.remove('show');
}

function confirmDelete() {
    if (itemToDelete) {
        deleteItem(itemToDelete);
        closeDeleteModal();
    }
}

// ========================================
// Render Functions
// ========================================
function renderItems() {
    itemCount.textContent = items.length;

    if (items.length === 0) {
        itemsGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    itemsGrid.innerHTML = items.map(item => `
        <div class="item-card">
            <img 
                src="${escapeHtml(item.imageUrl)}" 
                alt="${escapeHtml(item.name)}" 
                class="item-image"
                onerror="this.src='https://via.placeholder.com/400x200?text=Imagen+No+Disponible'"
            >
            <div class="item-content">
                <h3 class="item-name">
                    <span class="icon">📌</span>
                    ${escapeHtml(item.name)}
                </h3>
                <div class="item-links">
                    <a href="${escapeHtml(item.imageUrl)}" target="_blank" class="item-link">
                        <span class="icon">🖼️</span>
                        Ver imagen
                    </a>
                    <a href="${escapeHtml(item.driveUrl)}" target="_blank" class="item-link">
                        <span class="icon">📁</span>
                        Abrir en Drive
                    </a>
                </div>
                <div class="item-actions">
                    <button 
                        class="btn btn-secondary btn-small" 
                        onclick="editItem('${item._id}')"
                    >
                        <span class="icon">✏️</span>
                        Editar
                    </button>
                    <button 
                        class="btn btn-danger btn-small" 
                        onclick="showDeleteModal('${item._id}')"
                    >
                        <span class="icon">🗑️</span>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========================================
// UI Helpers
// ========================================
function showLoading() {
    loading.style.display = 'block';
    itemsGrid.style.display = 'none';
    emptyState.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
    itemsGrid.style.display = 'grid';
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
