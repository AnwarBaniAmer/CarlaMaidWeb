import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../shared/services/analytics.service';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.sass'
})
export class ContactUsComponent implements OnInit { 
  _translate = inject(TranslateService);
  sanitizer = inject(DomSanitizer);
  analyticsService = inject(AnalyticsService);
  seoService = inject(SeoService);


  email = 'info@carlamaid.qa';
  sent = false;
  formData = {
    name: '',
    email: '',
    phone: '',
    message: '',
  };

  ngOnInit(): void {
    // Set SEO
    this.seoService.setPageSeo({
      title: 'Request Free Quotation | Contact Carla Maid Qatar | Call +974-71236660 | Doha',
      description: 'Request a free quotation for professional cleaning services in Qatar. Contact Carla Maid: Call +974-71236660, email info@carlamaid.qa, or visit our office in Doha. Get instant quotes for home, office, and commercial cleaning services.',
      keywords: 'quotation request Qatar, free cleaning quote Doha, contact Carla Maid Qatar, cleaning service phone number, Doha cleaning company contact, book cleaning service Qatar, cleaning service email, Carla Maid address Doha, request cleaning quote',
      image: 'https://carlamaid.qa/assets/images/contact-us.png',
      url: 'https://carlamaid.qa/contact-us',
      type: 'ContactPage',
      structuredData: [
        this.getContactPageSchema()
      ]
    });

    // Set default quotation request message
    this.formData.message = this._translate.instant('contact.form.defaultMessage');
    
    // Update message when language changes
    this._translate.onLangChange.subscribe(() => {
      if (this.formData.message === this._translate.instant('contact.form.defaultMessage')) {
        this.formData.message = this._translate.instant('contact.form.defaultMessage');
      }
    });
  }

  resetForm(){
    this.formData = {
      name: '',
      email: '',
      phone: '',
      message: this._translate.instant('contact.form.defaultMessage'),
    };
  }

  isDefaultMessage(): boolean {
    return this.formData.message === this._translate.instant('contact.form.defaultMessage');
  }

