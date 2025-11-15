/**
 * Configuration des Variables d'Environnement - Vercel
 * Ce fichier contient les clés API pour la production
 */

console.log('[env-config.js] Chargement du fichier env-config.js...');

// Ces variables seront utilisées par config-loader.js
window.VITE_AIRTABLE_API_KEY = 'patyCcUpabDv4vXhd.31c66723c3e0ac95c060410702767d1351fd26e335be3e740f4514b8f828c557';
window.VITE_AIRTABLE_BASE_ID = 'appRfeVgdy8HsBm7t';

console.log('[env-config.js] Variables définies:');
console.log('[env-config.js] - API Key:', window.VITE_AIRTABLE_API_KEY.substring(0, 15) + '...');
console.log('[env-config.js] - Base ID:', window.VITE_AIRTABLE_BASE_ID);
