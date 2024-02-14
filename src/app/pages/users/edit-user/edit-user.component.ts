import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CONFIG_DATE_PICKER } from 'src/app/shared/interfaces/utils.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { usersService } from 'src/app/shared/services/users.service';
import { formatDate, toFormData } from 'src/app/shared/services/utils.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit{
  public links: any = [
    {
      url: '/main',
      label: 'Inicio'
    },
    {
      url: '/users/list',
      label: 'Usuarios'
    },
    {
      url: '',
      label: 'Editar Usuario'
    },
  ];

  public roles = [
    {
      label: "RH",
      value: 'rh'
    },
    {
      label: "Director",
      value: 'director'
    }
  ];

  public datePickerConfig = CONFIG_DATE_PICKER;

  public frmEditUser!: FormGroup;

  private idUser : any = null;

  constructor(
    private fb: FormBuilder,
    private userService: usersService,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.frmEditUser = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      second_last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthday: ['', Validators.required],
      department: ['', Validators.required],
      role: ['director', Validators.required]
    })
  }

  ngOnInit(): void {
    this.idUser = this.route.snapshot.paramMap.get('id_user');
    this.userService.detailUser(this.idUser).subscribe({
      next:(response) =>{
        console.log(response.data)
        this.frmEditUser.patchValue({
          first_name: response.data.user.meta.name,
          last_name: response.data.user.meta.last_name,
          second_last_name: response.data.user.meta.second_last_name,
          email: response.data.user.email,
          birthday: response.data.user.meta.birthday,
          department: response.data.user.meta.department,
          role: response.data.user.roles[0].name
        })
      }
    });
  }

  updateUser() {
    let formData = toFormData(this.frmEditUser.value);
    formData.set('birthday', formatDate(this.frmEditUser.controls['birthday'].value!));

    this.userService.updateUser(this.idUser,formData).subscribe({
      next: (response) => {
        this.modalService.openConfirmModal("El usuario ha sido actualizado correctamente");
      },
      error: (err) => {
        console.log(err)
      }
    });
  }

  returnToList() {
    this.router.navigateByUrl('/users/list')
  }
}