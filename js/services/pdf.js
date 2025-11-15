/**
 * Service PDF
 * Génération de factures et reçus en PDF
 *
 * POINT D'EXTENSION : Intégration jsPDF ou pdf-lib
 *
 * Pour implémenter la génération PDF :
 * 1. Inclure jsPDF : <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
 * 2. Utiliser le code ci-dessous
 *
 * Pour l'instant, on génère du HTML imprimable stylisé
 */

window.PDFService = {
  /**
   * Génère une facture PDF (ou HTML imprimable)
   * @param {Object} vente
   * @param {Object} client
   * @param {Array} lignes
   * @param {Object} boutique
   * @returns {string} HTML de la facture
   */
  generateFacturePDF(vente, client, lignes, boutique) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture ${vente.reference}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #333; }
    .header { display: flex; justify-content: space-between; border-bottom: 3px solid ${boutique.couleur_principale || '#6366f1'}; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { max-width: 150px; }
    .company-info { text-align: right; }
    .company-name { font-size: 24px; font-weight: bold; color: ${boutique.couleur_principale || '#6366f1'}; }
    .invoice-info { margin-bottom: 30px; }
    .invoice-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
    .client-info { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background-color: ${boutique.couleur_principale || '#6366f1'}; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .total-row { font-weight: bold; font-size: 14px; background-color: #f9fafb; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${boutique.logo_url ? `<img src="${boutique.logo_url}" class="logo" alt="${boutique.nom}">` : ''}
      <div class="company-name">${boutique.nom}</div>
    </div>
    <div class="company-info">
      <div class="invoice-title">FACTURE</div>
      <div>N° ${vente.reference}</div>
      <div>Date : ${Helpers.formatDate(vente.date_vente)}</div>
    </div>
  </div>

  <div class="client-info">
    <strong>Client :</strong><br>
    ${client.nom_complet}<br>
    ${client.telephone ? 'Tél : ' + client.telephone : ''}<br>
    ${client.adresse || ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>Article</th>
        <th>Quantité</th>
        <th>Prix unitaire</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${lignes.map(ligne => `
        <tr>
          <td>${ligne.article_nom}</td>
          <td>${ligne.quantite}</td>
          <td>${Helpers.formatCurrency(ligne.prix_unitaire_negocie)}</td>
          <td>${Helpers.formatCurrency(ligne.total_ligne)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <table>
    <tr class="total-row">
      <td colspan="3" style="text-align: right;">TOTAL</td>
      <td>${Helpers.formatCurrency(vente.montant_total)}</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align: right;">Montant payé</td>
      <td>${Helpers.formatCurrency(vente.montant_paye_initial)}</td>
    </tr>
    <tr class="total-row" style="background-color: ${vente.montant_restant_du > 0 ? '#fee2e2' : '#d1fae5'};">
      <td colspan="3" style="text-align: right;">RESTE DÛ</td>
      <td>${Helpers.formatCurrency(vente.montant_restant_du)}</td>
    </tr>
  </table>

  <div class="footer">
    ${boutique.texte_legal || 'Merci pour votre confiance !'}
  </div>
</body>
</html>
    `;

    return html;
  },

  /**
   * Génère un reçu PDF
   */
  generateRecuPDF(paiement, client, allocations, boutique) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reçu ${paiement.reference}</title>
  <style>
    @page { size: A5; margin: 15mm; }
    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #333; }
    .header { text-align: center; border-bottom: 2px solid ${boutique.couleur_principale || '#6366f1'}; padding-bottom: 15px; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: bold; color: ${boutique.couleur_principale || '#6366f1'}; }
    .info-block { margin-bottom: 20px; background-color: #f9fafb; padding: 15px; border-radius: 8px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .label { font-weight: bold; }
    .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">REÇU DE PAIEMENT</div>
    <div>${boutique.nom}</div>
  </div>

  <div class="info-block">
    <div class="info-row"><span class="label">Reçu N° :</span><span>${paiement.reference}</span></div>
    <div class="info-row"><span class="label">Date :</span><span>${Helpers.formatDate(paiement.date_paiement)}</span></div>
    <div class="info-row"><span class="label">Client :</span><span>${client.nom_complet}</span></div>
    <div class="info-row"><span class="label">Mode :</span><span>${paiement.mode_paiement}</span></div>
  </div>

  <div class="info-block" style="background-color: #d1fae5;">
    <div class="info-row"><span class="label">Montant reçu :</span><span style="font-size: 18px; font-weight: bold;">${Helpers.formatCurrency(paiement.montant)}</span></div>
  </div>

  ${allocations.length > 0 ? `
  <div>
    <strong>Dettes impactées :</strong>
    ${allocations.map(alloc => `<div>• ${alloc.dette_reference} : ${Helpers.formatCurrency(alloc.montant_alloue)}</div>`).join('')}
  </div>
  ` : ''}

  <div class="footer">
    ${boutique.texte_legal || 'Merci pour votre confiance !'}
  </div>
</body>
</html>
    `;

    return html;
  },

  /**
   * Ouvre le HTML dans une nouvelle fenêtre pour impression
   */
  printDocument(html) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  },

  /**
   * Télécharge le HTML en tant que PDF (nécessite une librairie)
   * PLACEHOLDER pour future implémentation avec jsPDF
   */
  async downloadPDF(html, filename) {
    /*
     * Exemple avec jsPDF + html2canvas :
     *
     * const { jsPDF } = window.jspdf;
     * const doc = new jsPDF();
     *
     * // Créer un élément temporaire avec le HTML
     * const tempDiv = document.createElement('div');
     * tempDiv.innerHTML = html;
     * document.body.appendChild(tempDiv);
     *
     * // Convertir en canvas puis en PDF
     * const canvas = await html2canvas(tempDiv);
     * const imgData = canvas.toDataURL('image/png');
     *
     * doc.addImage(imgData, 'PNG', 10, 10);
     * doc.save(filename);
     *
     * document.body.removeChild(tempDiv);
     */

    // Fallback : ouvre pour impression
    this.printDocument(html);
    Helpers.log('warn', 'PDF download not implemented, opening print dialog');
  }
};
