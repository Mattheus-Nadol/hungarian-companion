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

                <button onclick="navigate('explore')">

                    🔍 Explore

                </button>

                <button>

                    📚 Learn

                </button>

                <button>

                    🧠 Review

                </button>

            </div>

        </main>

        `;

    },

    explore() {

        return `

        <header>

            <button onclick="navigate('home')">

                ← Back

            </button>

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

    document
        .getElementById("app")
        .innerHTML = Pages[App.currentPage]();

    if (App.currentPage === "explore") {

        renderWordList(words);

    }

}

function renderWordList(list) {

    const container = document.getElementById("wordList");

    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '<p>No words found.</p>';
        return;
    }

    container.innerHTML = list.map(word => `

        <div class="card" onclick="showWordDetails(${word.id})" style="cursor:pointer; padding:10px; border:1px solid #ddd; margin-bottom:8px; border-radius:6px;">

            <h2 style="margin:0">${escapeHtml(word.hu)}</h2>

            <p style="margin:4px 0 0 0; color:#555">${escapeHtml(word.pl || '')} <span style="font-weight:600; margin-left:8px">${escapeHtml(word.en || '')}</span></p>

        </div>

    `).join("");

}

function filterWords() {

    const query = document
        .getElementById("search")
        .value
        .toLowerCase();

    const filtered = words.filter(word =>
        JSON.stringify(word)
            .toLowerCase()
            .includes(query)
    );

    renderWordList(filtered);

}

function showWordDetails(id) {

    const word = words.find(w => Number(w.id) === Number(id));

    const details = document.getElementById("wordDetails");

    if (!word) {
        if (details) {
            details.style.display = 'none';
            details.innerHTML = '';
        }
        return;
    }

    const related = Array.isArray(word.related) ? word.related.join(', ') : word.related || '';
    const tags = Array.isArray(word.tags) ? word.tags.join(', ') : word.tags || '';

    details.innerHTML = `
        <div style="padding:12px; border:1px solid #ccc; border-radius:6px; background:#fafafa;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2 style="margin:0">${escapeHtml(word.hu)}</h2>
                <button onclick="closeWordDetails()" style="margin-left:12px;">Close</button>
            </div>
            <p style="margin:8px 0 0 0;"><strong>Polish:</strong> ${escapeHtml(word.pl || '')}</p>
            <p style="margin:4px 0 0 0;"><strong>English:</strong> ${escapeHtml(word.en || '')}</p>
            <p style="margin:4px 0 0 0;"><strong>Type:</strong> ${escapeHtml(word.type || '')}</p>
            <p style="margin:4px 0 0 0;"><strong>Pattern:</strong> ${escapeHtml(word.pattern || '')}</p>
            <p style="margin:4px 0 0 0;"><strong>Family:</strong> ${escapeHtml(word.family || '')}</p>
            <p style="margin:4px 0 0 0;"><strong>Related:</strong> ${escapeHtml(related)}</p>
            <p style="margin:4px 0 0 0;"><strong>Tags:</strong> ${escapeHtml(tags)}</p>
            <p style="margin:4px 0 0 0;"><strong>Notes:</strong> ${escapeHtml(word.notes || '')}</p>
            <div style="margin-top:8px;">
                <strong>Examples</strong>
                <div style="margin-top:6px;">
                    <div><em>HU:</em> ${escapeHtml((word.example && word.example.hu) || '')}</div>
                    <div><em>PL:</em> ${escapeHtml((word.example && word.example.pl) || '')}</div>
                </div>
            </div>
        </div>
    `;

    details.style.display = 'block';

    // Scroll details into view for small screens
    details.scrollIntoView({ behavior: 'smooth', block: 'start' });

}

function closeWordDetails() {
    const details = document.getElementById("wordDetails");
    if (details) {
        details.style.display = 'none';
        details.innerHTML = '';
    }
}

// Simple HTML escape to avoid injecting raw JSON into the page
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

fetch("data/vocabulary.json")
    .then(response => response.json())
    .then(data => {

        words = data;

        render();

    })
    .catch(error => {

        console.error("Cannot load vocabulary:", error);

    });
