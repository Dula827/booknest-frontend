import { useState, useEffect } from 'react';
import { Filter, BookOpen, Check, X } from 'lucide-react';
import type { LendingItem } from '../types/lending';

function ReturnBookModal({
    isOpen,
    onClose,
    onConfirm,
    bookTitle
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: string) => Promise<void>;
    bookTitle: string;
}) {
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Return Book</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <p className="text-gray-600 mb-4">
                    Mark "{bookTitle}" as returned
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Return Date
                    </label>
                    <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true);
                            await onConfirm(returnDate);
                            setLoading(false);
                        }}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Marking as Returned...' : 'Mark as Returned'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Lending() {
    const [lendings, setLendings] = useState<LendingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'Not Returned' | 'Returned' | 'All'>('Not Returned');
    const [selectedLending, setSelectedLending] = useState<LendingItem | null>(null);
    const [showReturnModal, setShowReturnModal] = useState(false);

    const fetchLendings = async () => {
        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch('http://localhost:3000/api/lending', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch lendings');
            }

            const data = await response.json();
            setLendings(data);
        } catch (err) {
            setError('Failed to load lending data');
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (date: string) => {
        if (!selectedLending) return;

        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch(`http://localhost:3000/api/lending/${selectedLending.id}/return`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    return_date: date,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to return book');
            }

            await fetchLendings();
            setShowReturnModal(false);
            setSelectedLending(null);
        } catch (err) {
            setError('Failed to mark book as returned');
        }
    };

    useEffect(() => {
        fetchLendings();
    }, []);

    const filteredLendings = lendings.filter(lending => {
        if (filter === 'All') return true;
        return lending.return_status === filter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Lending Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Track and manage your borrowed books
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as typeof filter)}
                        className="block rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-4"
                    >
                        <option value="Not Returned">Not Returned</option>
                        <option value="Returned">Returned</option>
                        <option value="All">All</option>
                    </select>
                </div>

                <div className="text-sm text-gray-500">
                    Showing {filteredLendings.length} {filter === 'All' ? 'total' : filter.toLowerCase()} books
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            ) : filteredLendings.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No lending records found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {filter === 'Not Returned'
                            ? 'No books are currently borrowed'
                            : filter === 'Returned'
                                ? 'No books have been returned yet'
                                : 'No lending history available'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Book
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Borrower
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Borrow Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Return Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLendings.map((lending) => (
                                    <tr key={lending.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {lending.book_title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {lending.borrower_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(lending.borrow_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(lending.return_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lending.return_status === 'Returned'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {lending.return_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {lending.return_status === 'Not Returned' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedLending(lending);
                                                        setShowReturnModal(true);
                                                    }}
                                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                                                >
                                                    <Check className="h-4 w-4 mr-1.5" />
                                                    Return
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedLending && (
                <ReturnBookModal
                    isOpen={showReturnModal}
                    onClose={() => {
                        setShowReturnModal(false);
                        setSelectedLending(null);
                    }}
                    onConfirm={handleReturn}
                    bookTitle={selectedLending.book_title}
                />
            )}
        </div>
    );
}