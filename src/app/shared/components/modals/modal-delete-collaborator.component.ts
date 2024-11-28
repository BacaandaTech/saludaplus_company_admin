import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CollaboratorsService } from '../../services/collaborators.service';
import { ModalService } from '../../services/modal.service';
@Component({
  selector: 'app-delete-collab',
  template: `
      <div class="modal-header justify-content-center">
        <h4 class="modal-title text-center">Aviso</h4>
      </div>
      <div class="modal-body">
        <p class="text-center modal-body-text m-0">
          Si eliminas al colaborador {{data.meta.last_name}} {{data.meta.second_last_name}} {{data.meta.name}} todas las membresías asignadas a este seran liberadas.  ¿ Estas seguro de querer eliminar a este colaborador ?
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-cancel btn-rounded" (click)="bsModalRef.hide()">Cancelar</button>
        <button class="btn btn-add btn-rounded" (click)="deleteCollaborator()">Si, continuar</button>
      </div>
    `
})

export class ModalDeleteCollaborator implements OnInit {
  data?: any;

  constructor(public bsModalRef: BsModalRef, private collabService:CollaboratorsService,private modalService:ModalService) { }

  ngOnInit() {
    
  }

  deleteCollaborator(){
    this.collabService.deleteCollaborator(this.data.meta.id).subscribe({
      next: (response) => {
        this.bsModalRef.hide();
        this.modalService.openConfirmModal("El colaborador ha sido eliminado correctamente");
        this.collabService.setCurrentUpdateStatus(true);
      },
      error: (err) => {
        console.log(err)
      }
    })
    
    
  }
}