// =========================
// Hungarian Companion SPA (cards expand in-place)
// v0.5 — Word Card feature
// Patch: preserve search state across hash navigation; improve Back behavior
// so UI back uses browser history and keeps URL/hash in sync.
// =========================

let words = [];

const App = {
    currentPage: "home",
    // selectedWordId is managed via hash route #/word/<id>
    selectedWordId: null,
    // Persist the user's current search query so rerenders keep filters applied
    searchQuery: ''
    ,
    // Persist UI filters
    filters: {
        type: '',
        tags: []
    }
};

const Pages = {
    home() {
        return `
        <header>
            <h1>🇭🇺 Hungarian Companion</h1>
        </header>
        <main>
            <div class="menu">
                <button onclick="navigate('explore')">🔍 Explore</button>
                <button onclick="navigate('families')">🌳 Families</button>
                <button>📚 Learn</button>
                <button>🧠 Review</button>
            </div>
        </main>
        `;
    },

    explore() {
        return `
        <header>
            <button onclick="goBackToExplore()">← Back to Explore</button>
            <button onclick="navigate('home')">Home</button>
            <h1>Explore</h1>
        </header>
        <main>
            <input
                id="search"
                placeholder="Search..."
                oninput="filterWords()"
            >

                        <div class="filters" style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                                <label style="display:flex;align-items:center;gap:6px;"><strong>Type</strong>
                                    <select id="filter-type" onchange="filterWords()" style="margin-left:6px;padding:6px;border-radius:6px">
                                        <option value="">All</option>
                                    </select>
                                </label>

                                <div id="filter-tags" style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-left:8px;"></div>
                        </div>

            <div id="wordList"></div>

        </main>
        `;
    }
    ,
    families() {
        return `
        <header>
            <button onclick="navigate('explore')">← Back to Explore</button>
            <button onclick="navigate('home')">Home</button>
            <h1>Families</h1>
        </header>
        <main>
            <div id="familiesContainer">Loading families…</div>
        </main>
        `;
    }
};

// Navigation helper using history API for predictable Back behavior.
function navigate(page) {
    if (page === 'home') {
        App.currentPage = 'home';
        App.selectedWordId = null;
        // Clear hash/URL without creating a history entry so Back doesn't return here.
        try {
            history.replaceState(null, '', location.pathname + location.search);
        } catch (e) {
            location.hash = '';
        }
        render();
        return;
    }

    if (page === 'explore') {
        App.currentPage = 'explore';
        // Ensure explore is represented in history once.
        if (!location.hash || !location.hash.startsWith('#/explore')) {
            history.pushState({ view: 'explore' }, '', '#/explore');
        }
        render();
        return;
    }

    // fallback
    App.currentPage = page;
    render();
}

// UI back handler: prefer browser history when meaningful, otherwise navigate home.
function handleBack() {
    if (location.hash && location.hash.startsWith('#/word/')) {
        // If we're viewing a specific word, go back in history to restore previous state
        history.back();
        return;
    }

    // If there is a previous entry in history, go back; otherwise, go to home.
    if (history.length > 1) {
        history.back();
        return;
    }

    navigate('home');
}

// Navigate back to Explore view and collapse any open cards
function goBackToExplore() {
    document.querySelectorAll('.card.expanded').forEach(c => {
        c.classList.remove('expanded');
        const p = c.querySelector('.panel'); if (p) p.style.display = 'none';
    });
    App.selectedWordId = null;
    App.currentPage = 'explore';
    try { history.replaceState(null, '', '#/explore'); } catch (e) { location.hash = '#/explore'; }
    render();
}

// Open a related word: ensure Explore is rendered, clear search, then open the card
function openRelated(id) {
    App.searchQuery = '';
    App.currentPage = 'explore';
    try { history.pushState({ view: 'word', id }, '', `#/word/${id}`); } catch (e) { location.hash = `#/word/${id}`; }
    render();
    setTimeout(() => toggleCardDetails(id), 60);
}

