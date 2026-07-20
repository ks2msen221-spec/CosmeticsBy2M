export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  logo_url: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number; // in FCFA
  description: string;
  ingredients: string | null;
  allergens: string | null;
  stock: number;
  brand_id: string | null;
  category_id: string | null;
  images: string[];
  brand?: Brand | null;
  category?: Category | null;
  active?: boolean;
  is_active?: boolean;
  expiration_date?: string | null;
}

export interface Catalogue {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
