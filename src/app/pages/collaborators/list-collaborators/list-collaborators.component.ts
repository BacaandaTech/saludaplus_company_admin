import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, DomLayoutType, GridReadyEvent } from 'ag-grid-community';
import { Observable, Subject, Subscription, of, takeUntil } from 'rxjs';
import { CollaboratorsService } from 'src/app/shared/services/collaborators.service';
import { CollaboratorStatusComponent } from './ag-grid/collaborator-status.component';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { CollaboratorActionsComponent } from './ag-grid/collaborator-actions.component';
import { BUTTON_ACTIONS, IButtonDetails } from 'src/app/shared/interfaces/utils.interface';

@Component({
  selector: 'app-list-collaborators',
  templateUrl: './list-collaborators.component.html',
  styleUrls: ['./list-collaborators.component.scss']
})
export class ListCollaboratorsComponent {
  public currentPage: number = 1;
  public totalCollaborators!: number;
  public collaboratorsPerPage: number = 10;

  private unsuscribe$: Subject<void> = new Subject();

  // Data that gets displayed in the grid
  public rowData$!: Observable<any[]>;
  public domLayout: DomLayoutType = 'autoHeight';

  public links:any =[
    {
      url:'/main',
      label:'Inicio'
    },
    {
      url:'/collaborators/list',
      label:'Colaboradores'
    },
  ];

  public buttonDetails: IButtonDetails = {
    action:BUTTON_ACTIONS.REDIRECT,
    label:'Agregar',
    url:'/collaborators/create'
  }

  public columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: "ID",
      headerClass:'table-header'
    },
    {
      headerName: 'APELLIDOS',
      headerClass:'table-header',
      cellRenderer: (params:any) => {
        return params.data.meta.last_name +" "+ params.data.meta.second_last_name;
      }
    },
    {
      headerName: 'NOMBRE(S)',
      headerClass:'table-header',
      cellRenderer: (params:any) => {
        return params.data.meta.name;
      }
    },
    {
      headerName: 'ESTATUS',
      headerClass:'table-header',
      cellRenderer: CollaboratorStatusComponent
    },
    {
      headerName: 'ACCIONES',
      headerClass:'table-header',
      cellRenderer: CollaboratorActionsComponent
    },
    
  ];

  public params: any;

  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: false,
  };

  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  //Variables for debounce search
  searchValue: string = '';
  searchDebounce = new Subject<string | any>();

  public makingRequest:boolean = false;

  public updateDataSubscription:Subscription;

  constructor(
    private collaboratorsService:CollaboratorsService
  ) { 
    this.updateDataSubscription = this.collaboratorsService.currentStatusUpdateComunicates
    .pipe(takeUntil(this.unsuscribe$))
    .subscribe({
      next: (response:any) =>{
        if(response == true){
          this.getCollaborators(this.searchValue);
        }
      }
    })
  }

  ngOnInit(): void {
    this.getCollaborators();
    
  }

  ngOnDestroy(): void {
    this.searchDebounce.unsubscribe();
    this.unsuscribe$.next();
    this.unsuscribe$.unsubscribe()
  }

  handleSearchValue(value:any){
    this.searchValue = value;
    this.getCollaborators(this.searchValue);
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
  }

  getCollaborators(query?: string) {
    this.makingRequest = true;
    var searchTerm = undefined;
    if (query) {
      searchTerm = query;
    }
    this.collaboratorsService.getCollaborators(this.currentPage, this.collaboratorsPerPage, query)
    .pipe(takeUntil(this.unsuscribe$))
    .subscribe({
      next: (response: any) => {
        this.rowData$ = of(response.data.collaborators);
        this.currentPage = response.data.pagination.current_page;
        this.totalCollaborators = response.data.pagination.total;
        this.makingRequest = false;
        this.agGrid.gridOptions?.api?.sizeColumnsToFit();
      }
    })
  }

  loadPage(event: PageChangedEvent):void{
    this.currentPage = event.page;
    this.getCollaborators(this.searchValue);
  }
}