function parseHash() {
    const hash = (location.hash || '').replace(/^#/, '');
    if (hash.startsWith('word/')) {
        const id = parseInt(hash.split('/')[1], 10);
        App.selectedWordId = Number.isNaN(id) ? null : id;
        App.currentPage = 'explore';
    } else if (hash === 'explore' || hash === '/explore') {
        App.selectedWordId = null;
        App.currentPage = 'explore';
    } else if (!hash || hash === 'home') {
        App.currentPage = 'home';
        App.selectedWordId = null;
    }
}

function render() {
    parseHash();
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = Pages[App.currentPage]();

    // restore persisted search input after rendering
    if (App.currentPage === "explore") {
        const searchEl = document.getElementById('search');
        if (searchEl) searchEl.value = App.searchQuery || '';

        // populate filter controls and restore their state
        populateFilterControls();
        const typeEl = document.getElementById('filter-type');
        if (typeEl) typeEl.value = App.filters.type || '';
        const tagEls = document.querySelectorAll('#filter-tags input[type="checkbox"]');
        tagEls.forEach(cb => cb.checked = App.filters.tags.includes(cb.value));
    }

    if (App.currentPage === "explore") {
        // Use persisted searchQuery when rendering so hash-triggered rerenders
        // keep the filtered list intact (fixes bug where clicking a search
        // result would reset the list to default).
        const query = App.searchQuery || (document.getElementById('search')?.value || '').toLowerCase().trim();
        App.searchQuery = query;

        // build base list then apply query/type/tags filters
        let baseList = Array.isArray(words) ? words.slice() : [];

        if (query) {
            baseList = baseList.filter(word => {
                const hu = (word.hu || '').toLowerCase();
                const en = (word.en || '').toLowerCase();
                const pl = (word.pl || '').toLowerCase();
                return hu.includes(query) || en.includes(query) || pl.includes(query);
            });
        }

        // type filter
        if (App.filters.type) {
            baseList = baseList.filter(w => (w.type || '').toLowerCase() === (App.filters.type || '').toLowerCase());
        }

        // tags filter (OR semantics)
        if (Array.isArray(App.filters.tags) && App.filters.tags.length > 0) {
            baseList = baseList.filter(w => Array.isArray(w.tags) && App.filters.tags.some(t => w.tags.includes(t)));
        }

        renderWordList(baseList);

        // if selectedWordId present, try to open it (card must exist in DOM)
        if (App.selectedWordId) {
            setTimeout(() => {
                // guard: only toggle if card exists and not already expanded
                const existing = document.querySelector(`.card[data-id="${App.selectedWordId}"]`);
                if (existing && !existing.classList.contains('expanded')) toggleCardDetails(App.selectedWordId);
            }, 10);
        }
    }

    if (App.currentPage === 'families') {
        // load and render families index
        loadAndRenderFamilies();
    }
}

// Build the tag filter checkboxes and type options from the loaded words
function populateFilterControls() {
    const typeEl = document.getElementById('filter-type');
    const tagsContainer = document.getElementById('filter-tags');
    if (!typeEl || !tagsContainer || !Array.isArray(words) || words.length === 0) return;

    // populate types
    const types = Array.from(new Set(words.map(w => (w.type || '').toLowerCase()).filter(Boolean))).sort();
    // clear existing (except the default 'All')
    while (typeEl.options.length > 1) typeEl.remove(1);
    types.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        typeEl.appendChild(opt);
    });

    // populate tags (checkboxes)
    const tagSet = new Set();
    words.forEach(w => {
        if (Array.isArray(w.tags)) w.tags.forEach(tag => tagSet.add(tag));
    });
    const tags = Array.from(tagSet).sort();

    // if already populated, skip rebuilding unless mismatch
    if (tagsContainer.dataset.count && Number(tagsContainer.dataset.count) === tags.length) return;
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
        const id = `tag-${escapeJs(tag)}`;
        const wrapper = document.createElement('label');
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '6px';
        wrapper.style.padding = '4px 6px';
        wrapper.style.borderRadius = '6px';
        wrapper.style.background = 'rgba(255,255,255,0.02)';
        wrapper.style.cursor = 'pointer';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = tag;
        cb.id = id;
        cb.onchange = () => {
            filterWords();
        };

        const span = document.createElement('span');
        span.textContent = tag;
        span.style.fontSize = '13px';
        span.style.color = 'var(--muted)';

        wrapper.appendChild(cb);
        wrapper.appendChild(span);
        tagsContainer.appendChild(wrapper);
    });
    tagsContainer.dataset.count = String(tags.length);
}

