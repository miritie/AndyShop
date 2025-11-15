#!/bin/bash

# Script de build pour Vercel/Netlify
# Remplace les placeholders dans config-loader.js par les vraies variables d'environnement

echo "🔧 AndyShop - Build Script"
echo "=========================="

# Vérifier que les variables d'environnement sont définies
if [ -z "$VITE_AIRTABLE_API_KEY" ]; then
  echo "⚠️  ATTENTION: VITE_AIRTABLE_API_KEY n'est pas défini"
  echo "L'application ne pourra pas se connecter à Airtable"
fi

if [ -z "$VITE_AIRTABLE_BASE_ID" ]; then
  echo "⚠️  ATTENTION: VITE_AIRTABLE_BASE_ID n'est pas défini"
  echo "L'application ne pourra pas se connecter à Airtable"
fi

# Remplacer les placeholders dans config-loader.js
echo "📝 Remplacement des placeholders..."

sed -i.bak "s|__VITE_AIRTABLE_API_KEY__|${VITE_AIRTABLE_API_KEY}|g" js/config-loader.js
sed -i.bak "s|__VITE_AIRTABLE_BASE_ID__|${VITE_AIRTABLE_BASE_ID}|g" js/config-loader.js

# Supprimer le fichier backup
rm -f js/config-loader.js.bak

echo "✅ Build terminé avec succès!"
echo ""
echo "Variables injectées:"
echo "- AIRTABLE_API_KEY: ${VITE_AIRTABLE_API_KEY:0:15}..."
echo "- AIRTABLE_BASE_ID: $VITE_AIRTABLE_BASE_ID"
