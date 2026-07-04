// =========================
// Hungarian Companion SPA
// =========================

let words = [];

const App = {
    currentPage: "home"
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

            <!-- Details pane for selected word -->
            <div id="wordDetails" class="details" style="display:none; margin-top:1rem;"></div>

        </main>
        `;
    }
};

function navigate(page) {
    App.currentPage = page;
    render();
}

function render() {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = Pages[App.currentPage]();

    if (App.currentPage === "explore") {
        renderWordList(words);
        // If hash points to a word, open it
        handleHashRoute();
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
        <div class="card" onclick="showWordDetails(${escapeJs(word.id)})">
            <h2>${escapeHtml(word.hu)}</h2>
            <p>${escapeHtml(word.pl || '')} <span style="font-weight:600; margin-left:8px">${escapeHtml(word.en || '')}</span></p>
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

function showWordDetails(id) {
    const word = words.find(w => Number(w.id) === Number(id));
    const details = document.getElementById("wordDetails");

    if (!details) return;

    if (!word) {
        details.style.display = 'none';
        details.innerHTML = '';
        // clear hash
        if (location.hash && location.hash.startsWith('#/word/')) location.hash = '';
        return;
    }

    const related = Array.isArray(word.related) ? word.related : (word.related ? [word.related] : []);
    const tags = Array.isArray(word.tags) ? word.tags.join(', ') : (word.tags || '');

    // build related links
    const relatedHtml = related.length === 0 ? '<em>—</em>' : related.map(r => {
        // if number -> link by id
        if (typeof r === 'number' || String(r).match(/^\d+$/)) {
            const rid = Number(r);
            return `<a href="#/word/${rid}" onclick="event.stopPropagation(); showWordDetails(${rid}); return false;">${rid}</a>`;
        }
        // try to find by hu or en
        const found = words.find(w => (w.hu && w.hu.toLowerCase() === String(r).toLowerCase()) || (w.en && w.en.toLowerCase() === String(r).toLowerCase()));
        if (found) {
            return `<a href="#/word/${found.id}" onclick="event.stopPropagation(); showWordDetails(${found.id}); return false;">${escapeHtml(String(r))}</a>`;
        }
        // fallback plain text
        return `<span>${escapeHtml(String(r))}</span>`;
    }).join(', ');

    details.innerHTML = `
        <div class="panel">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2 style="margin:0">${escapeHtml(word.hu)}</h2>
                <div>
                  <button class="close-btn" onclick="closeWordDetails()">Close</button>
                </div>
            </div>
            <div class="meta" style="margin-top:8px;">
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
                <button onclick="toggleRawJson(${escapeJs(word.id)})" style="padding:6px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.06); background:transparent; color:inherit; cursor:pointer;">View raw JSON</button>
                <small style="color:var(--muted)">Permalink: <code>${escapeHtml('#/word/' + word.id)}</code></small>
            </div>

            <pre id="raw-json-${escapeJs(word.id)}" style="display:none; margin-top:10px; white-space:pre-wrap; background:rgba(0,0,0,0.2); padding:10px; border-radius:6px; overflow:auto; max-height:260px;">${escapeHtml(JSON.stringify(word, null, 2))}</pre>
        </div>
    `;

    details.style.display = 'block';

    // update hash for deep link (hash routing is safe for GitHub Pages)
    location.hash = `#/word/${word.id}`;

    // Scroll details into view for small screens
    details.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleRawJson(id) {
    const el = document.getElementById(`raw-json-${id}`);
    if (!el) return;
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function closeWordDetails() {
    const details = document.getElementById("wordDetails");
    if (details) {
        details.style.display = 'none';
        details.innerHTML = '';
    }
    // clear hash when closing
    if (location.hash && location.hash.startsWith('#/word/')) location.hash = '';
}

// Handle hash routes like #/word/23
function handleHashRoute() {
    const hash = location.hash || '';
    const m = hash.match(/^#\/word\/(\d+)$/);
    if (m) {
        const id = Number(m[1]);
        // ensure we're on explore page
        if (App.currentPage !== 'explore') navigate('explore');
        // wait a tick for render
        setTimeout(() => showWordDetails(id), 50);
    }
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
