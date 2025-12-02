import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Article } from '../components/LanguageContext';

// Helper to convert Supabase row to App Article type
const mapRowToArticle = (row: any): Article => ({
  id: row.id.toString(), // Convert number ID to string
  category: row.category,
  tag: row.tag || 'UPDATE',
  title: row.title,
  date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  summary: row.meta_desc || '',
  content: row.content || '',
  image_url: row.image_url // Map image URL from DB
});

export const fetchArticles = async (stream: 'market' | 'notice'): Promise<Article[]> => {
  // If Supabase is not configured (e.g. env vars missing), return empty array immediately.
  // This forces the UI to use the static fallback data defined in LanguageContext.
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('stream', stream)
      .order('created_at', { ascending: false });

    if (error) {
      // Log the error message to avoid [object Object]
      console.warn(`Error fetching ${stream} articles:`, error.message);
      return [];
    }

    return (data || []).map(mapRowToArticle);
  } catch (err: any) {
    console.warn("Unexpected error fetching articles:", err.message || err);
    return [];
  }
};

export const fetchArticleById = async (id: string): Promise<Article | null> => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    // Try to fetch from Supabase assuming ID is numeric
    const numericId = parseInt(id);
    if (isNaN(numericId)) return null;

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', numericId)
      .single();

    if (error) return null;

    return mapRowToArticle(data);
  } catch (err) {
    return null;
  }
};