import { supabase } from './supabase';
import { Category, Brand, Product, Catalogue, Review } from '../types/catalog';
import { 
  mockCategories, 
  mockBrands, 
  mockCatalogues, 
  mockProducts, 
  mockCatalogueProducts, 
  mockReviews 
} from '../data/mockCatalog';

// Browser and Node compatible compliant UUID v4 generator
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Local storage keys for mock persistence
const LOCAL_PRODUCTS_KEY = '2m_cosmetics_products';
const LOCAL_CATEGORIES_KEY = '2m_cosmetics_categories';
const LOCAL_BRANDS_KEY = '2m_cosmetics_brands';

// Local Storage Helper
function getLocalData<T>(key: string, defaultData: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error(`Error parsing localStorage key ${key}`, e);
    return defaultData;
  }
}

function saveLocalData<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Helpers for reading current mock values
const getLocalCategories = () => getLocalData<Category>(LOCAL_CATEGORIES_KEY, mockCategories);
const getLocalBrands = () => getLocalData<Brand>(LOCAL_BRANDS_KEY, mockBrands);
const getLocalProducts = (): Product[] => {
  const prods = getLocalData<Product>(LOCAL_PRODUCTS_KEY, mockProducts);
  return prods.map(p => ({
    ...p,
    active: p.active !== false && p.is_active !== false,
    is_active: p.is_active !== false && p.active !== false
  }));
};

