import { supabase } from './supabaseClient';
import { Article, MarketCategory, NoticeCategory } from '../components/LanguageContext';

interface SupabaseArticleRow {
  id: number;
  category: string;
  tag: string;
  title: string;
  created_at: string;
  meta_desc: string | null;
  content: string | null;
  stream: 'market' | 'notice';
}

// Helper to convert Supabase row to App Article type
const mapRowToArticle = (row: SupabaseArticleRow): Article => ({
  id: row.id.toString(), // Convert number ID to string
  category: row.category as MarketCategory | NoticeCategory,
  tag: row.tag || 'UPDATE',
  title: row.title,
  date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  summary: row.meta_desc || '',
  content: row.content || ''
});

export const fetchArticles = async (stream: 'market' | 'notice'): Promise<Article[]> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('stream', stream)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${stream} articles:`, error);
      return [];
    }

    // Cast data safely knowing the schema structure or use generic if setup in supabaseClient
    const rows = data as unknown as SupabaseArticleRow[];
    return (rows || []).map(mapRowToArticle);
  } catch (err) {
    console.error("Unexpected error fetching articles:", err);
    return [];
  }
};

export const fetchArticleById = async (id: string): Promise<Article | null> => {
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

    return mapRowToArticle(data as unknown as SupabaseArticleRow);
  } catch (err) {
    return null;
  }
};