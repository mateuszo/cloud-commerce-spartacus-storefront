import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { CartService } from '../../../cart/facade/cart.service';
import { Configurator } from '../../../model/configurator.model';
import * as UiActions from '../store/actions/configurator-ui.action';
import * as ConfiguratorActions from '../store/actions/configurator.action';
import { StateWithConfiguration, UiState } from '../store/configuration-state';
import * as UiSelectors from '../store/selectors/configurator-ui.selector';
import * as ConfiguratorSelectors from '../store/selectors/configurator.selector';

@Injectable()
export class ConfiguratorCommonsService {
  constructor(
    protected store: Store<StateWithConfiguration>,
    protected cartService: CartService
  ) {}

  createConfiguration(
    productCode: string
  ): Observable<Configurator.Configuration> {
    this.store.dispatch(
      new ConfiguratorActions.CreateConfiguration(productCode)
    );

    return this.store.pipe(
      select(ConfiguratorSelectors.getConfigurationFactory(productCode))
    );
  }

  isConfigurationReady(productCode: string): Observable<boolean> {
    return this.store.pipe(
      select(ConfiguratorSelectors.getConfigurationStateFactory(productCode)),
      map(state => !state.loading)
    );
  }

  hasConfiguration(productCode: string): Observable<Boolean> {
    return this.store.pipe(
      select(ConfiguratorSelectors.getConfigurationFactory(productCode)),
      map(configuration => this.isConfigurationCreated(configuration))
    );
  }

  getConfiguration(
    productCode: string
  ): Observable<Configurator.Configuration> {
    return this.store.pipe(
      select(ConfiguratorSelectors.getConfigurationFactory(productCode)),
      tap(configuration => {
        if (!this.isConfigurationCreated(configuration)) {
          this.store.dispatch(
            new ConfiguratorActions.CreateConfiguration(productCode)
          );
        }
      }),
      filter(configuration => this.isConfigurationCreated(configuration))
    );
  }

  readConfiguration(
    configId: string,
    productCode: string,
    groupId: string
  ): Observable<Configurator.Configuration> {
    this.store.dispatch(
      new ConfiguratorActions.ReadConfiguration({
        configId: configId,
        productCode: productCode,
        groupId: groupId,
      })
    );

    return this.store.pipe(
      select(ConfiguratorSelectors.getConfigurationFactory(productCode))
    );
  }

  updateConfiguration(
    productCode: string,
    groupId: string,
    changedAttribute: Configurator.Attribute
  ): void {
    this.store
      .pipe(
        select(ConfiguratorSelectors.getConfigurationFactory(productCode)),
        take(1)
      )
      .subscribe(configuration => {
        this.store.dispatch(
          new ConfiguratorActions.UpdateConfiguration(
            this.createConfigurationExtract(
              groupId,
              changedAttribute,
              configuration
            )
          )
        );
      });
  }

  getUiState(productCode: string): Observable<UiState> {
    return this.store.pipe(
      select(UiSelectors.getUiStateForProduct(productCode)),
      tap(uiState => {
        if (!this.isUiStateCreated(uiState)) {
          this.store.dispatch(new UiActions.CreateUiState(productCode));
        }
      }),
      filter(uiState => this.isUiStateCreated(uiState))
    );
  }

  setUiState(productCode: string, state: UiState) {
    this.store.dispatch(new UiActions.SetUiState(productCode, state));
  }

  removeUiState(productCode: string | string[]) {
    this.store.dispatch(new UiActions.RemoveUiState(productCode));
  }

  addToCart(productCode: string, configId: string) {
    const cart$ = this.cartService.getOrCreateCart();
    cart$.pipe(take(1)).subscribe(cart => {
      console.log('Cart id ' + cart.guid);
      console.log('User uid: ' + cart.user.uid);
      this.store.dispatch(
        new ConfiguratorActions.AddToCart({
          userId: cart.user.uid,
          cartId: cart.guid,
          productCode: productCode,
          quantity: 1,
          configId: configId,
        })
      );
    });
  }

  ////
  // Helper methods
  ////
  isUiStateCreated(uiState: UiState): boolean {
    return uiState !== undefined;
  }

  isConfigurationCreated(configuration: Configurator.Configuration): boolean {
    return (
      configuration !== undefined &&
      configuration.configId !== undefined &&
      configuration.configId.length !== 0
    );
  }

  createConfigurationExtract(
    groupId: string,
    changedAttribute: Configurator.Attribute,
    configuration: Configurator.Configuration
  ): Configurator.Configuration {
    const newConfiguration: Configurator.Configuration = {
      configId: configuration.configId,
      groups: [],
    };

    const group = configuration.groups.find(
      currentGroup => currentGroup.id === groupId
    );
    if (group) {
      const changedGroup: Configurator.Group = {
        groupType: group.groupType,
        id: group.id,
        attributes: [changedAttribute],
      };
      newConfiguration.groups.push(changedGroup);
    }

    return newConfiguration;
  }
}
