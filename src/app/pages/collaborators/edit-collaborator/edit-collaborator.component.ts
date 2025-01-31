import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CONFIG_DATE_PICKER } from 'src/app/shared/interfaces/utils.interface';
import { formatDate, toFormData } from 'src/app/shared/services/utils.service';
import { CollaboratorsService } from 'src/app/shared/services/collaborators.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-edit-collaborator',
  templateUrl: './edit-collaborator.component.html',
  styleUrls: ['./edit-collaborator.component.scss']
})
export class EditCollaboratorComponent implements OnInit {
  public links: any = [
    {
      url: '/main',
      label: 'Inicio'
    },
    {
      url: '/collaborators/list',
      label: 'Colaboradores',
      queryParams: { ...this.route.snapshot.queryParams }
    },
    {
      url: `/collaborators/edit/${this.route.snapshot.params['id_collab']}`,
      label: 'Editar',
      queryParams: { ...this.route.snapshot.queryParams }
    },
  ];

  public genders = [
    {
      label:'Masculino',
      value:'male'
    },
    {
      label:'Femenino',
      value:'female'
    },
  ];


  public datePickerConfig = CONFIG_DATE_PICKER;

  public frmEditCollaborator: FormGroup;
  public idCollab:any = null;


  constructor(
    private fb: FormBuilder,
    private collabService: CollaboratorsService,
    private modalService: ModalService,
    private router: Router,
    private route:ActivatedRoute
  ) {
    

    this.frmEditCollaborator = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      second_last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthday: ['', Validators.required],
      department: ['', Validators.required],
      gender: ['male', Validators.required],
      telephone: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      colony: ['', Validators.required],
      street: ['', Validators.required],
      external_number: ['', Validators.required],
      internal_number: ['', Validators.required],
      zipcode: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.idCollab = this.route.snapshot.paramMap.get('id_collab');
    if(this.idCollab){
      this.collabService.detailCollaborator(this.idCollab).subscribe({
        next:(response:any) =>{
          this.frmEditCollaborator.patchValue({
            first_name: response.data.user.meta.name,
            last_name: response.data.user.meta.last_name,
            second_last_name: response.data.user.meta.second_last_name,
            email: response.data.user.email,
            birthday: response.data.user.meta.birthday,
            department: response.data.user.meta.department,
            gender: response.data.user.meta.gender,
            telephone: response.data.user.meta.telephone,
            country: response.data.user.meta.country,
            state: response.data.user.meta.state,
            city: response.data.user.meta.city,
            colony: response.data.user.meta.colony,
            street: response.data.user.meta.street,
            external_number: response.data.user.meta.external_number,
            internal_number: response.data.user.meta.internal_number,
            zipcode: response.data.user.meta.zipcode,
          })
        }
      });
    }
  }

  editCollaborator(): void {
    this.frmEditCollaborator.get('birthday')?.setValue(formatDate(this.frmEditCollaborator.controls['birthday'].value!))

    this.collabService.updateCollaborator(this.idCollab,this.frmEditCollaborator.value!).subscribe({
      next: (response) => {
        this.modalService.openConfirmModal("El colaborador ha sido actualizado correctamente");
      },
      error: () => {
      }
    });
  }

  returnToList() {
    this.router.navigateByUrl('/collaborators/list')
  }
}
