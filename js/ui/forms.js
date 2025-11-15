/**
 * Helpers pour formulaires
 */

window.FormHelpers = {
  /**
   * Autocomplete générique
   */
  setupAutocomplete(inputId, items, onSelect, searchKeys = ['nom', 'nom_complet']) {
    const input = document.getElementById(inputId);
    let resultsDiv = document.getElementById(`${inputId}-results`);

    if (!resultsDiv) {
      resultsDiv = document.createElement('div');
      resultsDiv.id = `${inputId}-results`;
      resultsDiv.className = 'autocomplete-results';
      input.parentNode.appendChild(resultsDiv);
    }

    const search = Helpers.debounce((query) => {
      if (!query) {
        resultsDiv.innerHTML = '';
        return;
      }

      const matches = items.filter(item =>
        searchKeys.some(key => Helpers.matchSearch(item[key], query))
      ).slice(0, 10);

      if (matches.length === 0) {
        resultsDiv.innerHTML = '<div class="autocomplete-empty">Aucun résultat</div>';
      } else {
        resultsDiv.innerHTML = matches.map(item => `
          <div class="autocomplete-item" data-id="${item.id}">
            ${item.nom_complet || item.nom}
          </div>
        `).join('');

        resultsDiv.querySelectorAll('.autocomplete-item').forEach(el => {
          el.onclick = () => {
            onSelect(items.find(i => i.id === el.dataset.id));
            resultsDiv.innerHTML = '';
          };
        });
      }
    }, 300);

    input.addEventListener('input', (e) => search(e.target.value));
  }
};
