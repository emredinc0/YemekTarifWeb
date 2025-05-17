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
const addIngredientBtn = document.getElementById('addIngredientBtn');

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
    if (user && token) {
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('currentUser');
    }
    renderUserArea();
}

function renderUserArea() {
    const userArea = document.getElementById('userArea');
    if (currentUser) {
        userArea.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-dark dropdown-toggle" id="userDropdownBtn" data-bs-toggle="dropdown" aria-expanded="false">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" style="margin-right:6px; vertical-align:middle;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4v1H4v-1z"/></svg>
                    <b>${currentUser.userName}</b>
                </button>
                <ul class="dropdown-menu show" id="userDropdownMenu" style="display:none; position:absolute; right:0; top:40px; min-width:180px; z-index:10000;">
                    <li><a class="dropdown-item" href="#" id="profileMenuProfile">Profilim</a></li>
                    <li><a class="dropdown-item" href="#" id="profileMenuFavorites">Favorilerim</a></li>
                    <li><a class="dropdown-item" href="#" id="profileMenuComments">Yaptığım Yorumlar</a></li>
                    <li><a class="dropdown-item" href="#" id="profileMenuRated">Puanladığım Tarifler</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Çıkış Yap</a></li>
                </ul>
            </div>
        `;
        // Menü açma/kapama
        const dropdownBtn = document.getElementById('userDropdownBtn');
        const dropdownMenu = document.getElementById('userDropdownMenu');
        dropdownBtn.onclick = function(e) {
            e.stopPropagation();
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        };
        document.body.addEventListener('click', function() {
            dropdownMenu.style.display = 'none';
        });
        // Modal açıcılar
        document.getElementById('profileMenuProfile').onclick = function(e) { e.preventDefault(); openProfileModal('profile'); };
        document.getElementById('profileMenuFavorites').onclick = function(e) { e.preventDefault(); openProfileModal('favorites'); };
        document.getElementById('profileMenuComments').onclick = function(e) { e.preventDefault(); openProfileModal('comments'); };
        document.getElementById('profileMenuRated').onclick = function(e) { e.preventDefault(); openProfileModal('rated'); };
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
    const emailOrUserName = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailOrUserName, password })
        });
        if (!res.ok) {
            let errorText = await res.text();
            let errorMsg;
            try {
                errorMsg = JSON.parse(errorText).message;
            } catch {
                errorMsg = errorText;
            }
            throw new Error(errorMsg || 'Giriş başarısız');
        }
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
    if (localStorage.getItem('currentUser')) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } else if (jwtToken) {
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
    setupEvents();
    // URL'den kategori parametresi oku
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) {
        selectedCategory = cat;
        await fetchRecipes();
        filterAndRender();
        const recipesSection = document.querySelector('.container.mb-5');
        if (recipesSection) {
            recipesSection.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        await fetchRecipes();
    }
});

async function fetchRecipes() {
    loadingDiv.style.display = "block";
    recipesRow.innerHTML = "";
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('API bağlantısı başarısız');
        const data = await res.json();
        allRecipes = data;
        filteredRecipes = allRecipes;
        renderRecipes();
        renderDailyMenuBox();
        renderCalorieBox();
    } catch (e) {
        loadingDiv.innerHTML = "Tarifler yüklenemedi. Lütfen bağlantınızı ve sunucu durumunu kontrol edin.";
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
                    <div style="font-size:0.98em; color:#666; margin-bottom:6px;">
                        <span style="margin-right:10px;"><b>Zorluk:</b> ${recipe.difficulty || 'Kolay'}</span>
                        <span style="margin-right:10px;"><b>Süre:</b> ${recipe.duration || 30} dk</span>
                        <span><b>Kişi:</b> ${recipe.servings || 4}</span>
                    </div>
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
        ? `<ol>${recipe.instructions.split('\\n').map(i => `<li>${i.trim().replace(/^\d+\.?\s*/, '')}</li>`).join('')}</ol>`
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
                    <i class="bi bi-clock me-1"></i> ${recipe.duration || 30} dk
                </span>
                <span class="badge bg-info text-dark me-2" style="font-size: 0.9rem; padding: 8px 12px; border-radius: 12px;">
                    <i class="bi bi-bar-chart me-1"></i> ${recipe.difficulty || 'Kolay'}
                </span>
                <span class="badge bg-primary text-light" style="font-size: 0.9rem; padding: 8px 12px; border-radius: 12px;">
                    <i class="bi bi-people me-1"></i> ${recipe.servings || 4} Kişilik
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
            body: JSON.stringify({ recipeId: id, content, userName: currentUser.userName })
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
                    body: JSON.stringify({ recipeId, value, userName: currentUser.userName })
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
    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-theme");
        themeIcon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
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

    if (addIngredientBtn && ingredientInput) {
        addIngredientBtn.onclick = function() {
            let val = ingredientInput.value.trim().toLowerCase();
            if (val && !ingredients.includes(val)) {
                ingredients.push(val);
                ingredientInput.value = '';
                renderIngredientTags();
            } else {
                ingredientInput.value = '';
            }
        };
    }

    closeModalBtn && (closeModalBtn.onclick = closeModal);

    document.getElementById('randomRecipeHeaderBtn') && (document.getElementById('randomRecipeHeaderBtn').onclick = function() {
        const spinner = document.getElementById('randomRecipeSpinner');
        if (spinner) spinner.classList.add('spin');
        setTimeout(() => {
            if (spinner) spinner.classList.remove('spin');
            const all = allRecipes;
            const random = pickRandom(all);
            if (random) {
                window.showRecipeModal(random.id);
            }
        }, 1000);
    });

    document.getElementById('navSalads').onclick = function(e) {
        e.preventDefault();
        selectedCategory = 'Salatalar';
        filterAndRender();
        const recipesSection = document.querySelector('.container.mb-5');
        if (recipesSection) {
            recipesSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    document.getElementById('navDesserts').onclick = function(e) {
        e.preventDefault();
        selectedCategory = 'Tatlılar';
        filterAndRender();
        const recipesSection = document.querySelector('.container.mb-5');
        if (recipesSection) {
            recipesSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
    document.getElementById('navMeals').onclick = function(e) {
        e.preventDefault();
        selectedCategory = 'Yemekler';
        filterAndRender();
        const recipesSection = document.querySelector('.container.mb-5');
        if (recipesSection) {
            recipesSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
}

async function applySearch() {
    searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        await fetchRecipes();
        return;
    }
    try {
        loadingDiv.style.display = "block";
        recipesRow.innerHTML = "";
        const res = await fetch(`${API_URL}/search?term=${encodeURIComponent(searchTerm)}`);
        if (!res.ok) throw new Error("Arama başarısız");
        const data = await res.json();
        filteredRecipes = data;
        renderRecipes();
    } catch (e) {
        recipesRow.innerHTML = "<div class='text-danger text-center'>Arama sırasında hata oluştu.</div>";
    } finally {
        loadingDiv.style.display = "none";
        // Sonuçlar geldikten sonra tarifler bölümüne kaydır
        const recipesSection = document.querySelector('.container.mb-5');
        if (recipesSection) {
            recipesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
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

function openProfileModal(type) {
    const modal = document.getElementById('profileModal');
    const body = document.getElementById('profileModalBody');
    if (type === 'profile') {
        body.innerHTML = `<h4>Profilim</h4><div>Kullanıcı adı: <b>${currentUser.userName}</b><br>E-posta: <b>${currentUser.email}</b></div>`;
    } else if (type === 'favorites') {
        // Favori tarifleri bul
        const favRecipes = allRecipes.filter(r => isFavorite(r.id));
        if (favRecipes.length === 0) {
            body.innerHTML = `<h4>Favorilerim</h4><div>Henüz favori tarifin yok.</div>`;
        } else {
            body.innerHTML = `<h4>Favorilerim</h4><ul style='padding-left:0; list-style:none;'>${favRecipes.map(r => `<li style='margin-bottom:10px;'><a href='#' class='fav-recipe-link' data-id='${r.id}' style='text-decoration:none; color:#ff9800; font-weight:bold;'>${r.title}</a></li>`).join('')}</ul>`;
            // Tarif adına tıklanınca detay modalı aç
            setTimeout(() => {
                document.querySelectorAll('.fav-recipe-link').forEach(link => {
                    link.onclick = function(e) {
                        e.preventDefault();
                        document.getElementById('profileModal').style.display = 'none';
                        document.body.style.overflow = 'auto';
                        showRecipeModal(parseInt(this.getAttribute('data-id')));
                    };
                });
            }, 0);
        }
    } else if (type === 'comments') {
        body.innerHTML = `<h4>Yaptığım Yorumlar</h4><div class='text-muted'>Yorumlar yükleniyor...</div>`;
        // Tüm tariflerde kullanıcının yaptığı yorumları bul
        let userComments = [];
        for (const recipe of allRecipes) {
            if (recipe.comments && Array.isArray(recipe.comments)) {
                for (const comment of recipe.comments) {
                    if (comment.userName && comment.userName === currentUser.userName) {
                        userComments.push({
                            recipeId: recipe.id,
                            recipeTitle: recipe.title,
                            content: comment.content,
                            createdAt: comment.createdAt
                        });
                    }
                }
            }
        }
        if (userComments.length === 0) {
            body.innerHTML = `<h4>Yaptığım Yorumlar</h4><div>Henüz yorumun yok.</div>`;
        } else {
            body.innerHTML = `<h4>Yaptığım Yorumlar</h4><ul style='padding-left:0; list-style:none;'>${userComments.map(c => `<li style='margin-bottom:14px;'><a href='#' class='comment-recipe-link' data-id='${c.recipeId}' style='font-weight:bold; color:#ff9800;'>${c.recipeTitle}</a><br><span style='font-size:0.95em; color:#555;'>${c.content}</span><br><span style='font-size:0.85em; color:#aaa;'>${new Date(c.createdAt).toLocaleString('tr-TR')}</span></li>`).join('')}</ul>`;
            setTimeout(() => {
                document.querySelectorAll('.comment-recipe-link').forEach(link => {
                    link.onclick = function(e) {
                        e.preventDefault();
                        document.getElementById('profileModal').style.display = 'none';
                        document.body.style.overflow = 'auto';
                        showRecipeModal(parseInt(this.getAttribute('data-id')));
                    };
                });
            }, 0);
        }
    } else if (type === 'rated') {
        // Tüm tariflerde kullanıcının puanladığı tarifleri bul
        let ratedRecipes = [];
        for (const recipe of allRecipes) {
            if (recipe.ratings && Array.isArray(recipe.ratings)) {
                for (const rating of recipe.ratings) {
                    if (rating.userName && rating.userName === currentUser.userName) {
                        ratedRecipes.push({
                            recipeId: recipe.id,
                            recipeTitle: recipe.title,
                            value: rating.value,
                            createdAt: rating.createdAt
                        });
                    }
                }
            }
        }
        if (ratedRecipes.length === 0) {
            body.innerHTML = `<h4>Puanladığım Tarifler</h4><div>Henüz puanladığın tarif yok.</div>`;
        } else {
            body.innerHTML = `<h4>Puanladığım Tarifler</h4><ul style='padding-left:0; list-style:none;'>${ratedRecipes.map(r => `<li style='margin-bottom:14px;'><a href='#' class='rated-recipe-link' data-id='${r.recipeId}' style='font-weight:bold; color:#ff9800;'>${r.recipeTitle}</a> <span style='color:#ffc107;'>(Puan: ${r.value})</span><br><span style='font-size:0.85em; color:#aaa;'>${new Date(r.createdAt).toLocaleString('tr-TR')}</span></li>`).join('')}</ul>`;
            setTimeout(() => {
                document.querySelectorAll('.rated-recipe-link').forEach(link => {
                    link.onclick = function(e) {
                        e.preventDefault();
                        document.getElementById('profileModal').style.display = 'none';
                        document.body.style.overflow = 'auto';
                        showRecipeModal(parseInt(this.getAttribute('data-id')));
                    };
                });
            }, 0);
        }
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

document.getElementById('closeProfileModal').onclick = function() {
    document.getElementById('profileModal').style.display = 'none';
    document.body.style.overflow = 'auto';
};

// Sayfa yüklenince tema durumunu uygula
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.className = "bi bi-sun";
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.className = "bi bi-moon-stars";
    }
});

// --- Kalori Hesaplama Özelliği (Sekmeli) ---

// Dinamik olarak API'den kalori çeken fonksiyon
async function getCalorieFromApi(ingredient) {
    try {
        const res = await fetch(`http://localhost:5111/api/calories/${encodeURIComponent(ingredient)}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.kcalPer100g;
    } catch {
        return null;
    }
}

