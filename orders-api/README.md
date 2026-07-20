# orders-api — Cloudflare Worker 2M Cosmetics Sénégal

Ce répertoire contient le code source de l'API de gestion des commandes de **Maison 2M Cosmetics**, conçue pour être déployée de manière autonome et sécurisée sur **Cloudflare Workers**.

L'endpoint principal est : **`POST /api/orders`** (ou `/orders`).

---

## 🔒 Principes de Sécurité Non Négociables
1. **Zéro Confiance Côté Client** : Le Worker recalcule entièrement le prix de chaque produit depuis la base de données Supabase, garantissant qu'aucune manipulation de prix malveillante par le client ne soit possible.
2. **Bypass des RLS via `service_role`** : Le Worker s'exécute de manière sécurisée en tant qu'administrateur système à l'aide de la clé `service_role` pour pouvoir vérifier les stocks globaux, décrémenter l'inventaire, et créer l'ordre et ses lignes d'articles, tout en étant à l'abri d'interférences externes.
3. **Vérification cryptographique** : Le token d'authentification JWT Supabase (`Authorization: Bearer <token>`) est transmis par le client et validé auprès du serveur d'authentification Supabase avant toute opération.
4. **Validation stricte de propriété** : L'adresse de livraison associée à la commande est vérifiée pour s'assurer qu'elle appartient bien à l'utilisateur authentifié.

---

## 🛠️ Configuration des Variables d'Environnement

Le Worker requiert deux variables d'environnement pour fonctionner :

1. `SUPABASE_URL` : L'URL de votre projet Supabase (ex: `https://xyz.supabase.co`). À configurer dans le fichier `wrangler.toml` sous le bloc `[vars]`.
2. `SUPABASE_SERVICE_ROLE_KEY` : La clé secrète de rôle de service de Supabase. **Attention : Cette clé ne doit JAMAIS être exposée au client ou versionnée dans Git**. Elle doit être enregistrée de manière sécurisée dans Cloudflare.

---

## 🚀 Guide de Déploiement

### 1. Installation des dépendances du Worker
Depuis le dossier `orders-api/`, installez les dépendances :
```bash
npm install
```

### 2. Configurer les Secrets sur Cloudflare
Ajoutez la clé de rôle de service Supabase aux secrets de votre Worker :
```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```
Saisissez ensuite la valeur de la clé `service_role` obtenue sur votre console Supabase.

### 3. Tester en local
Pour exécuter le Worker en local pour tests :
```bash
npm run dev
```

### 4. Déploiement en production
Pour déployer l'API directement sur le réseau mondial de Cloudflare :
```bash
npm run deploy
```

---

## 📝 Format de Requête attendu (`POST /api/orders`)

### En-têtes HTTP requis
```http
Authorization: Bearer <SUPABASE_USER_JWT_TOKEN>
Content-Type: application/json
```

### Corps de la requête (JSON)
```json
{
  "address_id": "8fa3bfd1-4df2-4ce0-9187-b673648eb129",
  "payment_method_code": "wave",
  "items": [
    {
      "product_id": "67f1ad92-1234-4567-89ab-cdef01234567",
      "quantity": 2
    },
    {
      "product_id": "bd76abf8-8888-4444-aaaa-bbbbccccdddd",
      "quantity": 1
    }
  ]
}
```

### Réponse en cas de succès (`201 Created`)
```json
{
  "success": true,
  "order_id": "0dfbc91c-7777-4444-bbbb-ccddeeff1234",
  "status": "awaiting_verification",
  "subtotal": 45000,
  "shipping_fee": 3500,
  "total": 48500
}
```

---

## ❌ Gestion des Erreurs Intégrée

Le Worker intègre un système d'erreur complet retournant un code HTTP adéquat et un message explicite :
- **`401 Unauthorized`** : En cas de token d'authentification manquant, expiré ou invalide.
- **`403 Forbidden`** : Si l'adresse de livraison fournie appartient à un autre utilisateur.
- **`400 Bad Request`** :
  - Moyen de paiement invalide (différent de `cod`, `wave`, ou `om`).
  - Format d'article ou quantités invalides.
  - Soin introuvable ou actuellement désactivé (`active: false`).
  - Stock insuffisant pour l'un des soins demandés.
- **`500 Internal Server Error`** : En cas de défaillance réseau ou de base de données. En cas de rejet au milieu de l'insertion, un mécanisme de rollback automatique supprime l'en-tête de commande pour préserver l'intégrité de vos tables.
