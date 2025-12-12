import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Direction } from '../shared/interfaces/languages';
import { ConfigService } from '../shared/config/config.service';
import { Meta, Title } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import { WordPressService } from '../shared/services/word-press.service';
import { SharedService } from '../shared/services/shared.service';
import { SeoService } from '../shared/services/seo.service';
import { PhoneTrackDirective } from '../shared/directives/phone-track.directive';
import { BlogCardComponent } from '../shared/components/blog-card/blog-card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    TranslateModule,
    CarouselModule,
    ButtonModule,
    TagModule,
    RouterLink,
    NgOptimizedImage,
    PhoneTrackDirective,
    BlogCardComponent
  ],
  animations: [
    trigger('openAnimation', [
      state('out', style({
        opacity: 0,
        transform: 'translateY(20%)',
      })),
      state('in', style({
        opacity: 1,
        transform: 'translateY(0)',
      })),
      transition('out => in', [
        animate('1s ease-out')
      ]),
      transition('in => out', [
        animate('1s ease-in')
      ]),
    ]),

    trigger('slideAside', [
      state('out', style({
        opacity: 0,
        transform: 'translateX(20%)',
      })),
      state('in', style({
        opacity: 1,
        transform: 'translateX(0)',
      })),
      transition('out => in', [
        animate('1s ease-out')
      ]),
      transition('in => out', [
        animate('1s ease-in')
      ]),
    ]),

  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.sass'
})
export class LandingComponent implements OnInit {

  private _translate = inject(TranslateService);
  private _configService = inject(ConfigService);
  private _wordPressService = inject(WordPressService);
  protected _sharedService = inject(SharedService);

  private meta = inject(Meta);
  private titleService = inject(Title);
  private seoService = inject(SeoService);

  lang: string = 'en';

