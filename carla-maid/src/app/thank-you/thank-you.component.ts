import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BookingOrder } from '../shared/services/booking.service';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './thank-you.component.html',
  styleUrl: './thank-you.component.sass'
})
export class ThankYouComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private seoService = inject(SeoService);

  bookingDetails: BookingOrder | null = null;
  orderId: string | null = null;

  ngOnInit(): void {
    // Set SEO - noindex for thank you page
    this.seoService.setPageSeo({
      title: 'Thank You | Booking Confirmed | Carla Maid Qatar',
      description: 'Thank you for booking with Carla Maid Qatar. Your cleaning service booking has been confirmed. We will contact you soon.',
      keywords: 'booking confirmed, thank you, Carla Maid booking',
      image: 'https://carlamaid.qa/assets/images/logo.png',
      url: 'https://carlamaid.qa/thank-you',
      type: 'website'
    });

    // Set noindex for thank you page (don't want it indexed)
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    }

    // Get booking details from route state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.bookingDetails = navigation.extras.state['bookingDetails'];
      this.orderId = navigation.extras.state['orderId'];
    }

    // If no state, try to get from query params
    if (!this.bookingDetails) {
      this.route.queryParams.subscribe(params => {
        this.orderId = params['orderId'] || null;
      });
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'QAR'
    }).format(price);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  bookAnother(): void {
    this.router.navigate(['/book-now']);
  }
}

