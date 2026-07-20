export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  status: 'draft' | 'published';
  created_at: string;
  reading_time: string | null; // e.g., "5 min"
  excerpt: string | null; // short description
  category: string | null; // e.g., "Rituels", "Dermatologie"
}
