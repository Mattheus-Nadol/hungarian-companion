// Minimal UI stub: load `data/families_index.json` (generated) and expose a render function.
export async function loadFamiliesIndex() {
  try {
    const res = await fetch('data/families_index.json');
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    console.warn('families index load failed', e);
    return {};
  }
}

export function renderFamiliesList(container, families) {
  container.innerHTML = '';
  const keys = Object.keys(families).sort();
  keys.forEach(k => {
    const fam = families[k];
    const el = document.createElement('div');
    el.className = 'family-card';
    el.innerHTML = `<h4>${(fam.name && fam.name.hu) || k}</h4><p>Members: ${fam.members.length}</p>`;
    container.appendChild(el);
  });
}