// Malzeme ile hesaplama (artık dinamik ve asenkron)
document.getElementById('calorieFormIngredient').onsubmit = async function(e) {
    e.preventDefault();
    console.log('Malzeme ile hesaplama formu submit edildi!');
    let portion = parseInt(document.getElementById('caloriePortion').value);
    if (!portion || portion < 1) portion = 1;
    let total = 0;
    let missing = [];
    for (const item of calorieIngredients) {
        const name = item.name.trim().toLowerCase();
        const amount = parseFloat(item.amount);
        const unit = item.unit;
        if (!name || !amount || amount <= 0) continue;
        let kcalPer100g = await getCalorieFromApi(name);
        if (!kcalPer100g) {
            missing.push(name);
            continue;
        }
        let kcal = 0;
        if (unit === 'g') {
            kcal = (kcalPer100g * amount) / 100;
        } else if (unit === 'adet') {
            kcal = (kcalPer100g * amount * 50) / 100;
        }
        total += kcal;
    }
    let html = '';
    if (missing.length > 0) {
        html += `<div class='text-danger mb-2'>Veritabanında bulunamayan malzemeler: <b>${missing.join(', ')}</b></div>`;
    }
    html += `<div class='alert alert-info'>Toplam Kalori: <b>${total.toFixed(0)} kcal</b><br>1 Porsiyon: <b>${(total/portion).toFixed(0)} kcal</b></div>`;
    document.getElementById('calorieResultIngredient').innerHTML = html;
};

