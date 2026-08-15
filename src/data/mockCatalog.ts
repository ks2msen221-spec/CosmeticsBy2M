import { Category, Brand, Product, Catalogue, Review } from '../types/catalog';

// Valid UUID equivalents of mock categories
export const UUID_CAT_VISAGE = '11111111-1111-4111-a111-111111111111';
export const UUID_CAT_SERUMS = '22222222-2222-4222-b222-222222222222';
export const UUID_CAT_CORPS = '33333333-3333-4333-c333-333333333333';

// Valid UUID equivalents of mock brands
export const UUID_BRAND_BOTANICS = '88888888-8888-4888-b888-888888888888';
export const UUID_BRAND_SYLLA = '99999999-9999-4999-b999-999999999999';

// Valid UUID equivalents of mock catalogues
export const UUID_CAT_NOUVEAUTES = 'dddddddd-dddd-4ddd-addd-dddddddddddd';
export const UUID_CAT_SELECTION = 'eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee';
export const UUID_CAT_PROMO = 'ffffffff-ffff-4fff-afff-ffffffffffff';

// Valid UUID equivalents of mock products
export const UUID_PROD_SERUM_REVITALISANT = 'a0000000-0000-4000-a000-000000000001';
export const UUID_PROD_CREME_ECLAT = 'a0000000-0000-4000-a000-000000000002';
export const UUID_PROD_ECRAN_SPF50 = 'a0000000-0000-4000-a000-000000000003';
export const UUID_PROD_GEL_NETTOYANT = 'a0000000-0000-4000-a000-000000000004';
export const UUID_PROD_LAIT_CORPS = 'a0000000-0000-4000-a000-000000000005';
export const UUID_PROD_HUILE_PRECIEUSE_SYLLA = 'a0000000-0000-4000-a000-000000000006';

export const mockCategories: Category[] = [
  {
    id: UUID_CAT_VISAGE,
    slug: 'soins-visage',
    name: 'Soins du Visage',
    description: 'Des soins formulés simplement pour nettoyer en douceur, hydrater et protéger votre peau au quotidien.',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: UUID_CAT_SERUMS,
    slug: 'serums-huiles',
    name: 'Sérums & Huiles Végétales',
    description: 'Des huiles végétales pressées à froid et des sérums concentrés pour nourrir et soutenir votre peau.',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: UUID_CAT_CORPS,
    slug: 'soins-corps',
    name: 'Soins du Corps',
    description: 'Des formules au beurre de karité et aux extraits végétaux pour une peau souple et hydratée.',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600'
  }
];

export const mockBrands: Brand[] = [
  {
    id: UUID_BRAND_BOTANICS,
    slug: 'm-botanics',
    name: 'M Botanics',
    bio: 'Marque de cosmétiques naturels basée au Sénégal, M Botanics formule des soins simples à base d’ingrédients végétaux d’Afrique de l’Ouest (Moringa, Baobab, Nébédaye) avec une exigence de transparence sur chaque composition.',
    logo_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: UUID_BRAND_SYLLA,
    slug: 'sylla-dermatology',
    name: 'Sylla Dermatology',
    bio: 'Développée à Dakar par le Dr. Sylla, cette gamme associe rigueur scientifique et ingrédients locaux. Des soins formulés pour convenir aux peaux sensibles, aider à prévenir les taches et protéger la barrière cutanée.',
    logo_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=150'
  }
];

export const mockCatalogues: Catalogue[] = [
  {
    id: UUID_CAT_NOUVEAUTES,
    slug: 'nouveautes',
    name: 'Nouveautés & Formulations Récentes',
    description: 'Découvrez nos derniers soins formulés avec des ingrédients d’origine naturelle pour prendre soin de votre peau.'
  },
  {
    id: UUID_CAT_SELECTION,
    slug: 'selection-botanique',
    name: 'Sélection Botanique Essentielle',
    description: 'Une sélection de soins du quotidien formulés à base d’extraits végétaux pour construire une routine claire et adaptée.'
  },
  {
    id: UUID_CAT_PROMO,
    slug: 'promo-ete',
    name: 'Soins Solaires & Hydratation',
    description: 'Nos protections solaires SPF et soins hydratants pour préserver la peau au quotidien sous le climat de Dakar.'
  }
];

