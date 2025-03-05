import { User } from './auth';

export interface UserProfile {
  user: User & {
    created_at: string;
    updated_at: string;
  };
  statistics: {
    total_books: number;
    books_read: string;
    books_lent: string;
    wishlist_items: number;
  };
}