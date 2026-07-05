// =========================
// Hungarian Companion SPA (cards expand in-place)
// v0.5 — Word Card feature
// =========================

let words = [];

const App = {
    currentPage: "home",
    // selectedWordId is managed via hash route #/word/<id>
    selectedWordId: null
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
                <button>📚 Learn</button>
                <button>🧠 Review</button>
            </div>
        </main>
        `;
    },

    explore() {
        return `
        <header>
            <button onclick="navigate('home')">← Back</button>
            <h1>Explore</h1>
        </header>
        <main>
            <input
                id="search"
                placeholder="Search..."
                oninput="filterWords()"
            >

            <div id="wordList"></div>

        </main>
        `;
    }
};

function navigate(page) {
    App.currentPage = page;
    if (page === 'explore') location.hash = location.hash || '#/explore';
    render();
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

    if (App.currentPage === "explore") {
        renderWordList(words);
        // if selectedWordId present, try to open it
        if (App.selectedWordId) {
            setTimeout(() => toggleCardDetails(App.selectedWordId), 10);
        }
    }
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
            <div class="card-main" onclick="toggleCardDetails(${escapeJs(word.id)})" style="cursor:pointer;">
                <h2 tabindex="0">${escapeHtml(word.hu)}</h2>
                <p>${escapeHtml(word.pl || '')} <span style="font-weight:600; margin-left:8px">${escapeHtml(word.en || '')}</span></p>
            </div>
            <div class="panel" style="display:none;"></div>
        </div>
    `).join("");
}

function filterWords() {
    const query = (document.getElementById("search")?.value || "").toLowerCase().trim();

    if (!query) {
        renderWordList(words);
        return;
    }

    const filtered = words.filter(word => {
        const hu = (word.hu || '').toLowerCase();
        const en = (word.en || '').toLowerCase();
        const pl = (word.pl || '').toLowerCase();
        return hu.includes(query) || en.includes(query) || pl.includes(query);
    });

    renderWordList(filtered);
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
        if (location.hash && location.hash.startsWith('#/word/')) location.hash = '#/explore';
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

    // update hash for deep link
    location.hash = `#/word/${word.id}`;
    App.selectedWordId = word.id;
}

function buildDetailsHtml(word) {
    const related = Array.isArray(word.related) ? word.related : (word.related ? [word.related] : []);
    const tags = Array.isArray(word.tags) ? word.tags.join(', ') : (word.tags || '');

    const relatedHtml = related.length === 0 ? '<em>—</em>' : related.map(r => {
        if (typeof r === 'number' || String(r).match(/^\d+$/)) {
            const rid = Number(r);
            return `<a href="#/word/${rid}" onclick="event.stopPropagation(); toggleCardDetails(${rid}); return false;">${rid}</a>`;
        }
        const found = words.find(w => (w.hu && w.hu.toLowerCase() === String(r).toLowerCase()) || (w.en && w.en.toLowerCase() === String(r).toLowerCase()));
        if (found) {
            return `<a href="#/word/${found.id}" onclick="event.stopPropagation(); toggleCardDetails(${found.id}); return false;">${escapeHtml(String(r))}</a>`;
        }
        return `<span>${escapeHtml(String(r))}</span>`;
    }).join(', ');

    return `
        <div class="panel-inner">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0">${escapeHtml(word.hu)}</h3>
                <div>
                  <button class="close-btn" onclick="event.stopPropagation(); toggleCardDetails(${escapeJs(word.id)});">Close</button>
                </div>
            </div>
            <div class="meta" style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap">
                <span><strong>Polish:</strong> ${escapeHtml(word.pl || '')}</span>
                <span><strong>English:</strong> ${escapeHtml(word.en || '')}</span>
                <span><strong>Type:</strong> ${escapeHtml(word.type || '')}</span>
            </div>
            <p style="margin:8px 0 0 0;"><strong>Pattern:</strong> ${escapeHtml(word.pattern || '')}</p>
            <p style="margin:4px 0 0 0;"><strong>Family:</strong> ${escapeHtml(word.family || '')}</p>
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
                <button onclick="event.stopPropagation(); toggleRawJson(${escapeJs(word.id)});" style="padding:6px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.06); background:transparent; color:inherit;">Raw JSON</button>
                <small style="color:var(--muted)">Permalink: <code>${escapeHtml('#/word/' + word.id)}</code></small>
            </div>

            <pre id="raw-json-${escapeJs(word.id)}" style="display:none; margin-top:10px; white-space:pre-wrap; background:rgba(0,0,0,0.12); padding:10px; border-radius:6px; overflow:auto; max-height:240px;">${escapeHtml(JSON.stringify(word, null, 2))}</pre>
        </div>
    `;
}

function toggleRawJson(id) {
    const el = document.getElementById(`raw-json-${id}`);
    if (!el) return;
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// Handle hash routes like #/word/23 and #/explore
function handleHashRoute() {
    parseHash();
    render();
}

window.addEventListener('hashchange', handleHashRoute);

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
    return String(val).replace(/\"/g, '\\"').replace(/'/g, "\\'");
}

fetch("data/vocabulary.json")
    .then(response => response.json())
    .then(data => {
        words = Array.isArray(data) ? data : [];
        render();
    })
    .catch(error => {
        console.error("Cannot load vocabulary:", error);
    });
