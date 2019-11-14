import { ChangeDetectionStrategy, Type } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  Configurator,
  ConfiguratorCommonsService,
  ConfiguratorGroupsService,
  I18nTestingModule,
  RouterState,
  RoutingService,
} from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { ConfigPreviousNextButtonsComponent } from './config-previous-next-buttons.component';

const PRODUCT_CODE = 'CONF_LAPTOP';
const GROUP_ID = 'group1';
const GROUP_2_ID = 'group2';

const mockRouterState: any = {
  state: {
    params: {
      rootProduct: PRODUCT_CODE,
    },
  },
};

class MockRoutingService {
  getRouterState(): Observable<RouterState> {
    return of(mockRouterState);
  }
}

class MockConfiguratorGroupsService {
  getCurrentGroup() {
    return of('');
  }
  getNextGroup() {
    return of('');
  }
  getPreviousGroup() {
    return of('');
  }
  navigateToGroup() {}
}

const config: Configurator.Configuration = {
  configId: '1234-56-7890',
  consistent: true,
  complete: true,
  productCode: PRODUCT_CODE,
  groups: [
    {
      configurable: true,
      description: 'Core components',
      groupType: Configurator.GroupType.CSTIC_GROUP,
      id: '1-CPQ_LAPTOP.1',
      name: '1',
      attributes: [
        {
          label: 'Expected Number',
          name: 'EXP_NUMBER',
          required: true,
          uiType: Configurator.UiType.NOT_IMPLEMENTED,
          values: [],
        },
        {
          label: 'Processor',
          name: 'CPQ_CPU',
          required: true,
          selectedSingleValue: 'INTELI5_35',
          uiType: Configurator.UiType.RADIOBUTTON,
          values: [],
        },
      ],
    },
    {
      configurable: true,
      description: 'Peripherals & Accessories',
      groupType: Configurator.GroupType.CSTIC_GROUP,
      id: '1-CPQ_LAPTOP.2',
      name: '2',
      attributes: [],
    },
    {
      configurable: true,
      description: 'Software',
      groupType: Configurator.GroupType.CSTIC_GROUP,
      id: '1-CPQ_LAPTOP.3',
      name: '3',
      attributes: [],
    },
  ],
};

class MockConfiguratorCommonsService {
  getConfiguration(): Observable<Configurator.Configuration> {
    return of(config);
  }
  isConfigurationReady(): Observable<boolean> {
    return of(true);
  }
}

describe('ConfigPreviousNextButtonsComponent', () => {
  let classUnderTest: ConfigPreviousNextButtonsComponent;
  let fixture: ComponentFixture<ConfigPreviousNextButtonsComponent>;
  let configurationGroupsService: ConfiguratorGroupsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [ConfigPreviousNextButtonsComponent],
      providers: [
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: ConfiguratorGroupsService,
          useClass: MockConfiguratorGroupsService,
        },
        {
          provide: ConfiguratorCommonsService,
          useClass: MockConfiguratorCommonsService,
        },
      ],
    })
      .overrideComponent(ConfigPreviousNextButtonsComponent, {
        set: {
          changeDetection: ChangeDetectionStrategy.Default,
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigPreviousNextButtonsComponent);
    classUnderTest = fixture.componentInstance;
    configurationGroupsService = TestBed.get(ConfiguratorGroupsService as Type<
      ConfiguratorGroupsService
    >);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(classUnderTest).toBeTruthy();
  });

  it('should display previous button as disabled if it is the first group', () => {
    spyOn(configurationGroupsService, 'getPreviousGroup').and.returnValue(
      of(null)
    );
    fixture.detectChanges();
    const prevBtn = fixture.debugElement.query(By.css('.btn-action'))
      .nativeElement;
    expect(prevBtn.disabled).toBe(true);
  });

  it('should display previous button as enabled if it is not the first group', () => {
    spyOn(configurationGroupsService, 'getPreviousGroup').and.returnValue(
      of('anyGroupId')
    );
    fixture.detectChanges();
    const prevBtn = fixture.debugElement.query(By.css('.btn-action'))
      .nativeElement;
    expect(prevBtn.disabled).toBe(false);
  });

  it('should display next button as disabled if it is the last group', () => {
    spyOn(configurationGroupsService, 'getNextGroup').and.returnValue(of(null));
    fixture.detectChanges();
    const lastBtn = fixture.debugElement.query(By.css('.btn-secondary'))
      .nativeElement;
    expect(lastBtn.disabled).toBe(true);
  });

  it('should display next button as enabled if it is not the last group', () => {
    spyOn(configurationGroupsService, 'getNextGroup').and.returnValue(
      of('anyGroupId')
    );
    fixture.detectChanges();
    const prevBtn = fixture.debugElement.query(By.css('.btn-secondary'))
      .nativeElement;
    expect(prevBtn.disabled).toBe(false);
  });

  it('should derive that current group is last group depending on group service nextGroup function', () => {
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
    testScheduler.run(helpers => {
      const { cold, expectObservable } = helpers;

      const nextGroup = cold('-a-b-c', { a: GROUP_ID, b: GROUP_2_ID, c: null });

      spyOn(configurationGroupsService, 'getNextGroup').and.returnValue(
        nextGroup
      );

      expectObservable(classUnderTest.isLastGroup(PRODUCT_CODE)).toBe(
        '-a-b-c',
        {
          a: false,
          b: false,
          c: true,
        }
      );
    });
  });
  it('should derive that current group is first group depending on group service getPreviousGroup function', () => {
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
    testScheduler.run(helpers => {
      const { cold, expectObservable } = helpers;

      const previousGroup = cold('-a-b-c-d-e', {
        a: null,
        b: GROUP_2_ID,
        c: null,
        d: '',
        e: ' ',
      });

      spyOn(configurationGroupsService, 'getPreviousGroup').and.returnValue(
        previousGroup
      );

      expectObservable(classUnderTest.isFirstGroup(PRODUCT_CODE)).toBe(
        '-a-b-c-d-e',
        {
          a: true,
          b: false,
          c: true,
          d: true,
          e: false,
        }
      );
    });
  });
  it('should navigate to group exactly one time on navigateToPreviousGroup', () => {
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    testScheduler.run(helpers => {
      const { cold, expectObservable } = helpers;

      const previousGroup = cold('-a-b', {
        a: GROUP_ID,
        b: GROUP_2_ID,
      });
      //this just validates the testScheduler
      expectObservable(previousGroup.pipe(take(1))).toBe('-(a|)', {
        a: GROUP_ID,
      });

      spyOn(configurationGroupsService, 'getPreviousGroup').and.returnValue(
        previousGroup
      );
      spyOn(configurationGroupsService, 'navigateToGroup');

      classUnderTest.navigateToPreviousGroup(config.configId, PRODUCT_CODE);
    });
    //this is the actual test
    expect(configurationGroupsService.navigateToGroup).toHaveBeenCalledTimes(1);
  });

  it('should navigate to group exactly one time on navigateToNextGroup', () => {
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    testScheduler.run(helpers => {
      const { cold } = helpers;

      const nextGroup = cold('-a-b', {
        a: GROUP_ID,
        b: GROUP_2_ID,
      });

      spyOn(configurationGroupsService, 'getNextGroup').and.returnValue(
        nextGroup
      );
      spyOn(configurationGroupsService, 'navigateToGroup');

      classUnderTest.navigateToNextGroup(config.configId, PRODUCT_CODE);
    });

    expect(configurationGroupsService.navigateToGroup).toHaveBeenCalledTimes(1);
  });
});