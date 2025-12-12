import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-our-services',
  standalone: true,
  imports: [
    TranslateModule,
    RouterLink
  ],
  templateUrl: './our-services.component.html',
  styleUrl: './our-services.component.sass'
})
export class OurServicesComponent implements OnInit {
  private meta = inject(Meta);
  private title = inject(Title);
  private translate = inject(TranslateService);
  private seoService = inject(SeoService);

  ngOnInit() {
    // Set dynamic meta tags based on current language
    this.setMetaTags();

    // Update meta tags when language changes
    this.translate.onLangChange.subscribe(() => {
      this.setMetaTags();
    });
  }

  private setMetaTags() {
    // Get translations for meta content
    const title = this.translate.instant('meta.services.title');
    const description = this.translate.instant('meta.services.description');
    const keywords = this.translate.instant('meta.services.keywords');

    // Use SEO service for comprehensive SEO setup with optimized content
    const optimizedTitle = this.translate.currentLang === 'ar' 
      ? title 
      : 'Professional Cleaning Services in Qatar | Office, Home & Maid Services Doha | Carla Maid';
    const optimizedDescription = this.translate.currentLang === 'ar'
      ? description
      : 'Discover 12+ professional cleaning services in Qatar. From office cleaning to maid services, deep cleaning to eco-friendly solutions. Expert cleaners, flexible scheduling, competitive rates. Serving Doha & all Qatar. Book now!';
    const optimizedKeywords = this.translate.currentLang === 'ar'
      ? keywords
      : 'cleaning services Qatar, office cleaning Doha, home cleaning Qatar, maid services Doha, deep cleaning Qatar, hospitality staff, event cleaning, housekeeping services Doha, eco-friendly cleaning Qatar';

    this.seoService.setPageSeo({
      title: optimizedTitle,
      description: optimizedDescription,
      keywords: optimizedKeywords,
      image: 'https://carlamaid.qa/assets/images/our-services/our-services-top.png',
      url: 'https://carlamaid.qa/our-services',
      type: 'website'
    });

    // Additional SEO meta tags
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ name: 'author', content: 'Carla Maid Services' });
  }
}
