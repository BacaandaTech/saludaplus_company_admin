import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from "ag-grid-community";
import { PoliciesService } from "src/app/shared/services/policies.service";
import * as moment from 'moment/moment';
import { ModalService } from "src/app/shared/services/modal.service";
import { CollaboratorsService } from "src/app/shared/services/collaborators.service";

@Component({
    selector: 'app-collaborator-status',
    template: `
    <div *ngIf="!isPolicyAssigned" class="d-flex align-items-center justify-content-center" style="width: 100%;" >
        <button class="btn btn-add ms-3" (click)="assignPolicy()">Asignar</button>
    </div>
    <div *ngIf="isPolicyAssigned"  class="d-flex align-items-center justify-content-center" style="width: 100%;">
        <div style="background-color: #1f2b5b; color:white; text-align:center; padding: 0px 15px;">
            {{params.data.user_request.brand_policy.policy.folio}}
        </div>
        
    </div>
   `
})
export class CollaboratorStatusComponent implements ICellRendererAngularComp {
    public cellValue!: string;
    public isPolicyAssigned!: boolean;
    public params!: ICellRendererParams;

    constructor(
        private modalService:ModalService,
        private router: Router,
        private policiesService: PoliciesService,
        private collabService:CollaboratorsService
    ) { }

    // gets called once before the renderer is used
    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.isPolicyAssigned = (params.data.user_request === null || params.data.user_request === undefined) ? false : true;
    }

    assignPolicy() {
        let formData = new FormData();
        formData.append('date_request', moment().format('YYYY-MM-DD'));
        formData.append('user_id', this.params.data.id)

        this.policiesService.assignPolicy(formData).subscribe({
            next: (response) => {
                this.modalService.openConfirmModal("La membresía ha sido asignada correctamente");
                this.collabService.setCurrentUpdateStatus(true);
            },
            error: (err) => {
                console.log(err)
            }
        })
    }

    // gets called whenever the cell refreshes
    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}