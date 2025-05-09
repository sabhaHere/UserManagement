import { Component, computed, effect, inject, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { routes } from '../../app.routes';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { ViewUserDetailsComponent } from "../view-user-details/view-user-details.component";
import Notiflix from 'notiflix';
import { SortDirection, TableSortComponent } from '../shared/sort';
import { UserSearchComponent } from "../shared/search";
import { NotiflixConfig } from '../utils/notiflix-config';
@Component({
  selector: 'app-user-list',
  imports: [ViewUserDetailsComponent, UserSearchComponent, TableSortComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  // signals for component state
  userList = signal<User[]>([]);
  editingUser = signal<User | null>(null);
  editedUser = signal<User | null>(null);
  headers = signal<string[]>([]); // to add the headers dynamically

  selectedUser = signal<User | null>(null); // for showing the details of selected user in the modal

  users = computed(() => this.userService.paginatedUsers());
  currentPage = computed(() => this.userService.Currentpage); // call the getter for getting the current page
  totalPages = computed(() => this.userService.totalPages());
  pageSize = computed(() => this.userService.PageSize); // call the getter
  tableColumns = signal<string[]>(['id', 'name']);

  // Search and sort signals
  searchTerm = signal<string>('');
  sortColumn = signal<string>('id');
  sortDirection = signal<SortDirection>('asc');

  // Available page sizes
  pageSizeOptions = [5, 10, 20, 50];

  constructor() {
    this.userList.set(this.userService.UsersList);
    if (this.userService.UsersList.length > 0) {
      this.headers.set(Object.keys(this.userService.UsersList[0])); // set the headers dynamically based on the structure of first user
    }

    effect(() => {
      const currentUser = this.users();
      if (currentUser.length > 0 && this.headers().length === 0) {
        this.headers.set(Object.keys(currentUser[0]));
        console.log(this.headers());
      }
      this.userList.set(this.userService.UsersList);
    });

    NotiflixConfig.initialize();
  }

  showUserDetails(user: User) {
    if (this.editingUser() != user) {
      this.selectedUser.set(user);
    }
  }

  closeUseModal() {
    this.selectedUser.set(null);
  }

  startEditing(user: User) {
    this.editingUser.set(user);
    this.editedUser.set({ ...user });
  }

  // method for editing the user details
  saveEditedUser() {
    const userToSave = this.editedUser();
    if (userToSave) {
      Notiflix.Confirm.show(
        'Save Changes',
        'Are you sure you want to save these changes?',
        'Save',
        'Cancel',
        () => {
          this.userService.updateUser(userToSave);
          this.editedUser.set(null);
          this.editingUser.set(null);
          Notiflix.Notify.success('User updated successfully!');
        },
        () => {
          Notiflix.Notify.info('Edit canceled');
        }
      );
    }
  }

  // method for cancel the editing
  cancelEditing(): void {
    Notiflix.Confirm.show(
      'Cancel Editing',
      'Are you sure you want to cancel? Your changes will be lost.',
      'Cancel',
      'Continue Editing',
      () => {
        this.editingUser.set(null);
        this.editedUser.set(null);
        Notiflix.Notify.info('Editing canceled');
      },
      () => {}
    );
  }

  // method for update the user details
  updateEditedUser(property: string, value: any) {
    const currentUser = this.editedUser();
    if (currentUser) {
      this.editedUser.update((user) => ({
        ...user!,
        [property]: property === 'version' ? parseFloat(value) : value,
      }));
    }
  }

  // Pagination methods
  nextPage(): void {
    this.userService.nextPage();
  }

  previousPage(): void {
    this.userService.previousPage();
  }

  goToPage(page: number): void {
    this.userService.setCurrentPages(page);
  }
  changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.userService.setPageSize(Number(select.value));
  }

  // Generate page numbers for pagination
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (current >= total - 2) {
      return [total - 4, total - 3, total - 2, total - 1, total];
    }

    return [current - 2, current - 1, current, current + 1, current + 2];
  }

  // method to dynamically update the user object
  handleInputChange(event: Event, property: string): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = target.value;
    this.updateEditedUser(property, value);
  }

  visibleHeaders = computed(() => {
    const allHeaders = this.headers();
    const orderedHeaders = ['id', 'name']; // Always ensure id and name come first in this specific order
    if (this.editingUser()) {
      return [
        ...orderedHeaders,
        ...allHeaders.filter((header) => !orderedHeaders.includes(header)),
      ];
    }

    return orderedHeaders.filter((header) => allHeaders.includes(header)); // For display mode, only show id and name in the specified order
  });

  getPropertyValue(user: User, propertyName: string): any {
    switch (propertyName) {
      case 'id':
        return user.id;
      case 'name':
        return user.name;
      case 'bio':
        return user.bio;
      case 'language':
        return user.language;
      case 'version':
        return user.version;

      default:
        return '';
    }
  }

  closeUserModal(): void {
    this.selectedUser.set(null);
  }

  // method for deleting the user
  deleteUser(id: string): void {
    Notiflix.Confirm.show(
      'Delete User',
      'Are you sure you want to delete this user?',
      'Delete',
      'Cancel',
      () => {
        this.userService.deleteUser(id);
        Notiflix.Notify.success('User deleted successfully!');
      },
      () => {
        Notiflix.Notify.info('Deletion canceled');
      }
    );
  }

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.userService
      .paginatedUsers()
      .filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.language.toLowerCase().includes(term) ||
          user.bio.toLowerCase().includes(term)
      );
  });

  // Search and sort handlers
  handleSearchClear(): void {
    this.searchTerm.set('');
  }

  handleSortChange(event: { column: string; direction: SortDirection }): void {
    console.log(`Sorting by ${event.column} in ${event.direction} order`);
  }

  // Combined computed property for filtered and sorted users
  filteredAndSortedUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    // First filter the users
    let result = this.users().filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.language?.toLowerCase().includes(term) ||
        user.bio?.toLowerCase().includes(term) ||
        user.id.toLowerCase().includes(term)
    );

    // sort the filtered results
    return result.sort((a, b) => {
      const aValue = this.getPropertyValue(a, column);
      const bValue = this.getPropertyValue(b, column);

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // For string comparison
      const aString = String(aValue || '').toLowerCase();
      const bString = String(bValue || '').toLowerCase();

      if (direction === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  });
}