let calorieIngredients = [ { name: '', amount: '', unit: 'g' } ];
function renderCalorieIngredients() {
    const container = document.getElementById('calorieIngredients');
    container.innerHTML = '';
    calorieIngredients.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'd-flex align-items-center mb-2';
        row.innerHTML = `
            <input type="text" class="form-control me-2" placeholder="Malzeme (örn: yumurta)" value="${item.name}" data-idx="${idx}" data-type="name" style="max-width:160px;">
            <input type="number" class="form-control me-2" placeholder="Miktar" value="${item.amount}" min="1" data-idx="${idx}" data-type="amount" style="max-width:90px;">
            <select class="form-select me-2" data-idx="${idx}" data-type="unit" style="max-width:70px;">
                <option value="g" ${item.unit==='g'?'selected':''}>g</option>
                <option value="adet" ${item.unit==='adet'?'selected':''}>adet</option>
            </select>
            <button type="button" class="btn btn-danger btn-sm" data-idx="${idx}" data-type="remove">&times;</button>
        `;
        container.appendChild(row);
    });
    // Eventler
    container.querySelectorAll('input,select').forEach(el => {
        el.onchange = function() {
            const idx = +this.getAttribute('data-idx');
            const type = this.getAttribute('data-type');
            calorieIngredients[idx][type] = this.value;
        };
    });
    container.querySelectorAll('button[data-type="remove"]').forEach(btn => {
        btn.onclick = function() {
            const idx = +this.getAttribute('data-idx');
            calorieIngredients.splice(idx,1);
            if (calorieIngredients.length === 0) calorieIngredients.push({ name: '', amount: '', unit: 'g' });
            renderCalorieIngredients();
                };
            });
}
document.getElementById('addCalorieIngredient').onclick = function(e) {
            e.preventDefault();
    calorieIngredients.push({ name: '', amount: '', unit: 'g' });
    renderCalorieIngredients();
};

