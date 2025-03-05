export interface WishlistItem {
    id: number;
    user_id: number;
    ref_no: number;
    title: string;
    author: string;
    series_name?: string;
    series_no?: number;
    remarks?: string;
    created_at: string;
    updated_at: string;
    category?: string;
}

export interface NewWishlistItem {
    title: string;
    author: string;
    series_name?: string;
    series_no?: number;
    remarks?: string;
    category?: string;
}

export interface SearchResult {
    items: WishlistItem[];
}