export const catalogService = {
  // 1. Fetch all main categories
  async getCategories(): Promise<Category[]> {
    if (!supabase) {
      return getLocalCategories();
    }
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Supabase categories query failed:", error);
      throw error;
    }
    return data as Category[] || [];
  },

  // 2. Fetch category by slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (!supabase) {
      return getLocalCategories().find(c => c.slug === slug) || null;
    }
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) {
      console.error(`Supabase category slug "${slug}" query failed:`, error);
      throw error;
    }
    return data as Category | null;
  },

  // 3. Fetch all brands
  async getBrands(): Promise<Brand[]> {
    if (!supabase) {
      return getLocalBrands();
    }
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Supabase brands query failed:", error);
      throw error;
    }
    return data as Brand[] || [];
  },

  // 4. Fetch brand by slug
  async getBrandBySlug(slug: string): Promise<Brand | null> {
    if (!supabase) {
      return getLocalBrands().find(b => b.slug === slug) || null;
    }
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) {
      console.error(`Supabase brand slug "${slug}" query failed:`, error);
      throw error;
    }
    return data as Brand | null;
  },

  // 5. Fetch all catalogues
  async getCatalogues(): Promise<Catalogue[]> {
    if (!supabase) {
      return mockCatalogues;
    }
    const { data, error } = await supabase
      .from('catalogues')
      .select('*');
    
    if (error) {
      console.error("Supabase catalogues query failed:", error);
      throw error;
    }
    return data as Catalogue[] || [];
  },

  // 6. Fetch catalogue by slug
  async getCatalogueBySlug(slug: string): Promise<Catalogue | null> {
    if (!supabase) {
      return mockCatalogues.find(c => c.slug === slug) || null;
    }
    const { data, error } = await supabase
      .from('catalogues')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) {
      console.error(`Supabase catalogue slug "${slug}" query failed:`, error);
      throw error;
    }
    return data as Catalogue | null;
  },

  // 7. Core query to get products with complex filtering
  async getProducts(options?: {
    category_id?: string;
    brand_id?: string;
    catalogue_id?: string;
    search?: string;
    includeInactive?: boolean;
  }): Promise<Product[]> {
    
    if (!supabase) {
      let filtered = [...getLocalProducts()];
      
      if (!options?.includeInactive) {
        filtered = filtered.filter(p => p.active !== false && p.is_active !== false);
      }
      if (options?.category_id) {
        filtered = filtered.filter(p => p.category_id === options.category_id);
      }
      if (options?.brand_id) {
        filtered = filtered.filter(p => p.brand_id === options.brand_id);
      }
      if (options?.catalogue_id) {
        const matchedProductIds = mockCatalogueProducts
          .filter(cp => cp.catalogue_id === options.catalogue_id)
          .map(cp => cp.product_id);
        filtered = filtered.filter(p => matchedProductIds.includes(p.id));
      }
      if (options?.search) {
        const query = options.search.toLowerCase().trim();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        );
      }
      
      const localBrands = getLocalBrands();
      const localCategories = getLocalCategories();
      
      return filtered.map(p => ({
        ...p,
        brand: localBrands.find(b => b.id === p.brand_id) || null,
        category: localCategories.find(c => c.id === p.category_id) || null
      }));
    }

    let query = supabase.from('products').select(`
      *,
      brand:brands(*),
      category:categories(*)
    `);

    if (options?.category_id) {
      query = query.eq('category_id', options.category_id);
    }
    if (options?.brand_id) {
      query = query.eq('brand_id', options.brand_id);
    }
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    if (options?.catalogue_id) {
      const { data: catProds, error: joinErr } = await supabase
        .from('catalogue_products')
        .select('product_id')
        .eq('catalogue_id', options.catalogue_id);
      
      if (joinErr) {
        console.error("Supabase catalogue_products query failed:", joinErr);
        throw joinErr;
      }
      
      if (catProds && catProds.length > 0) {
        const productIds = catProds.map(cp => cp.product_id);
        query = query.in('id', productIds);
      } else {
        return [];
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase products query failed:", error);
      throw error;
    }

    let results = data as Product[] || [];

    if (!options?.includeInactive) {
      results = results.filter(p => p.active !== false && p.is_active !== false);
    }

    return results;
  },

  // 8. Fetch individual product details by slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!supabase) {
      const prod = getLocalProducts().find(p => p.slug === slug);
      if (!prod) return null;
      return {
        ...prod,
        brand: getLocalBrands().find(b => b.id === prod.brand_id) || null,
        category: getLocalCategories().find(c => c.id === prod.category_id) || null
      } as Product;
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:categories(*)
      `)
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) {
      console.error(`Supabase product slug "${slug}" query failed:`, error);
      throw error;
    }
    return data as Product | null;
  },

  // 9. Fetch reviews for a specific product
  async getProductReviews(productId: string): Promise<Review[]> {
    if (!supabase) {
      return mockReviews.filter(r => r.product_id === productId);
    }
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Supabase reviews query for product "${productId}" failed:`, error);
      throw error;
    }
    return data as Review[] || [];
  },

  // 10. Fetch products by multiple IDs (optimized for Cart subtotal calculations)
  async getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];
    
    if (!supabase) {
      return getLocalProducts()
        .filter(p => ids.includes(p.id))
        .map(p => ({
          ...p,
          brand: getLocalBrands().find(b => b.id === p.brand_id) || null,
          category: getLocalCategories().find(c => c.id === p.category_id) || null
        }));
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:categories(*)
      `)
      .in('id', ids);

    if (error) {
      console.error("Supabase products by IDs query failed:", error);
      throw error;
    }
    return data as Product[] || [];
  },

  // === WRITE OPERATIONS FOR ADMIN CONSOLE ===

  // A. Categories CRUD
  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    if (!supabase) {
      const newId = generateUUID();
      const newCategory: Category = { ...category, id: newId };
      const cats = getLocalCategories();
      cats.push(newCategory);
      saveLocalData(LOCAL_CATEGORIES_KEY, cats);
      return newCategory;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase createCategory failed:", error);
      throw error;
    }
    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (!supabase) {
      const cats = getLocalCategories();
      const index = cats.findIndex(c => c.id === id);
      if (index === -1) throw new Error("Category not found");
      cats[index] = { ...cats[index], ...updates };
      saveLocalData(LOCAL_CATEGORIES_KEY, cats);
      return cats[index];
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase updateCategory failed:", error);
      throw error;
    }
    return data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    if (!supabase) {
      const cats = getLocalCategories();
      const filtered = cats.filter(c => c.id !== id);
      saveLocalData(LOCAL_CATEGORIES_KEY, filtered);
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Supabase deleteCategory failed:", error);
      throw error;
    }
  },

  // B. Brands CRUD
  async createBrand(brand: Omit<Brand, 'id'>): Promise<Brand> {
    if (!supabase) {
      const newId = generateUUID();
      const newBrand: Brand = { ...brand, id: newId };
      const brands = getLocalBrands();
      brands.push(newBrand);
      saveLocalData(LOCAL_BRANDS_KEY, brands);
      return newBrand;
    }

    const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase createBrand failed:", error);
      throw error;
    }
    return data as Brand;
  },

  async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand> {
    if (!supabase) {
      const brands = getLocalBrands();
      const index = brands.findIndex(b => b.id === id);
      if (index === -1) throw new Error("Brand not found");
      brands[index] = { ...brands[index], ...updates };
      saveLocalData(LOCAL_BRANDS_KEY, brands);
      return brands[index];
    }

    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase updateBrand failed:", error);
      throw error;
    }
    return data as Brand;
  },

  async deleteBrand(id: string): Promise<void> {
    if (!supabase) {
      const brands = getLocalBrands();
      const filtered = brands.filter(b => b.id !== id);
      saveLocalData(LOCAL_BRANDS_KEY, filtered);
      return;
    }

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Supabase deleteBrand failed:", error);
      throw error;
    }
  },

  // C. Products CRUD
  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    if (!supabase) {
      const newId = generateUUID();
      const newProduct: Product = { 
        ...product, 
        id: newId, 
        active: product.active !== false,
        is_active: product.active !== false 
      };
      const prods = getLocalProducts();
      prods.push(newProduct);
      saveLocalData(LOCAL_PRODUCTS_KEY, prods);
      return newProduct;
    }

    const payload = {
      name: product.name,
      slug: product.slug,
      price: product.price,
      description: product.description,
      ingredients: product.ingredients,
      allergens: product.allergens,
      stock: product.stock,
      brand_id: product.brand_id,
      category_id: product.category_id,
      images: product.images,
      active: product.active !== false,
      is_active: product.active !== false,
      expiration_date: product.expiration_date || null
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase createProduct failed:", error);
      throw error;
    }
    return data as Product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!supabase) {
      const prods = getLocalProducts();
      const index = prods.findIndex(p => p.id === id);
      if (index === -1) throw new Error("Product not found");
      prods[index] = { ...prods[index], ...updates };
      saveLocalData(LOCAL_PRODUCTS_KEY, prods);
      return prods[index];
    }

    const dbUpdates = { ...updates };
    delete dbUpdates.brand;
    delete dbUpdates.category;

    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase updateProduct failed:", error);
      throw error;
    }
    return data as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    if (!supabase) {
      const prods = getLocalProducts();
      const filtered = prods.filter(p => p.id !== id);
      saveLocalData(LOCAL_PRODUCTS_KEY, filtered);
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Supabase deleteProduct failed:", error);
      throw error;
    }
  },

  // D. Image Upload to Supabase Storage
  async uploadImage(file: File, bucket: string = 'product-images'): Promise<string> {
    if (!supabase) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error("Supabase storage upload failed:", error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  }
};
