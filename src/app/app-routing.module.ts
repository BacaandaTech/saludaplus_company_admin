import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotLoggedGuard } from './shared/guards/not_logged.guard';
import { AuthGuard } from './shared/guards/auth.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AddPaymentComponent } from './pages/add-payment/add-payment.component';
import { RegisterComponent } from './pages/register/register.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  {
    path: '', 
    redirectTo:'main',
    pathMatch:'full'
  },
  {
    path: 'payment-method',
    component: AddPaymentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate:[NotLoggedGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
    canActivate:[NotLoggedGuard]
  },
  { 
    path: 'main', 
    loadChildren: () => import('./pages/landing/landing.module').then(m => m.LandingModule),
    canActivate:[AuthGuard]
  },
  { 
    path: 'collaborators', 
    loadChildren: () => import('./pages/collaborators/collaborators.module').then(m => m.CollaboratorsModule),
    canActivate:[AuthGuard]
  },
  
  { 
    path: 'memberships', 
    loadChildren: () => import('./pages/policies/policies.module').then(m => m.PoliciesModule),
    canActivate:[AuthGuard]
  },
  { 
    path: 'users', 
    loadChildren: () => import('./pages/users/users.module').then(m => m.UsersModule),
    canActivate:[AuthGuard]
  },
  
 
  
  {path: '**', component:NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
