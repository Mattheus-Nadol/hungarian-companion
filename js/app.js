// Hungarian Companion v0.2

const words = [
  {
    hu: "szól",
    pl: "dać znać",
    en: "let someone know",
    type: "Verb",
    example: "Majd szólok.",
    pattern: "Communication"
  },
  {
    hu: "tetszik",
    pl: "podobać się",
    en: "be pleasing",
    type: "Verb",
    example: "Tetszik nekem ez a könyv.",
    pattern: "Thing + tetszik + nekem"
  },
  {
    hu: "ízlik",
    pl: "smakować",
    en: "taste good",
    type: "Verb",
    example: "Ízlik nekem a pizza.",
    pattern: "Thing + ízlik + nekem"
  }
];

function render(list) {
  const container = document.getElementById("vocab");

  container.innerHTML = list.map(word => `
    <div class="card">
      <h2>${word.hu}</h2>

      <span class="tag">${word.type}</span>

      <p><strong>🇵🇱</strong> ${word.pl}</p>

      <p><strong>🇬🇧</strong> ${word.en}</p>

      <p><strong>Pattern</strong><br>${word.pattern}</p>

      <p><strong>Example</strong><br><i>${word.example}</i></p>
    </div>
  `).join("");
}

function filterCards() {
  const query = document
    .getElementById("search")
    .value
    .toLowerCase();

  const filtered = words.filter(word =>
    JSON.stringify(word).toLowerCase().includes(query)
  );

  render(filtered);
}

// Initial render
render(words);
