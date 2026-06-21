// Хранилище объявлений
let items = [];
let currentTab = 'all';
let currentCampus = 'biryulyovo';

function loadItems() {
    const saved = localStorage.getItem('mgkeit_items');
    if (saved) {
        try { items = JSON.parse(saved); } catch (e) { items = []; }
    }
}

function saveItems() {
    localStorage.setItem('mgkeit_items', JSON.stringify(items));
}

function renderItems() {
    const grid = document.getElementById('items-grid');
    const empty = document.getElementById('empty-state');
    if (!grid) return;

    let filtered = items;
    if (currentTab === 'lost') filtered = filtered.filter(i => i.type === 'lost');
    if (currentTab === 'found') filtered = filtered.filter(i => i.type === 'found');
    if (currentCampus !== 'all') filtered = filtered.filter(i => i.campus === currentCampus);

    if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('section-hidden');
    } else {
        empty.classList.add('section-hidden');
        grid.innerHTML = filtered.map(item => `
            <div class="item-card" onclick="openModal('${item.id}')">
                <div class="item-image" style="background: ${getBg(item.category)};">
                    <span>${getIcon(item.category)}</span>
                    <span class="item-badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}">
                        ${item.type === 'lost' ? 'Потеряно' : 'Найдено'}
                    </span>
                    ${item.reward ? '<span class="item-reward">💰 ' + item.reward.toLocaleString() + ' ₽</span>' : ''}
                </div>
                <div class="item-body">
                    <div class="item-title">${esc(item.title)}</div>
                    <div class="item-meta">
                        <span class="item-campus-badge">🏫 ${campusName(item.campus)}</span>
                        <span>📍 ${esc(item.location)}</span>
                        <span>🕐 ${fmtDate(item.date)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function getBg(cat) {
    const g = {
        documents: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        electronics: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        clothing: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        keys: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        other: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)'
    };
    return g[cat] || g.other;
}

function getIcon(cat) {
    const i = { documents: '📄', electronics: '📱', clothing: '👕', keys: '🔑', other: '📦' };
    return i[cat] || '📦';
}

function catName(cat) {
    const n = { documents: 'Документы', electronics: 'Электроника', clothing: 'Одежда', keys: 'Ключи', other: 'Другое' };
    return n[cat] || 'Другое';
}

function campusName(c) { return c === 'biryulyovo' ? 'Бирюлёво' : c; }

function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

function fmtDate(d) {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Только что';
    if (diff < 60) return diff + ' мин. назад';
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return hrs + ' ч. назад';
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Вчера';
    if (days < 7) return days + ' дн. назад';
    return date.toLocaleDateString('ru-RU');
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const tabs = ['all', 'lost', 'found'];
    document.querySelectorAll('.tab').forEach((t, i) => {
        if (tabs[i] === tab) t.classList.add('active');
    });
    renderItems();
}

function switchCampus(campus) {
    currentCampus = campus;
    const h = document.getElementById('header-campus');
    const f = document.getElementById('filter-campus');
    if (h) h.value = campus;
    if (f) f.value = campus;
    renderItems();
}

function showTab(name) {
    const hero = document.getElementById('hero-section');
    const add = document.getElementById('add-section');
    const bar = document.getElementById('filters-bar');
    const grid = document.getElementById('items-grid');
    const empty = document.getElementById('empty-state');

    if (name === 'add') {
        if (hero) hero.style.display = 'none';
        if (bar) bar.style.display = 'none';
        if (grid) grid.innerHTML = '';
        if (empty) empty.classList.add('section-hidden');
        if (add) add.classList.remove('section-hidden');
    } else {
        if (add) add.classList.add('section-hidden');
        if (hero) hero.style.display = '';
        if (bar) bar.style.display = '';
        renderItems();
    }
}

function openModal(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    document.getElementById('modal-title').textContent = item.type === 'lost' ? '🔍 Потерянная вещь' : '📸 Найденная вещь';
    document.getElementById('modal-body').innerHTML = 
        '<div class="big-icon">' + getIcon(item.category) + '</div>' +
        '<div class="modal-info-row"><span class="modal-info-label">Название</span><span class="modal-info-value">' + esc(item.title) + '</span></div>' +
        '<div class="modal-info-row"><span class="modal-info-label">Категория</span><span class="modal-info-value">' + catName(item.category) + '</span></div>' +
        '<div class="modal-info-row"><span class="modal-info-label">Корпус</span><span class="modal-info-value">🏫 ' + campusName(item.campus) + '</span></div>' +
        '<div class="modal-info-row"><span class="modal-info-label">Место</span><span class="modal-info-value">' + esc(item.location) + '</span></div>' +
        '<div class="modal-info-row"><span class="modal-info-label">Описание</span><span class="modal-info-value">' + esc(item.description || '—') + '</span></div>' +
        (item.reward ? '<div class="modal-info-row"><span class="modal-info-label">Вознаграждение</span><span class="modal-info-value" style="color:#B45309;font-weight:600;">' + item.reward.toLocaleString() + ' ₽</span></div>' : '') +
        '<div class="modal-info-row"><span class="modal-info-label">Опубликовано</span><span class="modal-info-value">' + fmtDate(item.date) + '</span></div>' +
        '<div class="dev-notice">🔧 Система обратной связи <strong>в разработке</strong>.</div>';
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) { if (e.target === this) closeModal(); });
    }
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
    loadItems();
    renderItems();
});

function handleSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('item-type').value;
    const title = document.getElementById('item-title').value.trim();
    if (!type || !title) { alert('Заполните Тип и Название'); return false; }
    const newItem = {
        id: 'item-' + Date.now(),
        type: type,
        category: document.getElementById('item-category').value,
        campus: document.getElementById('item-campus').value,
        title: title,
        location: document.getElementById('item-location').value.trim() || 'Корпус Бирюлёво',
        description: document.getElementById('item-desc').value.trim(),
        reward: document.getElementById('item-reward').value ? parseInt(document.getElementById('item-reward').value) : null,
        status: 'active',
        date: new Date().toISOString()
    };
    items.unshift(newItem);
    saveItems();
    document.getElementById('add-form').reset();
    document.getElementById('reward-group').style.display = 'none';
    showTab('items');
    switchTab('all');
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    const typeSelect = document.getElementById('item-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', function() {
            const rg = document.getElementById('reward-group');
            if (rg) rg.style.display = this.value === 'lost' ? 'block' : 'none';
        });
    }
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    const preview = document.getElementById('upload-preview-container');
    if (preview) {
        preview.innerHTML = '<div class="upload-preview"><span>🖼️</span><div style="flex:1;"><strong>' + esc(file.name) + '</strong><br><span style="font-size:11px;color:var(--gray-500);">' + (file.size/1048576).toFixed(1) + ' МБ</span></div><span class="file-remove" onclick="removeFile()">✕</span></div>';
    }
}

function removeFile() {
    document.getElementById('file-input').value = '';
    document.getElementById('upload-preview-container').innerHTML = '';
}