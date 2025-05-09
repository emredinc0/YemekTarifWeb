const API_BASE_URL = "http://localhost:5111/api";
const API_URL = `${API_BASE_URL}/recipes`;
let allRecipes = [];
let filteredRecipes = [];
let selectedCategory = "";
let searchTerm = "";

// Malzeme etiketli arama için
let ingredients = [];
const ingredientInput = document.getElementById('ingredientInput');
const ingredientTags = document.getElementById('ingredientTags');
const findRecipesBtn = document.getElementById('findRecipesBtn');

const loadingDiv = document.getElementById("loading");
const recipesRow = document.getElementById("recipesRow");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const categoryBtns = document.querySelectorAll(".category-btn");
const recipeModal = document.getElementById("recipeModal");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");

let favoriteIds = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');

// Kullanıcı oturum yönetimi
let currentUser = null;
let jwtToken = localStorage.getItem('jwtToken') || null;

function setUser(user, token) {
    currentUser = user;
    jwtToken = token;
    if (token) localStorage.setItem('jwtToken', token);
    else localStorage.removeItem('jwtToken');
    renderUserArea();
}

function renderUserArea() {
    const userArea = document.getElementById('userArea');
    if (currentUser) {
        userArea.innerHTML = `<span class="me-2">👋 <b>${currentUser.userName}</b></span><button class="btn btn-outline-danger btn-sm" id="logoutBtn">Çıkış Yap</button>`;
        document.getElementById('logoutBtn').onclick = () => { setUser(null, null); };
    } else {
        userArea.innerHTML = `<button class="btn btn-primary" id="loginBtn">Giriş Yap / Kayıt Ol</button>`;
        document.getElementById('loginBtn').onclick = openAuthModal;
    }
}

function openAuthModal() {
    const authModal = document.getElementById('authModal');
    authModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('login-tab').classList.add('active');
    document.getElementById('register-tab').classList.remove('active');
    document.getElementById('loginTabPane').classList.add('show', 'active');
    document.getElementById('registerTabPane').classList.remove('show', 'active');
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    authModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

document.getElementById('closeAuthModal').onclick = closeAuthModal;
window.onclick = function(e) {
    if (e.target === document.getElementById('authModal')) closeAuthModal();
};

document.getElementById('loginBtn') && (document.getElementById('loginBtn').onclick = openAuthModal);

document.getElementById('loginForm').onsubmit = async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Giriş başarısız');
        const data = await res.json();
        setUser(data.user, data.token);
        closeAuthModal();
    } catch (err) {
        document.getElementById('loginError').innerText = err.message || 'Giriş başarısız';
        document.getElementById('loginError').style.display = 'block';
    }
};

document.getElementById('registerForm').onsubmit = async function(e) {
    e.preventDefault();
    const userName = document.getElementById('registerUserName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, email, password })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Kayıt başarısız');
        // Kayıt başarılıysa otomatik giriş
        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await loginRes.json();
        setUser(data.user, data.token);
        closeAuthModal();
    } catch (err) {
        document.getElementById('registerError').innerText = err.message || 'Kayıt başarısız';
        document.getElementById('registerError').style.display = 'block';
    }
};

// Token'ı otomatik olarak fetch isteklerine ekle
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
    if (jwtToken && typeof input === 'string' && input.startsWith(API_BASE_URL)) {
        init.headers = init.headers || {};
        init.headers['Authorization'] = 'Bearer ' + jwtToken;
    }
    return originalFetch(input, init);
};

// Sayfa yüklendiğinde kullanıcıyı localStorage'dan yükle
(function() {
    if (jwtToken) {
        // Token'dan kullanıcı adını decode etmek için basit bir yol (güvenli değil, demo amaçlı)
        try {
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            currentUser = { userName: payload['unique_name'] || payload['name'], email: payload['email'] };
        } catch {}
    }
    renderUserArea();
})();

// Yorum, puan, favori işlemlerini sadece giriş yapanlara aç
function requireLogin(action) {
    if (!currentUser) {
        openAuthModal();
        return false;
    }
    return true;
}

// Fetch recipes from API
document.addEventListener("DOMContentLoaded", async () => {
    await fetchRecipes();
    setupEvents();
});

