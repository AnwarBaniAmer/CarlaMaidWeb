import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatLabel, MatSelectModule } from '@angular/material/select';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { AnalyticsService } from '../shared/services/analytics.service';
import { PaymentService, PaymentRequest, PaymentResponse, PaymentStatus } from '../shared/services/payment.service';
import { BookingService, BookingRequest, BookingResponse } from '../shared/services/booking.service';
import { PaymentDataService } from '../shared/services/payment-data.service';
import { PaymentSuccessPopupComponent } from '../shared/components/payment-success-popup/payment-success-popup.component';
import { SeoService } from '../shared/services/seo.service';

// Constants for pricing and configuration
const PRICING_CONFIG = {
  CLEANER_PRICE_PER_HOUR: 35,
  MATERIALS_PRICE_PER_HOUR: 5,
  DATE_RANGE_DAYS: 30
};

// ✅ SkipCash payment status constants (numeric values)
const SKIPCASH_STATUS = {
  NEW: 0,           // new
  PENDING: 1,       // pending
  PAID: 2,          // paid - triggers booking update
  CANCELLED: 3,     // canceled
  FAILED: 4,        // failed
  REJECTED: 5,      // rejected
  REFUNDED: 6,      // refunded - treated as successful completion
  PENDING_REFUND: 7, // pending refund
  REFUND_FAILED: 8  // refund failed
} as const;

const FORM_TIMEOUT = 9000;

@Component({
  selector: 'app-book-now',
  standalone: true,
  providers: [provideNativeDateAdapter(), DatePipe],
  imports: [
    MatSelectModule,
    TranslateModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterLink,
    MatDatepickerModule,
    PaymentSuccessPopupComponent,
  ],
  templateUrl: './book-now.component.html',
  styleUrl: './book-now.component.sass'
})
export class BookNowComponent implements OnInit {
  // Form and UI state
  bookingForm!: FormGroup;
  price: number = 0;
  sent = false;
  isProcessingPayment = false;
  isSubmitting = false;
  paymentError = '';
  
  // Click prevention
  private lastClickTime = 0;
  private readonly CLICK_DEBOUNCE_MS = 1000; // 1 second debounce
  
  // Payment processing prevention
  private readonly PAYMENT_PROCESSING_KEY = 'payment_processing_in_progress';
  
  // Payment success popup state
  showPaymentSuccessPopup = false;
  showPaymentCancelPopup = false;
  showPaymentFailedPopup = false;
  paymentStatus?: PaymentStatus;
  bookingOrderId?: string;

  // Date configuration
  minDate!: Date;
  maxDate!: Date;

  // ViewChild references
  @ViewChild('addressInput') addressInput!: ElementRef;
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('submitButton') submitButton!: ElementRef;

