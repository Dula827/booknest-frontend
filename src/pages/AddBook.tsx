import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ArrowLeft } from 'lucide-react';

const categories = [
    'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance',
    'Historical Fiction', 'Literary Fiction', 'Non-Fiction', 'Biography',
    'Self-Help', 'Business', 'Science', 'Technology', 'Art', 'Poetry'
];

interface BookFormData {
    title: string;
    author: string;
    category: string;
    series_name: string;
    series_no: string;
    purchase_date: string;
    reading_status: 'Read' | 'Unread';
    personal_notes: string;
}

interface BookResponse {
    message: string;
    id: number;
    images: string[];
}

const generateUniqueId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const uploadImageWithId = async (file: File, bookId: number): Promise<string> => {
    try {
        const uniqueId = generateUniqueId();
        const fileName = `${bookId}_${uniqueId}_${file.name.replace(/\s+/g, '_')}`;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('filename', fileName);

        console.log('Uploading file:', fileName);

        const response = await fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.filePath) {
            throw new Error('No path returned from server');
        }

        return data.filePath;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

export default function AddBook() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<BookFormData>({
        title: '',
        author: '',
        category: '',
        series_name: '',
        series_no: '',
        purchase_date: new Date().toISOString().split('T')[0],
        reading_status: 'Unread',
        personal_notes: '',
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('booknest-token');
            if (!token) throw new Error('No authentication token found');

            // Create book first
            const response = await fetch('http://localhost:3000/api/books', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    series_no: formData.series_no ? parseInt(formData.series_no) : undefined,
                    images: []
                }),
            });

            if (!response.ok) throw new Error('Failed to create book');
            const bookData: BookResponse = await response.json();

            // Upload images if any
            const uploadPromises = selectedFiles.map(file => uploadImageWithId(file, bookData.id));
            const imagePaths = await Promise.all(uploadPromises);

            if (imagePaths.length > 0) {
                // Update book with image paths
                const updateResponse = await fetch(`http://localhost:3000/api/books/${bookData.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        images: imagePaths
                    }),
                });

                if (!updateResponse.ok) throw new Error('Failed to update book with images');
            }

            navigate('/dashboard/books');
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to add book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={() => navigate('/dashboard/books')}
                        className="w-full sm:w-auto flex items-center justify-center sm:justify-start text-gray-600 hover:text-indigo-600 transition-colors mb-4 sm:mb-0"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Books
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center sm:text-left">
                        Add New Book
                    </h1>

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Author
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base px-3 py-2"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Series Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.series_name}
                                    onChange={(e) => setFormData({ ...formData, series_name: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Series Number
                                </label>
                                <input
                                    type="number"
                                    value={formData.series_no}
                                    onChange={(e) => setFormData({ ...formData, series_no: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Purchase Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.purchase_date}
                                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reading Status
                                </label>
                                <select
                                    required
                                    value={formData.reading_status}
                                    onChange={(e) => setFormData({ ...formData, reading_status: e.target.value as 'Read' | 'Unread' })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base px-3 py-2"
                                >
                                    <option value="Unread">Unread</option>
                                    <option value="Read">Read</option>
                                </select>
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Personal Notes
                                </label>
                                <textarea
                                    value={formData.personal_notes}
                                    onChange={(e) => setFormData({ ...formData, personal_notes: e.target.value })}
                                    rows={3}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base px-3 py-2"
                                />
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Book Images
                                </label>
                                <div className="space-y-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                        />
                                        <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">Click to upload book images</p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>

                                    {selectedFiles.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 sm:h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="absolute top-2 right-2 p-1 sm:p-2 bg-red-500 text-white rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/books')}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding Book...' : 'Add Book'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}