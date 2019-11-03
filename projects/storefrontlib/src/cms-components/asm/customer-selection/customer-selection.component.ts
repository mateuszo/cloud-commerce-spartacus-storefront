import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AsmConfig,
  AsmService,
  CustomerSearchPage,
  User,
} from '@spartacus/core';
import { Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'cx-customer-selection',
  templateUrl: './customer-selection.component.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class CustomerSelectionComponent implements OnInit, OnDestroy {
  form: FormGroup;
  private subscription = new Subscription();
  searchResultsLoading$: Observable<boolean>;
  searchResults: Observable<CustomerSearchPage>;
  selectedCustomer: User;

  @Output()
  submitEvent = new EventEmitter<{ customerId: string }>();

  @ViewChild('resultList', { static: false }) resultList: ElementRef;

  constructor(
    private fb: FormBuilder,
    private asmService: AsmService,
    private config: AsmConfig
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      searchTerm: [''],
    });
    this.asmService.customerSearchReset();
    this.searchResultsLoading$ = this.asmService.getCustomerSearchResultsLoading();
    this.searchResults = this.asmService.getCustomerSearchResults();

    this.subscription.add(
      this.form.controls.searchTerm.valueChanges
        .pipe(debounceTime(300))
        .subscribe(value => {
          this.handleSearchTerm(value);
        })
    );
  }

  private handleSearchTerm(value: string) {
    if (!!this.selectedCustomer && value !== this.selectedCustomer.name) {
      this.selectedCustomer = undefined;
    }
    if (!!this.selectedCustomer) {
      return;
    }
    this.asmService.customerSearchReset();
    if (value.trim().length >= 3) {
      this.asmService.customerSearch({
        query: value,
        pageSize: this.config.asm.customeSearch.maxResults,
      });
    }
  }

  selectCustomerFromList(customer: User) {
    this.selectedCustomer = customer;
    this.form.controls.searchTerm.setValue(this.selectedCustomer.name);
    this.asmService.customerSearchReset();
  }

  onSubmit(): void {
    if (!!this.selectedCustomer) {
      this.submitEvent.emit({ customerId: this.selectedCustomer.customerId });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onDocumentClick(event) {
    if (!!this.resultList) {
      if (!this.resultList.nativeElement.contains(event.target)) {
        this.asmService.customerSearchReset();
      }
    }
  }
}
