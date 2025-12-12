import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BookingOrder } from '../shared/services/booking.service';

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

  bookingDetails: BookingOrder | null = null;
  orderId: string | null = null;

  ngOnInit(): void {
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

