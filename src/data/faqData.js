import { supabase } from '@/lib/supabaseClient';

export const getFaqData = async () => {
  const { data, error } = await supabase
    .from('faq_items')
    .select('id, question, answer_steps, category, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
  return data;
};

export const fetchFaqById = async (id) => {
  const { data, error } = await supabase
    .from('faq_items')
    .select('id, question, answer_steps, category, created_at')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching FAQ by ID:', error);
    throw error;
  }
  return data;
};

export const createFaq = async (faqData) => {
  const { data, error } = await supabase
    .from('faq_items')
    .insert([faqData])
    .select()
    .single();
  if (error) {
    console.error('Error creating FAQ:', error);
    throw error;
  }
  return data;
};

export const updateFaq = async (id, faqData) => {
  const { data, error } = await supabase
    .from('faq_items')
    .update(faqData)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating FAQ:', error);
    throw error;
  }
  return data;
};

export const deleteFaq = async (id) => {
  const { error } = await supabase
    .from('faq_items')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting FAQ:', error);
    throw error;
  }
  return true;
};

export const addFaqQuestion = async (questionText) => {
  const newQuestion = {
    question: questionText,
    category: "Question Utilisateur",
    answer_steps: [
      {
        instruction: "Cette question a été posée par un formateur. Une réponse sera ajoutée bientôt.",
        image_id: null,
        pictogram_id: null
      }
    ],
  };
  return await createFaq(newQuestion);
};