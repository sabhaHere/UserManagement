import { Component, EventEmitter, Output, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="search-container">
      <input 
        type="text" 
        placeholder="Search users..." 
        [value]="searchTerm()" 
        (input)="handleSearch($event)"
        class="search-input"
      >
      @if (searchTerm().length > 0) {
        <button 
          (click)="clearSearch()" 
          class="clear-search-button"
        >✕</button>
      }
    </div>
  `,
  styles: [`
    .search-container {
      position: relative;
      margin-bottom: 20px;
    }
    
    .search-input {
      width: 100%;
      padding: 10px 35px 10px 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
      box-sizing: border-box;
    }
    
    .clear-search-button {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #888;
    }
    
    .clear-search-button:hover {
      color: #333;
    }
  `]
})
export class UserSearchComponent {
  // Using the new model() API for two-way binding
  searchTerm = model<string>('');
  
  // Legacy output approach for clearing search
  @Output() clear = new EventEmitter<void>();

  handleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.clear.emit();
  }
}