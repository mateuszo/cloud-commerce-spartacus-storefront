import { Observable } from 'rxjs';
import {
  CardType,
  PaymentDetails,
  PaymentType,
} from '../../../model/cart.model';

export abstract class CheckoutPaymentAdapter {
  /**
   * Abstract method used to create payment details on cart
   *
   * @param userId
   * @param cartId
   * @param paymentDetails
   */
  abstract create(
    userId: string,
    cartId: string,
    paymentDetails: PaymentDetails
  ): Observable<PaymentDetails>;

  /**
   * Abstract method used to set payment details on cart
   *
   * @param userId
   * @param cartId
   * @param paymentDetailsId
   */
  abstract set(
    userId: string,
    cartId: string,
    paymentDetailsId: string
  ): Observable<any>;

  /**
   * Abstract method used to get available cart types
   */
  abstract loadCardTypes(): Observable<CardType[]>;

  /**
   * Abstract method used to get available payment types
   */
  abstract loadPaymentTypes(): Observable<PaymentType[]>;

  /**
   * Abstract method used to set payment type to cart
   *
   * @param userId
   * @param cartId
   * @param typeCode
   * @param poNumber: purchase order number
   */
  abstract setPaymentType(
    userId: string,
    cartId: string,
    typeCode: string,
    poNumber?: string
  ): Observable<any>;
}
