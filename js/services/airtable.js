/**
 * Service Airtable
 * Gère toutes les interactions avec l'API Airtable (CRUD)
 */

window.AirtableService = {
  /**
   * URL de base de l'API Airtable
   */
  get baseUrl() {
    return `https://api.airtable.com/v0/${AppConfig.airtable.baseId}`;
  },

  /**
   * Headers pour les requêtes Airtable
   */
  get headers() {
    return {
      'Authorization': `Bearer ${AppConfig.airtable.apiKey}`,
      'Content-Type': 'application/json'
    };
  },

  /**
   * Récupère tous les enregistrements d'une table
   * @param {string} tableName - Nom de la table
   * @param {Object} options - Options de filtrage/tri
   * @returns {Promise<Array>}
   */
  async getAll(tableName, options = {}) {
    try {
      Helpers.log('info', `Fetching all from ${tableName}`, options);

      let records = [];
      let offset = null;

      do {
        const params = new URLSearchParams();

        if (options.filterByFormula) {
          params.append('filterByFormula', options.filterByFormula);
        }

        if (options.sort) {
          options.sort.forEach((s, idx) => {
            params.append(`sort[${idx}][field]`, s.field);
            params.append(`sort[${idx}][direction]`, s.direction || 'asc');
          });
        }

        if (options.maxRecords) {
          params.append('maxRecords', options.maxRecords);
        }

        if (offset) {
          params.append('offset', offset);
        }

        const url = `${this.baseUrl}/${encodeURIComponent(tableName)}?${params}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: this.headers
        });

        if (!response.ok) {
          throw new Error(`Airtable API error: ${response.status}`);
        }

        const data = await response.json();
        records = records.concat(data.records);
        offset = data.offset;

      } while (offset);

      Helpers.log('info', `Fetched ${records.length} records from ${tableName}`);
      return records.map(r => ({ id: r.id, ...r.fields }));

    } catch (error) {
      Helpers.log('error', `Error fetching from ${tableName}`, error);
      throw error;
    }
  },

  /**
   * Récupère un enregistrement par ID
   * @param {string} tableName
   * @param {string} recordId
   * @returns {Promise<Object>}
   */
  async getById(tableName, recordId) {
    try {
      Helpers.log('info', `Fetching ${tableName}/${recordId}`);

      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}/${recordId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      return { id: data.id, ...data.fields };

    } catch (error) {
      Helpers.log('error', `Error fetching ${tableName}/${recordId}`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel enregistrement
   * @param {string} tableName
   * @param {Object} fields - Données à créer
   * @returns {Promise<Object>}
   */
  async create(tableName, fields) {
    try {
      Helpers.log('info', `Creating record in ${tableName}`, fields);

      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      Helpers.log('info', `Created record ${data.id} in ${tableName}`);
      return { id: data.id, ...data.fields };

    } catch (error) {
      Helpers.log('error', `Error creating in ${tableName}`, error);
      throw error;
    }
  },

  /**
   * Crée plusieurs enregistrements (batch)
   * @param {string} tableName
   * @param {Array<Object>} recordsFields - Tableau de données
   * @returns {Promise<Array>}
   */
  async createMany(tableName, recordsFields) {
    try {
      Helpers.log('info', `Creating ${recordsFields.length} records in ${tableName}`);

      // Airtable limite à 10 records par requête
      const batches = [];
      for (let i = 0; i < recordsFields.length; i += 10) {
        batches.push(recordsFields.slice(i, i + 10));
      }

      const results = [];

      for (const batch of batches) {
        const url = `${this.baseUrl}/${encodeURIComponent(tableName)}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            records: batch.map(fields => ({ fields }))
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        results.push(...data.records.map(r => ({ id: r.id, ...r.fields })));
      }

      Helpers.log('info', `Created ${results.length} records in ${tableName}`);
      return results;

    } catch (error) {
      Helpers.log('error', `Error creating batch in ${tableName}`, error);
      throw error;
    }
  },

  /**
   * Met à jour un enregistrement
   * @param {string} tableName
   * @param {string} recordId
   * @param {Object} fields - Champs à mettre à jour
   * @returns {Promise<Object>}
   */
  async update(tableName, recordId, fields) {
    try {
      Helpers.log('info', `Updating ${tableName}/${recordId}`, fields);

      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}/${recordId}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      Helpers.log('info', `Updated record ${data.id} in ${tableName}`);
      return { id: data.id, ...data.fields };

    } catch (error) {
      Helpers.log('error', `Error updating ${tableName}/${recordId}`, error);
      throw error;
    }
  },

  /**
   * Supprime un enregistrement
   * @param {string} tableName
   * @param {string} recordId
   * @returns {Promise<void>}
   */
  async delete(tableName, recordId) {
    try {
      Helpers.log('info', `Deleting ${tableName}/${recordId}`);

      const url = `${this.baseUrl}/${encodeURIComponent(tableName)}/${recordId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      Helpers.log('info', `Deleted record ${recordId} from ${tableName}`);

    } catch (error) {
      Helpers.log('error', `Error deleting ${tableName}/${recordId}`, error);
      throw error;
    }
  },

  /**
   * Recherche des enregistrements avec une formule
   * @param {string} tableName
   * @param {string} formula - Formule Airtable
   * @returns {Promise<Array>}
   */
  async findByFormula(tableName, formula) {
    return this.getAll(tableName, { filterByFormula: formula });
  },

  /**
   * Recherche par champ
   * @param {string} tableName
   * @param {string} field - Nom du champ
   * @param {*} value - Valeur recherchée
   * @returns {Promise<Array>}
   */
  async findByField(tableName, field, value) {
    const formula = typeof value === 'string'
      ? `{${field}}="${value}"`
      : `{${field}}=${value}`;
    return this.findByFormula(tableName, formula);
  }
};