// Header'daki Kalori Hesapla butonuna işlevsellik ekle
const openCalorieModalBtnSection = document.getElementById('openCalorieModalBtnSection');
const calorieModal = document.getElementById('calorieModal');
openCalorieModalBtnSection && (openCalorieModalBtnSection.onclick = function() {
    calorieModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('calorieResultMeal').innerHTML = '';
    document.getElementById('calorieResultIngredient').innerHTML = '';
    document.getElementById('calorieMealName').value = '';
    calorieIngredients = [ { name: '', amount: '', unit: 'g' } ];
    renderCalorieIngredients();
    byMealTab.click();
});

const closeCalorieModalBtn = document.getElementById('closeCalorieModal');
closeCalorieModalBtn && (closeCalorieModalBtn.onclick = function() {
    calorieModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// --- Günün Menüsü ve Kararsızım Özelliği ---
function getCategoryRecipes(categoryName) {
    return allRecipes.filter(r => r.category && r.category.name && r.category.name.toLowerCase() === categoryName.toLowerCase());
}

function pickRandom(arr) {
    if (!arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function getTodayKey() {
    const now = new Date();
    return now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
}

function getDailyMenu() {
    const todayKey = getTodayKey();
    let dailyMenu = localStorage.getItem('dailyMenu');
    let dailyMenuDate = localStorage.getItem('dailyMenuDate');
    if (dailyMenu && dailyMenuDate === todayKey) {
        return JSON.parse(dailyMenu);
    }
    // Yeni gün, yeni menü seç
    const yemekler = getCategoryRecipes('Yemekler');
    const salatalar = getCategoryRecipes('Salatalar');
    const tatlilar = getCategoryRecipes('Tatlılar');
    const menu = {
        yemek: pickRandom(yemekler),
        salata: pickRandom(salatalar),
        tatli: pickRandom(tatlilar)
    };
    localStorage.setItem('dailyMenu', JSON.stringify(menu));
    localStorage.setItem('dailyMenuDate', todayKey);
    return menu;
}

function renderDailyMenuBox() {
    const box = document.getElementById('dailyMenuBox');
    if (!box) return;
    const menu = getDailyMenu();
    let html = `
    <div class="modern-menu-card">
        <div class="modern-menu-title" style="font-size:2rem; font-weight:700;"><i class="bi bi-stars" style="color:#ff9800;"></i> Günün Menüsü</div>
        <div class="modern-menu-row">
            <div class="modern-menu-item">
                <div class="modern-menu-icon">🍲</div>
                <div class="modern-menu-label">Yemek</div>
                ${menu.yemek ? `<div class="modern-menu-name">${menu.yemek.title}</div>
                <img src="${menu.yemek.imageUrl || '/img/default-food.jpg'}" alt="${menu.yemek.title}" class="modern-menu-img">` : '<div>Yok</div>'}
            </div>
            <div class="modern-menu-item">
                <div class="modern-menu-icon">🥗</div>
                <div class="modern-menu-label">Salata</div>
                ${menu.salata ? `<div class="modern-menu-name">${menu.salata.title}</div>
                <img src="${menu.salata.imageUrl || '/img/default-food.jpg'}" alt="${menu.salata.title}" class="modern-menu-img">` : '<div>Yok</div>'}
            </div>
            <div class="modern-menu-item">
                <div class="modern-menu-icon">🍰</div>
                <div class="modern-menu-label">Tatlı</div>
                ${menu.tatli ? `<div class="modern-menu-name">${menu.tatli.title}</div>
                <img src="${menu.tatli.imageUrl || '/img/default-food.jpg'}" alt="${menu.tatli.title}" class="modern-menu-img">` : '<div>Yok</div>'}
            </div>
        </div>
        </div>
    `;
    box.innerHTML = html;
    // Menüdeki yemeğe tıklayınca modal aç
    [menu.yemek, menu.salata, menu.tatli].forEach(item => {
        if (item) {
            const imgs = box.querySelectorAll(`img[alt='${item.title}']`);
            imgs.forEach(img => {
                img.style.cursor = 'pointer';
                img.onclick = () => window.showRecipeModal(item.id);
            });
        }
    });
}

function renderCalorieBox() {
    const box = document.getElementById('calorieBox');
    if (!box) return;
    box.innerHTML = '';
}

// Yemek Adı ile hesaplama
document.getElementById('calorieFormMeal').onsubmit = async function(e) {
    e.preventDefault();
    const mealName = document.getElementById('calorieMealName').value.trim().toLowerCase();
    if (!mealName) return;

    try {
        const res = await fetch(`${API_BASE_URL}/calories/meal/${encodeURIComponent(mealName)}`);
        if (!res.ok) {
            document.getElementById('calorieResultMeal').innerHTML = '<div class="alert alert-danger">Bu yemek için kalori bilgisi bulunamadı.</div>';
            return;
        }
        const data = await res.json();
        document.getElementById('calorieResultMeal').innerHTML = `
            <div class="alert alert-info">
                <b>${mealName}</b> için 1 porsiyon kalori: <b>${data.kcalPerPortion} kcal</b>
            </div>`;
    } catch (error) {
        document.getElementById('calorieResultMeal').innerHTML = '<div class="alert alert-danger">Bir hata oluştu. Lütfen tekrar deneyin.</div>';
    }
}; 