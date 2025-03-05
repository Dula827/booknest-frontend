import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter, X, Edit2, BookOpen, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Book, BookFilters } from '../types/book';

interface SearchResult {
    id: number;
    title: string;
    author: string;
    images: string[];
}

const categories = [
    'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance',
    'Historical Fiction', 'Literary Fiction', 'Non-Fiction', 'Biography',
    'Self-Help', 'Business', 'Science', 'Technology', 'Art', 'Poetry'
];

function SearchResults({
    results,
    onSelect,
    onClose
}: {
    results: SearchResult[];
    onSelect: (id: number) => void;
    onClose: () => void;
}) {
    if (results.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
            {results.map((book) => (
                <div
                    key={book.id}
                    onClick={() => {
                        onSelect(book.id);
                        onClose();
                    }}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                    <img
                        src={book.images[0] ? `${book.images[0]}` : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e'}
                        alt={book.title}
                        className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">{book.title}</h4>
                        <p className="text-sm text-gray-500">{book.author}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function BookCard({ book }: { book: Book }) {
    const navigate = useNavigate();

    const getImagePath = (imagePath: string) => {
        if (!imagePath) return 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e';
        const filename = imagePath.split('/').pop();
        return `http://localhost:3001/uploads/${filename}`;
    };

    return (
        <div
            className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02] duration-300 cursor-pointer"
            onClick={() => navigate(`/dashboard/books/${book.id}`)}
        >
            <div className="relative h-48">
                <img
                    src={book.images[0] ? getImagePath(book.images[0]) : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-semibold text-white">{book.title}</h3>
                    <p className="text-sm text-gray-200">{book.author}</p>
                </div>
            </div>
            <div className="p-4">
                <div
                    style={{ height: '7.5rem' }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full">
                            {book.category || 'Uncategorized'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${book.reading_status === 'Read'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-yellow-50 text-yellow-600'
                            }`}>
                            {book.reading_status}
                        </span>
                    </div>
                    {book.series_name && (
                        <p className="text-sm text-gray-600 mb-2">
                            Series: {book.series_name} #{book.series_no}
                        </p>
                    )}
                    <p className="text-sm text-gray-600 mb-4">
                        Added: {new Date(book.created_at).toLocaleDateString()}
                    </p>
                </div>
                <button
                    onClick={(e) => {
                        navigate(`/dashboard/books/${book.id}`)
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Book
                </button>
            </div>
        </div>
    );
}

export default function Books() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<BookFilters>({
        page: 1,
        limit: 10,
        sort_by: 'title',
        sort_order: 'asc',
        series_name: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
    const navigate = useNavigate();
    const [series, setSeries] = useState<string[]>([]);

    useEffect(() => {
        fetchSeries();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('booknest-token');
            const queryParams = new URLSearchParams({
                page: filters.page?.toString() || '1',
                limit: filters.limit?.toString() || '10',
                sort_order: filters.sort_order || 'asc',
            });

            if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.series_name) queryParams.append('series_name', filters.series_name);
            if (filters.reading_status) queryParams.append('reading_status', filters.reading_status);

            const response = await fetch(`http://localhost:3000/api/books/getallwf?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }

            const data = await response.json();
            setBooks(data.books || []);
            setTotalPages(data.pagination.total_pages);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch books');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const searchBooks = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch(`http://localhost:3000/api/books/search?query=${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setSearchResults(data.books || []);
            setShowSearchResults(true);
        } catch (err) {
            console.error('Search error:', err);
            setSearchResults([]);
        }
    };

    const fetchSeries = async () => {
        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch('http://localhost:3000/api/books/seriesnames', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch series');
            }

            const data = await response.json();
            setSeries(data || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setSeries([]);
        }
    }

    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            if (searchQuery) {
                searchBooks(searchQuery);
            } else {
                fetchBooks();
            }
        }, 300);

        setSearchTimeout(timeout);

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchQuery, filters]);

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage and organize your personal library
                    </p>
                </div>
                <button
                    onClick={() => {
                        navigate('/dashboard/books/add')
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add New Book
                </button>
            </div>

            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search books by title, or author..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (!e.target.value) {
                                    setShowSearchResults(false);
                                }
                            }}
                            onFocus={() => {
                                if (searchResults.length > 0) {
                                    setShowSearchResults(true);
                                }
                            }}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        {showSearchResults && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowSearchResults(false)}
                                ></div>
                                <SearchResults
                                    results={searchResults}
                                    onSelect={(id) => navigate(`/dashboard/books/${id}`)}
                                    onClose={() => {
                                        setShowSearchResults(false);
                                        setSearchQuery('');
                                    }}
                                />
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Filter className="w-5 h-5 mr-2" />
                        Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={filters.category || ''}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                                    className="block w-full rounded-lg border-gray-300 bg-white pl-3 pr-10 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors hover:border-indigo-300"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reading Status</label>
                                <select
                                    value={filters.reading_status || ''}
                                    onChange={(e) => setFilters({ ...filters, reading_status: e.target.value as 'Read' | 'Unread', page: 1 })}
                                    className="block w-full rounded-lg border-gray-300 bg-white pl-3 pr-10 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors hover:border-indigo-300"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Read">Read</option>
                                    <option value="Unread">Unread</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                <select
                                    value={filters.sort_by || 'title'}
                                    onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as BookFilters['sort_by'], page: 1 })}
                                    className="block w-full rounded-lg border-gray-300 bg-white pl-3 pr-10 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors hover:border-indigo-300"
                                >
                                    <option value="title">Title</option>
                                    <option value="author">Author</option>
                                    <option value="category">Category</option>
                                    <option value="created_at">Date Added</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Series Name
                                </label>
                                <select
                                    value={filters.series_name || ''}
                                    onChange={(e) => setFilters({ ...filters, series_name: e.target.value, page: 1 })}
                                    className="block w-full rounded-lg border-gray-300 bg-white pl-3 pr-10 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors hover:border-indigo-300"
                                >
                                    <option value="">All Series</option>
                                    {series?.map((seriesName) => (
                                        <option key={seriesName?.series_name} value={seriesName?.series_name}>{seriesName?.series_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by adding a new book to your library.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => {
                                navigate('/dashboard/books/add')
                            }}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Add New Book
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                                    disabled={filters.page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>

                                <div className="md:hidden relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    {filters.page} / {totalPages}
                                </div>

                                <div className="hidden md:flex">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setFilters({ ...filters, page })}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === filters.page
                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                                    disabled={filters.page === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}