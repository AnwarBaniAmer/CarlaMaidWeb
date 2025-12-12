import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    TranslateModule,
    RouterLink
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.sass'
})
export class AboutUSComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'About Carla Maid Qatar | Trusted Cleaning Company in Doha Since 2020',
      description: 'Learn why Carla Maid is Qatar\'s most trusted cleaning service. Professional cleaners, eco-friendly solutions, 1000+ satisfied customers in Doha. Licensed, insured, and committed to excellence. Discover our story!',
      keywords: 'about Carla Maid Qatar, cleaning company Doha, professional cleaners Qatar, trusted cleaning service, cleaning company history Qatar, best cleaning service Doha',
      image: 'https://carlamaid.qa/assets/images/logo.png',
      url: 'https://carlamaid.qa/about-us',
      type: 'website'
    });
  }
}
