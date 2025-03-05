export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  series_name?: string;
  series_no?: number;
  purchase_date: string;
  reading_status: 'Read' | 'Unread';
  lending_status?: 'Available' | 'Lent Out';
  personal_notes?: string;
  images: string[];
}

export interface BookFilters {
  author?: string;
  category?: string;
  series_name?: string;
  purchase_date_start?: string;
  purchase_date_end?: string;
  reading_status?: 'Read' | 'Unread';
  lending_status?: 'Available' | 'Lent Out';
  page?: number;
  limit?: number;
  sort_by?: 'title' | 'author' | 'series_name' | 'purchase_date' | 'category';
  sort_order?: 'asc' | 'desc';
}

export interface SearchParams extends Pick<BookFilters, 'category' | 'page' | 'limit' | 'sort_by' | 'sort_order'> {
  query?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}