  // Injected services
  private datePipe = inject(DatePipe);

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private analyticsService: AnalyticsService,
    private paymentService: PaymentService,
    private bookingService: BookingService,
    private paymentDataService: PaymentDataService,
    private seoService: SeoService
  ) {
    this.initializeForm();
    this.initializeDateRange();
    this.setupLanguage();
  }

  ngOnInit(): void {
    // Set SEO
    this.seoService.setPageSeo({
      title: 'Book Cleaning Service Online Qatar | Instant Booking | Same-Day Service | Carla Maid',
      description: 'Book professional cleaning services in Qatar instantly! Home cleaning, office cleaning, maid services. Flexible scheduling, competitive rates, same-day service available. Secure online booking with payment options. Book now!',
      keywords: 'book cleaning service Qatar, online booking Doha, instant cleaning booking, schedule cleaning service Qatar, book maid service online, cleaning service booking Doha',
      image: 'https://carlamaid.qa/assets/images/logo.png',
      url: 'https://carlamaid.qa/book-now',
      type: 'website'
    });

    this.setupFormSubscriptions();
    this.setupRouterEvents();
    this.checkPaymentSuccessFromUrl();
  }

  // ==================== INITIALIZATION METHODS ====================

  private initializeForm(): void {
    this.bookingForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      address: ['', Validators.required],
      arrivalDate: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      cleaners: ['', Validators.required],
      materials: ['', Validators.required],
      hours: ['', Validators.required],
      paymentOption: ['', Validators.required]
    });
  }

  private initializeDateRange(): void {
    const today = new Date();
    this.minDate = today;
    this.maxDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + PRICING_CONFIG.DATE_RANGE_DAYS
    );
  }

  private setupLanguage(): void {
    this.translate.setDefaultLang('en');
  }

  private setupFormSubscriptions(): void {
    this.bookingForm.valueChanges.subscribe(() => this.calculatePrice());
    
    this.bookingForm.get('hours')?.valueChanges.subscribe(() => {
      this.bookingForm.get('arrivalTime')?.setValue('');
    });
  }

  private setupRouterEvents(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0 });
      }
    });
  }

  // ==================== PRICING METHODS ====================

  calculatePrice(): void {
    const formValue = this.bookingForm.value;
    const cleanerCost = formValue.cleaners * PRICING_CONFIG.CLEANER_PRICE_PER_HOUR * formValue.hours;
    const materialsCost = formValue.materials 
      ? formValue.hours * PRICING_CONFIG.MATERIALS_PRICE_PER_HOUR * formValue.cleaners 
      : 0;
    
    this.price = cleanerCost + materialsCost;
  }

  // ==================== FORM SUBMISSION METHODS ====================

  async onSubmit(): Promise<void> {
    // Prevent multi-clicking with debounce
    const now = Date.now();
    if (this.isSubmitting || this.isProcessingPayment) {
      console.log('Form submission already in progress, ignoring click');
      return;
    }
    
    // Debounce rapid clicks
    if (now - this.lastClickTime < this.CLICK_DEBOUNCE_MS) {
      console.log('Click debounced, ignoring rapid clicks');
      return;
    }
    
    this.lastClickTime = now;

    if (this.bookingForm.invalid) {
      return;
    }

    // Set submitting state to prevent multiple clicks
    this.isSubmitting = true;
    this.disableSubmitButton();
    
    try {
      // Additional validation to ensure all required fields have actual values
      const formValue = this.bookingForm.value;
      const requiredFields = ['fullName', 'email', 'phone', 'address', 'arrivalDate', 'arrivalTime', 'cleaners', 'hours'];
      const missingFields = requiredFields.filter(field => !formValue[field] || formValue[field] === '');
      
      if (missingFields.length > 0) {
        console.error('Missing required field values:', missingFields);
        this.setPaymentError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      const paymentOption = this.bookingForm.value.paymentOption;
      
      if (paymentOption === 'pay_now') {
        await this.processPayment();
      } else {
        await this.submitBookingWithoutPayment();
      }
    } finally {
      // Reset submitting state after completion (success or error)
      this.isSubmitting = false;
      this.enableSubmitButton();
    }
  }

  // ==================== PAYMENT PROCESSING METHODS ====================

  private async processPayment(): Promise<void> {
    this.setPaymentProcessingState(true);

    try {
      if (!this.validatePaymentAmount()) {
        return;
      }

      // Call payment creation directly without health check
      this.createPaymentOrder();
    } catch (error) {
      this.handlePaymentError('An unexpected error occurred. Please try again.', error);
    }
  }

  /**
   * Retry payment processing
   */
  retryPayment(): void {
    this.paymentError = '';
    this.onSubmit();
  }

  private validatePaymentAmount(): boolean {
    if (!this.paymentService.validateAmount(this.price)) {
      this.setPaymentError('Invalid payment amount');
      return false;
    }
    return true;
  }

    private createPaymentOrder(): void {
    const paymentOrderId = this.paymentService.generateOrderId();
    const paymentRequest = this.buildPaymentRequest(paymentOrderId);

    console.log('Creating payment order:', { orderId: paymentOrderId, request: paymentRequest });
    this.paymentService.logPaymentAttempt(paymentRequest);

    this.paymentService.createPayment(paymentRequest).subscribe({
      next: (response: any) => {
        console.log('Payment API response received:', response);
        
        if (response.success) {
          this.handleSuccessfulPaymentCreation(paymentOrderId, response);
        } else {
          this.handlePaymentCreationFailure(paymentOrderId, response);
        }
      },
      error: (error) => {
        console.error('Payment API error:', error);
        let errorMessage = 'Payment processing failed. Please try again.';
        
        if (error.status === 0) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.status === 404) {
          errorMessage = 'Payment service not found. Please contact support.';
        }
        
        this.handlePaymentError(errorMessage, error, paymentOrderId);
      }
    });
  }

  private buildPaymentRequest(paymentOrderId: string): PaymentRequest {
    const formValue = this.bookingForm.value;
    
    // Ensure all required fields have values
    if (!formValue.fullName || !formValue.email || !formValue.phone || !formValue.address || 
        !formValue.arrivalDate || !formValue.arrivalTime || !formValue.cleaners || !formValue.hours) {
      throw new Error('All required fields must have values');
    }
    
    // Additional validation to ensure values are meaningful
    if (formValue.fullName.trim() === '' || formValue.email.trim() === '' || 
        formValue.phone.trim() === '' || formValue.address.trim() === '' || 
        formValue.arrivalTime.trim() === '') {
      throw new Error('All required fields must have meaningful values');
    }
    
    // Validate numeric fields
    if (formValue.cleaners <= 0 || formValue.hours <= 0) {
      throw new Error('Cleaners and hours must be greater than 0');
    }
    
    return {
      amount: this.price,
      currency: 'QAR',
      orderId: paymentOrderId,
      customerName: formValue.fullName.trim(),
      customerEmail: formValue.email.trim(),
      customerPhone: formValue.phone.trim(),
      description: `Cleaning Service - ${formValue.cleaners} cleaner(s), ${formValue.hours} hour(s)`,
      address: formValue.address.trim(),
      serviceType: 'Cleaning Service',
      cleaners: formValue.cleaners,
      hours: formValue.hours,
      materials: formValue.materials || false,
      scheduledDate: formValue.arrivalDate,
      scheduledTime: formValue.arrivalTime.trim()
    };
  }

  private handleSuccessfulPaymentCreation(paymentOrderId: string, response: any): void {
    this.trackPaymentInitiation(paymentOrderId);
    this.storePaymentData(paymentOrderId);
    // Persist the orderId locally to be read on success/cancel pages without URL params
    sessionStorage.setItem('paymentOrderId', paymentOrderId);
    this.paymentService.logPaymentResult(paymentOrderId, 'initiated');
    
    // Extract payment URL from the updated API response structure
    const paymentUrl = this.paymentService.extractPaymentUrl(response);
    
    if (paymentUrl) {
      console.log('Redirecting to payment gateway:', paymentUrl);
      // Store the payment URL in session storage as backup
      sessionStorage.setItem('paymentUrl', paymentUrl);
      
      try {
        this.paymentService.redirectToPayment(paymentUrl);
      } catch (redirectError) {
        console.error('Redirect error:', redirectError);
        this.setPaymentError('Failed to redirect to payment gateway. Please try again.');
        this.setPaymentProcessingState(false);
      }
    } else {
      console.error('Payment URL not found in response:', response);
      this.setPaymentError('Payment URL not found. Please try again.');
      // Reset processing state to allow retry
      this.setPaymentProcessingState(false);
    }
  }

  private handlePaymentCreationFailure(paymentOrderId: string, response: any): void {
    const errorMessage = response.error || 'Payment creation failed';
    this.setPaymentError(errorMessage);
    this.paymentService.logPaymentResult(paymentOrderId, 'failed', response.error);
  }

  private trackPaymentInitiation(paymentOrderId: string): void {
    this.analyticsService.trackPaymentInitiation(paymentOrderId, this.price, 'QAR');
  }

  private storePaymentData(paymentOrderId: string): void {
    const bookingData = this.buildBookingData();
    
    // Store in backend for reliable retrieval
    this.paymentDataService.storePaymentData(paymentOrderId, bookingData, this.price).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Payment data stored in backend successfully');
        } else {
          console.error('Failed to store payment data in backend:', response.error);
        }
      },
      error: (error) => {
        console.error('Error storing payment data in backend:', error);
      }
    });
    
    // Also store in sessionStorage as backup
    this.paymentDataService.storePaymentDataInSessionStorage(paymentOrderId, bookingData, this.price);
  }

  // ==================== BOOKING METHODS ====================

  private async submitBookingWithoutPayment(): Promise<void> {
    this.analyticsService.trackFormSubmission('booking_form', 'book-now-form');
    
    // Set processing state for "pay later" option
    this.setPaymentProcessingState(true);
    
    const bookingRequest = this.buildBookingRequest('pay_later');

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (bookingResponse: BookingResponse) => {

        console.log("bookingResponse", bookingResponse);
        
        if (bookingResponse.success) {
          this.handleSuccessfulBooking(bookingResponse);
        } else {
          this.setPaymentError(bookingResponse.error || 'Failed to create booking');
        }
      },
      error: (error) => {
        this.handleBookingError(error);
      }
    });
  }

  private buildBookingRequest(paymentMethod: string): BookingRequest {
    const formValue = this.bookingForm.value;
    return {
      customerName: formValue.fullName,
      customerEmail: formValue.email,
      customerPhone: formValue.phone,
      address: formValue.address,
      serviceType: 'cleaning',
      cleaners: formValue.cleaners,
      hours: formValue.hours,
      materials: formValue.materials,
      total: this.price,
      paymentMethod: paymentMethod,
      scheduledDate: this.formatDate(formValue.arrivalDate),
      scheduledTime: formValue.arrivalTime
    };
  }

  private buildBookingData(): any {
    const formValue = this.bookingForm.value;
    
    // Ensure all required fields have meaningful values
    if (!formValue.fullName || !formValue.email || !formValue.phone || !formValue.address || 
        !formValue.arrivalDate || !formValue.arrivalTime || !formValue.cleaners || !formValue.hours) {
      throw new Error('All required fields must have values');
    }
    
    return {
      customerName: formValue.fullName.trim(),
      customerEmail: formValue.email.trim(),
      customerPhone: formValue.phone.trim(),
      address: formValue.address.trim(),
      cleaners: formValue.cleaners,
      hours: formValue.hours,
      materials: formValue.materials || false,
      scheduledDate: this.formatDate(formValue.arrivalDate),
      scheduledTime: formValue.arrivalTime.trim()
    };
  }

  private handleSuccessfulBooking(bookingResponse?: BookingResponse): void {
    this.trackBookingCompletion();
    
    // Reset processing state after successful booking
    this.setPaymentProcessingState(false);
    
    // Show appropriate success message based on payment option
    if (this.isPayLaterOption()) {
      console.log('Booking created successfully with pay later option');
      
      // Prepare booking details for thank-you page
      const bookingData = this.buildBookingData();
      const bookingRequest = this.buildBookingRequest('pay_later');
      
      // Use booking response data if available, otherwise use form data
      const bookingDetails = bookingResponse?.order || {
        ...bookingRequest,
        total: this.price,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        id: bookingResponse?.orderId || `BOOKING_${Date.now()}`
      };
      
      // Navigate to thank-you page with booking details
      this.router.navigate(['/thank-you'], {
        state: {
          bookingDetails: bookingDetails,
          orderId: bookingResponse?.orderId || bookingDetails.id
        }
      });
    } else {
      // For pay now, keep the existing behavior
      this.sent = true;
      this.resetForm();
      this.scheduleFormReset();
    }
  }

  private trackBookingCompletion(): void {
    this.analyticsService.trackBookingComplete('cleaning_service', this.price);
    this.analyticsService.trackPurchase(`booking_${Date.now()}`, this.price, 'QAR');
  }

  // ==================== GOOGLE FORM SUBMISSION ====================

  submitGoogleForm({ formUrl, formData }: { formUrl: string, formData: FormData }): void {
    this.sent = false;
    
    fetch(formUrl, {
      method: 'POST',
      body: formData,
      mode: 'no-cors',
    })
    .then(() => {
      this.handleSuccessfulGoogleFormSubmission();
    })
    .catch((error) => {
      console.error('Google form submission error:', error);
    });
  }

  private handleSuccessfulGoogleFormSubmission(): void {
    this.sent = true;
    this.resetForm();
    this.trackBookingCompletion();
    this.scheduleFormReset();
  }

  // ==================== UTILITY METHODS ====================

  private formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || new Date().toISOString().split('T')[0];
  }

  private setPaymentProcessingState(isProcessing: boolean): void {
    this.isProcessingPayment = isProcessing;
    this.isSubmitting = isProcessing; // Also set submitting state
    if (!isProcessing) {
      this.paymentError = '';
    }
  }

  private setPaymentError(message: string): void {
    this.paymentError = message;
    this.isProcessingPayment = false;
  }

  private handlePaymentError(message: string, error: any, paymentOrderId?: string): void {
    console.error('Payment error:', { message, error, paymentOrderId });
    
    // Log additional error details for debugging
    if (error?.error) {
      console.error('Error details:', error.error);
    }
    if (error?.message) {
      console.error('Error message:', error.message);
    }
    if (error?.status) {
      console.error('Error status:', error.status);
    }
    
    this.setPaymentError(message);
    if (paymentOrderId) {
      this.paymentService.logPaymentResult(paymentOrderId, 'error', 'Payment processing failed');
      // Track payment failure for marketing optimization
      this.analyticsService.trackPaymentFailure(paymentOrderId, 'error');
    }
  }

  private handleBookingError(error: any): void {
    console.error('Booking creation error:', error);
    this.setPaymentError('Failed to create booking. Please try again.');
    
    // Reset processing state after booking error
    this.setPaymentProcessingState(false);
  }

  private scheduleFormReset(): void {
    setTimeout(() => {
      this.sent = false;
    }, FORM_TIMEOUT);
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Disable submit button to prevent multiple submissions
   */
  private disableSubmitButton(): void {
    if (this.submitButton?.nativeElement) {
      this.submitButton.nativeElement.disabled = true;
    }
  }

  /**
   * Enable submit button after submission completes
   */
  private enableSubmitButton(): void {
    if (this.submitButton?.nativeElement) {
      this.submitButton.nativeElement.disabled = false;
    }
  }

  /**
   * Check if payment is already being processed to prevent double processing
   */
  private isPaymentAlreadyBeingProcessed(orderId: string): boolean {
    const processingData = sessionStorage.getItem(this.PAYMENT_PROCESSING_KEY);
    if (!processingData) return false;
    
    try {
      const data = JSON.parse(processingData);
      const now = Date.now();
      
      // Check if this specific order is being processed and is within timeout period
      if (data.orderId === orderId && (now - data.timestamp) < 30000) { // 30 seconds timeout
        return true;
      }
      
      // Clean up expired data
      if ((now - data.timestamp) >= 30000) {
        sessionStorage.removeItem(this.PAYMENT_PROCESSING_KEY);
      }
      
      return false;
    } catch (error) {
      console.error('Error parsing payment processing data:', error);
      sessionStorage.removeItem(this.PAYMENT_PROCESSING_KEY);
      return false;
    }
  }

  /**
   * Mark payment as being processed
   */
  private markPaymentAsBeingProcessed(orderId: string): void {
    const processingData = {
      orderId: orderId,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(this.PAYMENT_PROCESSING_KEY, JSON.stringify(processingData));
  }

  /**
   * Clear payment processing flag after completion
   */
  private clearPaymentProcessingFlag(): void {
    sessionStorage.removeItem(this.PAYMENT_PROCESSING_KEY);
  }

  /**
   * Get current payment option from form
   */
  getCurrentPaymentOption(): string {
    return this.bookingForm.get('paymentOption')?.value || '';
  }

  /**
   * Check if current payment option is "pay now"
   */
  isPayNowOption(): boolean {
    return this.getCurrentPaymentOption() === 'pay_now';
  }

  /**
   * Check if current payment option is "pay later"
   */
  isPayLaterOption(): boolean {
    return this.getCurrentPaymentOption() === 'pay_later';
  }

  /**
   * Remove URL parameters after successful payment processing
   */
  private removeUrlParameters(): void {
    try {
      // Get current URL without query parameters
      const url = new URL(window.location.href);
      const cleanUrl = url.origin + url.pathname;
      
      // Replace current URL without query parameters
      window.history.replaceState({}, document.title, cleanUrl);
      
      console.log('URL parameters removed after successful payment processing');
    } catch (error) {
      console.error('Error removing URL parameters:', error);
    }
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
  }

  resetForm(): void {
    this.bookingForm.reset();
    this.paymentError = '';
    this.isProcessingPayment = false;
    this.isSubmitting = false;
  }

  openDatePicker(picker: any): void {
    picker.open();
  }

  // ==================== PAYMENT SUCCESS POPUP METHODS ====================

  /**
   * Extract and validate SkipCash return URL parameters
   * @returns Object with validated parameters
   */
  private extractSkipCashReturnParams(): {
    orderId: string | null;
    status: string | null;
    paymentId: string | null;
    transactionId: string | null;
    amount: string | null;
    currency: string | null;
  } {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      orderId: urlParams.get('order_id'),
      status: urlParams.get('statusId'),
      paymentId: urlParams.get('paymentId'),
      transactionId: urlParams.get('transId'),
      amount: urlParams.get('amount'),
      currency: urlParams.get('currency')
    };
  }

  private checkPaymentSuccessFromUrl(): void {
    // ✅ Extract SkipCash return URL parameters using helper method
    const params = this.extractSkipCashReturnParams();
    const { orderId, status, transactionId, amount } = params;
    
    console.log('SkipCash return URL parameters received:', params);
    
    // ✅ Check if this is a SkipCash return callback (numeric status)
    if (orderId && status && (
      parseInt(status) === SKIPCASH_STATUS.PAID && transactionId && orderId
    )) {
      
      // Check if payment is already being processed to prevent double processing
      if (this.isPaymentAlreadyBeingProcessed(orderId)) {
        console.log('Payment already being processed for orderId:', orderId);
        return;
      }
      
      // Mark payment as being processed
      this.markPaymentAsBeingProcessed(orderId);
      
      const bookingInfo = localStorage.getItem('bookingInfo');
      const paymentInfo = {
        orderId: orderId,
        transactionId: transactionId,
        status: status,
        amount: amount,
        bookingInfo: bookingInfo
      }
      this.saveBookingWithPayment(paymentInfo);
    }
  }

  saveBookingWithPayment(paymentInfo: any) {
    this.paymentService.savePayment(paymentInfo).subscribe({
      next: (response) => {
        console.log('Booking saved with payment:', response);
        // Clear payment processing flag after successful completion
        this.clearPaymentProcessingFlag();
        // Remove URL parameters after successful processing
        this.removeUrlParameters();
      },
      error: (error) => {
        console.error('Error saving booking with payment:', error);
        // Clear payment processing flag on error as well
        this.clearPaymentProcessingFlag();
      }
    });
  }

  private createBookingWithPayment(paymentStatus: PaymentStatus): void {
    const paymentOrderId = paymentStatus.orderId;

    if (paymentOrderId) {
      // Try to get payment data from multiple sources
      this.paymentDataService.getPaymentDataFromMultipleSources(paymentOrderId).subscribe({
        next: (paymentDataResponse) => {
          if (paymentDataResponse.success && paymentDataResponse.data) {
            const bookingInfo = paymentDataResponse.data.bookingData;
            const paymentAmount = paymentDataResponse.data.paymentAmount;
            
            // Update session storage with payment amount for booking service
            sessionStorage.setItem('paymentAmount', paymentAmount.toString());
            
            this.bookingService.createBookingWithPayment(
              bookingInfo, 
              paymentOrderId, 
              paymentStatus.status
            ).subscribe({
              next: (response) => {
                if (response.success && response.orderId) {
                  this.bookingOrderId = response.orderId;
                  
                  // Track booking completion with payment for marketing analytics
                  this.analyticsService.trackBookingWithPayment(
                    paymentOrderId,
                    response.orderId,
                    paymentAmount,
                    'QAR'
                  );
                  
                  // Clean up payment data after successful booking creation
                  this.paymentDataService.cleanupPaymentData(paymentOrderId).subscribe({
                    next: (cleanupResponse) => {
                      if (cleanupResponse.success) {
                        console.log('Payment data cleaned up successfully');
                      } else {
                        console.error('Failed to clean up payment data:', cleanupResponse.error);
                      }
                    },
                    error: (cleanupError) => {
                      console.error('Error cleaning up payment data:', cleanupError);
                    }
                  });
                  
                  // Also clear session storage
                  this.paymentDataService.clearPaymentDataFromSessionStorage();
                  
                  console.log('Booking created successfully with payment:', response.orderId);
                  
                  // Show success popup
                  this.showPaymentSuccess(paymentStatus, response.orderId);
                } else {
                  console.error('Failed to create booking with payment:', response.error);
                }
              },
              error: (error) => {
                console.error('Error creating booking with payment:', error);
              }
            });
          } else {
            console.error('Failed to retrieve payment data:', paymentDataResponse.error);
            // Show error message to user
            this.setPaymentError('Failed to retrieve booking data. Please contact support.');
          }
        },
        error: (error) => {
          console.error('Error retrieving payment data:', error);
          // Show error message to user
          this.setPaymentError('Failed to retrieve booking data. Please contact support.');
        }
      });
    } else {
      console.error('Missing payment order ID');
      this.setPaymentError('Missing payment information. Please contact support.');
    }
  }

  showPaymentSuccess(paymentStatus: PaymentStatus, bookingOrderId?: string): void {
    this.paymentStatus = paymentStatus;
    this.bookingOrderId = bookingOrderId;
    this.showPaymentSuccessPopup = true;
  }

  closePaymentSuccessPopup(): void {
    this.showPaymentSuccessPopup = false;
    this.paymentStatus = undefined;
    this.bookingOrderId = undefined;
  }

  // ==================== PAYMENT CANCEL POPUP METHODS ====================

  private checkPaymentCancelFromUrl(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentCancel = urlParams.get('payment_cancel');
    const orderId = urlParams.get('order_id');
        
    if (paymentCancel === 'true' && orderId) {
      // Show popup immediately with basic info
      const mockPaymentStatus: PaymentStatus = {
        orderId: orderId,
        status: 'cancelled',
        amount: 280,
        currency: 'QAR'
      };
      
      // Show popup immediately
      this.showPaymentCancel(mockPaymentStatus, orderId);
      
      // Also try to check actual payment status
      this.paymentService.checkPaymentStatus(orderId).subscribe({
        next: (status) => {
          console.log('Payment cancel status check result:', status);
          if (status.status === 'cancelled') {
            // Track cancelled payment
            this.analyticsService.trackEvent('payment_cancelled', {
              order_id: status.orderId,
              amount: status.amount,
              currency: status.currency
            });

            // Update popup with real payment data
            this.paymentStatus = status;
          } else {
            console.error('Payment not cancelled:', status);
          }
        },
        error: (error) => {
          console.error('Error checking payment cancel status:', error);
          // Keep the popup open even if status check fails
        }
      });
    }
  }

  showPaymentCancel(paymentStatus: PaymentStatus, orderId?: string): void {
    this.paymentStatus = paymentStatus;
    this.showPaymentCancelPopup = true;
    
    // Clear session storage for cancelled payment
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('paymentOrderId');
    sessionStorage.removeItem('paymentAmount');
  }

  closePaymentCancelPopup(): void {
    this.showPaymentCancelPopup = false;
    this.paymentStatus = undefined;
  }

  // ==================== PAYMENT FAILED POPUP METHODS ====================

  private checkPaymentFailedFromUrl(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentFailed = urlParams.get('payment_failed');
    const orderId = urlParams.get('order_id');
        
    if (paymentFailed === 'true' && orderId) {
      // Show popup immediately with basic info
      const mockPaymentStatus: PaymentStatus = {
        orderId: orderId,
        status: 'failed',
        amount: 280,
        currency: 'QAR'
      };
      
      // Show popup immediately
      this.showPaymentFailed(mockPaymentStatus, orderId);
      
      // Also try to check actual payment status
      this.paymentService.checkPaymentStatus(orderId).subscribe({
        next: (status) => {
          console.log('Payment failed status check result:', status);
          if (status.status === 'failed') {
            // Track failed payment
            this.analyticsService.trackEvent('payment_failed', {
              order_id: status.orderId,
              amount: status.amount,
              currency: status.currency
            });

            // Update popup with real payment data
            this.paymentStatus = status;
          } else {
            console.error('Payment not failed:', status);
          }
        },
        error: (error) => {
          console.error('Error checking payment failed status:', error);
          // Keep the popup open even if status check fails
        }
      });
    }
  }

  showPaymentFailed(paymentStatus: PaymentStatus, orderId?: string): void {
    this.paymentStatus = paymentStatus;
    this.showPaymentFailedPopup = true;
    
    // Clear session storage for failed payment
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('paymentOrderId');
    sessionStorage.removeItem('paymentAmount');
  }

  closePaymentFailedPopup(): void {
    this.showPaymentFailedPopup = false;
    this.paymentStatus = undefined;
  }

  tryAgain(): void {
    this.closePaymentCancelPopup();
    this.closePaymentFailedPopup();
    this.router.navigate(['/book-now']);
  }

  goToHome(): void {
    this.closePaymentSuccessPopup();
    this.router.navigate(['/']);
  }

  bookAnother(): void {
    this.closePaymentSuccessPopup();
    this.resetForm();
  }
}