  contacts = [
    {
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg width="41" height="65" viewBox="0 0 41 65" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M34.1913 0.883301H6.30801C3.00931 0.883301 0.333008 3.5596 0.333008 6.8583V58.6416C0.333008 61.9403 3.00931 64.6166 6.30801 64.6166H34.1913C37.49 64.6166 40.1663 61.9403 40.1663 58.6416V6.8583C40.1663 3.5596 37.49 0.883301 34.1913 0.883301ZM20.2497 60.6333C18.0464 60.6333 16.2663 58.8532 16.2663 56.65C16.2663 54.4467 18.0464 52.6666 20.2497 52.6666C22.453 52.6666 24.233 54.4467 24.233 56.65C24.233 58.8532 22.453 60.6333 20.2497 60.6333ZM34.1913 47.1896C34.1913 48.0111 33.5192 48.6833 32.6976 48.6833H7.80176C6.9802 48.6833 6.30801 48.0111 6.30801 47.1896V8.35205C6.30801 7.53049 6.9802 6.8583 7.80176 6.8583H32.6976C33.5192 6.8583 34.1913 7.53049 34.1913 8.35205V47.1896Z" fill="url(#paint0_linear_446_5383)"/>
            <defs>
            <linearGradient id="paint0_linear_446_5383" x1="25.4133" y1="-36.2945" x2="-51.3369" y2="16.7673" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0188FF"/>
            <stop offset="1" stop-color="#0346FF"/>
            </linearGradient>
            </defs>
            </svg>
            `),
      title: this._translate.instant('contact.info.callUs'),
      info: '974-71236660'
    },
    {
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M63.2835 57.4383C63.2835 60.6695 60.6642 63.2889 57.433 63.2889H6.72845C3.49726 63.2889 0.87793 60.6695 0.87793 57.4383V25.3487C0.87794 24.4616 1.07971 23.586 1.46798 22.7883C1.85624 21.9906 2.42084 21.2917 3.11904 20.7444C6.15559 18.3641 8.66497 16.4339 23.1327 5.9339C25.1834 4.43873 29.2526 0.841025 32.0807 0.883685C34.9082 0.840538 38.979 4.43934 41.0287 5.93378C55.495 16.4327 58.0078 18.3655 61.0424 20.7444C61.7406 21.2917 62.3052 21.9906 62.6934 22.7883C63.0817 23.586 63.2835 24.4616 63.2835 25.3487V57.4383ZM55.2797 33.475C54.9673 33.0206 54.3412 32.9149 53.8977 33.2425C51.1132 35.2991 47.1376 38.2039 41.0287 42.6374C38.978 44.1324 34.9088 47.7299 32.0807 47.6871C29.2516 47.729 25.187 44.135 23.1327 42.6374C17.0245 38.2044 13.0486 35.2994 10.2637 33.2425C9.82021 32.9149 9.19408 33.0206 8.88169 33.475L7.77594 35.0834C7.63261 35.2917 7.57587 35.5476 7.61769 35.7971C7.65952 36.0465 7.79663 36.2699 8.00009 36.4201C10.7897 38.4798 14.7591 41.3796 20.835 45.7892C23.3061 47.5908 27.7245 51.6169 32.0807 51.5877C36.435 51.6172 40.8517 47.5934 43.3263 45.7892C49.4023 41.3795 53.3719 38.4797 56.1612 36.4201C56.3647 36.2699 56.5018 36.0465 56.5436 35.7971C56.5854 35.5476 56.5287 35.2917 56.3854 35.0834L55.2797 33.475Z" fill="url(#paint0_linear_446_5388)"/>
      <defs>
      <linearGradient id="paint0_linear_446_5388" x1="40.1703" y1="-35.5199" x2="-39.751" y2="52.8869" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0188FF"/>
      <stop offset="1" stop-color="#0346FF"/>
      </linearGradient>
      </defs>
      </svg>
      `),
      title: this._translate.instant('contact.info.support'),
      info: this.email
    },
    {
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg width="66" height="58" viewBox="0 0 66 58" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M33.2469 0.883301C25.3864 0.883301 19.0147 7.17373 19.0147 14.9339C19.0147 21.2076 28.3165 32.6421 31.8801 36.7926C32.6019 37.6334 33.893 37.6334 34.6136 36.7926C38.1773 32.6421 47.479 21.2076 47.479 14.9339C47.479 7.17373 41.1073 0.883301 33.2469 0.883301ZM33.2469 19.6174C30.6263 19.6174 28.5028 17.521 28.5028 14.9339C28.5028 12.3468 30.6263 10.2504 33.2469 10.2504C35.8674 10.2504 37.9909 12.3468 37.9909 14.9339C37.9909 17.521 35.8674 19.6174 33.2469 19.6174ZM2.98893 24.9644C2.31819 25.2293 1.7432 25.6865 1.33813 26.277C0.933053 26.8675 0.716469 27.5643 0.716309 28.2775L0.716309 56.1913C0.716309 57.4536 2.00737 58.3167 3.1945 57.8484L18.7888 50.8409V24.8496C17.7903 23.0676 16.9737 21.3325 16.3886 19.6732L2.98893 24.9644ZM33.2469 40.991C31.6576 40.991 30.1542 40.3019 29.1229 39.0998C26.9023 36.5127 24.5404 33.5665 22.4033 30.5445V50.8398L44.0904 57.9766V30.5456C41.9533 33.5665 39.5926 36.5138 37.3708 39.1009C36.3395 40.3019 34.8361 40.991 33.2469 40.991ZM63.2992 18.8547L47.7049 25.8621V57.9777L63.5048 51.7386C64.1756 51.4739 64.7507 51.0168 65.1558 50.4262C65.5609 49.8357 65.7774 49.1388 65.7774 48.4256V20.5117C65.7774 19.2494 64.4864 18.3863 63.2992 18.8547Z" fill="url(#paint0_linear_446_5393)"/>
      <defs>
      <linearGradient id="paint0_linear_446_5393" x1="41.6807" y1="-32.4218" x2="-29.8847" y2="57.788" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0188FF"/>
      <stop offset="1" stop-color="#0346FF"/>
      </linearGradient>
      </defs>
      </svg>
      `),
      title: this._translate.instant('contact.info.address'),
      info: this._translate.instant('contact.info.location'),
    },
    {
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg width="55" height="57" viewBox="0 0 55 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.9217 20.7149C41.2744 27.2292 41.1872 37.6734 34.96 44.0878C34.9483 44.1009 34.9345 44.1151 34.9217 44.1281L27.7766 51.4475C21.4747 57.9031 11.2218 57.9022 4.92079 51.4475C-1.38115 44.9929 -1.38115 34.4888 4.92079 28.0342L8.86612 23.9927C9.91237 22.9209 11.7142 23.6333 11.7682 25.1479C11.8371 27.0782 12.175 29.0175 12.7985 30.8902C13.0096 31.5243 12.8588 32.2258 12.3963 32.6996L11.0048 34.125C8.02487 37.1776 7.93141 42.148 10.882 45.2304C13.8616 48.3432 18.7592 48.3617 21.7618 45.2859L28.9069 37.9677C31.9043 34.8971 31.8918 29.9341 28.9069 26.8764C28.5134 26.4741 28.117 26.1615 27.8073 25.9431C27.5883 25.789 27.4075 25.5846 27.2792 25.3463C27.151 25.1079 27.0789 24.8421 27.0687 24.5701C27.0266 23.4191 27.4247 22.2331 28.3125 21.3236L30.5511 19.0303C31.1381 18.429 32.059 18.3552 32.7397 18.8418C33.5193 19.3994 34.2494 20.0262 34.9217 20.7149ZM49.9068 5.36361C43.6058 -1.09115 33.3529 -1.09202 27.0509 5.36361L19.9058 12.683C19.8931 12.696 19.8793 12.7102 19.8676 12.7233C13.6405 19.1377 13.5532 29.5819 19.9058 36.0962C20.5781 36.7849 21.3082 37.4116 22.0878 37.9692C22.7685 38.4558 23.6895 38.3819 24.2764 37.7807L26.515 35.4874C27.4028 34.5779 27.8009 33.3919 27.7588 32.2409C27.7486 31.9689 27.6765 31.7031 27.5483 31.4647C27.42 31.2264 27.2392 31.022 27.0201 30.8679C26.7105 30.6495 26.3141 30.3369 25.9206 29.9346C22.9357 26.8769 22.9232 21.9139 25.9206 18.8433L33.0657 11.5251C36.0682 8.44929 40.9657 8.46781 43.9455 11.5806C46.8961 14.663 46.8027 19.6334 43.8227 22.686L42.4312 24.1114C41.9687 24.5852 41.8178 25.2867 42.029 25.9208C42.6525 27.7935 42.9904 29.7328 43.0593 31.6631C43.1134 33.1777 44.9151 33.8901 45.9613 32.8183L49.9067 28.7767C56.2087 22.3223 56.2087 11.8182 49.9068 5.36361Z" fill="url(#paint0_linear_446_5398)"/>
      <defs>
      <linearGradient id="paint0_linear_446_5398" x1="34.4707" y1="-32.0083" x2="-37.1011" y2="45.2774" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0188FF"/>
      <stop offset="1" stop-color="#0346FF"/>
      </linearGradient>
      </defs>
      </svg>
      `) ,
      title: this._translate.instant('contact.info.website'),
      info: 'www.carlamaid.qa'
    },
  ]