// Families loader + renderer (lightweight, uses data/families_index.json)
let _familiesCache = null;
async function loadAndRenderFamilies() {
    const container = document.getElementById('familiesContainer');
    if (!container) return;
    container.innerHTML = 'Loading families...';
    try {
        if (!_familiesCache) {
            const res = await fetch('data/families_index.json');
            if (!res.ok) {
                // fallback to sample file if index not present
                const sample = await fetch('data/families_sample.json');
                _familiesCache = sample.ok ? await sample.json() : {};
            } else {
                _familiesCache = await res.json();
            }
        }

        // families may be object (index) or array (sample)
        if (Array.isArray(_familiesCache)) {
            // sample array
            container.innerHTML = '';
            _familiesCache.forEach(f => {
                const el = document.createElement('div');
                el.className = 'family-card';
                el.innerHTML = `<h4>${escapeHtml((f.name && f.name.hu) || f.id)}</h4><p>Members: ${Array.isArray(f.members)?f.members.length:0}</p>`;
                container.appendChild(el);
            });
        } else {
            // index object
            container.innerHTML = '';
            const keys = Object.keys(_familiesCache).sort();
            keys.forEach(k => {
                const fam = _familiesCache[k];
                const el = document.createElement('div');
                el.className = 'family-card';
                const title = (fam.name && (fam.name.hu || fam.name.en)) || k;
                const members = Array.isArray(fam.members) ? fam.members.length : 0;
                el.innerHTML = `<h4>${escapeHtml(title)}</h4><p>Members: ${members}</p>`;
                el.addEventListener('click', () => showFamilyMembers(k, fam));
                container.appendChild(el);
            });
        }
    } catch (e) {
        container.innerHTML = '<p>Failed to load families.</p>';
        console.warn('loadAndRenderFamilies error', e);
    }
}

function showFamilyMembers(slug, fam) {
    // render a simple modal-like list in the main app area
    const app = document.getElementById('app');
    if (!app) return;
    const members = Array.isArray(fam.members) ? fam.members : [];
    const title = (fam.name && (fam.name.hu || fam.name.en)) || slug;
    app.innerHTML = `
        <header>
            <button onclick="navigate('families')">← Back to Families</button>
            <button onclick="navigate('home')">Home</button>
            <h1>${escapeHtml(title)}</h1>
        </header>
        <main>
            <p>Members (${members.length}):</p>
            <ul id="family-members-list"></ul>
        </main>
    `;
    const list = document.getElementById('family-members-list');
    members.forEach(id => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#/word/${id}" onclick="event.preventDefault(); openRelated(${id});">${id}</a>`;
        list.appendChild(li);
    });
}

function renderWordList(list) {
    const container = document.getElementById("wordList");
    if (!container) return;

    if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = '<p>No words found.</p>';
        return;
    }

    container.innerHTML = list.map(word => `
        <div class="card" data-id="${escapeHtml(String(word.id))}">
            <div class="card-main" role="button" tabindex="0" aria-expanded="false" aria-controls="panel-${escapeHtml(String(word.id))}" onclick="toggleCardDetails(${escapeJs(word.id)})" onkeydown="handleCardKeydown(event, ${escapeJs(word.id)})" style="cursor:pointer;">
                <h2>${escapeHtml(word.hu)}</h2>
                <p>${escapeHtml(word.pl || '')} <span style="font-weight:600; margin-left:8px">${escapeHtml(word.en || '')}</span></p>
            </div>
            <div id="panel-${escapeHtml(String(word.id))}" class="panel" style="display:none;" aria-hidden="true"></div>
        </div>
    `).join("");
}

