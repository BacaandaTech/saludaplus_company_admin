import { Component,ViewChild   } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { AuthCredentials } from 'src/app/shared/interfaces/auth.interface';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EncryptService } from 'src/app/shared/services/encrypt.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(
    private authService: AuthService,
    private router: Router,
    private encryptService:EncryptService
  ) {
  }

  bsModalRef?: BsModalRef

  frmLogin = new FormGroup({
    email: new FormControl('', [Validators.required,Validators.email]),
    password: new FormControl('', Validators.required)
  });
  public forgot_password_view: Boolean = false;
  public password_recover_view: Boolean = false;
  private unsuscribe$: Subject<void> = new Subject();

  @ViewChild('autoShownModal', { static: false }) autoShownModal?: ModalDirective;
  isModalShown = true;
 
  showModal(): void {
    this.isModalShown = false;
  }

  handleLogin(){
    const authCredentials = new AuthCredentials({
      email: this.frmLogin.value.email,
      password: this.frmLogin.value.password
    });

    this.authService.login(authCredentials).pipe(takeUntil(this.unsuscribe$))
    .subscribe({
      next: (response: any) => {
        this.handleSuccesLogin(response);

        const to_buy = localStorage.getItem('to_buy');
        if (to_buy) {          
          const query_params = JSON.parse(to_buy)
          this.router.navigate(['/payment-method'], {queryParams: query_params});
        } else {
          this.router.navigate(['/main']);
        }
        this.authService.setCurrentUser(true);
      },
      error: (error:HttpErrorResponse) => {
        console.log(error.error.message)
      }
    })
  }

  handleSuccesLogin(response:any) {
    if (!localStorage.getItem('to_buy')) localStorage.clear();
    localStorage.setItem("token", response.access_token);
    this.encryptService.saveData("user",JSON.stringify(response.user));
    this.encryptService.saveData("permissions",JSON.stringify(response.user.permissions))
    localStorage.setItem("expires_in", JSON.stringify(Date.now() + response.expires_in ));
  }
  forgotPasswordAction(): void {
    const form_data: FormData = new FormData()
    form_data.append('email', this.frmLogin.value.email ?? '')

    this.authService.sendRecoverPassword(form_data).subscribe({
      next: (response: any) => {
        this.password_recover_view = true;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error.error.message)
      }
    })
  }
}
