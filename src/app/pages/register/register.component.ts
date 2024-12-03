import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { usersService } from 'src/app/shared/services/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EncryptService } from 'src/app/shared/services/encrypt.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  public tabs_model: number = 0
  public type_person: string = 'moral';
  public user: any = {};
  public logo: File | null;
  public loader: boolean = false;
  
  constructor(
    private user_service: usersService, 
    private router: Router, 
    private authService: AuthService,
    private encryptService:EncryptService
  ) {
    this.logo = null;
  }

  public owner_form = new FormGroup({
    name: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    second_lastname: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    gender: new FormControl('', Validators.required),
    department: new FormControl('', Validators.required),
    birthday: new FormControl('', Validators.required)
  });

  public info_moral_form = new FormGroup({
    company: new FormControl('', Validators.required),
    rfc: new FormControl('', Validators.required),
    logo: new FormControl(''),
    web: new FormControl('')
  });

  public info_physic_form = new FormGroup({
    rfc: new FormControl(''),
    is_beneficiary: new FormControl(false),
  });

  public address_form = new FormGroup({
    street: new FormControl('', Validators.required),
    number: new FormControl('', Validators.required),
    colony: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    cp: new FormControl('', Validators.required),
    tyc: new FormControl(false, Validators.requiredTrue)
  });

  nextTab(): void {
    this.tabs_model += 1;
  }
  backTab(): void {
    this.tabs_model -= 1;
  }
  handleCorrectUrl() {
    let url = this.info_moral_form.value.web ?? '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }
  handleFileInput(event: any): void {
    this.logo = event.target.files[0];
  }
  createAccount(): void {
    const form_data: FormData = new FormData();
    form_data.append('first_name', this.owner_form.value.name ?? '');
    form_data.append('last_name', this.owner_form.value.lastname ?? '');
    form_data.append('second_last_name', this.owner_form.value.second_lastname ?? '');
    form_data.append('email', this.owner_form.value.email ?? '');
    form_data.append('password', this.owner_form.value.password ?? '');
    form_data.append('telephone', this.owner_form.value.phone ?? '');
    form_data.append('gender', this.owner_form.value.gender ?? '');
    form_data.append('department', this.owner_form.value.department ?? '');
    
    form_data.append('birthday', new Date(this.owner_form.value.birthday ?? '').toLocaleDateString('en-US'));
  
    if (this.type_person === 'moral') {
      form_data.append('brand_name', this.info_moral_form.value.company ?? '');
      form_data.append('rfc', this.info_moral_form.value.rfc ?? '');
      if (this.logo) form_data.append('logo', this.logo);
      if (this.info_moral_form.value.web) {
        const url = this.handleCorrectUrl()
        form_data.append('url', url ?? '');

      }
    } else {
      form_data.append('rfc', this.info_physic_form.value.rfc ?? '');
      const fullname = `${this.owner_form.value.name} ${this.owner_form.value.lastname} ${this.owner_form.value.second_lastname}`
      form_data.append('brand_name', fullname);
      if (this.info_physic_form.value.is_beneficiary) form_data.append('is_beneficiary', '1');
    }

    form_data.append('street', this.address_form.value.street ?? '');
    form_data.append('external_number', this.address_form.value.number ?? '');
    form_data.append('colony', this.address_form.value.colony ?? '');
    form_data.append('city', this.address_form.value.city ?? '');
    form_data.append('state', this.address_form.value.state ?? '');
    form_data.append('zipcode', this.address_form.value.cp ?? '');
    form_data.append('register_external', 'true');
    this.loader = true;
    this.user_service.registerUser(form_data).subscribe({
      next: (response: any) => {
        this.handleSuccesLogin(response);
        this.loader = false;
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
        this.loader = false;
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
}
