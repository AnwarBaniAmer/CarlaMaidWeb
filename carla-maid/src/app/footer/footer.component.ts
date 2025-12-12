import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {ChangeDetectionStrategy,} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PhoneTrackDirective } from '../shared/directives/phone-track.directive';
import { EmailTrackDirective } from '../shared/directives/email-track.directive';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    RouterLink,
    PhoneTrackDirective,
    EmailTrackDirective
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.sass'
})
export class FooterComponent {

  constructor(private translate: TranslateService) {}

  openUrl(url: string) {
    window.open(url, '_blank');
  }

  makePhoneCall(phoneNumber: string) {
    window.open(`tel:${phoneNumber}`, '_self');
  }

  sendEmail() {
    const subject = this.translate.instant('shared.emailSubject');
    const body = this.translate.instant('shared.emailBody');
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoLink = `mailto:info@carlamaid.qa?subject=${encodedSubject}&body=${encodedBody}`;
    window.open(mailtoLink, '_self');
  }
}
