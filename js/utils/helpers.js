/**
 * Fonctions utilitaires globales
 */

window.Helpers = {
  /**
   * Formate un montant en devise
   * @param {number} amount - Montant à formater
   * @param {string} currency - Code devise (défaut : XOF)
   * @returns {string} Montant formaté
   */
  formatCurrency(amount, currency = 'XOF') {
    if (amount === null || amount === undefined) return '0 ' + currency;

    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

    return `${formatted} ${currency}`;
  },

  /**
   * Formate une date
   * @param {Date|string} date - Date à formater
   * @param {string} format - Format ('short' | 'long' | 'time')
   * @returns {string} Date formatée
   */
  formatDate(date, format = 'short') {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'short') {
      // Format : 15/11/2025
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else if (format === 'long') {
      // Format : 15 novembre 2025
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else if (format === 'time') {
      // Format : 15/11/2025 14:30
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return d.toLocaleDateString('fr-FR');
  },

  /**
   * Calcule le nombre de jours entre deux dates
   * @param {Date|string} date1
   * @param {Date|string} date2
   * @returns {number} Nombre de jours
   */
  daysBetween(date1, date2) {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    const diff = Math.abs(d2 - d1);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },

  /**
   * Vérifie si une date est dépassée
   * @param {Date|string} date
   * @returns {boolean}
   */
  isOverdue(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d < new Date();
  },

  /**
   * Génère une référence unique
   * @param {string} type - Type ('vente', 'paiement', 'lot')
   * @param {number} num - Numéro séquentiel
   * @returns {string} Référence formatée
   */
  generateReference(type, num) {
    const year = new Date().getFullYear();
    const paddedNum = String(num).padStart(3, '0');

    const prefixes = {
      vente: 'VTE',
      paiement: 'PAY',
      lot: 'LOT'
    };

    const prefix = prefixes[type] || 'REF';
    return `${prefix}-${year}-${paddedNum}`;
  },

  /**
   * Valide un numéro de téléphone
   * @param {string} phone
   * @returns {boolean}
   */
  isValidPhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/\s+/g, '');
    return cleaned.length >= Constants.Rules.MIN_PHONE_LENGTH &&
           cleaned.length <= Constants.Rules.MAX_PHONE_LENGTH;
  },

  /**
   * Formate un numéro de téléphone
   * @param {string} phone
   * @returns {string}
   */
  formatPhone(phone) {
    if (!phone) return '';
    // Enlève tous les espaces et caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Format pour numéros ivoiriens (+225 XX XX XX XX XX)
    if (cleaned.startsWith('+225')) {
      cleaned = cleaned.substring(4);
      return `+225 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`.trim();
    }

    return cleaned;
  },

  /**
   * Débounce une fonction
   * @param {Function} func - Fonction à débouncer
   * @param {number} wait - Délai en ms
   * @returns {Function}
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Tronque un texte
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  truncate(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  /**
   * Génère un ID unique temporaire
   * @returns {string}
   */
  generateTempId() {
    return 'tmp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  },

  /**
   * Deep clone d'un objet
   * @param {Object} obj
   * @returns {Object}
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Normalise une chaîne pour la recherche
   * @param {string} str
   * @returns {string}
   */
  normalizeForSearch(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Enlève les accents
  },

  /**
   * Vérifie si une chaîne contient une recherche
   * @param {string} text - Texte à chercher
   * @param {string} query - Requête
   * @returns {boolean}
   */
  matchSearch(text, query) {
    if (!query) return true;
    if (!text) return false;
    return this.normalizeForSearch(text).includes(this.normalizeForSearch(query));
  },

  /**
   * Calcule un pourcentage
   * @param {number} value
   * @param {number} total
   * @returns {number}
   */
  percentage(value, total) {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  /**
   * Sécurise l'accès à une propriété imbriquée
   * @param {Object} obj - Objet
   * @param {string} path - Chemin (ex: 'user.profile.name')
   * @param {*} defaultValue - Valeur par défaut
   * @returns {*}
   */
  get(obj, path, defaultValue = null) {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }

    return result !== undefined ? result : defaultValue;
  },

  /**
   * Groupe un tableau par une clé
   * @param {Array} array
   * @param {string|Function} key
   * @returns {Object}
   */
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },

  /**
   * Trie un tableau par une propriété
   * @param {Array} array
   * @param {string} key
   * @param {string} order - 'asc' | 'desc'
   * @returns {Array}
   */
  sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
      const aVal = this.get(a, key);
      const bVal = this.get(b, key);

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  /**
   * Copie du texte dans le presse-papier
   * @param {string} text
   * @returns {Promise<void>}
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback pour navigateurs ne supportant pas clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  },

  /**
   * Convertit un fichier en base64
   * @param {File} file
   * @returns {Promise<string>}
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Valide une image
   * @param {File} file
   * @returns {Object} {valid: boolean, error: string}
   */
  validateImage(file) {
    if (!file) {
      return { valid: false, error: 'Aucun fichier sélectionné' };
    }

    if (!Constants.Rules.ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Format non supporté (JPG, PNG ou WebP uniquement)' };
    }

    if (file.size > Constants.Rules.MAX_UPLOAD_SIZE) {
      return { valid: false, error: 'Fichier trop volumineux (max 5 MB)' };
    }

    return { valid: true };
  },

  /**
   * Parse un échéancier JSON
   * @param {string} echeancierJson
   * @returns {Array}
   */
  parseEcheancier(echeancierJson) {
    if (!echeancierJson) return [];
    try {
      if (typeof echeancierJson === 'object') return echeancierJson;
      return JSON.parse(echeancierJson);
    } catch (e) {
      console.error('Erreur parsing échéancier:', e);
      return [];
    }
  },

  /**
   * Stringifie un échéancier pour stockage
   * @param {Array} echeancier
   * @returns {string}
   */
  stringifyEcheancier(echeancier) {
    return JSON.stringify(echeancier || []);
  },

  /**
   * Log avec niveau (si debug activé)
   * @param {string} level - 'info' | 'warn' | 'error'
   * @param {string} message
   * @param {*} data
   */
  log(level, message, data = null) {
    if (!AppConfig?.app?.debug) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (level === 'error') {
      console.error(logMessage, data);
    } else if (level === 'warn') {
      console.warn(logMessage, data);
    } else {
      console.log(logMessage, data);
    }
  }
};
