import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configurator } from '../../../model/configurator.model';
import { ConfiguratorCommonsAdapter } from './configurator-commons.adapter';

@Injectable({
  providedIn: 'root',
})
export class ConfiguratorCommonsConnector {
  constructor(protected adapter: ConfiguratorCommonsAdapter) {}

  createConfiguration(
    productCode: string
  ): Observable<Configurator.Configuration> {
    return this.adapter.createConfiguration(productCode);
  }

  readConfiguration(configId: string): Observable<Configurator.Configuration> {
    return this.adapter.readConfiguration(configId);
  }

  updateConfiguration(
    Configuration: Configurator.Configuration
  ): Observable<Configurator.Configuration> {
    return this.adapter.updateConfiguration(Configuration);
  }

  readConfigurationPrice(
    configId: string
  ): Observable<Configurator.Configuration> {
    return this.adapter.readConfigurationPrice(configId);
  }
}
