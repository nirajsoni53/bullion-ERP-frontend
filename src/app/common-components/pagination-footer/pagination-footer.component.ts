import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination-footer',
  templateUrl: './pagination-footer.component.html'
})
export class PaginationFooterComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() pageSizeOptions = [10, 50, 100];
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  
  protected readonly Math = Math;
}
