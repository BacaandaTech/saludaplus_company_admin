import { Component } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';
import { StripeService } from 'src/app/shared/services/stripe.service';
import { IMembership } from 'src/app/shared/interfaces/membership.interface';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CONFIG_TOAST } from '../../shared/interfaces/utils.interface';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.component.html',
  styleUrls: ['./add-payment.component.scss'],
 
})
export class AddPaymentComponent {
  private stripe: Stripe | null
  private card: any;
  private exp: any;
  private cvv: any;

  public name_user: string;
  public cp: string;
  public loader: boolean = false;
  public success_transaction: boolean = false;
  public reference_seller: string = '';

  public memberships: IMembership[] = [
    {
      name: 'CLUB SALUDA+',
      price: '$3,598 anual',
      alternative_name: 'Anual 2 pagos',
      per_price: '$299 MXM / mes',
      frequency_payment: '2 pagos de $1,799',
      frequency_payment_down_text: 'Mes 1 y mes 7',
      amount: 0,
      has_month: true,
      value: 1799,
    },
    {
      name: 'CLUB SALUDA+',
      price: '$3,199 anual',
      alternative_name: 'Anual 1 pago',
      per_price: '2 meses gratis',
      frequency_payment: '1 solo pago',
      frequency_payment_down_text: '$266.58 MXM / mes',
      amount: 0,
      has_year: true,
      value: 3199,
    }
  ]

  private _type_payment: String = 'card'
  
  public get type_payment(): String {
    return this._type_payment;
  }
  
  public set type_payment(value: String) {
    this._type_payment = value;
    if (value === 'card') this.loadStripeInputs()
  }

  public oxxo_form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  private status_card: any = {
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  }

  constructor(private stripe_service: StripeService, private route: ActivatedRoute, private toast: ToastrService) {
    this.stripe = null;
    this.name_user = ''
    this.cp = '';
  }

  ngOnInit() {

    this.setMembershipsFromParams()
    this.getCustomer();
    this.loadStripeInputs()
  }

  async loadStripeInputs(): Promise<void> {
    this.stripe = await loadStripe(environment.STRIPE_PUBLIC);
    this.waitForElementsToLoad().then((elements) => {
      this.createAndMountElements(elements);
    });
  }
  
  waitForElementsToLoad(): Promise<any> {
    return new Promise((resolve) => {
      const checkElements = setInterval(() => {
        const elements = this.stripe?.elements();
        if (elements) {
          clearInterval(checkElements);
          resolve(elements);
        }
      }, 100);
    });
  }
  addMonths(date: any, months: any) {
      const d = new Date(date);
      d.setMonth(d.getMonth() + months);

      if (d.getDate() !== date.getDate()) {
          d.setDate(0);
      }
      return d;
  }

