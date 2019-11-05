import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StrategyResult } from '../../model/strategy.result';
import { StrategyAdapter } from './strategy.adapter';
import { CdsConfig } from '../../../cds-config';

@Injectable()
export class MerchandisingStrategyAdapter implements StrategyAdapter {

  constructor(private config: CdsConfig, protected http: HttpClient) {}

  load(strategyId: string): Observable<StrategyResult> {
    return this.http.get<StrategyResult>(`${this.config.cds.baseUrl}/strategy/${this.config.cds.tenant}/strategies/${strategyId}/products`);
  }
}