export const mockProducts: Product[] = [
  {
    id: UUID_PROD_SERUM_REVITALISANT,
    slug: 'serum-revitalisant-botanique',
    name: 'Sérum Revitalisant au Moringa',
    price: 32000,
    description: 'Formulé à base d’huile pure de Moringa et d’acide hyaluronique d’origine végétale, ce sérum apporte une hydratation ciblée et aide à lisser les ridules. Sa texture fluide pénètre rapidement sans fini gras, pour une peau souple et hydratée au quotidien.',
    ingredients: 'Moringa Oleifera Seed Oil, Aqua, Sodium Hyaluronate, Glycerin, Aloe Barbadensis Leaf Juice, Tocopherol (Vitamin E), Benzyl Alcohol, Dehydroacetic Acid.',
    allergens: 'Aucun allergène majeur. Sans parfum synthétique.',
    stock: 24,
    brand_id: UUID_BRAND_BOTANICS,
    category_id: UUID_CAT_SERUMS,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600'
    ]
  },
  {
    id: UUID_PROD_CREME_ECLAT,
    slug: 'creme-eclat-baobab',
    name: 'Crème Hydratante Apaisante au Baobab',
    price: 28500,
    description: 'Formulée avec de l’huile de graines de baobab et du beurre de karité, cette crème nourrit et aide à protéger la peau de la déshydratation causée par le vent sec et la chaleur. Elle apporte souplesse et confort aux peaux sèches.',
    ingredients: 'Adansonia Digitata (Baobab) Seed Oil, Butyrospermum Parkii (Karité), Aqua, Cetearyl Olivate, Sorbitan Olivate, Pentylene Glycol, Xanthan Gum.',
    allergens: 'Contient des noix (Karité).',
    stock: 18,
    brand_id: UUID_BRAND_BOTANICS,
    category_id: UUID_CAT_VISAGE,
    images: [
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=600'
    ]
  },
  {
    id: UUID_PROD_ECRAN_SPF50,
    slug: 'ecran-total-anti-taches-spf50',
    name: 'Écran Solaire Anti-Taches Haute Protection SPF 50+',
    price: 24500,
    description: 'Ce soin haute protection SPF 50+ protège contre les UVA/UVB et aide à prévenir l’apparition des taches pigmentaires. Formulé pour convenir aux peaux noires et métissées, il s’applique sans laisser de traces blanches ni de sensation grasse. Fini mat adapté pour un usage quotidien.',
    ingredients: 'Aqua, Zinc Oxide, Titanium Dioxide, Niacinamide (Vitamin B3), Ethylhexyl Salicylate, Caprylic/Capric Triglycerine, Glyceryl Stearate, Centella Asiatica Extract.',
    allergens: 'Sans parfum. Sans huiles essentielles.',
    stock: 45,
    brand_id: UUID_BRAND_SYLLA,
    category_id: UUID_CAT_VISAGE,
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600'
    ]
  },
  {
    id: UUID_PROD_GEL_NETTOYANT,
    slug: 'gel-purifiant-nebedaye',
    name: 'Gel Nettoyant Purifiant au Nébédaye',
    price: 18000,
    description: 'Formulé sans sulfate avec des tensioactifs doux, ce gel nettoie le visage en éliminant les impuretés et l’excès de sébum sans sensation de tiraillement. L’extrait de Nébédaye (Moringa) et l’arbre à thé nettoient les pores avec fraîcheur.',
    ingredients: 'Aqua, Cocamidopropyl Betaine, Decyl Glucoside, Moringa Oleifera Leaf Extract, Melaleuca Alternifolia (Tea Tree) Oil, Citric Acid, Potassium Sorbate.',
    allergens: 'Limonene (présent naturellement dans l’huile essentielle d’arbre à thé).',
    stock: 30,
    brand_id: UUID_BRAND_BOTANICS,
    category_id: UUID_CAT_VISAGE,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600'
    ]
  },
  {
    id: UUID_PROD_LAIT_CORPS,
    slug: 'lait-corps-soyeux-karite',
    name: 'Lait Corps Nourrissant au Beurre de Karité & Hibiscus',
    price: 22000,
    description: 'Ce lait corporel associe le beurre de karité brut de Casamance et l’extrait d’Hibiscus pour nourrir la peau et réduire les tiraillements. Texture fluide à pénétration rapide avec un parfum doux et naturel.',
    ingredients: 'Aqua, Butyrospermum Parkii, Hibiscus Sabdariffa Flower Extract, Prunus Amygdalus Dulcis (Amande Douce) Oil, Glycerin, Glyceryl Stearate, Fragrance.',
    allergens: 'Contient des noix (Amande Douce, Karité).',
    stock: 12,
    brand_id: UUID_BRAND_BOTANICS,
    category_id: UUID_CAT_CORPS,
    images: [
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600'
    ]
  },
  {
    id: UUID_PROD_HUILE_PRECIEUSE_SYLLA,
    slug: 'huile-reparatrice-nuit-sylla',
    name: 'Huile Réparatrice de Nuit Haute Tolérance',
    price: 36000,
    description: 'Formulée avec des huiles végétales pures pressées à froid (Jojoba, Rosier Sauvage, Marula), cette huile de nuit aide à nourrir et apaiser la peau pendant le sommeil. Sans parfum, elle convient aux peaux sensibles pour un réveil tout en douceur.',
    ingredients: 'Simmondsia Chinensis (Jojoba) Seed Oil, Rosa Canina (Rosier Sauvage) Fruit Oil, Squalane, Sclerocarya Birrea (Marula) Seed Oil, Tocopherol.',
    allergens: 'Aucun. Sans parfum.',
    stock: 15,
    brand_id: UUID_BRAND_SYLLA,
    category_id: UUID_CAT_SERUMS,
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600'
    ]
  }
];