function filterWords() {
    const query = (document.getElementById("search")?.value || "").toLowerCase().trim();
    // persist the user's search so re-renders keep the same filtered list
    App.searchQuery = query;

    // read filters
    const typeEl = document.getElementById('filter-type');
    const selectedType = typeEl ? (typeEl.value || '') : '';
    App.filters.type = selectedType;

    const tagEls = Array.from(document.querySelectorAll('#filter-tags input[type="checkbox"]'));
    const selectedTags = tagEls.filter(cb => cb.checked).map(cb => cb.value);
    App.filters.tags = selectedTags;

    // start with all words, then apply filters
    let list = Array.isArray(words) ? words.slice() : [];

    if (query) {
        list = list.filter(word => {
            const hu = (word.hu || '').toLowerCase();
            const en = (word.en || '').toLowerCase();
            const pl = (word.pl || '').toLowerCase();
            return hu.includes(query) || en.includes(query) || pl.includes(query);
        });
    }

    if (selectedType) {
        list = list.filter(w => (w.type || '').toLowerCase() === selectedType.toLowerCase());
    }

    if (selectedTags.length > 0) {
        list = list.filter(w => Array.isArray(w.tags) && selectedTags.some(t => w.tags.includes(t)));
    }

    renderWordList(list);
}

// Expand/collapse a card in-place without scrolling
function toggleCardDetails(id) {
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;

    const panel = card.querySelector('.panel');
    const isExpanded = card.classList.contains('expanded');

    // collapse any other expanded cards
    document.querySelectorAll('.card.expanded').forEach(c => {
        if (c !== card) {
            c.classList.remove('expanded');
            const p = c.querySelector('.panel');
            if (p) p.style.display = 'none';
        }
    });

    if (isExpanded) {
        // collapse
        card.classList.remove('expanded');
        if (panel) panel.style.display = 'none';

        if (location.hash && location.hash.startsWith('#/word/')) {
            // go back in history to restore previous app state (will trigger popstate/hashchange)
            try { history.back(); } catch (e) { history.replaceState(null, '', '#/explore'); }
        } else {
            // ensure state and hash are consistent
            try { history.replaceState(null, '', '#/explore'); } catch (e) { location.hash = '#/explore'; }
            App.selectedWordId = null;
            render();
        }
        // update ARIA state on collapse
        try {
            const cm = document.querySelector(`.card[data-id="${id}"] .card-main`);
            const panelEl = document.getElementById(`panel-${id}`);
            if (cm) cm.setAttribute('aria-expanded', 'false');
            if (panelEl) panelEl.setAttribute('aria-hidden', 'true');
        } catch (e) {}
        // deactivate focus trap and remove dialog attributes
        try {
            const panelEl = document.getElementById(`panel-${id}`);
            if (panelEl && panelEl._deactivateTrap) panelEl._deactivateTrap();
            if (panelEl) {
                panelEl.removeAttribute('role');
                panelEl.removeAttribute('aria-modal');
                panelEl.removeAttribute('aria-labelledby');
                panelEl.tabIndex = -1;
            }
            // restore focus to the card main
            const cm = document.querySelector(`.card[data-id="${id}"] .card-main`);
            if (cm && typeof cm.focus === 'function') cm.focus();
        } catch (e) {}
        App.selectedWordId = null;
        return;
    }

    // expand
    const word = words.find(w => Number(w.id) === Number(id));
    if (!word) return;

    // fill panel content
    if (panel) panel.innerHTML = buildDetailsHtml(word);

    card.classList.add('expanded');
    if (panel) panel.style.display = 'block';

    // scroll expanded card into view and focus header for keyboard users
    try {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const heading = card.querySelector('.card-main h2');
        if (heading && typeof heading.focus === 'function') heading.focus();
    } catch (e) {}

    // push a history entry for the opened word (so back behaves correctly)
    try {
        history.pushState({ view: 'word', id: word.id }, '', `#/word/${word.id}`);
    } catch (e) {
        location.hash = `#/word/${word.id}`;
    }
    App.selectedWordId = word.id;
    // update ARIA state on expand
    try {
        const cm = document.querySelector(`.card[data-id="${id}"] .card-main`);
        const panelEl = document.getElementById(`panel-${id}`);
        if (cm) cm.setAttribute('aria-expanded', 'true');
        if (panelEl) {
            panelEl.setAttribute('aria-hidden', 'false');
            // mark as dialog for assistive tech
            panelEl.setAttribute('role', 'dialog');
            panelEl.setAttribute('aria-modal', 'true');
            panelEl.setAttribute('aria-labelledby', `panel-title-${escapeJs(id)}`);
            panelEl.tabIndex = -1;
            // activate focus trap
            if (typeof activateFocusTrap === 'function') activateFocusTrap(panelEl);
        }
    } catch (e) {}
}

