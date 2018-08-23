import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { take, filter, tap } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromCheckoutStore from '../../../store';
import * as fromUserStore from '../../../../user/store';

import * as fromRouting from '../../../../routing/store';
import * as fromCart from '../../../../cart/store';
import * as fromGlobalMessage from '../../../../global-message/store';

import { GlobalMessageType } from './../../../../global-message/models/message.model';

import { CheckoutService } from '../../../services/checkout.service';
import { CartService } from '../../../../cart/services/cart.service';

import { Address } from '../../../models/address-model';

@Component({
  selector: 'y-multi-step-checkout',
  templateUrl: './multi-step-checkout.component.html',
  styleUrls: ['./multi-step-checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiStepCheckoutComponent implements OnInit, OnDestroy {
  step = 1;

  deliveryAddress: Address;
  paymentDetails: any;

  step1Sub: Subscription;
  step2Sub: Subscription;
  step3Sub: Subscription;
  step4Sub: Subscription;

  cart$: Observable<any>;
  existingPaymentMethods$: Observable<any>;

  constructor(
    protected checkoutService: CheckoutService,
    protected cartService: CartService,
    private store: Store<fromCheckoutStore.CheckoutState>,
    protected cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cart$ = this.store.select(fromCart.getActiveCart);
    this.processSteps();
  }

  processSteps() {
    this.step4Sub = this.store
      .select(fromCheckoutStore.getOrderDetails)
      .pipe(
        filter(order => Object.keys(order).length !== 0),
        take(1)
      )
      .subscribe(order => {
        this.checkoutService.orderDetails = order;
        this.store.dispatch(
          new fromRouting.Go({
            path: ['orderConfirmation']
          })
        );
      });
  }

  ngOnDestroy() {
    if (this.step1Sub) {
      this.step1Sub.unsubscribe();
    }
    if (this.step2Sub) {
      this.step2Sub.unsubscribe();
    }
    if (this.step3Sub) {
      this.step3Sub.unsubscribe();
    }
    if (this.step4Sub) {
      this.step4Sub.unsubscribe();
    }

    this.store.dispatch(new fromCheckoutStore.ClearCheckoutData());
  }

  setStep(backStep) {
    if (this.step > backStep) {
      for (let i = backStep; i <= this.step; i++) {
        this.store.dispatch(new fromCheckoutStore.ClearCheckoutStep(i));
      }

      this.step = backStep;
    }
  }

  addAddress(addressObject) {
    if (addressObject.newAddress) {
      this.checkoutService.createAndSetAddress(addressObject.address);
    } else {
      this.checkoutService.setDeliveryAddress(addressObject.address);
    }

    this.step1Sub = this.store
      .select(fromCheckoutStore.getDeliveryAddress)
      .pipe(
        filter(deliveryAddress => Object.keys(deliveryAddress).length !== 0),
        take(1)
      )
      .subscribe(deliveryAddress => {
        this.step = 2;
        this.refreshCart();
        this.deliveryAddress = deliveryAddress;
        this.cd.detectChanges();
      });
  }

  setDeliveryMode(deliveryMode: any) {
    this.checkoutService.setDeliveryMode(deliveryMode.deliveryModeId);

    this.step2Sub = this.store
      .select(fromCheckoutStore.getSelectedCode)
      .pipe(
        filter(selected => selected !== ''),
        take(1)
      )
      .subscribe(selected => {
        this.step = 3;
        this.refreshCart();
        this.cd.detectChanges();
      });
  }

  addPaymentInfo(paymentDetailsObject) {
    if (paymentDetailsObject.newPayment) {
      paymentDetailsObject.payment.billingAddress = this.deliveryAddress;
      this.checkoutService.createPaymentDetails(paymentDetailsObject.payment);
    } else {
      this.checkoutService.setPaymentDetails(paymentDetailsObject.payment);
    }

    this.step3Sub = this.store
      .select(fromCheckoutStore.getPaymentDetails)
      .pipe(
        filter(paymentInfo => Object.keys(paymentInfo).length !== 0),
        take(1)
      )
      .subscribe(paymentInfo => {
        if (!paymentInfo['hasError']) {
          this.step = 4;
          this.paymentDetails = paymentInfo;
          this.cd.detectChanges();
        } else {
          Object.keys(paymentInfo).forEach(key => {
            if (key.startsWith('InvalidField')) {
              this.store.dispatch(
                new fromGlobalMessage.AddMessage({
                  type: GlobalMessageType.MSG_TYPE_ERROR,
                  text: 'InvalidField: ' + paymentInfo[key]
                })
              );
            }
          });

          this.store.dispatch(new fromCheckoutStore.ClearCheckoutStep(3));
        }
      });
  }

  placeOrder() {
    this.checkoutService.placeOrder();
  }

  private refreshCart() {
    this.cartService.loadCartDetails();
  }
}
