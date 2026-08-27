import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: object;
}

export const useSEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  jsonLd,
}: SEOProps) => {
  useEffect(() => {
    // 1. Set Document Title
    const baseTitle = 'StreetPet — Platform Penyelamatan & Adopsi Hewan';
    document.title = title ? `${title} | StreetPet` : baseTitle;

    // Helper to set meta attribute
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // 2. Set Meta Description
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    // 3. Set Keywords
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // 4. Set Open Graph & Twitter
    if (title) {
      setMetaTag('property', 'og:title', `${title} | StreetPet`);
      setMetaTag('name', 'twitter:title', `${title} | StreetPet`);
    }

    if (image) {
      setMetaTag('property', 'og:image', image);
      setMetaTag('name', 'twitter:image', image);
    }

    if (url) {
      setMetaTag('property', 'og:url', url);
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    setMetaTag('property', 'og:type', type);

    // 5. Dynamic JSON-LD Structured Data
    let scriptTag: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.id = 'dynamic-jsonld';
      scriptTag.innerHTML = JSON.stringify(jsonLd);
      document.head.appendChild(scriptTag);
    }

    return () => {
      // Clean up dynamic jsonld on unmount
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [title, description, keywords, image, url, type, jsonLd]);
};
