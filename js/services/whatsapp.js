/**
 * Service WhatsApp
 * Génère des messages formatés et liens WhatsApp
 */

window.WhatsAppService = {
  /**
   * Génère une facture WhatsApp
   * @param {Object} vente - Objet vente
   * @param {Object} client - Objet client
   * @param {Array} lignes - Lignes de vente
   * @param {Object} boutique - Boutique principale
   * @returns {string} Message formaté
   */
  generateFacture(vente, client, lignes, boutique) {
    const template = Constants.WhatsAppTemplates.FACTURE;

    // Formate les articles
    const articlesText = lignes.map(ligne => {
      return `• ${ligne.article_nom} x${ligne.quantite} - ${Helpers.formatCurrency(ligne.total_ligne)}`;
    }).join('\n');

    const message = template
      .replace('{client_name}', client.nom_complet || 'Client')
      .replace('{reference}', vente.reference)
      .replace('{date}', Helpers.formatDate(vente.date_vente))
      .replace('{articles}', articlesText)
      .replace('{total}', Helpers.formatCurrency(vente.montant_total))
      .replace('{paye}', Helpers.formatCurrency(vente.montant_paye_initial))
      .replace('{reste}', Helpers.formatCurrency(vente.montant_restant_du))
      .replace(/{currency}/g, AppConfig.business.currency)
      .replace('{boutique_name}', boutique?.nom || 'AndyShop');

    return message;
  },

  /**
   * Génère un reçu de paiement WhatsApp
   * @param {Object} paiement - Objet paiement
   * @param {Object} client - Objet client
   * @param {Array} allocations - Allocations sur dettes
   * @param {Object} boutique - Boutique
   * @returns {string} Message formaté
   */
  generateRecu(paiement, client, allocations, boutique) {
    const template = Constants.WhatsAppTemplates.RECU;

    // Formate les dettes impactées
    const dettesText = allocations.map(alloc => {
      return `• ${alloc.dette_reference} : -${Helpers.formatCurrency(alloc.montant_alloue)}`;
    }).join('\n');

    // Calcule le nouveau solde (simplifié, devrait venir du client mis à jour)
    const nouveauSolde = client.solde_du - paiement.montant;

    const message = template
      .replace('{client_name}', client.nom_complet || 'Client')
      .replace('{reference}', paiement.reference)
      .replace('{date}', Helpers.formatDate(paiement.date_paiement))
      .replace('{montant}', Helpers.formatCurrency(paiement.montant))
      .replace('{mode}', paiement.mode_paiement)
      .replace('{dettes_impactees}', dettesText || 'Aucune dette impactée')
      .replace('{nouveau_solde}', Helpers.formatCurrency(nouveauSolde))
      .replace(/{currency}/g, AppConfig.business.currency)
      .replace('{boutique_name}', boutique?.nom || 'AndyShop');

    return message;
  },

  /**
   * Génère un message de relance
   * @param {Object} client - Objet client
   * @param {Array} dettes - Liste des dettes
   * @param {string} type - Type de relance ('amicale' | 'ferme' | 'echeance')
   * @param {Object} boutique - Boutique
   * @returns {string} Message formaté
   */
  generateRelance(client, dettes, type = 'amicale', boutique) {
    let template;

    if (type === 'amicale') {
      template = Constants.WhatsAppTemplates.RELANCE_AMICALE;
    } else if (type === 'ferme') {
      template = Constants.WhatsAppTemplates.RELANCE_FERME;
    } else if (type === 'echeance') {
      template = Constants.WhatsAppTemplates.RELANCE_ECHEANCE;
      // Pour une relance d'échéance, on traite une seule dette
      const dette = dettes[0];
      const echeancier = Helpers.parseEcheancier(dette.echeancier);
      const prochaineEcheance = echeancier.find(e => new Date(e.date) >= new Date());

      const message = template
        .replace('{client_name}', client.nom_complet || 'Client')
        .replace('{date_echeance}', Helpers.formatDate(prochaineEcheance?.date))
        .replace('{montant}', Helpers.formatCurrency(prochaineEcheance?.montant))
        .replace(/{currency}/g, AppConfig.business.currency)
        .replace('{boutique_name}', boutique?.nom || 'AndyShop');

      return message;
    } else {
      template = Constants.WhatsAppTemplates.RELANCE_AMICALE;
    }

    // Formate les dettes
    const dettesText = dettes.map(dette => {
      const dateVente = Helpers.formatDate(dette.date_creation, 'short');
      return `• Vente du ${dateVente} : ${Helpers.formatCurrency(dette.montant_restant)}`;
    }).join('\n');

    // Calcule le total dû
    const totalDu = dettes.reduce((sum, d) => sum + (d.montant_restant || 0), 0);

    // Calcule les jours de retard (pour relance ferme)
    let joursRetard = 0;
    if (type === 'ferme') {
      const datesRetard = dettes.map(dette => {
        const echeancier = Helpers.parseEcheancier(dette.echeancier);
        if (echeancier.length > 0) {
          const echeancePassee = echeancier.find(e => new Date(e.date) < new Date());
          if (echeancePassee) {
            return Helpers.daysBetween(new Date(echeancePassee.date), new Date());
          }
        }
        return 0;
      });
      joursRetard = Math.max(...datesRetard);
    }

    const message = template
      .replace('{client_name}', client.nom_complet || 'Client')
      .replace('{dettes_details}', dettesText)
      .replace('{total_du}', Helpers.formatCurrency(totalDu))
      .replace('{jours_retard}', joursRetard)
      .replace(/{currency}/g, AppConfig.business.currency)
      .replace('{boutique_name}', boutique?.nom || 'AndyShop');

    return message;
  },

  /**
   * Génère un lien WhatsApp pré-rempli
   * @param {string} phoneNumber - Numéro de téléphone (format international)
   * @param {string} message - Message à pré-remplir
   * @returns {string} URL WhatsApp
   */
  generateWhatsAppLink(phoneNumber, message) {
    // Nettoie le numéro de téléphone
    let cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    // Assure que le numéro commence par +
    if (!cleanPhone.startsWith('+')) {
      // Si c'est un numéro ivoirien sans +, on ajoute +225
      if (cleanPhone.length === 10) {
        cleanPhone = '+225' + cleanPhone;
      }
    }

    // Encode le message pour l'URL
    const encodedMessage = encodeURIComponent(message);

    // Génère le lien wa.me
    const link = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    return link;
  },

  /**
   * Ouvre WhatsApp avec un message pré-rempli
   * @param {string} phoneNumber
   * @param {string} message
   */
  openWhatsApp(phoneNumber, message) {
    const link = this.generateWhatsAppLink(phoneNumber, message);
    window.open(link, '_blank');
  },

  /**
   * Copie un message dans le presse-papier
   * @param {string} message
   * @returns {Promise<boolean>}
   */
  async copyMessage(message) {
    try {
      await Helpers.copyToClipboard(message);
      return true;
    } catch (error) {
      Helpers.log('error', 'Error copying message', error);
      return false;
    }
  },

  /**
   * POINT D'EXTENSION : Envoi via WhatsApp Business API
   *
   * Pour implémenter l'envoi automatique via WhatsApp Business API :
   *
   * async sendMessage(phoneNumber, message) {
   *   const url = 'https://graph.facebook.com/v17.0/{PHONE_NUMBER_ID}/messages';
   *
   *   const response = await fetch(url, {
   *     method: 'POST',
   *     headers: {
   *       'Authorization': `Bearer ${AppConfig.whatsapp.apiKey}`,
   *       'Content-Type': 'application/json'
   *     },
   *     body: JSON.stringify({
   *       messaging_product: 'whatsapp',
   *       to: phoneNumber,
   *       type: 'text',
   *       text: {
   *         body: message
   *       }
   *     })
   *   });
   *
   *   if (!response.ok) {
   *     throw new Error('WhatsApp API error');
   *   }
   *
   *   const data = await response.json();
   *   return data;
   * }
   *
   * Documentation : https://developers.facebook.com/docs/whatsapp/cloud-api/
   */
};
