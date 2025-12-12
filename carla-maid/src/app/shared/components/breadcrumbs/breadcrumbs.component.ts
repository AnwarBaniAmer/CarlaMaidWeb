import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.sass'
})
export class BreadcrumbsComponent implements OnInit {
  @Input() items: BreadcrumbItem[] = [];
  private seoService = inject(SeoService);

  ngOnInit(): void {
    if (this.items.length > 0) {
      this.addBreadcrumbStructuredData();
    }
  }

  private addBreadcrumbStructuredData(): void {
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": this.items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": `https://carlamaid.qa${item.url}`
      }))
    };

    this.seoService.addStructuredData(breadcrumbList);
  }
}

