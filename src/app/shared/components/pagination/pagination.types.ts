export interface PaginationConfig {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  maxVisiblePages?: number;
}

export interface PageChangeEvent {
  page: number;
  itemsPerPage: number;
}
