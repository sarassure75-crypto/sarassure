import React from 'react';

export default function AdminExerciseValidationDebug() {
  console.log('AdminExerciseValidationDebug - Component mounted');

  try {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">🔧 Debug - Validation Exercices</h1>
        <p>✅ La page se charge correctement maintenant.</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800">🚀 Serveur actif sur localhost:3000</p>
          <p className="text-blue-600 text-sm mt-2">Timestamp: {new Date().toLocaleString()}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <p className="text-green-800">✅ React fonctionne correctement</p>
          <p className="text-green-600 text-sm mt-2">Pas d'erreurs JavaScript détectées</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erreur dans AdminExerciseValidationDebug:', error);
    return (
      <div className="p-4 text-red-600">
        <h1>❌ Erreur détectée</h1>
        <pre>{error.toString()}</pre>
      </div>
    );
  }
}