  // Google Form submission URL
  

  // Method to submit the form data
  onSubmit() {
    // Track contact form submission
    this.analyticsService.trackFormSubmission('contact_form', 'contact-us-form');
    
    const formData = new FormData();
    formData.append('entry.1423087057', this.formData.name); 
    formData.append('entry.999466525', this.formData.email);
    formData.append('entry.14756651', this.formData.phone);
    formData.append('entry.588313379', this.formData.message);

    let googleFormUrl ='https://docs.google.com/forms/u/0/d/e/1FAIpQLSf2VwYd5oymDq589hsQdhHP3LMDfkByzpEL_FmWk8KMiZii5A/formResponse';


    this.submitGoogleFrom({formURl: googleFormUrl, formData: formData})
  }

  submitGoogleFrom({formURl, formData}: {formURl: string, formData: FormData}){
    fetch(formURl, {
      method: 'POST',
      body: formData,
      mode: 'no-cors',
    })
     .then((res: any) => {
        this.sent = true;
        this.resetForm()

        // Track successful contact form submission
        this.analyticsService.trackServiceInquiry('contact_inquiry');
        this.analyticsService.trackFormSubmission('quotation_request', 'contact-us-form');

        setTimeout(() => {
          this.sent = false;
        }, 5000); // Increased timeout for better UX
        
      })
     .catch(() => console.log('There was an error submitting the form.'));
  }

  private getContactPageSchema(): any {
    return {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Carla Maid Qatar - Request Quotation",
      "description": "Contact Carla Maid Qatar for free quotations on professional cleaning services. Call, email, or visit our office in Doha.",
      "url": "https://carlamaid.qa/contact-us",
      "mainEntity": {
        "@type": "Organization",
        "name": "Carla Maid Cleaning Company",
        "telephone": "+974-71236660",
        "email": "info@carlamaid.qa",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Manarat Lusail - Floor 25 - Office 2501",
          "addressLocality": "Doha",
          "addressRegion": "Doha",
          "addressCountry": "QA"
        },
        "url": "https://carlamaid.qa",
        "sameAs": [
          "https://www.facebook.com/carlamaidqa",
          "https://www.instagram.com/carlamaidqa"
        ]
      }
    };
  }

}
