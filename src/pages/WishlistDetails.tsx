import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, BookOpen, AlertTriangle, X, Upload } from 'lucide-react';
import type { WishlistItem } from '../types/wishlist';

interface MoveToBookData {
    purchase_date: string;
    reading_status: 'Read' | 'Unread';
    personal_notes?: string;
    images: string[];
}

export default function WishlistDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<WishlistItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showMoveToBookModal, setShowMoveToBookModal] = useState(false);
    const [editForm, setEditForm] = useState<Partial<WishlistItem>>({});
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchWishlistItem();
    }, [id]);

    const fetchWishlistItem = async () => {
        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch(`http://localhost:3000/api/wishlist/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch wishlist item');
            }

            const data = await response.json();
            setItem(data);
            setEditForm(data);
        } catch (err) {
            setError('Failed to load wishlist item');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch(`http://localhost:3000/api/wishlist/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete wishlist item');
            }

            navigate('/dashboard/wishlist');
        } catch (err) {
            setError('Failed to delete wishlist item');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('booknest-token');
            const response = await fetch(`http://localhost:3000/api/wishlist/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });

            if (!response.ok) {
                throw new Error('Failed to update wishlist item');
            }

            await fetchWishlistItem();
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update wishlist item');
        } finally {
            setLoading(false);
        }
    };

    const handleMoveToBook = async (moveData: MoveToBookData) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('booknest-token');

            // First, upload images if any
            const uploadedImages: string[] = [];
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

                const imagePaths = await Promise.all(uploadPromises);
                uploadedImages.push(...imagePaths);
            }

            const response = await fetch(`http://localhost:3000/api/wishlist/${id}/move-to-books`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...moveData,
                    images: uploadedImages,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to move item to books');
            }

            navigate('/dashboard/books');
        } catch (err) {
            setError('Failed to move item to books');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    if (!item) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center">
                    <Link
                        to="/dashboard/wishlist"
                        className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Wishlist
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                    >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {isEditing ? 'Cancel Edit' : 'Edit Item'}
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Item
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title || ''}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Author</label>
                                <input
                                    type="text"
                                    value={editForm.author || ''}
                                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Series Name</label>
                                <input
                                    type="text"
                                    value={editForm.series_name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, series_name: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Series Number</label>
                                <input
                                    type="number"
                                    value={editForm.series_no || ''}
                                    onChange={(e) => setEditForm({ ...editForm, series_no: parseInt(e.target.value) })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Remarks</label>
                            <textarea
                                value={editForm.remarks || ''}
                                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                                rows={4}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                            />
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
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                                <p className="mt-1 text-lg text-gray-900">{item.title}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Author</h3>
                                <p className="mt-1 text-lg text-gray-900">{item.author}</p>
                            </div>

                            {item.series_name && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Series</h3>
                                    <p className="mt-1 text-lg text-gray-900">
                                        {item.series_name} #{item.series_no}
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Added On</h3>
                                <p className="mt-1 text-lg text-gray-900">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {item.remarks && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-500">Remarks</h3>
                                <p className="mt-1 text-gray-900">{item.remarks}</p>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowMoveToBookModal(true)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                            >
                                <BookOpen className="h-5 w-5 mr-2" />
                                Move to Books
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mt-3 text-center">
                            <h3 className="text-lg font-medium text-gray-900">Delete Wishlist Item</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Are you sure you want to delete "{item.title}"? This action cannot be undone.
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

            {showMoveToBookModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Move to Books</h2>
                            <button
                                onClick={() => setShowMoveToBookModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                handleMoveToBook({
                                    purchase_date: formData.get('purchase_date') as string,
                                    reading_status: formData.get('reading_status') as 'Read' | 'Unread',
                                    personal_notes: formData.get('personal_notes') as string,
                                    images: [],
                                });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                                <input
                                    type="date"
                                    name="purchase_date"
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reading Status</label>
                                <select
                                    name="reading_status"
                                    required
                                    defaultValue="Unread"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                                >
                                    <option value="Unread">Unread</option>
                                    <option value="Read">Read</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Personal Notes</label>
                                <textarea
                                    name="personal_notes"
                                    rows={3}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Book Images</label>
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
                                    <p className="mt-2 text-sm text-gray-600">Click to upload book images</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 gap-4">
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
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowMoveToBookModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                                >
                                    Move to Books
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}