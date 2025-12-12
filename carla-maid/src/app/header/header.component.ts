import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../shared/config/config.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterModule, Routes } from '@angular/router';
import { Direction, Languages } from '../shared/interfaces/languages';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

interface ServiceItem {
  label: string;
  translationKey: string;
  slug: string;
}

interface NavItem {
  label: string;
  icon: string;
  link: string;
  hasDropdown?: boolean;
  services?: ServiceItem[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    TranslateModule,
    MatIconModule,
    CommonModule,
    RouterLink,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.sass'
})

export class HeaderComponent implements OnInit, OnDestroy {
  items: NavItem[] = [];
  private langChangeSubscription?: Subscription;
  isMobileMenuOpen = false;
  isServicesDropdownOpen = false;
  
  // Services list matching the our-services page with individual page links
  services: ServiceItem[] = [
    { label: '', translationKey: 'shared.OfficeCleaningServices', slug: 'office-cleaning' },
    { label: '', translationKey: 'shared.HospitalityStaffinQatar', slug: 'hospitality-staff' },
    { label: '', translationKey: 'shared.DeepCleaningServices', slug: 'deep-cleaning' },
    { label: '', translationKey: 'shared.HomeCleaninginQatar', slug: 'home-cleaning' },
    { label: '', translationKey: 'shared.MaidServices', slug: 'maid-services' },
    { label: '', translationKey: 'shared.EventCleaning', slug: 'event-cleaning' },
    { label: '', translationKey: 'shared.EcoFriendlyCleaning', slug: 'eco-friendly-cleaning' },
    { label: '', translationKey: 'shared.HousekeepingServices', slug: 'housekeeping' },
    { label: '', translationKey: 'shared.CarpetCleaning', slug: 'carpet-cleaning' },
    { label: '', translationKey: 'shared.StaffingForBusinesses', slug: 'staffing-businesses' },
    { label: '', translationKey: 'shared.CustomizedCleaning', slug: 'customized-cleaning' },
    { label: '', translationKey: 'shared.SeasonalCleaningServices', slug: 'seasonal-cleaning' }
  ];

  constructor(private translate: TranslateService, private configService: ConfigService, private router: Router) {}
  
  ngOnInit(): void {
    if (this.configService.isBrowser()) {
      const savedLang = localStorage.getItem('currentLang') || 'en';
    }
    
    // Set initial navigation items
    this.updateNavigationItems();
    
    // Subscribe to language changes
    this.langChangeSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.updateNavigationItems();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Close mobile menu on window resize if screen becomes larger
    if (event.target.innerWidth > 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close mobile menu when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-container') && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  private updateNavigationItems(): void {
    // Update service labels with translations
    this.services = this.services.map(service => ({
      ...service,
      label: this.translate.instant(service.translationKey)
    }));

    this.items = [
      {
        label: this.translate.instant('header.home'),
        icon: 'pi pi-home',
        link: '/'
      },
      {
        label: this.translate.instant('header.ourServices'),
        icon: 'pi pi-star',
        link: '/our-services',
        hasDropdown: true,
        services: this.services
      },
      {
        label: this.translate.instant('shared.aboutUs'),
        icon: 'pi pi-envelope',
        link: '/about-us'
      },
      {
        label: this.translate.instant('header.blog'),
        icon: 'pi pi-envelope',
        link: '/blogs-list'
      },
      {
        label: this.translate.instant('header.bookNow'),
        icon: 'pi pi-envelope',
        link: '/book-now'
      }
    ];
    
    console.log('Navigation items updated:', this.items);
  }

  openServicesDropdown(): void {
    this.isServicesDropdownOpen = true;
  }

  closeServicesDropdown(): void {
    this.isServicesDropdownOpen = false;
  }

  toggleServicesDropdown(): void {
    this.isServicesDropdownOpen = !this.isServicesDropdownOpen;
  }

  // Test method to manually navigate
  navigateToBookNow(): void {
    console.log('Navigating to book-now...');
    this.router.navigate(['/book-now']).then(success => {
      console.log('Navigation successful:', success);
    }).catch(error => {
      console.error('Navigation failed:', error);
    });
  }

  switchLanguage(): void {
   this.configService.toggleLang()
  }

  getLang(): Languages {
    return this.configService.getLang();
  }
  
  direction(): Direction {
    return this.configService.getDirection() as Direction;
  }
}
