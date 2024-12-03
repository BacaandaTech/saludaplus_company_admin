import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from "ag-grid-community";
import { ModalService } from "src/app/shared/services/modal.service";


@Component({
    selector: 'app-collaborator-actions',
    template: `
        <div class="d-flex justify-content-between align-items-center actions-container">
            <img class="actions-item" src="assets/img/icons/edit.svg" alt="" (click)="goToEdit()">
            <img class="actions-item" src="assets/img/icons/delete.svg" alt="" (click)="deleteCollaborator()">
        </div>
    `,
    styles:[
        `
            .actions-container { 
                width: 100%;
                height:100%;
            }
            .actions-item { 
                height:25px;
                width:auto;
                cursor:pointer;
            }
        `
    ]
})
export class CollaboratorActionsComponent implements ICellRendererAngularComp {
    public cellValue!: string;
    public isPolicyAssigned!: boolean;
    public params!: ICellRendererParams;

    constructor(
       
        private router: Router,
        private modalService:ModalService
    ) { }

    // gets called once before the renderer is used
    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.isPolicyAssigned = (params.data.user_request === null || params.data.user_request === undefined) ? false : true;
    }

    // gets called whenever the cell refreshes
    refresh(params: ICellRendererParams): boolean {
        return false;
    }

    deleteCollaborator(){
        this.modalService.openDeleteCollaboratorModal(this.params.data)
    }

    goToEdit(){
        this.router.navigateByUrl('/collaborators/edit/'+this.params.data.meta.id)
    }
}