/** Écran Liste Clients */
window.ClientsScreen = async () => {
  const clients = await ClientModel.getAll();
  return `
    <button class="btn btn-primary btn-block mb-md" onclick="ClientsActions.showNewClientModal()">
      + Nouveau client
    </button>

    <div class="form-group">
      <input
        type="text"
        id="clients-search"
        class="form-input"
        placeholder="Rechercher par nom ou téléphone..."
        autocomplete="off"
      />
    </div>

    <div id="clients-list" class="list">
      ${renderClientsList(clients)}
    </div>

    <script>
      (function() {
        const clients = ${JSON.stringify(clients)};
        ClientsActions.setupSearch(clients);
      })();
    </script>
  `;
};

function renderClientsList(clients) {
  if (clients.length === 0) {
    return '<div class="empty-state">Aucun client trouvé</div>';
  }

  return clients.map(c => `
    <div class="list-item list-item-clickable" onclick="Router.navigate('/client/${c.id}')">
      <div class="list-item-avatar">${c.nom_complet[0].toUpperCase()}</div>
      <div class="list-item-content">
        <div class="list-item-title">${c.nom_complet}</div>
        <div class="list-item-subtitle">
          ${c.telephone || 'Pas de téléphone'}
          ${c.solde_du > 0 ? ' • <span style="color: var(--color-error);">' + Helpers.formatCurrency(c.solde_du) + ' de dette</span>' : ''}
        </div>
      </div>
    </div>
  `).join('');
}

/** Actions pour l'écran Clients */
window.ClientsActions = {
  setupSearch(clients) {
    const input = document.getElementById('clients-search');
    const listDiv = document.getElementById('clients-list');

    if (!input || !listDiv) return;

    const search = Helpers.debounce((query) => {
      if (!query) {
        listDiv.innerHTML = renderClientsList(clients);
        return;
      }

      const matches = clients.filter(client => {
        const nomMatch = client.nom_complet?.toLowerCase().includes(query.toLowerCase());
        const telMatch = client.telephone?.includes(query);
        return nomMatch || telMatch;
      });

      listDiv.innerHTML = renderClientsList(matches);
    }, 300);

    input.addEventListener('input', (e) => search(e.target.value));
  },

  showNewClientModal() {
    UIComponents.showModal(
      'Nouveau client',
      `
        <div class="form-group">
          <label for="client-nom">Nom complet *</label>
          <input type="text" id="client-nom" class="form-input" placeholder="Jean Kouadio" required />
        </div>
        <div class="form-group">
          <label for="client-tel">Téléphone *</label>
          <input type="tel" id="client-tel" class="form-input" placeholder="+225 0749189195" required />
        </div>
        <div class="form-group">
          <label for="client-email">Email</label>
          <input type="email" id="client-email" class="form-input" placeholder="jean@example.com" />
        </div>
        <div class="form-group">
          <label for="client-adresse">Adresse</label>
          <textarea id="client-adresse" class="form-input" placeholder="Cocody, Angré 7ème tranche..." rows="2"></textarea>
        </div>
        <div class="form-group">
          <label for="client-type">Type de client *</label>
          <select id="client-type" class="form-input">
            ${Object.values(Constants.TypesClient).map(type => `
              <option value="${type}">${type}</option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="client-notes">Notes</label>
          <textarea id="client-notes" class="form-input" placeholder="Notes personnelles..." rows="2"></textarea>
        </div>
      `,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Créer', class: 'btn-primary', onclick: 'ClientsActions.confirmNewClient()' }
      ]
    );

    setTimeout(() => document.getElementById('client-nom')?.focus(), 100);
  },

  async confirmNewClient() {
    const nom = document.getElementById('client-nom').value.trim();
    const tel = document.getElementById('client-tel').value.trim();
    const email = document.getElementById('client-email').value.trim();
    const adresse = document.getElementById('client-adresse').value.trim();
    const type = document.getElementById('client-type').value;
    const notes = document.getElementById('client-notes').value.trim();

    // Validation
    if (!nom || !tel) {
      UIComponents.showToast('Le nom et le téléphone sont obligatoires', 'error');
      return;
    }

    if (!Helpers.isValidPhone(tel)) {
      UIComponents.showToast('Numéro de téléphone invalide', 'error');
      return;
    }

    try {
      UIComponents.showToast('Création du client...', 'info');

      const client = await ClientModel.create({
        nom_complet: nom,
        telephone: tel,
        email: email,
        adresse: adresse,
        type_client: type,
        notes: notes
      });

      UIComponents.closeModal();
      UIComponents.showToast(Constants.Messages.SUCCESS.CLIENT_CREE, 'success');

      // Recharger l'écran
      await Router.refresh();

    } catch (error) {
      console.error('Erreur création client:', error);
      UIComponents.showToast('Erreur : ' + error.message, 'error');
    }
  }
};
