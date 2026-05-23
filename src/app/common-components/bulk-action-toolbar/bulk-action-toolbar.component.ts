import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-bulk-action-toolbar',
  templateUrl: './bulk-action-toolbar.component.html'
})
export class BulkActionToolbarComponent {
  @Input() count = 0;
  @Output() onSell = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
}
