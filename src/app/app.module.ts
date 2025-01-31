import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridModule } from 'ag-grid-angular';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { JwtInterceptor } from './shared/interceptors/jwt.inteceptor';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AddPaymentComponent } from './pages/add-payment/add-payment.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { AmountComponent } from './shared/components/amount/amount.component';
import { OnlyNumbersDirective } from './only-numbers.directive';
import { RegisterComponent } from './pages/register/register.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SettingsComponent } from './pages/settings/settings.component';
import { RecoverPasswordComponent } from './pages/recover-password/recover-password.component';
import { SharedModule } from './shared/modules/shared.module';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    NotFoundComponent,
    AddPaymentComponent,
    LoaderComponent,
    AmountComponent,
    OnlyNumbersDirective,
    RegisterComponent,
    SettingsComponent,
    RecoverPasswordComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forChild(),
    BsDropdownModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
