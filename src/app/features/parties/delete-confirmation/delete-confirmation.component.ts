// delete-confirmation.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrl: './delete-confirmation.component.scss'
})
export class DeleteConfirmationComponent {
  @Input() isOpen = false;
  @Input() isDeleting = false;
  @Input() title = 'Delete Item?';
  @Input() itemName: string | undefined = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
