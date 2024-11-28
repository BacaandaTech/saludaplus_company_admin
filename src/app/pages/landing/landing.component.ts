import { Component } from '@angular/core';
import { checkPermission } from 'src/app/shared/services/utils.service';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  public links:any =[
    {
      url:'/main',
      label:'Inicio'
    }
  ];

   AVAILABLE_MENUS = [
    {
      label:'Mis membresías',
      permission:"manage_policy",
      url:'/memberships/list',
      icon:'shield.svg'
    },
    {
      label:'Colaboradores',
      permission:"list_collaborators",
      url:'/collaborators/list',
      icon:'hands.svg'
    },
    {
      label:'Configuracion',
      permission:"edit_profile",
      url: '/settings',
      icon:'config.svg'
    },
    {
      label:'Usuarios',
      permission:"list_users",
      url:'/users/list',
      icon:'users.svg'
    },
  
  ];

  validatePermission(permission:string):boolean{
    return checkPermission(permission);
  }
}
