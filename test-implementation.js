#!/usr/bin/env node

/**
 * Test Script - Vérifier que tous les composants sont chargés
 * 
 * Exécutez ce test pour vérifier que les nouveaux composants
 * sont correctement implémentés et aucun import ne manque.
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  if (exists) {
    const stats = fs.statSync(fullPath);
    log(`✓ ${description}`, 'green');
    log(`  Taille: ${stats.size} bytes`, 'cyan');
  } else {
    log(`✗ ${description} - FICHIER MANQUANT`, 'red');
  }
  return exists;
}

function checkContent(filePath, searchString, description) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    log(`✗ ${description} - Fichier non trouvé`, 'red');
    return false;
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  const found = content.includes(searchString);
  if (found) {
    log(`✓ ${description}`, 'green');
  } else {
    log(`✗ ${description} - Contenu non trouvé`, 'red');
  }
  return found;
}

console.clear();
log('═══════════════════════════════════════════════════════════════', 'cyan');
log('         TEST D\'IMPLÉMENTATION - GESTES TACTILES', 'cyan');
log('═══════════════════════════════════════════════════════════════', 'cyan');
log('');

let allPassed = true;

log('📁 Vérification des fichiers créés...', 'yellow');
log('');

allPassed &= checkFile('src/components/exercise/InputAnimator.jsx', 'InputAnimator');
allPassed &= checkFile('src/components/admin/SwipeDragZoneEditor.jsx', 'SwipeDragZoneEditor');
allPassed &= checkFile('src/components/admin/InputZoneEditor.jsx', 'InputZoneEditor');
allPassed &= checkFile('migrations_add_zone_columns.sql', 'Migration SQL');

log('');
log('📝 Vérification des imports...', 'yellow');
log('');

allPassed &= checkContent(
  'src/components/admin/AdminStepForm.jsx',
  'SwipeDragZoneEditor',
  'AdminStepForm importe SwipeDragZoneEditor'
);

allPassed &= checkContent(
  'src/components/admin/AdminStepForm.jsx',
  'InputZoneEditor',
  'AdminStepForm importe InputZoneEditor'
);

allPassed &= checkContent(
  'src/pages/ExercisePage.jsx',
  'InputAnimator',
  'ExercisePage importe InputAnimator'
);

allPassed &= checkContent(
  'src/components/exercise/ActionAnimator.jsx',
  'startArea',
  'ActionAnimator utilise startArea'
);

allPassed &= checkContent(
  'src/components/exercise/ActionAnimator.jsx',
  'endArea',
  'ActionAnimator utilise endArea'
);

log('');
log('🗄️  Vérification du schéma DB...', 'yellow');
log('');

allPassed &= checkContent(
  'schema.sql',
  'start_area jsonb',
  'schema.sql contient start_area'
);

allPassed &= checkContent(
  'schema.sql',
  'end_area jsonb',
  'schema.sql contient end_area'
);

log('');
log('📚 Vérification de la documentation...', 'yellow');
log('');

allPassed &= checkFile('GESTURE_ANIMATION_GUIDE.md', 'Guide utilisateur');
allPassed &= checkFile('IMPLEMENTATION_CHECKLIST.md', 'Checklist');
allPassed &= checkFile('IMPLEMENTATION_SUMMARY.md', 'Résumé');

log('');
log('═══════════════════════════════════════════════════════════════', 'cyan');

if (allPassed) {
  log('✅ TOUS LES TESTS RÉUSSIS!', 'green');
  log('', 'green');
  log('Prochaines étapes:', 'green');
  log('1. Exécuter la migration SQL dans Supabase', 'green');
  log('2. Rafraîchir le navigateur (F5)', 'green');
  log('3. Tester dans l\'admin et sur les exercices', 'green');
} else {
  log('❌ CERTAINS TESTS ONT ÉCHOUÉ', 'red');
  log('Vérifiez les fichiers manquants ci-dessus', 'red');
  process.exit(1);
}

log('═══════════════════════════════════════════════════════════════', 'cyan');
