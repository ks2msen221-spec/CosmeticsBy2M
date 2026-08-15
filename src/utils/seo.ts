import { useEffect } from 'react';

/**
 * Hook to dynamically manage document title and meta description for SEO.
 * @param title Page title (aims for ~50-60 chars including brand suffix)
 * @param description Page description for search engines (~150-160 chars)
 */
export function usePageSEO(title: string, description: string) {
  useEffect(() => {
    // Set document title
    const fullTitle = title.includes('Maison 2M') || title.includes('2M Cosmetics')
      ? title
      : `${title} | Maison 2M Cosmetics Dakar`;
    document.title = fullTitle;

    // Set or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // OpenGraph Title & Description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', fullTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);
  }, [title, description]);
}
