import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SeoService } from '../shared/services/seo.service';

interface ServiceFeature {
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

interface ServiceData {
  id: string;
  slug: string;
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
  heroImage: string;
  heroBackground: string;
  icon: string;
  color: string;
  gradient: string;
  features: ServiceFeature[];
  benefitsKeys: string[];
  includedKeys: string[];
}

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.sass'
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
  currentService: ServiceData | null = null;
  private langChangeSubscription?: Subscription;
  
  // Service data with all details
  services: ServiceData[] = [
    {
      id: 'home-cleaning',
      slug: 'home-cleaning',
      titleKey: 'serviceDetail.homeCleaning.title',
      subtitleKey: 'serviceDetail.homeCleaning.subtitle',
      descriptionKey: 'serviceDetail.homeCleaning.description',
      heroImage: 'assets/images/our-services/our-services-3.png',
      heroBackground: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=80',
      icon: '🏠',
      color: '#0188FF',
      gradient: 'linear-gradient(135deg, #0188FF 0%, #0346FF 100%)',
      features: [
        { icon: '✨', titleKey: 'serviceDetail.homeCleaning.feature1.title', descriptionKey: 'serviceDetail.homeCleaning.feature1.desc' },
        { icon: '🧹', titleKey: 'serviceDetail.homeCleaning.feature2.title', descriptionKey: 'serviceDetail.homeCleaning.feature2.desc' },
        { icon: '🛋️', titleKey: 'serviceDetail.homeCleaning.feature3.title', descriptionKey: 'serviceDetail.homeCleaning.feature3.desc' },
        { icon: '🍳', titleKey: 'serviceDetail.homeCleaning.feature4.title', descriptionKey: 'serviceDetail.homeCleaning.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.homeCleaning.benefit1', 'serviceDetail.homeCleaning.benefit2', 'serviceDetail.homeCleaning.benefit3', 'serviceDetail.homeCleaning.benefit4'],
      includedKeys: ['serviceDetail.homeCleaning.included1', 'serviceDetail.homeCleaning.included2', 'serviceDetail.homeCleaning.included3', 'serviceDetail.homeCleaning.included4', 'serviceDetail.homeCleaning.included5']
    },
    {
      id: 'office-cleaning',
      slug: 'office-cleaning',
      titleKey: 'serviceDetail.officeCleaning.title',
      subtitleKey: 'serviceDetail.officeCleaning.subtitle',
      descriptionKey: 'serviceDetail.officeCleaning.description',
      heroImage: 'assets/images/our-services/our-services-2.png',
      heroBackground: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
      icon: '🏢',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      features: [
        { icon: '💼', titleKey: 'serviceDetail.officeCleaning.feature1.title', descriptionKey: 'serviceDetail.officeCleaning.feature1.desc' },
        { icon: '🖥️', titleKey: 'serviceDetail.officeCleaning.feature2.title', descriptionKey: 'serviceDetail.officeCleaning.feature2.desc' },
        { icon: '🚿', titleKey: 'serviceDetail.officeCleaning.feature3.title', descriptionKey: 'serviceDetail.officeCleaning.feature3.desc' },
        { icon: '📅', titleKey: 'serviceDetail.officeCleaning.feature4.title', descriptionKey: 'serviceDetail.officeCleaning.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.officeCleaning.benefit1', 'serviceDetail.officeCleaning.benefit2', 'serviceDetail.officeCleaning.benefit3', 'serviceDetail.officeCleaning.benefit4'],
      includedKeys: ['serviceDetail.officeCleaning.included1', 'serviceDetail.officeCleaning.included2', 'serviceDetail.officeCleaning.included3', 'serviceDetail.officeCleaning.included4', 'serviceDetail.officeCleaning.included5']
    },
    {
      id: 'deep-cleaning',
      slug: 'deep-cleaning',
      titleKey: 'serviceDetail.deepCleaning.title',
      subtitleKey: 'serviceDetail.deepCleaning.subtitle',
      descriptionKey: 'serviceDetail.deepCleaning.description',
      heroImage: 'assets/images/our-services/our-services-6.png',
      heroBackground: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1920&q=80',
      icon: '🧽',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      features: [
        { icon: '🔬', titleKey: 'serviceDetail.deepCleaning.feature1.title', descriptionKey: 'serviceDetail.deepCleaning.feature1.desc' },
        { icon: '🧴', titleKey: 'serviceDetail.deepCleaning.feature2.title', descriptionKey: 'serviceDetail.deepCleaning.feature2.desc' },
        { icon: '💨', titleKey: 'serviceDetail.deepCleaning.feature3.title', descriptionKey: 'serviceDetail.deepCleaning.feature3.desc' },
        { icon: '🏆', titleKey: 'serviceDetail.deepCleaning.feature4.title', descriptionKey: 'serviceDetail.deepCleaning.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.deepCleaning.benefit1', 'serviceDetail.deepCleaning.benefit2', 'serviceDetail.deepCleaning.benefit3', 'serviceDetail.deepCleaning.benefit4'],
      includedKeys: ['serviceDetail.deepCleaning.included1', 'serviceDetail.deepCleaning.included2', 'serviceDetail.deepCleaning.included3', 'serviceDetail.deepCleaning.included4', 'serviceDetail.deepCleaning.included5']
    },
    {
      id: 'hospitality-staff',
      slug: 'hospitality-staff',
      titleKey: 'serviceDetail.hospitalityStaff.title',
      subtitleKey: 'serviceDetail.hospitalityStaff.subtitle',
      descriptionKey: 'serviceDetail.hospitalityStaff.description',
      heroImage: 'assets/images/our-services/our-services-1.png',
      heroBackground: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80',
      icon: '🍽️',
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      features: [
        { icon: '👨‍🍳', titleKey: 'serviceDetail.hospitalityStaff.feature1.title', descriptionKey: 'serviceDetail.hospitalityStaff.feature1.desc' },
        { icon: '🎉', titleKey: 'serviceDetail.hospitalityStaff.feature2.title', descriptionKey: 'serviceDetail.hospitalityStaff.feature2.desc' },
        { icon: '☕', titleKey: 'serviceDetail.hospitalityStaff.feature3.title', descriptionKey: 'serviceDetail.hospitalityStaff.feature3.desc' },
        { icon: '⭐', titleKey: 'serviceDetail.hospitalityStaff.feature4.title', descriptionKey: 'serviceDetail.hospitalityStaff.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.hospitalityStaff.benefit1', 'serviceDetail.hospitalityStaff.benefit2', 'serviceDetail.hospitalityStaff.benefit3', 'serviceDetail.hospitalityStaff.benefit4'],
      includedKeys: ['serviceDetail.hospitalityStaff.included1', 'serviceDetail.hospitalityStaff.included2', 'serviceDetail.hospitalityStaff.included3', 'serviceDetail.hospitalityStaff.included4', 'serviceDetail.hospitalityStaff.included5']
    },
    {
      id: 'maid-services',
      slug: 'maid-services',
      titleKey: 'serviceDetail.maidServices.title',
      subtitleKey: 'serviceDetail.maidServices.subtitle',
      descriptionKey: 'serviceDetail.maidServices.description',
      heroImage: 'assets/images/our-services/our-services-4.png',
      heroBackground: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1920&q=80',
      icon: '👩‍🦰',
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      features: [
        { icon: '🏡', titleKey: 'serviceDetail.maidServices.feature1.title', descriptionKey: 'serviceDetail.maidServices.feature1.desc' },
        { icon: '⏰', titleKey: 'serviceDetail.maidServices.feature2.title', descriptionKey: 'serviceDetail.maidServices.feature2.desc' },
        { icon: '👶', titleKey: 'serviceDetail.maidServices.feature3.title', descriptionKey: 'serviceDetail.maidServices.feature3.desc' },
        { icon: '🧺', titleKey: 'serviceDetail.maidServices.feature4.title', descriptionKey: 'serviceDetail.maidServices.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.maidServices.benefit1', 'serviceDetail.maidServices.benefit2', 'serviceDetail.maidServices.benefit3', 'serviceDetail.maidServices.benefit4'],
      includedKeys: ['serviceDetail.maidServices.included1', 'serviceDetail.maidServices.included2', 'serviceDetail.maidServices.included3', 'serviceDetail.maidServices.included4', 'serviceDetail.maidServices.included5']
    },
    {
      id: 'event-cleaning',
      slug: 'event-cleaning',
      titleKey: 'serviceDetail.eventCleaning.title',
      subtitleKey: 'serviceDetail.eventCleaning.subtitle',
      descriptionKey: 'serviceDetail.eventCleaning.description',
      heroImage: 'assets/images/our-services/our-services-5.png',
      heroBackground: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80',
      icon: '🎊',
      color: '#EF4444',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      features: [
        { icon: '🎈', titleKey: 'serviceDetail.eventCleaning.feature1.title', descriptionKey: 'serviceDetail.eventCleaning.feature1.desc' },
        { icon: '🧹', titleKey: 'serviceDetail.eventCleaning.feature2.title', descriptionKey: 'serviceDetail.eventCleaning.feature2.desc' },
        { icon: '⚡', titleKey: 'serviceDetail.eventCleaning.feature3.title', descriptionKey: 'serviceDetail.eventCleaning.feature3.desc' },
        { icon: '📋', titleKey: 'serviceDetail.eventCleaning.feature4.title', descriptionKey: 'serviceDetail.eventCleaning.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.eventCleaning.benefit1', 'serviceDetail.eventCleaning.benefit2', 'serviceDetail.eventCleaning.benefit3', 'serviceDetail.eventCleaning.benefit4'],
      includedKeys: ['serviceDetail.eventCleaning.included1', 'serviceDetail.eventCleaning.included2', 'serviceDetail.eventCleaning.included3', 'serviceDetail.eventCleaning.included4', 'serviceDetail.eventCleaning.included5']
    },
    {
      id: 'eco-friendly-cleaning',
      slug: 'eco-friendly-cleaning',
      titleKey: 'serviceDetail.ecoFriendly.title',
      subtitleKey: 'serviceDetail.ecoFriendly.subtitle',
      descriptionKey: 'serviceDetail.ecoFriendly.description',
      heroImage: 'assets/images/our-services/our-services-7.png',
      heroBackground: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80',
      icon: '🌿',
      color: '#22C55E',
      gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
      features: [
        { icon: '🌱', titleKey: 'serviceDetail.ecoFriendly.feature1.title', descriptionKey: 'serviceDetail.ecoFriendly.feature1.desc' },
        { icon: '🧪', titleKey: 'serviceDetail.ecoFriendly.feature2.title', descriptionKey: 'serviceDetail.ecoFriendly.feature2.desc' },
        { icon: '♻️', titleKey: 'serviceDetail.ecoFriendly.feature3.title', descriptionKey: 'serviceDetail.ecoFriendly.feature3.desc' },
        { icon: '🐕', titleKey: 'serviceDetail.ecoFriendly.feature4.title', descriptionKey: 'serviceDetail.ecoFriendly.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.ecoFriendly.benefit1', 'serviceDetail.ecoFriendly.benefit2', 'serviceDetail.ecoFriendly.benefit3', 'serviceDetail.ecoFriendly.benefit4'],
      includedKeys: ['serviceDetail.ecoFriendly.included1', 'serviceDetail.ecoFriendly.included2', 'serviceDetail.ecoFriendly.included3', 'serviceDetail.ecoFriendly.included4', 'serviceDetail.ecoFriendly.included5']
    },
    {
      id: 'housekeeping',
      slug: 'housekeeping',
      titleKey: 'serviceDetail.housekeeping.title',
      subtitleKey: 'serviceDetail.housekeeping.subtitle',
      descriptionKey: 'serviceDetail.housekeeping.description',
      heroImage: 'assets/images/our-services/our-services-8.png',
      heroBackground: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1920&q=80',
      icon: '🛏️',
      color: '#6366F1',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      features: [
        { icon: '🏨', titleKey: 'serviceDetail.housekeeping.feature1.title', descriptionKey: 'serviceDetail.housekeeping.feature1.desc' },
        { icon: '🧼', titleKey: 'serviceDetail.housekeeping.feature2.title', descriptionKey: 'serviceDetail.housekeeping.feature2.desc' },
        { icon: '👔', titleKey: 'serviceDetail.housekeeping.feature3.title', descriptionKey: 'serviceDetail.housekeeping.feature3.desc' },
        { icon: '📆', titleKey: 'serviceDetail.housekeeping.feature4.title', descriptionKey: 'serviceDetail.housekeeping.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.housekeeping.benefit1', 'serviceDetail.housekeeping.benefit2', 'serviceDetail.housekeeping.benefit3', 'serviceDetail.housekeeping.benefit4'],
      includedKeys: ['serviceDetail.housekeeping.included1', 'serviceDetail.housekeeping.included2', 'serviceDetail.housekeeping.included3', 'serviceDetail.housekeeping.included4', 'serviceDetail.housekeeping.included5']
    },
    {
      id: 'staffing-businesses',
      slug: 'staffing-businesses',
      titleKey: 'serviceDetail.staffingBusinesses.title',
      subtitleKey: 'serviceDetail.staffingBusinesses.subtitle',
      descriptionKey: 'serviceDetail.staffingBusinesses.description',
      heroImage: 'assets/images/our-services/our-services-10.png',
      heroBackground: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=80',
      icon: '👥',
      color: '#0EA5E9',
      gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
      features: [
        { icon: '🤝', titleKey: 'serviceDetail.staffingBusinesses.feature1.title', descriptionKey: 'serviceDetail.staffingBusinesses.feature1.desc' },
        { icon: '📊', titleKey: 'serviceDetail.staffingBusinesses.feature2.title', descriptionKey: 'serviceDetail.staffingBusinesses.feature2.desc' },
        { icon: '🎓', titleKey: 'serviceDetail.staffingBusinesses.feature3.title', descriptionKey: 'serviceDetail.staffingBusinesses.feature3.desc' },
        { icon: '📝', titleKey: 'serviceDetail.staffingBusinesses.feature4.title', descriptionKey: 'serviceDetail.staffingBusinesses.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.staffingBusinesses.benefit1', 'serviceDetail.staffingBusinesses.benefit2', 'serviceDetail.staffingBusinesses.benefit3', 'serviceDetail.staffingBusinesses.benefit4'],
      includedKeys: ['serviceDetail.staffingBusinesses.included1', 'serviceDetail.staffingBusinesses.included2', 'serviceDetail.staffingBusinesses.included3', 'serviceDetail.staffingBusinesses.included4', 'serviceDetail.staffingBusinesses.included5']
    },
    {
      id: 'customized-cleaning',
      slug: 'customized-cleaning',
      titleKey: 'serviceDetail.customizedCleaning.title',
      subtitleKey: 'serviceDetail.customizedCleaning.subtitle',
      descriptionKey: 'serviceDetail.customizedCleaning.description',
      heroImage: 'assets/images/our-services/our-services-11.png',
      heroBackground: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1920&q=80',
      icon: '⚙️',
      color: '#F97316',
      gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      features: [
        { icon: '🎯', titleKey: 'serviceDetail.customizedCleaning.feature1.title', descriptionKey: 'serviceDetail.customizedCleaning.feature1.desc' },
        { icon: '📋', titleKey: 'serviceDetail.customizedCleaning.feature2.title', descriptionKey: 'serviceDetail.customizedCleaning.feature2.desc' },
        { icon: '🔄', titleKey: 'serviceDetail.customizedCleaning.feature3.title', descriptionKey: 'serviceDetail.customizedCleaning.feature3.desc' },
        { icon: '💡', titleKey: 'serviceDetail.customizedCleaning.feature4.title', descriptionKey: 'serviceDetail.customizedCleaning.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.customizedCleaning.benefit1', 'serviceDetail.customizedCleaning.benefit2', 'serviceDetail.customizedCleaning.benefit3', 'serviceDetail.customizedCleaning.benefit4'],
      includedKeys: ['serviceDetail.customizedCleaning.included1', 'serviceDetail.customizedCleaning.included2', 'serviceDetail.customizedCleaning.included3', 'serviceDetail.customizedCleaning.included4', 'serviceDetail.customizedCleaning.included5']
    },
    {
      id: 'seasonal-cleaning',
      slug: 'seasonal-cleaning',
      titleKey: 'serviceDetail.seasonalCleaning.title',
      subtitleKey: 'serviceDetail.seasonalCleaning.subtitle',
      descriptionKey: 'serviceDetail.seasonalCleaning.description',
      heroImage: 'assets/images/our-services/our-services-12.png',
      heroBackground: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80',
      icon: '🍂',
      color: '#A855F7',
      gradient: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
      features: [
        { icon: '🌸', titleKey: 'serviceDetail.seasonalCleaning.feature1.title', descriptionKey: 'serviceDetail.seasonalCleaning.feature1.desc' },
        { icon: '❄️', titleKey: 'serviceDetail.seasonalCleaning.feature2.title', descriptionKey: 'serviceDetail.seasonalCleaning.feature2.desc' },
        { icon: '🎄', titleKey: 'serviceDetail.seasonalCleaning.feature3.title', descriptionKey: 'serviceDetail.seasonalCleaning.feature3.desc' },
        { icon: '🌞', titleKey: 'serviceDetail.seasonalCleaning.feature4.title', descriptionKey: 'serviceDetail.seasonalCleaning.feature4.desc' }
      ],
      benefitsKeys: ['serviceDetail.seasonalCleaning.benefit1', 'serviceDetail.seasonalCleaning.benefit2', 'serviceDetail.seasonalCleaning.benefit3', 'serviceDetail.seasonalCleaning.benefit4'],
      includedKeys: ['serviceDetail.seasonalCleaning.included1', 'serviceDetail.seasonalCleaning.included2', 'serviceDetail.seasonalCleaning.included3', 'serviceDetail.seasonalCleaning.included4', 'serviceDetail.seasonalCleaning.included5']
    }
  ];

  private seoService = inject(SeoService);

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const serviceSlug = params['slug'];
      this.currentService = this.services.find(s => s.slug === serviceSlug) || null;
      
      if (this.currentService) {
        this.setServiceSeo(this.currentService);
      }
    });

    this.langChangeSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      // Update SEO when language changes
      if (this.currentService) {
        this.setServiceSeo(this.currentService);
      }
    });
  }

  private setServiceSeo(service: ServiceData): void {
    const serviceTitle = this.translate.instant(service.titleKey);
    const serviceDescription = this.translate.instant(service.descriptionKey);
    const serviceName = serviceTitle.replace(' in Qatar', '').replace(' Qatar', '').replace(' Services', '');
    
    // Create optimized title and description
    const optimizedTitle = this.translate.currentLang === 'ar'
      ? `${serviceTitle} | Carla Maid`
      : `Best ${serviceName} in Qatar | Professional ${serviceName} Doha | Carla Maid`;
    
    const optimizedDescription = this.translate.currentLang === 'ar'
      ? serviceDescription
      : `Professional ${serviceName.toLowerCase()} services in Qatar. Expert cleaners, competitive rates, flexible scheduling. Serving Doha and all Qatar. ${serviceDescription} Book your ${serviceName.toLowerCase()} service today!`;
    
    const optimizedKeywords = this.translate.currentLang === 'ar'
      ? `${serviceName.toLowerCase()} Qatar`
      : `${serviceName.toLowerCase()} Qatar, ${serviceName.toLowerCase()} Doha, best ${serviceName.toLowerCase()} Qatar, professional ${serviceName.toLowerCase()}, ${serviceName.toLowerCase()} services Doha, ${serviceName.toLowerCase()} company Qatar`;
    
    this.seoService.setPageSeo({
      title: optimizedTitle,
      description: optimizedDescription,
      keywords: optimizedKeywords,
      image: `https://carlamaid.qa/${service.heroImage}`,
      url: `https://carlamaid.qa/services/${service.slug}`,
      type: 'website',
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": serviceName,
        "provider": {
          "@type": "LocalBusiness",
          "name": "Carla Maid",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Manarat lusail - Floor 25 - office 2501",
            "addressLocality": "Doha",
            "addressCountry": "QA"
          }
        },
        "areaServed": {
          "@type": "City",
          "name": "Doha"
        },
        "description": serviceDescription
      }
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  getOtherServices(): ServiceData[] {
    return this.services.filter(s => s.id !== this.currentService?.id).slice(0, 4);
  }
}
