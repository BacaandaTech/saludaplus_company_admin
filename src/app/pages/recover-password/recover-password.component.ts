import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { usersService } from 'src/app/shared/services/users.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent {
  succed_recover: boolean = false;

  form_recover = new FormGroup({
    password: new FormControl(''),
    confirm_password: new FormControl(''),
  });

  token: string = ''

  constructor(private active_route: ActivatedRoute, private user_service: usersService, private router: Router) {
    this.token = this.active_route.snapshot.queryParams['token'];
  }

  recoverPassword(): void {
    const form_data: FormData = new FormData();
    form_data.append('password', this.form_recover.value.password ?? '')
    form_data.append('password_confirmation', this.form_recover.value.confirm_password ?? '')
    form_data.append('passwordToken', this.token)

    this.user_service.recoverPasswrod(form_data).subscribe({
      next: () => {
        this.succed_recover = true;
      }, error(error: HttpErrorResponse) {
      }
    });
  }
}
