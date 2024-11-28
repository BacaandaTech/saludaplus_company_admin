import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, DomLayoutType, GridReadyEvent } from 'ag-grid-community';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged, of, takeUntil } from 'rxjs';
import { PoliciesService } from 'src/app/shared/services/policies.service';

@Component({
  selector: 'app-policies-list',
  templateUrl: './policies-list.component.html',
  styleUrls: ['./policies-list.component.scss']
})
export class PoliciesListComponent implements OnInit{
  public currentPage: number = 1;
  public totalPolicies!: number;
  public policiesPerPage: number = 10;

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
      url:'/memberships/list',
      label:'Membresías'
    },
  ];

  public columnDefs: ColDef[] = [
    {
      field: 'created_at',
      headerName: "FECHA",
      headerClass:'table-header'
    },
    {
      headerName: 'MEMBRESÍAS',
      headerClass:'table-header',
      cellRenderer: (params:any) => {
        return params.data.policy.folio;
      }
    },
    {
      headerName: 'VIGENCIA',
      headerClass:'table-header',
      cellRenderer: (params:any) => {
        
        return params.data.policy.validity;
      }
    },
    {
      headerName: 'USUARIO ASIGNADO',
      headerClass:'table-header',
      cellRenderer: (params:any) => {
        if(params.data.user_request){
          return params.data.user_request.user.meta.last_name +" "+ params.data.user_request.user.meta.second_last_name;
        }else{
          return "";
        }
      }
    },
    /* {
      headerName: 'ESTATUS',
      headerClass:'table-header',
      cellRenderer: (params:any) => {
        return `
          <div class="status ${params.data.status}">${params.data.status == 'available' ? 'NO ASIGNADO' : 'ASIGNADO'}</div>
        `;
      }
    }, */

    /* {
      headerName: 'ACCIONES',
      headerClass:'table-header',
      
    }, */
    
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


  public makingRequest:boolean = false;

  private updateDataSubscription:Subscription;

  constructor(
    private policiesServices:PoliciesService
  ) { 
    this.updateDataSubscription = this.policiesServices.currentStatusUpdatePolicies
    .pipe(takeUntil(this.unsuscribe$))
    .subscribe({
      next: (response:any) =>{
        if(response == true){
          this.getPolicies(this.searchValue);
        }
      }
    })
  }

  ngOnInit(): void {
    this.getPolicies();
    
  }

  ngOnDestroy(): void {
    
    this.unsuscribe$.next();
    this.unsuscribe$.unsubscribe()
  }

 

  onGridReady(params: GridReadyEvent) {
    this.params = params;
  }

  handleSearchValue(value:any){
    this.searchValue = value;
    this.getPolicies(this.searchValue);
  }

  getPolicies(query?: string) {
    this.makingRequest = true;
    var searchTerm = undefined;
    if (query) {
      searchTerm = query;
    }
    this.policiesServices.getPolicies(this.currentPage, this.policiesPerPage, query)
    .pipe(takeUntil(this.unsuscribe$))
    .subscribe({
      next: (response: any) => {
        this.rowData$ = of(response.data.policies);
        this.currentPage = response.data.pagination.current_page;;
        this.totalPolicies = response.data.pagination.total;
        this.makingRequest = false;
        this.agGrid.gridOptions?.api?.sizeColumnsToFit();
      }
    })
  }

  loadPage(event: PageChangedEvent):void{
    this.currentPage = event.page;
    this.getPolicies(this.searchValue);
  }
}