  formatDate(date: any) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('es-ES', options);
  }

  getFutureDateInSevenMonths() {
    const today = new Date();
    const futureDate = this.addMonths(today, 7);
    return this.formatDate(futureDate);
  }
  
  createAndMountElements(elements: any): void {
    this.card = elements?.create('cardNumber');
    this.exp = elements?.create('cardExpiry');
    this.cvv = elements?.create('cardCvc');

    this.card?.mount('#card')
    this.exp?.mount('#exp');
    this.cvv?.mount('#cvv');
  
    this.card?.on('change', (event: any) => this.handleCardChange(event, 'card-errors'));
    this.exp?.on('change', (event: any) => this.handleCardChange(event, 'exp-errors'));
    this.cvv?.on('change', (event: any) => this.handleCardChange(event, 'cvc-errors'));
  }
  

  setMembershipsFromParams(): void {
    const query_params: any = this.route.snapshot.queryParams;
    const membership_month = this.memberships.find(i => i.has_month)
    const membership_year = this.memberships.find(i => i.has_year)

    if (query_params.has_month && membership_month) {
      membership_month.amount = parseInt(query_params.quantity_month);
    }
    if (query_params.has_year && membership_year) {
      membership_year.amount = parseInt(query_params.quantity_year);
    }
  }

  async handleBuy() {
    if (this.handleDisabledButton()) {
      const owner_info = {
        owner: {
          name: this.name_user,
          address: {
            postal_code: this.cp
          }
        },
        
      }
      try {
        const result = await this.stripe?.createSource(this.card, owner_info);
        if (result?.source) {
          const form_data: FormData = new FormData();
          form_data.append('token_card', result.source?.id ? result.source?.id : '');
          this.loader = true;
  
          this.stripe_service.addPaymentMethod(form_data).subscribe({
            next: (response) => {
              if (response.status === 200) {
                this.stripe_service.buySuscription(this.getFormDataMemberships()).subscribe({
                  next: (response_buy) => {
                    if (response_buy.status === 200) {
                      this.loader = true;
                      this.success_transaction = true
                    } else {
                      this.loader = false; 
                    }
                  },
                  error: () => {
                    this.loader = false; 
                  }
                })
              } else {
                this.loader = false;
              }
            },
            error: () => {
              this.loader = false;
            }
          })
        }
      } catch (e: any) {
        this.loader = false;
        console.warn(e.message)
      }
    }
  }

  buyOxxo(): void {
    this.loader = true;

    this.stripe_service.buySuscription(this.getFormDataMemberships(), true).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.collectDetailsOxxo(response)
        } else {
          this.loader = false; 
        }
      },
      error: (err) => {
        this.loader = false; 
      }
    });

  }

  async collectDetailsOxxo(response: any): Promise<void> {
    const result = await this.stripe?.confirmOxxoPayment(
      response.data.client_secret,
      {
        payment_method: {
          billing_details: {
            name: this.oxxo_form.value.name ?? '',
            email: this.oxxo_form.value.email ?? '',
          },
        },
      });
    
    if (result?.error) {
      this.toast.error(result.error.message, 'Error',CONFIG_TOAST);
    }
    this.loader = false;
  }

  getCustomer():void {
    this.stripe_service.getCustomerStripe().subscribe(() => {
    })
  }
  getTotal() {
    let total: number = 0
    this.memberships.forEach(membership => {
      total += membership.amount * membership.value
    });
    return Math.round(total);  
  }
  getNextTotalPaymentCase() {
    let total: number = 0
    const months: IMembership[] =  this.memberships.filter(i => i.has_month)
    
    months.forEach(membership => {
      total += membership.amount * membership.value
    });
    return Math.round(total);
  }
  separatebycomma(num: string) {
    if (num === null) return '0'
    const result = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return result
  }

  getFormDataMemberships() {
    const form_data_buy: FormData = new FormData();
    const memberships_to_buy: IMembership[] = this.memberships.filter(i => i.amount > 0);

    memberships_to_buy.forEach((membership) => {
      if (membership?.has_month) {
        form_data_buy.append('has_month', 'true');
        form_data_buy.append('quantity_month', membership.amount.toString());
      } 
      if (membership?.has_year) {  
        form_data_buy.append('has_year', 'true');
        form_data_buy.append('quantity_year', membership.amount.toString());
      } 
      if (this.reference_seller.length > 0) {
        form_data_buy.append('reference_seller_id', this.reference_seller);
      }

    })
    return form_data_buy;
  }

  handleDisabledButton() {
    const status = Object.values(this.status_card);
    if (this.type_payment === 'card') {
      status.push(this.cp.length > 0)
      status.push(this.name_user.length > 0)
      status.push(this.memberships.filter((i) => i.amount > 0).length > 0)
    } else if (this.type_payment === 'oxxo') {
      return !this.oxxo_form.invalid && this.memberships.filter((i) => i.amount > 0).length > 0
    }
    return status.every((i) => i === true)
  }
  
  handleCardChange(event: any, errorElementId: string) {
    const displayError = document.getElementById(errorElementId);

    this.status_card[event.elementType] = event.complete

    if (displayError) {
      displayError.textContent = event.error ? event.error.message : '';
    }
  }
}