  responsiveOptions = [
    {
      breakpoint: '1199px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '991px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '767px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  services: {}[] = []
  blogsPosts: any[] = [];
  latestBlogs: any[] = [];
  isLoadingBlogs: boolean = false;

  isInView = false;

  constructor(private router: Router) { }
  ngOnInit(): void {
    this.services = [
      {
        image: '../../assets/images/our-services/our-services-1.png',
        title: this._translate.instant('services.hospitalityStaffTitle'),
        description: this._translate.instant('services.hospitalityStaffDescription'),
        slug: 'hospitality-staff'
      },
      {
        image: '../../assets/images/our-services/our-services-2.png',
        title: this._translate.instant('services.officeCleaningTitle'),
        description: this._translate.instant('services.officeCleaningDescription'),
        slug: 'office-cleaning'
      },
      {
        image: '../../assets/images/our-services/our-services-3.png',
        title: this._translate.instant('services.homeCleaningTitle'),
        description: this._translate.instant('services.homeCleaningDescription'),
        slug: 'home-cleaning'
      },
      {
        image: '../../assets/images/our-services/our-services-4.png',
        title: this._translate.instant('services.maidServicesTitle'),
        description: this._translate.instant('services.maidServicesDescription'),
        slug: 'maid-services'
      },
      {
        image: '../../assets/images/our-services/our-services-5.png',
        title: this._translate.instant('services.eventCleaningTitle'),
        description: this._translate.instant('services.eventCleaningDescription'),
        slug: 'event-cleaning'
      },
      {
        image: '../../assets/images/our-services/our-services-6.png',
        title: this._translate.instant('services.deepCleaningTitle'),
        description: this._translate.instant('services.deepCleaningDescription'),
        slug: 'deep-cleaning'
      },
      {
        image: '../../assets/images/our-services/our-services-7.png',
        title: this._translate.instant('services.ecoFriendlyCleaningTitle'),
        description: this._translate.instant('services.ecoFriendlyCleaningDescription'),
        slug: 'eco-friendly-cleaning'
      },
      {
        image: '../../assets/images/our-services/our-services-8.png',
        title: this._translate.instant('services.housekeepingTitle'),
        description: this._translate.instant('services.housekeepingDescription'),
        slug: 'housekeeping'
      },
      {
        image: '../../assets/images/our-services/our-services-10.png',
        title: this._translate.instant('services.staffingBusinessesTitle'),
        description: this._translate.instant('services.staffingBusinessesDescription'),
        slug: 'staffing-businesses'
      },
      {
        image: '../../assets/images/our-services/our-services-11.png',
        title: this._translate.instant('services.customizedCleaningTitle'),
        description: this._translate.instant('services.customizedCleaningDescription'),
        slug: 'customized-cleaning'
      },
      {
        image: '../../assets/images/our-services/our-services-12.png',
        title: this._translate.instant('services.seasonalCleaningTitle'),
        description: this._translate.instant('services.seasonalCleaningDescription'),
        slug: 'seasonal-cleaning'
      }
    ];

    // Set comprehensive SEO using SEO service with optimized titles and descriptions
    this.seoService.setPageSeo({
      title: 'Best Cleaning Services in Qatar | Professional Maid & Housekeeping Doha | Carla Maid',
      description: 'Top-rated cleaning services in Qatar! Professional maids, housekeeping, office cleaning & eco-friendly solutions in Doha. Trusted by 1000+ customers. Book online or call +974-71236660. Same-day service available!',
      keywords: 'cleaning services Qatar, maid service Doha, professional cleaners Qatar, home cleaning Doha, office cleaning Qatar, eco-friendly cleaning, housekeeping services Doha, cleaning company Qatar, best cleaning service Doha, maid agency Qatar',
      image: 'https://carlamaid.qa/assets/images/why-us.png',
      url: 'https://carlamaid.qa/',
      type: 'website'
    });

    // Add additional geo tags
    this.meta.addTags([
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Carla Maid Qatar' },
      { name: 'geo.region', content: 'QA' },
      { name: 'geo.placename', content: 'Doha' },
      { name: 'geo.position', content: '25.3865308;51.5274001' },
      {
        property: 'business:contact_data:street_address',
        content: 'Manarat lusail - Floor 25 - office 2501'
      },
      {
        property: 'business:contact_data:locality',
        content: 'Doha'
      },
      {
        property: 'business:contact_data:country',
        content: 'Qatar'
      }
    ]);

    // Add FAQ Schema
    this.addFaqSchema();

    this.lang = this._translate.currentLang;
    
    this._translate.onLangChange.subscribe((event) => {
      this.lang = event.lang;
      this.updateMetaForLanguage(event.lang);
    });

    this.getBlogsPosts();
  }

  private updateMetaForLanguage(lang: string) {
    if (lang === 'ar') {
      this.meta.updateTag({ 
        name: 'description', 
        content: 'كارلا ميد قطر تقدم خدمات تنظيف واستقدام عاملات منزليات احترافية للمنازل والشركات. عمال تنظيف محترفون، حلول صديقة للبيئة، ومواعيد مرنة. احجز خدمة التنظيف في الدوحة اليوم!' 
      });
    } else {
      this.meta.updateTag({ 
        name: 'description', 
        content: 'Carla Maid Qatar offers professional cleaning and maid services for homes and businesses. Expert cleaners, eco-friendly solutions, and flexible scheduling. Book your cleaning service in Doha today!' 
      });
    }
  }

ngAfterViewInit(): void {
  gsap.registerPlugin(ScrollTrigger);
  //   gsap.fromTo(element, {
  //     opacity: 0,
  //     y: -50
  //   }, 
  //   {
  //     ease: "power1.inOut",
  //     duration: 0.8,
  //     opacity: 1,
  //     y: 0,
  //     scrollTrigger: {
  //       // markers: true,
  //       trigger: element,
  //       scrub: true,
  //       start: "top 100%",
  //       end: "top 50%"
  //       // toggleActions: "play none none none"
  //     }
  //   });
  // });

  // gsap.utils.toArray('.left-to-right').forEach((element: any) => {
  //   gsap.fromTo(element, {
  //     opacity: 0,
  //     x: -50
  //   }, 
  //   {
  //     ease: "power1.inOut",
  //     duration: 0.8,
  //     opacity: 1,
  //     x: 0,
      
  //     scrollTrigger: {
  //       trigger: element,
  //       scrub: true,
  //       start: "top 100%",
  //       end: "top 70%",

  //     }
  //   });
  // });

  // gsap.utils.toArray('.fade-in-animation').forEach((element: any) => {
  //   gsap.fromTo(element, {
  //     opacity: 0,
  //     y: -50
  //   }, 
  //   {
  //     ease: "power1.inOut",
  //     duration: 0.8,
  //     opacity: 1,
  //     y: 0,
      
  //     scrollTrigger: {
  //       // markers: true,
  //       trigger: element,
  //       start: "top 100%",
  //       end: "top 40%",
  //     }
  //   });
  // });

  }


  direction(): Direction {
    return this._configService.getDirection() as Direction;
  }

  /**
   * Retrieves posts filtered by multiple category names.
   */
  private addFaqSchema(): void {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What should I expect from a professional cleaning service in Qatar?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Professional cleaning services in Qatar provide expert cleaners, eco-friendly solutions, flexible scheduling, and comprehensive cleaning for homes and businesses. You can expect thorough cleaning, attention to detail, and reliable service."
          }
        },
        {
          "@type": "Question",
          "name": "How often should I schedule cleaning services?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The frequency depends on your needs. We offer daily, weekly, bi-weekly, monthly, and one-time cleaning services. Most customers prefer weekly or bi-weekly services for homes, and daily or weekly for offices."
          }
        },
        {
          "@type": "Question",
          "name": "Are eco-friendly cleaning products effective?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, eco-friendly cleaning products are highly effective. They provide the same level of cleanliness while being safe for your family, pets, and the environment. We use certified eco-friendly products that meet professional cleaning standards."
          }
        },
        {
          "@type": "Question",
          "name": "How can I ensure a cleaning company is reputable?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Look for licensed and insured companies, check customer reviews, verify their experience in Qatar, and ensure they use professional equipment and trained staff. Carla Maid is licensed, insured, and has served 1000+ satisfied customers in Doha."
          }
        },
        {
          "@type": "Question",
          "name": "Can I request specific cleaning tasks?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! We offer customized cleaning services tailored to your specific needs. You can request specific areas, tasks, or cleaning methods. Our flexible approach ensures we meet your exact requirements."
          }
        },
        {
          "@type": "Question",
          "name": "What are the costs of hiring a cleaning company in Qatar?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pricing varies based on service type, frequency, and property size. We offer competitive rates starting from 35 QAR per hour for cleaners. Contact us for a free quote tailored to your specific needs."
          }
        },
        {
          "@type": "Question",
          "name": "Do you provide cleaning materials?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we provide all professional cleaning materials and equipment. Our team comes fully equipped with eco-friendly cleaning products, tools, and supplies needed for comprehensive cleaning services."
          }
        },
        {
          "@type": "Question",
          "name": "How do I book a cleaning service?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can book online through our website, call us at +974-71236660, or email info@carlamaid.qa. We offer instant online booking with flexible scheduling and same-day service availability."
          }
        }
      ]
    };

    this.seoService.addStructuredData(faqSchema);
  }

  getBlogsPosts(): void {
    this.isLoadingBlogs = true;
    const postsPage = 'blogs';
    const categoriesNames = [postsPage, this.lang];

    const params = {
      per_page: 20,
      page: 1
    };

    // Add timeout to prevent hanging requests
    const timeout = setTimeout(() => {
      this.isLoadingBlogs = false;
      if (!this.blogsPosts || this.blogsPosts.length === 0) {
        this.blogsPosts = [];
      }
    }, 10000); // 10 second timeout

    this._wordPressService.getPosts({}).subscribe({
      next: (value: any) => {
        console.log('value', value);
        clearTimeout(timeout);
        this.blogsPosts = value || [];
        // Get the latest 3 blogs
        this.latestBlogs = this.blogsPosts.slice(0, 3);
        this.isLoadingBlogs = false;
      },
      error: (error: any) => {
        clearTimeout(timeout);
        console.error('Error fetching blog posts:', error);
        this.blogsPosts = [];
        this.latestBlogs = [];
        this.isLoadingBlogs = false;
      }
    });
  }

  /**
   * Extracts the first image URL from an HTML string.
   *
   * @param {string} html - The HTML content.
   * @returns {string | null} - The first image URL or null if no image is found.
   */
  getFirstImage(html: string): string | null {
    if (!html || typeof html !== 'string') {
      return "../../assets/images/posts/default.png";
    }
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const img = doc.querySelector("img");
      return img ? img.src : "../../assets/images/posts/default.png";
    } catch (error) {
      console.error('Error parsing HTML for image:', error);
      return "../../assets/images/posts/default.png";
    }
  }

  sendPost(post: any) {
    if (post && post.id) {
      this.router.navigate(['/view-blogs', post.id]);
    } else {
      console.error('Invalid post data:', post);
    }
  }

  navigateToCategory(category: any) {
    if (category && category.slug) {
      // Navigate to blogs page with category filter
      this.router.navigate(['/blogs'], { queryParams: { category: category.slug } });
    } else {
      console.error('Invalid category data:', category);
    }
  }

  makePhoneCall(phoneNumber: string) {
    window.open(`tel:${phoneNumber}`, '_self');
  }

  /**
   * Safely checks if blogsPosts is valid and has the expected structure
   */
  hasValidCategories(): boolean {
    return this.blogsPosts && 
           Array.isArray(this.blogsPosts) && 
           this.blogsPosts.length > 0 &&
           this.blogsPosts.every(category => category && category.name);
  }
}