async function fetchRecipes() {
    loadingDiv.style.display = "block";
    recipesRow.innerHTML = "";
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        allRecipes = data;
        filteredRecipes = allRecipes;
        renderRecipes();
    } catch (e) {
        loadingDiv.innerHTML = "Tarifler yüklenemedi.";
    }
}

function renderRecipes() {
    loadingDiv.style.display = "none";
    recipesRow.innerHTML = "";
    if (!filteredRecipes.length) {
        recipesRow.innerHTML = '<div class="text-center">Hiç tarif bulunamadı.</div>';
        return;
    }
    filteredRecipes.forEach(recipe => {
        const imageUrl = recipe.imageUrl ? recipe.imageUrl : "/img/default-food.jpg";
        const title = recipe.title || "Başlık Yok";
        const description = recipe.description || "Açıklama Yok";
        const favClass = isFavorite(recipe.id) ? 'btn-danger' : 'btn-outline-danger';
        const favIcon = isFavorite(recipe.id) ? '♥' : '♡';
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 col-lg-3";
        col.innerHTML = `
            <div class="card h-100 recipe-card">
                <div class="position-relative overflow-hidden">
                    <img src="${imageUrl}" class="card-img-top" alt="${title}">
                    <button class="btn ${favClass} btn-sm favorite-btn position-absolute" style="top:12px; right:12px;" data-id="${recipe.id}">${favIcon}</button>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-truncate">${title}</h5>
                    <p class="card-text flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${description}</p>
                    <button class="btn btn-warning w-100 show-recipe-btn" data-id="${recipe.id}">
                        <i class="bi bi-book me-2"></i>Tarifi Gör
                    </button>
                </div>
            </div>
        `;
        recipesRow.appendChild(col);
    });
    // Tüm 'Tarifi Gör' butonlarına event listener ekle
    document.querySelectorAll('.show-recipe-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            console.log("Tarifi Gör butonuna tıklandı, id:", id);
            window.showRecipeModal(id);
        });
    });
    // Favori butonlarına event listener ekle
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            toggleFavorite(id);
        });
    });
}

