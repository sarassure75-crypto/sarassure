import { createClient } from '@supabase/supabase-js';

    // Read Supabase config from environment (Vite) with fallbacks for local dev
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://vkvreculoijplklylpsz.supabase.co";
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdnJlY3Vsb2lqcGxrbHlscHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTk2NzMsImV4cCI6MjA2NTIzNTY3M30.YZcVOv9Rt_6nm8wvn3xvfRANyhXFCR0x-ivd-Y1i7Ys";

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Expose global client for debug in development (only on localhost)
    try {
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        // expose on localhost, 127.0.0.1 and common local IP used by user
        if (host === 'localhost' || host === '127.0.0.1' || host === '192.168.1.152') {
          // attach under a non-conflicting name
          window.supabase = supabase;
        }
      }
    } catch (e) {
      // ignore in non-browser environments
    }

    export const getImageUrl = (filePath) => {
      if (!filePath) {
        console.warn('getImageUrl called with empty filePath');
        return null;
      }
      try {
        // Normalize filePath: remove leading "public/" if present (bucket path already includes 'public'),
        // and encode path segments to avoid invalid characters (spaces, apostrophes, etc.).
        let normalized = String(filePath || '');
        if (normalized.startsWith('public/')) normalized = normalized.slice('public/'.length);
        // encode each segment separately to preserve slashes
        normalized = normalized.split('/').map(seg => encodeURIComponent(seg)).join('/');
        const { data } = supabase.storage.from('images').getPublicUrl(normalized);
        // The publicUrl property is on data, not data.publicUrl
        if (data && data.publicUrl) {
          console.log('✅ getImageUrl generated URL:', { filePath, normalized, url: data.publicUrl });
          return data.publicUrl;
        }
        console.warn("⚠️ URL publique non générée pour le chemin:", filePath, "data:", data);
        return null;
      } catch (error) {
        console.error("❌ Error getting public URL:", error.message, "for path:", filePath);
        return null;
      }
    };