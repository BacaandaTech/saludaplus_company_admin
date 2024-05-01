import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CONFIG_TOAST } from 'src/app/shared/interfaces/utils.interface';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EncryptService } from 'src/app/shared/services/encrypt.service';
import { ModalService } from 'src/app/shared/services/modal.service';

declare var bootstrap: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public file_uploaded: File | null;
  public user = {
    email: '',
    meta: {
      avatar: '',
      last_name: '',
      second_last_name: '',
      name: '',
      email: '',
    }
  }

  form_settings = new FormGroup({
    last_name: new FormControl('', Validators.required),
    second_last_name: new FormControl('', Validators.required),
    names: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(
    private auth_service: AuthService, 
    private encrypt_service: EncryptService,
    private modal_service: ModalService,
    private toast: ToastrService
  ) {
    this.file_uploaded = null;
  }
  

  ngOnInit(): void {    
    this.user = JSON.parse(this.encrypt_service.getData('user'))
    this.formatData()
  }

  formatData() {
    this.form_settings.setValue({
      last_name: this.user.meta.last_name,
      second_last_name: this.user.meta.second_last_name,
      names: this.user.meta.name,
      email: this.user.email,
    })
  }

  getUserClassAvatar(): string {
    if (!this.user?.meta.avatar) return 'avatar-default';
    else return 'avatar-user';
  }

  OnSubmit(): void {
    const form_data: FormData = new FormData()
    form_data.append('last_name', this.form_settings.value.last_name ?? '')
    form_data.append('second_last_name', this.form_settings.value.second_last_name ?? '')
    form_data.append('name', this.form_settings.value.names ?? '')
    form_data.append('email', this.form_settings.value.email ?? '')
    if (this.file_uploaded) form_data.append('avatar', this.file_uploaded)

    this.auth_service.updateProfile(form_data).subscribe({
      next: (response: any) => {
        this.encrypt_service.saveData('user', JSON.stringify(response.data.user))
        this.auth_service.setCurrentUser(true)
        this.user = response.data.user;        
        this.modal_service.openConfirmModal('El perfil ha sido actualizado exitosamente')
      }, error: (err) => {
        this.toast.error(`Hubo un error`, 'Error', CONFIG_TOAST);
      }
    })
  }
  addAvatar() {
    const input_element: any = document.getElementById('input-file-avatar-settings')
    input_element.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (this.user) this.user.meta.avatar = URL.createObjectURL(file)
    this.file_uploaded = file;
  }
}
