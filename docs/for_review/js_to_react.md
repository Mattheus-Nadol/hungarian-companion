# Blueprint: Upgrading Vocabulary App from Vanilla JS to React (Vite)

This document serves as an engineering manual and a series of prompt templates to migrate a localized language-learning application from Vanilla JS to a modern React SPA hosted on GitHub Pages.

---

## 1. Safety Blueprint & Git Branch Strategy

To ensure zero downtime for the live GitHub Pages site, the migration must follow a strict branching and isolation strategy.

### Step 1: Isolate the Migration Branch
Do not touch the `main` or `master` branch. All work happens in a dedicated migration branch.
```bash
# Ensure you are on main and up to date
git checkout main
git pull origin main

# Create and switch to the migration branch
git checkout -b feature/react-modernization
```

### Step 2: Directory Isolation
To avoid asset conflicts, keep the legacy code intact and build the new React app in a subfolder or a clean directory structure. 
* Do not delete your current JSON or `.md` files; they will serve as the single source of truth for the new app.

### Step 3: Deployment Fallback Plan
* If your GitHub Pages is currently powered by the `main` branch, it will remain untouched.
* The new React app will only be built and merged into `main` after local testing is 100% successful.

---

## 2. Target Architecture (Vite + React)

The upgraded application will use a structured data flow tailored to handle the **836+ words** efficiently without a database.

```text
src/
├── assets/          # Global styles and static images
├── components/      # Reusable UI blocks (Card, Search, Quiz)
├── data/            # Your big vocabulary JSON file
│   └── vocabulary.json
├── docs/            # Your Markdown (.md) grammar/unit notes
├── hooks/           # Custom React hooks (useAudio, useLeitner)
├── App.jsx          # Application layout and core state
└── main.jsx         # App entry point
```

---

## 3. Code Implementation Blueprints

### Component Blueprint: Word Card (`WordCard.jsx`)
This component renders vocabulary details dynamically from your JSON structure and includes integrated Text-to-Speech.

```jsx
import React from 'react';
import { Volume2, BookOpen, AlertCircle } from 'lucide-react';

export default function WordCard({ wordData }) {
  const { word, translation, examples, forms, patterns } = wordData;

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      // Automatically detect or set target language voice (e.g., 'es-ES', 'de-DE')
      utterance.lang = 'de-DE'; 
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {word}
            <button onClick={speak} className="text-blue-500 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 transition-colors">
              <Volume2 size={20} />
            </button>
          </h3>
          <p className="text-lg text-slate-600 italic mt-1">{translation}</p>
        </div>
        {forms && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {forms}
          </span>
        )}
      </div>

      {patterns && (
        <div className="mb-4 bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex gap-2 items-center">
          <AlertCircle size={16} />
          <span><strong>Pattern:</strong> {patterns}</span>
        </div>
      )}

      {examples && examples.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <BookOpen size={12} /> Examples
          </h4>
          <ul className="space-y-2">
            {examples.map((ex, idx) => (
              <li key={idx} className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                {ex}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Application State & Performance Blueprint (`App.jsx`)
Using `useMemo` ensures that filtering through 836+ records is lightning fast and does not trigger expensive UI re-renders on every keystroke.

```jsx
import React, { useState, useMemo } from 'react';
import vocabularyData from './data/vocabulary.json';
import WordCard from './components/WordCard';
import { Search } from 'lucide-react';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');

  // Extracts all unique units from the JSON dynamically
  const units = useMemo(() => {
    const allUnits = vocabularyData.map(item => item.unit).filter(Boolean);
    return ['all', ...new Set(allUnits)];
  }, []);

  // Performance-optimized searching and filtering
  const filteredVocabulary = useMemo(() => {
    return vocabularyData.filter(item => {
      const matchesSearch = 
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUnit = selectedUnit === 'all' || item.unit === selectedUnit;
      
      return matchesSearch && matchesUnit;
    });
  }, [searchTerm, selectedUnit]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Vocabulary Engine</h1>
        <p className="text-slate-500">Managing {vocabularyData.length} active words</p>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search words or translations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={selectedUnit} 
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {units.map(unit => (
              <option key={unit} value={unit}>
                {unit === 'all' ? 'All Units' : `Unit ${unit}`}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVocabulary.map(wordObj => (
          <WordCard key={wordObj.id} wordData={wordObj} />
        ))}
      </main>
    </div>
  );
}
```

---

## 4. GitHub Copilot Interrogation Prompts

Copy and paste these exact prompts into your Copilot chat when executing the migration.

### Prompt 1: Evaluating the Existing JSON Structure
> **Context:** I have a static vocabulary dataset tracking 836+ entries.
> **Prompt:** "Review my current JSON data scheme (pasted below). I am building a language learning React app using Vite. How should I structure my React state or components to optimally handle keys like translations, forms, examples, and patterns? Show me how to leverage `useMemo` for rapid client-side search across this specific JSON payload without introducing latency."

### Prompt 2: Safe GitHub Pages Deployment Strategy
> **Context:** The app will continue running exclusively on GitHub Pages.
> **Prompt:** "Provide a complete configuration guide for deploying a static Vite + React project to GitHub Pages. Include the configurations required in `vite.config.js` for custom base paths (`/repository-name/`), how to handle routing conflicts with static assets like my Markdown (.md) grammar files, and a step-by-step GitHub Actions workflow file (`.github/workflows/deploy.yml`) to compile and push the production build automatically upon pushing to the `main` branch."

### Prompt 3: Building a Spaced-Repetition System (Leitner/Anki)
> **Context:** Upgrading functionality from lists to active learning tools.
> **Prompt:** "I want to build a custom React hook called `useLeitner` to implement a Leitner quiz system (spaced repetition) for my vocabulary app. The hook must interface with browser `localStorage` to save state securely across sessions. It needs to track which box (1 to 5) a word ID belongs to, handle correct/incorrect increments, and filter words that are due for review today. Keep the implementation fully client-side so it works on GitHub Pages."

### Prompt 4: Markdown Parse Integration
> **Context:** Merging text manuals with datasets.
> **Prompt:** "I have `.md` files containing grammar rules and comprehensive unit guides. Write a React component called `GrammarViewer` that takes a `unitId` as a prop, fetches the matching Markdown file dynamically from the static public directory, and displays it safely using the `react-markdown` library. Ensure it handles exceptions gracefully if a specific unit's markdown file does not exist yet."

---

## 5. Deployment Step Checklist

When ready to go live, use this exact command sequence to transition production safely:

* **Step A:** Run local compilation via `npm run build`
* **Step B:** Preview production build locally via `npm run preview`
* **Step C:** Commit all current work directly to the active migration branch
* **Step D:** Safely merge the verified branch back into the core main branch
* **Step E:** Ensure the automated deployment automation pipeline exits successfully with zero errors
* **Step F:** Inspect the web inspector network tab to confirm JSON files load accurately

---

## 6. Blueprint Next Steps

Copy this entire block and use it as a persistent reference document. When starting the migration, copy Prompt 1 out of this text file, append your raw structural schema below it, and feed it directly to your target coding agent.
