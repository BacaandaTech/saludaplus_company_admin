import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CONFIG_DATE_PICKER } from 'src/app/shared/interfaces/utils.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { usersService } from 'src/app/shared/services/users.service';

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
      label: 'Usuarios',
      queryParams: { ...this.route.snapshot.queryParams }
    },
    {
      url: `/users/edit/${this.route.snapshot.params['id_user']}`,
      label: 'Editar Usuario',
      queryParams: { ...this.route.snapshot.queryParams }
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
    const data = {
      first_name: this.frmEditUser.controls['first_name'].value,
      last_name: this.frmEditUser.controls['last_name'].value,
      second_last_name: this.frmEditUser.controls['second_last_name'].value,
      email: this.frmEditUser.controls['email'].value,
      birthday: this.frmEditUser.controls['birthday'].value,
      department: this.frmEditUser.controls['department'].value,
      role: this.frmEditUser.controls['role'].value
    }

    this.userService.updateUser(this.idUser, data).subscribe({
      next: (response) => {
        this.modalService.openConfirmModal("El usuario ha sido actualizado correctamente");
      },
      error: () => {
      }
    });
  }

  returnToList() {
    this.router.navigateByUrl('/users/list')
  }
}
