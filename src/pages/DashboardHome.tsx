import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Library, Heart, Users, TrendingUp } from 'lucide-react';
import type { UserProfile } from '../types/user';

function StatCard({ icon: Icon, label, value, gradient }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    gradient: string;
}) {
    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 -z-10"></div>
            <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-gray-900">{value}</p>
                <p className="text-sm text-gray-600">{label}</p>
            </div>
        </div>
    );
}

const carouselImages = [
    'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'https://images.pexels.com/photos/207662/pexels-photo-207662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'https://images.pexels.com/photos/2943603/pexels-photo-2943603.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
];


export default function DashboardHome() {
    const token = localStorage.getItem('booknest-token');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % carouselImages.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setProfile(data);
            } catch (err) {
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    if (!token) {
        return <Navigate to="/login" />;
    }

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

    if (!profile) {
        return null;
    }

    const stats = [
        {
            icon: Library,
            label: 'Total Books',
            value: profile.statistics.total_books,
            gradient: 'from-blue-500 to-indigo-500'
        },
        {
            icon: TrendingUp,
            label: 'Books Read',
            value: profile.statistics.books_read,
            gradient: 'from-indigo-500 to-purple-500'
        },
        {
            icon: Users,
            label: 'Books Lent',
            value: profile.statistics.books_lent,
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: Heart,
            label: 'Wishlist Items',
            value: profile.statistics.wishlist_items,
            gradient: 'from-pink-500 to-rose-500'
        }
    ];

    return (
        <div>
            <div className="relative w-full h-[200px] mb-8 rounded-2xl overflow-hidden">
                {carouselImages.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={image}
                            alt={`Library ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                ))}

                {/* Navigation Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {carouselImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImage(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImage
                                ? 'bg-white w-4'
                                : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {profile.user.username}!
                </h1>
                <p className="mt-2 text-gray-600">
                    Here's an overview of your library activity
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Username</label>
                        <p className="mt-1 text-gray-900">{profile.user.username}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-gray-900">{profile.user.email}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                        <p className="mt-1 text-gray-900">
                            {new Date(profile.user.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}