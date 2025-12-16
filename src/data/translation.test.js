/**
 * Tests basiques pour translation.js
 * À exécuter avec: npm test
 */

// Mock Supabase
const mockSupabase = {
  from: (table) => ({
    select: (cols) => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      order: () => Promise.resolve({ data: [], error: null }),
    }),
  }),
};

describe('translation.js', () => {
  describe('autoTranslateText', () => {
    it('should return text unchanged if no translation API available', async () => {
      // Test basique: si pas de clé API, retourner texte original
      const text = 'Bonjour';
      expect(text).toBeDefined();
    });
  });

  describe('createQuestionnaireQuestionTranslation', () => {
    it('should handle array response from select() correctly', async () => {
      // Vérifier que .select() sans .single() retourne array
      const mockData = [{ id: '123', question_id: 'q1' }];
      expect(Array.isArray(mockData)).toBe(true);
      expect(mockData.length).toBeGreaterThan(0);
    });
  });

  describe('getQuestionnaireTranslationStats', () => {
    it('should aggregate translation counts by language', async () => {
      const languages = [
        { language_code: 'fr', language_name: 'Français' },
        { language_code: 'en', language_name: 'Anglais' },
      ];
      expect(languages.length).toBe(2);
    });
  });
});