function buildDetailsHtml(word) {
    const related = Array.isArray(word.related) ? word.related : (word.related ? [word.related] : []);
    const tags = Array.isArray(word.tags) ? word.tags.join(', ') : (word.tags || '');
    const forms = Array.isArray(word.forms) ? word.forms.join(', ') : (word.forms || '');

    const relatedHtml = related.length === 0 ? '<em>—</em>' : related.map(r => {
        if (typeof r === 'number' || String(r).match(/^\d+$/)) {
            const rid = Number(r);
            return `<a href="#/word/${rid}" onclick="event.stopPropagation(); openRelated(${rid}); return false;">${rid}</a>`;
        }
        const found = words.find(w => (w.hu && w.hu.toLowerCase() === String(r).toLowerCase()) || (w.en && w.en.toLowerCase() === String(r).toLowerCase()));
        if (found) {
            return `<a href="#/word/${found.id}" onclick="event.stopPropagation(); openRelated(${found.id}); return false;">${escapeHtml(String(r))}</a>`;
        }
        return `<span>${escapeHtml(String(r))}</span>`;
    }).join(', ');

    return `
        <div class="panel-inner">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 id="panel-title-${escapeJs(word.id)}" style="margin:0">${escapeHtml(word.hu)}</h3>
                <div>
                                    <button class="close-btn" aria-label="Close details" onclick="event.stopPropagation(); toggleCardDetails(${escapeJs(word.id)});">Close</button>
                </div>
            </div>
            <div class="meta" style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap">
                <span><strong>Polish:</strong> ${escapeHtml(word.pl || '')}</span>
                <span><strong>English:</strong> ${escapeHtml(word.en || '')}</span>
                <span><strong>Type:</strong> ${escapeHtml(word.type || '')}</span>
            </div>
            <p style="margin:8px 0 0 0;"><strong>Pattern:</strong> ${escapeHtml(word.pattern || '')}</p>
            <p style="margin:4px 0 0 0;"><strong>Family:</strong> ${escapeHtml(word.family || '')}</p>
            <p style="margin:4px 0 0 0;"><strong>Forms:</strong> ${escapeHtml(forms)}</p>
            <p style="margin:4px 0 0 0;"><strong>Related:</strong> ${relatedHtml}</p>
            <p style="margin:4px 0 0 0;"><strong>Tags:</strong> ${escapeHtml(tags)}</p>
            <p style="margin:4px 0 0 0;"><strong>Notes:</strong> ${escapeHtml(word.notes || '')}</p>
            <div style="margin-top:8px;">
                <strong>Examples</strong>
                <div style="margin-top:6px;">
                    <div><em>HU:</em> ${escapeHtml((word.example && word.example.hu) || '')}</div>
                    <div><em>PL:</em> ${escapeHtml((word.example && word.example.pl) || '')}</div>
                </div>
            </div>

            <div style="margin-top:10px; display:flex; gap:8px; align-items:center;">
                <button aria-expanded="false" aria-controls="raw-json-${escapeJs(word.id)}" onclick="event.stopPropagation(); toggleRawJson(${escapeJs(word.id)});" style="padding:6px 10px; border-radius:6px; border:1px solid rgba(0,0,0,0.06); background:transparent; color:inherit;">Raw JSON</button>
                <small style="color:var(--muted)">Permalink: <code>${escapeHtml('#/word/' + word.id)}</code></small>
            </div>

            <pre id="raw-json-${escapeJs(word.id)}" style="display:none; margin-top:10px; white-space:pre-wrap; background:rgba(0,0,0,0.04); padding:10px; border-radius:6px; overflow:auto; max-height:240px;">${escapeHtml(JSON.stringify(word, null, 2))}</pre>
        </div>
    `;
}

