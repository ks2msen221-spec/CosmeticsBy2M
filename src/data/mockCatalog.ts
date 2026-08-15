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
    description: 'Des rituels sur-mesure pour nettoyer en douceur, hydrater intensément et révéler la lumière naturelle de votre teint au quotidien.',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: UUID_CAT_SERUMS,
    slug: 'serums-huiles',
    name: 'Sérums & Huiles Précieuses',
    description: 'De véritables concentrés botaniques pressés à froid et gorgés d’antioxydants pour nourrir, réparer et sublimer votre peau en profondeur.',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: UUID_CAT_CORPS,
    slug: 'soins-corps',
    name: 'Soins du Corps',
    description: 'Des textures enveloppantes au beurre de karité et fleurs bienfaisantes pour une peau douce, soyeuse et durablement réconfortée.',
    parent_id: null,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600'
  }
];

export const mockBrands: Brand[] = [
  {
    id: UUID_BRAND_BOTANICS,
    slug: 'm-botanics',
    name: 'M Botanics',
    bio: 'Pionnier de la haute cosmétique naturelle au Sénégal, M Botanics sublime les trésors botaniques d’Afrique de l’Ouest (Moringa, Baobab, Nébédaye) à travers des formules pures, douces et certifiées biologiques pour révéler votre éclat originel.',
    logo_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: UUID_BRAND_SYLLA,
    slug: 'sylla-dermatology',
    name: 'Sylla Dermatology',
    bio: 'Conçue par le Dr. Sylla à Dakar, cette maison dermatologique associe la rigueur scientifique aux actifs protecteurs locaux. Des soins ciblés haute tolérance pour apaiser, prévenir les taches pigmentaires et protéger la barrière cutanée des agressions climatiques.',
    logo_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=150'
  }
];

export const mockCatalogues: Catalogue[] = [
  {
    id: UUID_CAT_NOUVEAUTES,
    slug: 'nouveautes',
    name: 'Nouveautés & Éditions Rares',
    description: 'Découvrez nos toutes dernières pépites formulatoires : des soins innovants et sensoriels fraîchement arrivés pour choyer votre peau.'
  },
  {
    id: UUID_CAT_SELECTION,
    slug: 'selection-botanique',
    name: 'Sélection Botanique Essentielle',
    description: 'Une sélection de soins incontournables enrichis aux extraits sacrés du terroir ouest-africain, pour bâtir une routine quotidienne bienfaisante.'
  },
  {
    id: UUID_CAT_PROMO,
    slug: 'promo-ete',
    name: 'Rituels Solaires & Éclat d’Été',
    description: 'Nos indispensables protecteurs SPF et sérums réflecteurs de lumière pour préserver un teint frais, uniforme et radieux sous le soleil.'
  }
];

export const mockProducts: Product[] = [
  {
    id: UUID_PROD_SERUM_REVITALISANT,
    slug: 'serum-revitalisant-botanique',
    name: 'Sérum Revitalisant au Moringa',
    price: 32000,
    description: 'Véritable shot d’éclat et de jeunesse, ce sérum précieux infuse votre peau en antioxydants protecteurs. Formulé à base d’huile pure de Moringa et d’acide hyaluronique d’origine végétale, il lisse délicatement les ridules et réveille les teints fatigués. Sa texture soyeuse et aérienne pénètre instantanément sans aucun fini gras, laissant la peau immédiatement rebondie et lumineuse.',
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
    description: 'Une caresse de douceur quotidienne pour nourrir et apaiser les épidermes assoiffés. Enrichie en huile précieuse de graines de baobab et en beurre de karité bio, cette crème onctueuse renforce la barrière cutanée tout en protégeant la peau de la déshydratation et du vent chaud. Votre teint retrouve souplesse, velouté et un éclat chaleureux dès les premières applications.',
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
    description: 'Votre bouclier invisible contre le soleil tropical ! Ce soin haute protection SPF 50+ protège efficacement contre les UVA/UVB et la lumière bleue tout en prévenant l’apparition des taches pigmentaires. Spécialement formulé pour les peaux métissées et noires, il fond instantanément sans laisser aucune trace blanche ni sensation collante. Fini mat poudré idéal seul ou sous votre maquillage.',
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
    description: 'Offrez un grand bol d’air pur à votre visage matin et soir. Formulé sans sulfate, ce gel soyeux se transforme en mousse délicate pour déloger impuretés, excès de sébum et particules de pollution urbaine sans jamais tirailler. L’extrait de Nébédaye (Moringa) clarifie et purifie les pores pour une sensation de fraîcheur nette et vivifiante.',
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
    description: 'Une émulsion veloutée d’une infinie douceur qui enlace votre corps pour 24h d’hydratation continue. L’alliance nourrissante du beurre de karité brut de Casamance et l’action tonifiante des fleurs d’Hibiscus satine le grain de peau, apaise les tiraillements et parfume délicatement de notes florales fraîches et solaires.',
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
    description: 'Un trésor régénérant pour bercer votre peau pendant le sommeil. Formulée avec une synergie d’huiles végétales pures pressées à froid (Jojoba, Rosier Sauvage, Marula), cette huile de nuit répare la barrière cutanée, apaise les rougeurs et favorise le renouvellement cellulaire nocturne. Au réveil, la peau est reposée, douce, souple et remarquablement lumineuse.',
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
