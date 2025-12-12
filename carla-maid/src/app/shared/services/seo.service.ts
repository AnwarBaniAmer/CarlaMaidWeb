import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);
  private configService = inject(ConfigService);

  private readonly baseUrl = 'https://carlamaid.qa';

  /**
   * Set page title
   */
  setTitle(title: string): void {
    this.title.setTitle(title);
  }

  /**
   * Set meta description
   */
  setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
  }

  /**
   * Set meta keywords
   */
  setKeywords(keywords: string): void {
    this.meta.updateTag({ name: 'keywords', content: keywords });
  }

  /**
   * Set Open Graph tags
   */
  setOpenGraphTags(data: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
  }): void {
    const currentUrl = data.url || this.getCurrentUrl();
    const image = data.image || `${this.baseUrl}/assets/images/logo.png`;

    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: currentUrl });
    this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });
  }

  /**
   * Set Twitter Card tags
   */
  setTwitterCardTags(data: {
    title: string;
    description: string;
    image?: string;
  }): void {
    const image = data.image || `${this.baseUrl}/assets/images/logo.png`;

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  /**
   * Set canonical URL
   */
  setCanonicalUrl(url?: string): void {
    const canonicalUrl = url || this.getCurrentUrl();
    
    // Remove existing canonical link if any
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Add new canonical link
    const link: HTMLLinkElement = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonicalUrl);
    document.head.appendChild(link);
  }

  /**
   * Set hreflang tags for bilingual support
   */
  setHreflangTags(path: string = ''): void {
    // Remove existing hreflang links
    const existingLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingLinks.forEach(link => link.remove());

    // Get current path
    const currentPath = path || this.router.url;
    const cleanPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;

    // English version
    const enLink: HTMLLinkElement = document.createElement('link');
    enLink.setAttribute('rel', 'alternate');
    enLink.setAttribute('hreflang', 'en');
    enLink.setAttribute('href', `${this.baseUrl}${cleanPath}`);
    document.head.appendChild(enLink);

    // Arabic version (assuming /ar/ prefix for Arabic)
    const arPath = cleanPath.startsWith('/ar/') ? cleanPath : `/ar${cleanPath}`;
    const arLink: HTMLLinkElement = document.createElement('link');
    arLink.setAttribute('rel', 'alternate');
    arLink.setAttribute('hreflang', 'ar');
    arLink.setAttribute('href', `${this.baseUrl}${arPath}`);
    document.head.appendChild(arLink);

    // Default (x-default) - English
    const defaultLink: HTMLLinkElement = document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', `${this.baseUrl}${cleanPath}`);
    document.head.appendChild(defaultLink);
  }

  /**
   * Add structured data (JSON-LD)
   */
  addStructuredData(data: object): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.id = 'structured-data-' + Date.now();
    document.head.appendChild(script);
  }

  /**
   * Remove structured data by type
   */
  removeStructuredData(type: string): void {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '{}');
        if (data['@type'] === type) {
          script.remove();
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });
  }

  /**
   * Set comprehensive SEO tags for a page
   */
  setPageSeo(config: {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    structuredData?: object;
  }): void {
    // Set basic meta tags
    this.setTitle(config.title);
    this.setDescription(config.description);
    
    if (config.keywords) {
      this.setKeywords(config.keywords);
    }

    // Set Open Graph
    this.setOpenGraphTags({
      title: config.title,
      description: config.description,
      image: config.image,
      url: config.url,
      type: config.type
    });

    // Set Twitter Card
    this.setTwitterCardTags({
      title: config.title,
      description: config.description,
      image: config.image
    });

    // Set canonical URL
    this.setCanonicalUrl(config.url);

    // Set hreflang tags
    if (config.url) {
      const url = new URL(config.url);
      this.setHreflangTags(url.pathname);
    } else {
      this.setHreflangTags();
    }

    // Add structured data if provided
    if (config.structuredData) {
      this.addStructuredData(config.structuredData);
    }
  }

  /**
   * Get current URL
   */
  private getCurrentUrl(): string {
    if (typeof window !== 'undefined') {
      return `${this.baseUrl}${this.router.url}`;
    }
    return this.baseUrl;
  }
}

