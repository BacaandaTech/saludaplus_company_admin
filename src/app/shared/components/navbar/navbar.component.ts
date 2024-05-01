import { Component } from '@angular/core';
import { hasSession } from '../../services/utils.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { EncryptService } from '../../services/encrypt.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  has_session = hasSession()
  private authSubscription: Subscription | undefined;
  user_data?: any | undefined;
  name_user?: string = '';
  avatar_user?: string = '';
  logo_image?: string = '';

  constructor(
    private auth_service: AuthService,
    private encryptService:EncryptService
  ) {
    this.user_data = JSON.parse(this.encryptService.getData('user'));
    if (this.user_data) {
      this.name_user = this.user_data.meta.name.toUpperCase();
      this.avatar_user = this.user_data.meta.avatar ? this.user_data.meta.avatar : '../assets/img/logo/avatar-default.png';
      this.logo_image = this.user_data.brand.logo ? this.user_data.brand.logo : '../assets/img/logo/saluda+.png'
    }
  }

  ngOnInit(): void {
    this.authSubscription = this.auth_service.currentAuth.subscribe((auth_status) => {
      this.has_session = auth_status;
      if (this.user_data) { 
        this.user_data = JSON.parse(this.encryptService.getData('user'));
        this.name_user = this.user_data.meta.name.toUpperCase();
        this.avatar_user = this.user_data.meta.avatar ? this.user_data.meta.avatar : '../assets/img/logo/avatar-default.png'
      }
    })
  }
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  logoutAction(): void {
    this.auth_service.logout();
    this.auth_service.setCurrentUser(undefined);
  }
}
