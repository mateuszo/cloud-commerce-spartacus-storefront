import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConverterService } from '@spartacus/core';
import { Observable } from 'rxjs';
import { CdsEndpointsService } from '../../../services/cds-endpoints.service';
import { MERCHANDISING_PRODUCTS_NORMALIZER } from '../../connectors/strategy/converters';
import { StrategyAdapter } from '../../connectors/strategy/strategy.adapter';
import { MerchandisingProducts } from '../../model/merchandising.products';

const STRATEGY_PRODUCTS_ENDPOINT_KEY = 'strategyProducts';

@Injectable()
export class MerchandisingStrategyAdapter implements StrategyAdapter {
  constructor(
    private converterService: ConverterService,
    private cdsEndpointsService: CdsEndpointsService,
    protected http: HttpClient
  ) {}

  loadProductsForStrategy(
    strategyId: string
  ): Observable<MerchandisingProducts> {
    return this.http
      .get(
        this.cdsEndpointsService.getUrl(STRATEGY_PRODUCTS_ENDPOINT_KEY, {
          strategyId,
        })
      )
      .pipe(this.converterService.pipeable(MERCHANDISING_PRODUCTS_NORMALIZER));
  }
}