function toggleRawJson(id) {
    const el = document.getElementById(`raw-json-${id}`);
    if (!el) return;
    const btn = document.querySelector(`#panel-${id} button[aria-controls="raw-json-${id}"]`);
    const isHidden = el.style.display === 'none' || getComputedStyle(el).display === 'none';
    el.style.display = isHidden ? 'block' : 'none';
    if (btn) btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
}

// Keep rendering in response to popstate (history.back / history.forward)
window.addEventListener('popstate', () => {
    parseHash();
    render();
});

// Also listen to hashchange for manual edits or direct hash navigation
window.addEventListener('hashchange', () => {
    parseHash();
    render();
});

// Keyboard handlers
function handleCardKeydown(event, id) {
    const code = event.key;
    if (code === 'Enter' || code === ' ' || code === 'Spacebar') {
        event.preventDefault();
        toggleCardDetails(id);
    }
}

// Close expanded card on Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        const expanded = document.querySelector('.card.expanded');
        if (expanded) {
            const id = expanded.getAttribute('data-id');
            if (id) toggleCardDetails(id);
        }
    }
});

// Focus trap helpers: keep Tab/Shift+Tab within the panel when open
function activateFocusTrap(panelEl) {
    if (!panelEl) return;
    const selector = 'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(panelEl.querySelectorAll(selector)).filter(n => !n.hasAttribute('disabled'));
    const first = nodes[0] || panelEl;
    const last = nodes[nodes.length - 1] || panelEl;

    function keyHandler(e) {
        if (e.key === 'Tab') {
            if (nodes.length === 0) {
                e.preventDefault();
                return;
            }
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    (last).focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    (first).focus();
                }
            }
        }
    }

    panelEl._deactivateTrap = () => {
        panelEl.removeEventListener('keydown', keyHandler);
        delete panelEl._deactivateTrap;
    };

    panelEl.addEventListener('keydown', keyHandler);

    // focus the first interactive element (close button) for screen-reader users
    setTimeout(() => {
        const closeBtn = panelEl.querySelector('button.close-btn');
        if (closeBtn && typeof closeBtn.focus === 'function') closeBtn.focus();
        else if (first && typeof first.focus === 'function') first.focus();
    }, 10);
}

// Simple HTML escape to avoid injecting raw JSON into the page
function escapeHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Escape values used inside JS string templates for safety (ids etc)
function escapeJs(val) {
    if (val === null || val === undefined) return '';
    return String(val).replace(/"/g, '\\"').replace(/'/g, "\\'");
}

// Initial render so static UI (header/menu) is visible before vocabulary loads.
render();

fetch("data/vocabulary.json")
    .then(response => response.json())
    .then(data => {
        words = Array.isArray(data) ? data : [];
        render();
    })
    .catch(error => {
        console.error("Cannot load vocabulary:", error);
    });