window.showRecipeModal = async function(id) {
    console.log("showRecipeModal çağrıldı, id:", id);
    const recipe = allRecipes.find(r => r.id === id);
    console.log("Bulunan tarif:", recipe);
    if (!recipe) {
        alert("Tarif bulunamadı! ID: " + id);
        return;
    }
    const recipeModal = document.getElementById('recipeModal');
    const modalBody = document.getElementById('modalBody');
    const imageUrl = recipe.imageUrl ? recipe.imageUrl : "/img/default-food.jpg";
    const ingredientsHtml = recipe.ingredients
        ? `<ul>${recipe.ingredients.split('\\n').map(i => `<li>${i.trim()}</li>`).join('')}</ul>`
        : "";
    const instructionsHtml = recipe.instructions
        ? `<ol>${recipe.instructions.split('\\n').map(i => `<li>${i.trim()}</li>`).join('')}</ol>`
        : "";
    let commentsHtml = '<div id="commentsSection"><div class="text-center text-muted">Yorumlar yükleniyor...</div></div>';
    let ratingHtml = `<div id="ratingSection" class="mb-3"><div class="text-center text-muted">Puanlar yükleniyor...</div></div>`;
    const favClass = isFavorite(id) ? 'btn-danger' : 'btn-outline-danger';
    const favIcon = isFavorite(id) ? '♥' : '♡';
    modalBody.innerHTML = `
        <h2 class="modal-title-modern">${recipe.title}</h2>
        <img src="${imageUrl}" alt="${recipe.title}" class="modal-img-modern">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <span class="badge bg-warning text-dark me-2" style="font-size: 0.9rem; padding: 8px 12px; border-radius: 12px;">
                    <i class="bi bi-clock me-1"></i> 45 dk
                </span>
                <span class="badge bg-info text-dark" style="font-size: 0.9rem; padding: 8px 12px; border-radius: 12px;">
                    <i class="bi bi-people me-1"></i> 4 Kişilik
                </span>
            </div>
            <button class="btn ${favClass} btn-lg" id="modalFavoriteBtn" style="border-radius: 12px; padding: 8px 16px;">
                ${favIcon} Favorilere ${isFavorite(id) ? 'Çıkar' : 'Ekle'}
            </button>
        </div>
        <div id="ratingContainer" class="mb-4">${ratingHtml}</div>
        <div class="modal-section">
            <h4 class="modal-section-title">
                <i class="bi bi-card-checklist me-2"></i>Malzemeler
            </h4>
            <div class="modal-section-content">${ingredientsHtml}</div>
        </div>
        <div class="modal-section">
            <h4 class="modal-section-title">
                <i class="bi bi-journal-text me-2"></i>Yapılışı
            </h4>
            <div class="modal-section-content">${instructionsHtml}</div>
        </div>
        ${recipe.youtubeUrl ? `
        <div class="text-center mt-4">
            <a href="${recipe.youtubeUrl}" target="_blank" class="youtube-link">
                <i class="bi bi-youtube"></i>
                YouTube'da İzle
            </a>
        </div>` : ""}
        <div class="modal-section">
            <h4 class="modal-section-title">
                <i class="bi bi-chat-dots me-2"></i>Yorumlar
            </h4>
            <div class="modal-section-content" id="commentsContainer">${commentsHtml}</div>
        </div>
        <form id="addCommentForm" class="mt-4">
            <div class="mb-3">
                <textarea class="form-control" id="commentContent" rows="2" maxlength="300" 
                    placeholder="Yorumunuzu yazın..." required
                    style="border-radius: 12px; padding: 12px; font-size: 1rem;"></textarea>
            </div>
            <button type="submit" class="btn btn-primary w-100" style="border-radius: 12px; padding: 12px;">
                <i class="bi bi-send me-2"></i>Yorum Ekle
            </button>
        </form>
    `;
    recipeModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    // Favori butonu event
    document.getElementById('modalFavoriteBtn').onclick = function() {
        toggleFavorite(id);
        updateFavoriteButtonInModal(id);
    };
    // Puanları getir ve göster
    await loadAndRenderRating(id);
    // Yorumları getir ve göster
    await loadAndRenderComments(id);
    // Yorum ekleme formu
    const addCommentForm = document.getElementById("addCommentForm");
    addCommentForm.onsubmit = async function(e) {
        e.preventDefault();
        const content = document.getElementById("commentContent").value.trim();
        if (!content) return;
        await fetch(`${API_BASE_URL}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeId: id, content })
        });
        document.getElementById("commentContent").value = "";
        await loadAndRenderComments(id);
    };
}

function updateFavoriteButtonInModal(id) {
    const btn = document.getElementById('modalFavoriteBtn');
    if (!btn) return;
    const favClass = isFavorite(id) ? 'btn-danger' : 'btn-outline-danger';
    const favIcon = isFavorite(id) ? '♥' : '♡';
    btn.className = `btn ${favClass} btn-lg`;
    btn.innerHTML = `${favIcon} Favorilere ${isFavorite(id) ? 'Çıkar' : 'Ekle'}`;
}

async function loadAndRenderRating(recipeId) {
    const ratingSection = document.getElementById("ratingSection");
    ratingSection.innerHTML = '<div class="text-center text-muted">Puanlar yükleniyor...</div>';
    try {
        const res = await fetch(`${API_BASE_URL}/ratings/recipe/${recipeId}/average`);
        const { average, count } = await res.json();
        let starsHtml = '';
        const rounded = Math.round(average);
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<span class="star" data-value="${i}" style="font-size:2rem; color:${i <= rounded ? '#ffc107' : '#e0e0e0'}; cursor:pointer;">&#9733;</span>`;
        }
        ratingSection.innerHTML = `
            <div class="d-flex flex-column align-items-center">
                <div id="starRow">${starsHtml}</div>
                <div class="mt-1" style="font-size:1.1rem; color:#555;">Ortalama Puan: <b>${average.toFixed(1)}</b> (${count} oy)</div>
                <div id="ratingMsg" class="text-success mt-1" style="display:none;"></div>
            </div>
        `;
        // Yıldızlara tıklama
        document.querySelectorAll('#starRow .star').forEach(star => {
            star.addEventListener('mouseenter', function() {
                const val = parseInt(this.getAttribute('data-value'));
                document.querySelectorAll('#starRow .star').forEach((s, idx) => {
                    s.style.color = idx < val ? '#ffc107' : '#e0e0e0';
                });
            });
            star.addEventListener('mouseleave', function() {
                document.querySelectorAll('#starRow .star').forEach((s, idx) => {
                    s.style.color = idx < rounded ? '#ffc107' : '#e0e0e0';
                });
            });
            star.addEventListener('click', async function() {
                const value = parseInt(this.getAttribute('data-value'));
                await fetch(`${API_BASE_URL}/ratings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ recipeId, value })
                });
                document.getElementById("ratingMsg").innerText = "Puanınız kaydedildi!";
                document.getElementById("ratingMsg").style.display = "block";
                await loadAndRenderRating(recipeId);
            });
        });
    } catch {
        ratingSection.innerHTML = '<div class="text-danger text-center">Puanlar yüklenemedi.</div>';
    }
}

async function loadAndRenderComments(recipeId) {
    const commentsContainer = document.getElementById("commentsContainer");
    commentsContainer.innerHTML = '<div class="text-center text-muted">Yorumlar yükleniyor...</div>';
    try {
        const res = await fetch(`${API_BASE_URL}/comments/recipe/${recipeId}`);
        const comments = await res.json();
        if (!comments.length) {
            commentsContainer.innerHTML = '<div class="text-center text-muted">Henüz yorum yok. İlk yorumu sen ekle!</div>';
            return;
        }
        commentsContainer.innerHTML = comments.map(c => `
            <div class="mb-2 p-2 border rounded bg-light">
                <div style="font-size:0.95em; color:#555;">${c.userName ? `<b>${c.userName}</b>` : "Anonim"} <span style="font-size:0.85em; color:#aaa;">${new Date(c.createdAt).toLocaleString('tr-TR')}</span></div>
                <div style="font-size:1.05em; color:#222; margin-top:2px;">${c.content}</div>
            </div>
        `).join("");
    } catch {
        commentsContainer.innerHTML = '<div class="text-danger text-center">Yorumlar yüklenemedi.</div>';
    }
}

function closeModal() {
    const recipeModal = document.getElementById('recipeModal');
    recipeModal.style.display = "none";
    document.body.style.overflow = "auto";
}

function setupEvents() {
    recipeModal.addEventListener("click", e => {
        if (e.target === recipeModal) closeModal();
    });
    searchBtn.addEventListener("click", applySearch);
    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") applySearch();
    });
    categoryBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            selectedCategory = btn.getAttribute("data-category");
            filterAndRender();
        });
    });
    themeToggleBtn.addEventListener("click", toggleTheme);
    
    if (ingredientInput && ingredientTags && findRecipesBtn) {
        ingredientInput.addEventListener('keydown', function(e) {
            if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && ingredientInput.value.trim()) {
                let val = ingredientInput.value.trim().toLowerCase();
                if (val && !ingredients.includes(val)) {
                    ingredients.push(val);
                    ingredientInput.value = '';
                    renderIngredientTags();
                } else {
                    ingredientInput.value = '';
                }
                e.preventDefault();
            }
        });
        findRecipesBtn.onclick = function() {
            if (ingredients.length > 0) {
                fetch(`${API_URL}/suggest?ingredients=${ingredients.join(',')}`)
                    .then(res => res.json())
                    .then(data => {
                        filteredRecipes = data;
                        renderRecipes();
                    });
            }
        };
    }
}

function applySearch() {
    searchTerm = searchInput.value.trim();
    filterAndRender();
}

function filterAndRender() {
    filteredRecipes = allRecipes.filter(r => {
        const matchesCategory = !selectedCategory || (r.category && r.category.name === selectedCategory);
        const matchesSearch = !searchTerm ||
            (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.ingredients && r.ingredients.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.category && r.category.name && r.category.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });
    renderRecipes();
}

function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-theme");
    themeIcon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
}

function renderIngredientTags() {
    ingredientTags.innerHTML = '';
    ingredients.forEach((ing, idx) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${ing}<span class="remove" title="Kaldır" tabindex="0">&times;</span>`;
        tag.querySelector('.remove').onclick = (e) => {
            e.stopPropagation();
            ingredients.splice(idx, 1);
            renderIngredientTags();
            ingredientInput.focus();
        };
        ingredientTags.appendChild(tag);
    });
}

function toggleFavorite(id) {
    if (favoriteIds.includes(id)) {
        favoriteIds = favoriteIds.filter(fid => fid !== id);
    } else {
        favoriteIds.push(id);
    }
    localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteIds));
    renderRecipes();
    if (document.getElementById('modalBody').style.display !== 'none') {
        updateFavoriteButtonInModal(id);
    }
}

function isFavorite(id) {
    return favoriteIds.includes(id);
} 