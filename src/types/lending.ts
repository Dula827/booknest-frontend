export interface LendingItem {
    id: number;
    user_id: number;
    book_id: number;
    borrower_name: string;
    borrow_date: string;
    return_date: string;
    return_status: 'Returned' | 'Not Returned';
    created_at: string;
    updated_at: string;
    book_title: string;
}