import { BlogPost } from '../types/blog';

export const SEED_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog_1',
    title: "Comprendre le double nettoyage",
    slug: "art-double-nettoyage",
    excerpt: "Pourquoi un nettoyage en deux temps aide à éliminer les résidus gras et aqueux sans agresser la barrière cutanée...",
    cover_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    status: "published",
    category: "Conseils Soins",
    reading_time: "4 min",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    content: `# Comprendre le double nettoyage : les bases d'une peau propre

Le **double nettoyage** est une méthode simple qui repose sur un principe chimique éprouvé : dissoudre d'abord les corps gras, puis nettoyer les impuretés aqueuses.

Voici comment cette étape quotidienne permet de nettoyer la peau en douceur et de préparer l'application de vos soins.

---

## Pourquoi un seul nettoyage ne suffit pas toujours ?

Tout au long de la journée, le visage accumule deux types d'impuretés :

1. **Les impuretés grasses (lipophiles) :** le sébum produit par la peau, le maquillage et les filtres solaires SPF (conçus pour résister à l'eau).
2. **Les impuretés aqueuses (hydrophiles) :** la sueur, la poussière et les cellules mortes.

Une huile végétale ou un baume dissout le gras et les filtres solaires sans frotter. Un nettoyant doux à l'eau vient ensuite éliminer la poussière et les impuretés restantes.

---

## La méthode en 2 étapes recommandée par 2M Cosmetics

### Étape 1 : Le nettoyant huileux (Dissoudre)
Sur peau sèche, appliquez une petite quantité d'huile végétale ou de baume démaquillant. Massez délicatement du bout des doigts sur l'ensemble du visage.

- **Rôle :** L'huile dissout l'excès de sébum, le maquillage et les filtres solaires.
- **Application :** Ajoutez ensuite un peu d'eau tiède pour émulsionner avant de rincer.

### Étape 2 : Le nettoyant aqueux (Nettoyer)
Sur peau humide, appliquez une noisette de gel nettoyant doux sans sulfate. Massez en mouvements circulaires puis rincez à l'eau claire.

- **Rôle :** Il élimine la sueur et la poussière sans décaper la barrière cutanée.

---

## Ce que vous observez après quelques jours

En intégrant cette étape chaque soir :

* **Pores moins obstrués :** Moins d'accumulation de sébum et d'impuretés.
* **Peau nette et confortable :** Pas de sensation de tiraillement après le nettoyage.
* **Meilleure absorption des soins :** Vos sérums et crèmes hydratantes s'appliquent sur une peau propre.
`
  },
  {
    id: 'blog_2',
    title: "L'importance du SPF à Dakar",
    slug: "importance-spf-dakar",
    excerpt: "Pourquoi toutes les peaux ont besoin d'une protection quotidienne contre les UVA et UVB sous le climat dakarois...",
    cover_image: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=800&q=80",
    status: "published",
    category: "Protection Solaire",
    reading_time: "5 min",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    content: `# La protection solaire quotidienne à Dakar : ce qu'il faut savoir

À Dakar et sur toute la côte sénégalaise, l'indice UV reste élevé pendant une grande partie de l'année. Les rayons ultraviolets (UVA et UVB) agissent au quotidien sur la peau, même par temps voilé.

Voici les faits scientifiques sur le rôle de la mélanine et les conseils pour protéger efficacement votre peau.

---

## Le rôle de la mélanine et ses limites

La mélanine absorbe naturellement une fraction des rayons UVB, offrant aux peaux noires et métissées un niveau de protection estimé entre SPF 10 et SPF 15.

Cependant, **cette protection naturelle reste partielle** :

* **Les UVA pénètrent en profondeur :** Représentant la majorité des rayons UV, les UVA atteignent le derme, dégradent les fibres de collagène et favorisent l'apparition des taches pigmentaires.
* **L'hyperpigmentation réactionnelle :** En réponse au soleil, la peau produit de la mélanine de manière ciblée, ce qui accentue les taches d'hyperpigmentation et les marques d'acné.

---

## 3 conseils simples pour protéger sa peau à Dakar

1. **Utilisez un indice SPF 50 large spectre :** Privilégiez une formule qui protège à la fois contre les UVB et les UVA.
2. **Choisissez des textures fluides et sans traces blanches :** Pour un confort au quotidien, optez pour des émulsions légères qui ne laissent pas de film gras.
3. **Appliquez en fin de routine :** Le soin solaire s'applique après votre crème hydratante, avant de sortir ou de vous maquiller. Renouvelez en cas d'exposition prolongée en extérieur.

---

## En résumé

Une protection solaire quotidienne est le geste le plus efficace pour préserver l'élasticité de votre peau et limiter les taches pigmentaires sous le climat de Dakar.
`
  }
];
