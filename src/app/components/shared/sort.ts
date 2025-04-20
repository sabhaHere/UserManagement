import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-table-sort',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sort-header" (click)="toggleSort()">
      <span>{{ label() }}</span>
      <span class="sort-icon">{{ getSortIcon() }}</span>
    </div>
  `,
  styles: [`
    .sort-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      width: 100%;
    }
    
    .sort-icon {
      margin-left: 5px;
      font-size: 12px;
    }
    
    .sort-header:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  `]
})
export class TableSortComponent {
  // Input signals
  column = input.required<string>();
  label = input<string>('');
  
  // Two-way binding for active column and direction
  activeColumn = model<string>('');
  sortDirection = model<SortDirection>('asc');
  
  // Output event when sort changes
  sortChanged = output<{column: string, direction: SortDirection}>();

  toggleSort(): void {
    if (this.activeColumn() === this.column()) {
      // Toggle direction if already sorting by this column
      const newDirection = this.sortDirection() === 'asc' ? 'desc' : 'asc';
      this.sortDirection.set(newDirection);
    } else {
      // Set new column and default to ascending
      this.activeColumn.set(this.column());
      this.sortDirection.set('asc');
    }
    
    // Emit the updated sort configuration
    this.sortChanged.emit({
      column: this.column(),
      direction: this.sortDirection()
    });
  }

  getSortIcon(): string {
    if (this.activeColumn() !== this.column()) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }
}