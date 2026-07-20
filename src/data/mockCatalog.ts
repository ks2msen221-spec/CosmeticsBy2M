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
    description: 'Une gamme complète pour purifier, hydrater et régénérer la peau délicate de votre visage.',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: UUID_CAT_SERUMS,
    slug: 'serums-huiles',
    name: 'Sérums et Huiles précieuses',
    description: 'Élixirs hautement concentrés en principes actifs d’origine végétale pour cibler des besoins spécifiques.',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: UUID_CAT_CORPS,
    slug: 'soins-corps',
    name: 'Soins du Corps',
    description: 'Lait hydratant, gommage et baumes nourrissants formulés pour sublimer l’éclat naturel de votre peau.',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600'
  }
];

export const mockBrands: Brand[] = [
  {
    id: UUID_BRAND_BOTANICS,
    slug: 'm-botanics',
    name: 'M Botanics',
    bio: 'Pionnier de la cosmétique naturelle au Sénégal, M Botanics extrait le meilleur des plantes ouest-africaines (Moringa, Baobab, Nébédaye) pour créer des soins purs certifiés biologiques.',
    logo_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: UUID_BRAND_SYLLA,
    slug: 'sylla-dermatology',
    name: 'Sylla Dermatology',
    bio: 'Fondé par le Dr. Sylla, dermatologue renommé à Dakar, ce laboratoire allie rigueur scientifique et actifs dakarois pour traiter les hyperpigmentations et protéger des agressions urbaines.',
    logo_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=150'
  }
];

export const mockCatalogues: Catalogue[] = [
  {
    id: UUID_CAT_NOUVEAUTES,
    slug: 'nouveautes',
    name: 'Nouveautés Exclusives',
    description: 'Les dernières formulations dermatologiques de 2026, validées par nos comités scientifiques et disponibles en édition limitée.'
  },
  {
    id: UUID_CAT_SELECTION,
    slug: 'selection-botanique',
    name: 'Sélection Botanique',
    description: 'Une collection intemporelle de soins formulés à base de plantes locales sacrées d’Afrique de l’Ouest.'
  },
  {
    id: UUID_CAT_PROMO,
    slug: 'promo-ete',
    name: 'Collection Promo Été',
    description: 'Des soins protecteurs solaires et des sérums éclat pour garder une mine rayonnante tout l’été.'
  }
];

export const mockProducts: Product[] = [
  {
    id: UUID_PROD_SERUM_REVITALISANT,
    slug: 'serum-revitalisant-botanique',
    name: 'Sérum Revitalisant au Moringa',
    price: 32000,
    description: 'Ce sérum précieux recharge la peau en antioxydants puissants. Formulé à base d’huile pure de Moringa et d’acide hyaluronique naturel, il atténue les ridules et apporte un coup d’éclat instantané. Sa texture légère pénètre rapidement sans laisser de film gras.',
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
    name: 'Crème Hydratante Éclat Intense au Baobab',
    price: 28500,
    description: 'Soin quotidien ultra-nourrissant pour peaux sèches et fatiguées. Enrichie en huile de graines de baobab et en beurre de karité bio, elle renforce la barrière cutanée, repulpe l’épiderme et illumine les teints ternes sous le soleil dakarois.',
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
    description: 'Une protection solaire absolue à large spectre contre les UVA/UVB et la lumière bleue, spécifiquement étudiée pour prévenir les hyperpigmentations sur peaux mélanodermes. Ne laisse aucune trace blanche, fini mat velouté parfait comme base de maquillage.',
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
    description: 'Gel moussant sans sulfate qui élimine en douceur l’excès de sébum et les impuretés de la pollution urbaine dakaroise. Les extraits de Nébédaye (Moringa) agissent comme un aimant anti-pollution pour purifier la peau en profondeur sans la dessécher.',
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
    name: 'Lait Corps Soyeux au Beurre de Karité & Hibiscus',
    price: 22000,
    description: 'Un lait fondant qui hydrate la peau pendant 24 heures. L’alliance réparatrice du beurre de karité brut de Casamance et l’action tonifiante des fleurs d’Hibiscus offre une peau douce, satinée et délicatement parfumée aux notes fleuries.',
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
    description: 'Un élixir de nuit d’exception pour peaux sensibles et fragilisées. Formulé avec seulement 5 huiles végétales pures pressées à froid, il apaise les irritations, atténue les rougeurs et accélère le renouvellement cellulaire nocturne pour un réveil frais.',
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
