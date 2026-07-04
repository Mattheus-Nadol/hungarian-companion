// =========================
// Hungarian Companion SPA
// =========================

const App = {

    currentPage: "home"

};

const words = [
  {
    id: 1,
    hu: "szól",
    pl: "dać znać",
    en: "let someone know",
    type: "Verb",
    example: "Majd szólok.",
    pattern: "Communication"
  },
  {
    id: 2,
    hu: "tetszik",
    pl: "podobać się",
    en: "be pleasing",
    type: "Verb",
    example: "Tetszik nekem ez a könyv.",
    pattern: "Thing + tetszik + nekem"
  },
  {
    id: 3,
    hu: "ízlik",
    pl: "smakować",
    en: "taste good",
    type: "Verb",
    example: "Ízlik nekem a pizza.",
    pattern: "Thing + ízlik + nekem"
  }
];

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

    document.getElementById("wordList").innerHTML = list.map(word => `

        <div class="card">

            <h2>${word.hu}</h2>

            <p>${word.pl}</p>

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

render();
