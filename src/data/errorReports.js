import { supabase } from '@/lib/supabaseClient';

export const fetchErrorReports = async () => {
  const { data, error } = await supabase
    .from('error_reports')
    .select('*')
    .order('report_date', { ascending: false });
  if (error) {
    console.error('Error fetching error reports:', error);
    throw error;
  }
  return data;
};

export const createErrorReport = async (reportData) => {
  // Ensure required fields like 'description' are present to satisfy NOT NULL constraint
  const payload = {
    ...reportData,
    description:
      reportData?.description ??
      [reportData?.error_type, reportData?.error_message]
        .filter(Boolean)
        .join(' - '),
  };

  const { data, error } = await supabase
    .from('error_reports')
    .insert([payload])
    .select()
    .single();
  if (error) {
    console.error('Error creating error report:', error);
    throw error;
  }
  return data;
};

export const updateErrorReport = async (id, updates) => {
  const { data, error } = await supabase
    .from('error_reports')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating error report:', error);
    throw error;
  }
  return data;
};

export const deleteErrorReport = async (id) => {
  const { error } = await supabase
    .from('error_reports')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting error report:', error);
    throw error;
  }
  return true;
};