export const mockCatalogueProducts = [
  { catalogue_id: UUID_CAT_NOUVEAUTES, product_id: UUID_PROD_SERUM_REVITALISANT },
  { catalogue_id: UUID_CAT_NOUVEAUTES, product_id: UUID_PROD_ECRAN_SPF50 },
  { catalogue_id: UUID_CAT_SELECTION, product_id: UUID_PROD_SERUM_REVITALISANT },
  { catalogue_id: UUID_CAT_SELECTION, product_id: UUID_PROD_CREME_ECLAT },
  { catalogue_id: UUID_CAT_SELECTION, product_id: UUID_PROD_GEL_NETTOYANT },
  { catalogue_id: UUID_CAT_SELECTION, product_id: UUID_PROD_LAIT_CORPS },
  { catalogue_id: UUID_CAT_PROMO, product_id: UUID_PROD_ECRAN_SPF50 },
  { catalogue_id: UUID_CAT_PROMO, product_id: UUID_PROD_LAIT_CORPS }
];

export const mockReviews: Review[] = [
  {
    id: 'rev_1',
    product_id: UUID_PROD_SERUM_REVITALISANT,
    user_name: 'Awa Diop',
    rating: 5,
    comment: 'Une pure merveille ! Ma peau est beaucoup plus lumineuse et les petites ridules s’estompent de jour en jour.',
    created_at: '2026-06-15T10:30:00Z'
  },
  {
    id: 'rev_2',
    product_id: UUID_PROD_SERUM_REVITALISANT,
    user_name: 'Mariama Sow',
    rating: 4,
    comment: 'Super sérum, ne colle pas et sent très bon le naturel.',
    created_at: '2026-07-01T14:20:00Z'
  },
  {
    id: 'rev_3',
    product_id: UUID_PROD_ECRAN_SPF50,
    user_name: 'Aminata Ndiaye',
    rating: 5,
    comment: 'Le seul écran solaire à Dakar qui ne me laisse aucun film blanc horrible ! Il est mat, régule bien le sébum et protège parfaitement. Je recommande à 1000%.',
    created_at: '2026-07-10T09:15:00Z'
  },
  {
    id: 'rev_4',
    product_id: UUID_PROD_CREME_ECLAT,
    user_name: 'Khady Gueye',
    rating: 4,
    comment: 'Très hydratant et nourrit bien ma peau sèche. Texture doudou.',
    created_at: '2026-06-20T17:45:00Z'
  }
];
