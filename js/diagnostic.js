/**
 * Script de diagnostic - AndyShop
 * Affiche l'état de la configuration au chargement
 */

(function() {
  console.log('============================================');
  console.log('🔍 DIAGNOSTIC ANDYSHOP');
  console.log('============================================');

  // Environnement
  console.log('\n📍 Environnement:');
  console.log('- Hostname:', window.location.hostname);
  console.log('- Protocol:', window.location.protocol);
  console.log('- URL:', window.location.href);

  // Variables window
  console.log('\n🔑 Variables window:');
  console.log('- VITE_AIRTABLE_API_KEY:', window.VITE_AIRTABLE_API_KEY ?
    window.VITE_AIRTABLE_API_KEY.substring(0, 15) + '...' : 'NON DÉFINI');
  console.log('- VITE_AIRTABLE_BASE_ID:', window.VITE_AIRTABLE_BASE_ID || 'NON DÉFINI');

  // AppConfig
  console.log('\n⚙️ AppConfig:');
  if (typeof AppConfig === 'undefined' || !window.AppConfig) {
    console.error('❌ AppConfig NON DÉFINI !');
  } else {
    console.log('✅ AppConfig défini');
    console.log('- API Key:', window.AppConfig?.airtable?.apiKey ?
      window.AppConfig.airtable.apiKey.substring(0, 15) + '...' : 'NON DÉFINI');
    console.log('- Base ID:', window.AppConfig?.airtable?.baseId || 'NON DÉFINI');
    console.log('- Tables:', Object.keys(window.AppConfig?.airtable?.tables || {}));
  }

  // AirtableService
  console.log('\n🔌 AirtableService:');
  if (typeof AirtableService === 'undefined' || !window.AirtableService) {
    console.error('❌ AirtableService NON DÉFINI !');
  } else {
    console.log('✅ AirtableService défini');
    try {
      const baseUrl = window.AirtableService.baseUrl;
      console.log('- Base URL:', baseUrl);
    } catch (e) {
      console.error('❌ Erreur lors de l\'accès à baseUrl:', e.message);
    }
  }

  console.log('\n============================================');
  console.log('Fin du diagnostic');
  console.log('============================================\n');
})();
