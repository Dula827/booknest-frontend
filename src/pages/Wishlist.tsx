import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Heart, X, ChevronLeft, ChevronRight, BookOpen, Filter } from 'lucide-react';
import type { WishlistItem, NewWishlistItem } from '../types/wishlist';

interface SearchResultsProps {
    results: WishlistItem[];
    onSelect: (id: number) => void;
    onClose: () => void;
}

function SearchResults({ results, onSelect, onClose }: SearchResultsProps) {
    if (results.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
            {results.map((item) => (
                <div
                    key={item.id}
                    onClick={() => {
                        onSelect(item.id);
                        onClose();
                    }}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                    <Heart className="h-5 w-5 text-pink-500" />
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.author}</p>
                        {item.series_name && (
                            <p className="text-xs text-gray-400">
                                {item.series_name} #{item.series_no}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function WishlistItemCard({ item, onClick }: { item: WishlistItem; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02] duration-300 cursor-pointer"
        >
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.author}</p>
                        {item.series_name && (
                            <p className="text-sm text-gray-500">
                                Series: {item.series_name} #{item.series_no}
                            </p>
                        )}
                    </div>
                    <Heart className="h-5 w-5 text-pink-500 flex-shrink-0" />
                </div>
                {item.remarks && (
                    <p className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                        {item.remarks}
                    </p>
                )}
                <div className="mt-4 text-xs text-gray-400">
                    Added on {new Date(item.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}

function AddWishlistModal({ isOpen, onClose, onAdd }: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: NewWishlistItem) => Promise<void>;
}) {
    const [formData, setFormData] = useState<NewWishlistItem>({
        title: '',
        author: '',
        series_name: '',
        remarks: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onAdd(formData);
            onClose();
            setFormData({ title: '', author: '', series_name: '', remarks: '' });
        } catch (err) {
            setError('Failed to add item to wishlist');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Add to Wishlist</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Author</label>
                        <input
                            type="text"
                            required
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Series Name</label>
                        <input
                            type="text"
                            value={formData.series_name}
                            onChange={(e) => setFormData({ ...formData, series_name: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Series Number</label>
                        <input
                            type="number"
                            value={formData.series_no || ''}
                            onChange={(e) => setFormData({ ...formData, series_no: parseInt(e.target.value) })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Remarks</label>
                        <textarea
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add to Wishlist'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Wishlist() {
    const navigate = useNavigate();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<WishlistItem[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        series_name: '',
    });
    const [series, setSeries] = useState<string[]>([]);

    useEffect(() => {
        fetchSeries();
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [filters]);

    const fetchSeries = async () => {
        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch('http://localhost:3000/api/wishlist/wlseriesnames', {
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

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('booknest-token');
            const queryParams = new URLSearchParams();

            // Add series_name filter if it exists
            if (filters.series_name) {
                queryParams.append('series_name', filters.series_name);
            }

            const response = await fetch(`http://localhost:3000/api/wishlist?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch wishlist');
            }

            const data = await response.json();
            setItems(data);
        } catch (err) {
            setError('Failed to load wishlist');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const searchWishlist = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch(`http://localhost:3000/api/wishlist/search?query=${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setSearchResults(data.items || []);
            setShowSearchResults(true);
        } catch (err) {
            console.error('Search error:', err);
            setSearchResults([]);
        }
    };

    const addToWishlist = async (item: NewWishlistItem) => {
        const token = localStorage.getItem('booknest-token');
        const response = await fetch('http://localhost:3000/api/wishlist', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });

        if (!response.ok) {
            throw new Error('Failed to add item to wishlist');
        }

        await fetchWishlist();
    };

    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            if (searchQuery) {
                searchWishlist(searchQuery);
            }
        }, 300);

        setSearchTimeout(timeout);

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchQuery]);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const paginatedItems = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Keep track of books you want to read or buy
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add to Wishlist
                </button>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search your wishlist..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (!e.target.value) {
                                setShowSearchResults(false);
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
                                onSelect={(id) => navigate(`/dashboard/wishlist/${id}`)}
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
                <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Series Name
                            </label>
                            <select
                                value={filters.series_name || ''}
                                onChange={(e) => setFilters({ ...filters, series_name: e.target.value })}
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

            {error ? (
                <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items in wishlist</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Start adding books you want to read or buy.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Add to Wishlist
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedItems.map((item) => (
                            <WishlistItemCard
                                key={item.id}
                                item={item}
                                onClick={() => navigate(`/dashboard/wishlist/${item.id}`)}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                <div className="md:hidden relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    {currentPage} / {totalPages}
                                </div>

                                <div className="hidden md:flex">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}

            <AddWishlistModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={addToWishlist}
            />
        </div>
    );
}