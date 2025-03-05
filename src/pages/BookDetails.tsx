import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, X, Upload, BookOpen, AlertTriangle, Users } from 'lucide-react';
import type { LendingItem } from '../types/lending';

interface BookDetail {
    id: number;
    ref_no: number;
    title: string;
    author: string;
    series_name?: string;
    series_no?: number;
    purchase_date?: string;
    reading_status: 'Read' | 'Unread';
    lending_status: 'Available' | 'Lent Out';
    personal_notes?: string;
    images: string[];
    created_at: string;
    updated_at: string;
}

interface BookResponse {
    book: BookDetail;
    series_books: SeriesBook[];
    lending_details?: LendingDetails;
}

interface SeriesBook {
    id: number;
    title: string;
    series_no: number;
    reading_status: 'Read' | 'Unread';
    lending_status: 'Available' | 'Lent Out';
}

interface LendingDetails {
    borrower_name: string;
    borrow_date: string;
    expected_return_date: string;
}

interface LendBookData {
    book_id: number;
    borrower_name: string;
    borrow_date: string;
    return_date: string;
}

function LendBookModal({
    isOpen,
    onClose,
    onConfirm,
    bookTitle
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: LendBookData) => Promise<void>;
    bookTitle: string;
}) {
    const [formData, setFormData] = useState<Omit<LendBookData, 'book_id'>>({
        borrower_name: '',
        borrow_date: new Date().toISOString().split('T')[0],
        return_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Lend Book</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <p className="text-gray-600 mb-4">
                    Lending out "{bookTitle}"
                </p>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    setError('');
                    try {
                        await onConfirm(formData);
                    } catch (err) {
                        setError('Failed to lend book');
                    } finally {
                        setLoading(false);
                    }
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Borrower Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.borrower_name}
                            onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Borrow Date
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.borrow_date}
                            onChange={(e) => setFormData({ ...formData, borrow_date: e.target.value })}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Return Date
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.return_date}
                            onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
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
                            {loading ? 'Lending...' : 'Lend Book'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BookDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<BookResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLendModal, setShowLendModal] = useState(false);
    const [lendingHistory, setLendingHistory] = useState<LendingItem[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editForm, setEditForm] = useState<Partial<BookDetail>>({});
    const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

    const fetchLendingHistory = async () => {
        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch(`http://localhost:3000/api/lending/book/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch lending history');
            }

            const data = await response.json();
            setLendingHistory(data);
        } catch (err) {
            console.error('Failed to fetch lending history:', err);
        }
    };

    const handleLend = async (lendData: Omit<LendBookData, 'book_id'>) => {
        const token = localStorage.getItem('booknest-token');
        const response = await fetch('http://localhost:3000/api/lending', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...lendData,
                book_id: Number(id),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to lend book');
        }

        setShowLendModal(false);
        await fetchLendingHistory();
        await fetchBookDetails();
    };

    useEffect(() => {
        if (id) {
            fetchBookDetails();
            fetchLendingHistory();
        }
    }, [id]);

    const fetchBookDetails = async () => {
        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch(`http://localhost:3000/api/books/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch book details');
            }

            const data = await response.json();
            setBook(data);
            setEditForm(data.book);
        } catch (err) {
            setError('Failed to load book details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('booknest-token');

            if (book?.book.images && book.book.images.length > 0) {
                const deletePromises = book.book.images.map(img => deleteImageFromServer(img));
                await Promise.all(deletePromises);
            }

            const response = await fetch(`http://localhost:3000/api/books/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete book');
            }

            navigate('/dashboard/books');
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete book and images');
        }
    };

    const deleteImageFromServer = async (imagePath: string): Promise<void> => {
        const filename = imagePath.split('/').pop();
        if (!filename) return;

        const response = await fetch(`http://localhost:3001/images/${filename}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete image');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('booknest-token');
            if (!token) throw new Error('No authentication token found');

            const deletePromises = imagesToRemove.map(img => deleteImageFromServer(img));
            await Promise.all(deletePromises);

            const remainingImages = book?.book.images.filter(img => !imagesToRemove.includes(img)) || [];

            const formattedDate = editForm.purchase_date
                ? new Date(editForm.purchase_date).toISOString().split('T')[0]
                : null;

            const updateData = {
                ...editForm,
                series_no: editForm.series_no ? Number(editForm.series_no) : null,
                series_name: editForm.series_name || null,
                purchase_date: formattedDate,
                personal_notes: editForm.personal_notes || null,
                images: remainingImages
            };

            const response = await fetch(`http://localhost:3000/api/books/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('Failed to update book');
            }

            if (selectedFiles.length > 0) {
                const uploadPromises = selectedFiles.map(async (file) => {
                    const formData = new FormData();
                    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    const fileName = `${id}_${uniqueId}_${file.name.replace(/\s+/g, '_')}`;

                    formData.append('image', file);
                    formData.append('filename', fileName);

                    const uploadResponse = await fetch('http://localhost:3001/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!uploadResponse.ok) {
                        throw new Error('Failed to upload image');
                    }

                    const uploadData = await uploadResponse.json();
                    return uploadData.filePath;
                });

                const newImagePaths = await Promise.all(uploadPromises);

                const finalUpdateResponse = await fetch(`http://localhost:3000/api/books/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...updateData,
                        images: [...remainingImages, ...newImagePaths]
                    }),
                });

                if (!finalUpdateResponse.ok) {
                    throw new Error('Failed to update book with images');
                }
            }

            setIsEditing(false);
            setSelectedFiles([]);
            setImagesToRemove([]);
            await fetchBookDetails();

        } catch (err) {
            console.error('Update error:', err);
            setError(err instanceof Error ? err.message : 'Failed to update book');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const toggleImageRemoval = (imagePath: string) => {
        setImagesToRemove(prev =>
            prev.includes(imagePath)
                ? prev.filter(path => path !== imagePath)
                : [...prev, imagePath]
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    if (!book) return null;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center">
                    <Link
                        to="/dashboard/books"
                        className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Books
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                    >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {isEditing ? 'Cancel Edit' : 'Edit Book'}
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Book
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Book Images</h2>
                        <div className="space-y-4">
                            {book.book.images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={`http://localhost:3001${image}`}
                                        alt={`${book.book.title} - ${index + 1}`}
                                        className={`w-full h-48 object-cover rounded-lg transition-opacity ${isEditing && imagesToRemove.includes(image) ? 'opacity-30' : 'opacity-100'
                                            }`}
                                    />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => toggleImageRemoval(image)}
                                            className={`absolute top-2 right-2 p-2 rounded-full ${imagesToRemove.includes(image)
                                                ? 'bg-green-500 hover:bg-green-600'
                                                : 'bg-red-500 hover:bg-red-600'
                                                } text-white transition-colors`}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                            <h2 className="text-xl font-semibold mb-6">Edit Book Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={editForm.title || ''}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Author</label>
                                    <input
                                        type="text"
                                        value={editForm.author || ''}
                                        onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Series Name</label>
                                    <input
                                        type="text"
                                        value={editForm.series_name || ''}
                                        onChange={(e) => setEditForm({ ...editForm, series_name: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Series Number</label>
                                    <input
                                        type="number"
                                        value={editForm.series_no || ''}
                                        onChange={(e) => setEditForm({ ...editForm, series_no: parseInt(e.target.value) })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                                    <input
                                        type="date"
                                        value={editForm.purchase_date ? new Date(editForm.purchase_date).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setEditForm({ ...editForm, purchase_date: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reading Status</label>
                                    <select
                                        value={editForm.reading_status || 'Unread'}
                                        onChange={(e) => setEditForm({ ...editForm, reading_status: e.target.value as 'Read' | 'Unread' })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                    >
                                        <option value="Read">Read</option>
                                        <option value="Unread">Unread</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Personal Notes</label>
                                <textarea
                                    value={editForm.personal_notes || ''}
                                    onChange={(e) => setEditForm({ ...editForm, personal_notes: e.target.value })}
                                    rows={4}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Update Images</label>
                                <div className="space-y-4">
                                    {book.book.images.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {book.book.images.map((image, index) => (
                                                    <span
                                                        key={index}
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${imagesToRemove.includes(image)
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                            }`}
                                                    >
                                                        Image {index + 1}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleImageRemoval(image)}
                                                            className="ml-2 focus:outline-none"
                                                        >
                                                            {imagesToRemove.includes(image) ? 'Restore' : 'Remove'}
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                        />
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">Click to upload new images</p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>

                                    {selectedFiles.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">New Images</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Title</h3>
                                    <p className="mt-1 text-lg text-gray-900">{book.book.title}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Author</h3>
                                    <p className="mt-1 text-lg text-gray-900">{book.book.author}</p>
                                </div>

                                {book.book.series_name && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Series</h3>
                                        <p className="mt-1 text-lg text-gray-900">
                                            {book.book.series_name} #{book.book.series_no}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                    <div className="mt-1 flex space-x-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${book.book.reading_status === 'Read'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {book.book.reading_status}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${book.book.lending_status === 'Available'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {book.book.lending_status}
                                        </span>
                                    </div>
                                </div>

                                {book.book.purchase_date && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Purchase Date</h3>
                                        <p className="mt-1 text-lg text-gray-900">
                                            {new Date(book.book.purchase_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Added On</h3>
                                    <p className="mt-1 text-lg text-gray-900">
                                        {new Date(book.book.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {book.book.personal_notes && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-500">Personal Notes</h3>
                                    <p className="mt-1 text-gray-900">{book.book.personal_notes}</p>
                                </div>
                            )}

                            {book.series_books.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Other Books in Series</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {book.series_books.map((seriesBook) => (
                                            <div
                                                key={seriesBook.id}
                                                className="p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/dashboard/books/${seriesBook.id}`)}
                                            >
                                                <h4 className="font-medium text-gray-900">{seriesBook.title}</h4>
                                                <p className="text-sm text-gray-500">Book #{seriesBook.series_no}</p>
                                                <div className="mt-2 flex space-x-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${seriesBook.reading_status === 'Read'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {seriesBook.reading_status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-medium text-gray-900">Lending Management</h3>
                                    {book.book.lending_status === 'Available' && (
                                        <button
                                            onClick={() => setShowLendModal(true)}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                                        >
                                            <Users className="h-5 w-5 mr-2" />
                                            Lend Book
                                        </button>
                                    )}
                                </div>

                                {book.lending_details && (
                                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <BookOpen className="h-5 w-5 text-yellow-400" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">Currently Borrowed</h3>
                                                <div className="mt-2 text-sm text-yellow-700">
                                                    <p>Borrowed by: {book.lending_details.borrower_name}</p>
                                                    <p>Borrowed on: {new Date(book.lending_details.borrow_date).toLocaleDateString()}</p>
                                                    <p>Expected return: {new Date(book.lending_details.expected_return_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-lg border border-gray-200">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-700">Lending History</h4>
                                    </div>
                                    {lendingHistory.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            No lending history available
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
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
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {lendingHistory.map((record) => (
                                                        <tr key={record.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {record.borrower_name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {new Date(record.borrow_date).toLocaleDateString()}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {new Date(record.return_date).toLocaleDateString()}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.return_status === 'Returned'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {record.return_status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mt-3 text-center">
                            <h3 className="text-lg font-medium text-gray-900">Delete Book</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Are you sure you want to delete "{book.book.title}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLendModal && (
                <LendBookModal
                    isOpen={showLendModal}
                    onClose={() => setShowLendModal(false)}
                    onConfirm={handleLend}
                    bookTitle={book.book.title}
                />
            )}
        </div>
    );
}