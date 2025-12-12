import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [
    TranslateModule,
    RouterLink
  ],
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.sass'
})
export class PolicyComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Privacy Policy & Terms of Service | Carla Maid Qatar',
      description: 'Read Carla Maid Qatar\'s privacy policy and terms of service. Learn how we protect your data and the terms for using our professional cleaning services in Doha.',
      keywords: 'privacy policy Qatar, terms of service, Carla Maid privacy, data protection Qatar, cleaning service terms, Doha cleaning company policy',
      image: 'https://carlamaid.qa/assets/images/logo.png',
      url: 'https://carlamaid.qa/policy',
      type: 'website'
    });
  }
}
