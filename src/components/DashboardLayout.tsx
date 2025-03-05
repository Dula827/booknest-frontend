import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Library, Heart, Users, LogOut, Home, Menu, X } from 'lucide-react';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    href: string;
    active: boolean;
    onClick?: () => void;
}

function NavItem({ icon: Icon, label, href, active, onClick }: NavItemProps) {
    return (
        <Link
            to={href}
            onClick={onClick}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
        >
            <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400'} mr-3`} />
            {label}
        </Link>
    );
}

interface ProfileAvatarProps {
    username: string;
}

function ProfileAvatar({ username }: ProfileAvatarProps) {
    const initials = username
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
            {initials}
        </div>
    );
}

interface HeaderProps {
    username: string;
    email: string;
    onMenuClick: () => void;
}

function Header({ username, email, onMenuClick }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <div className="hidden md:block flex-1 max-w-lg">
                </div>

                <div className="flex items-center space-x-4 sm:space-x-6">
                    <div className="flex items-center space-x-4">
                        <div className="sm:block text-right">
                            <div className="text-sm font-medium text-gray-900">{username}</div>
                            <div className="text-xs text-gray-500">{email}</div>
                        </div>
                        <ProfileAvatar username={username} />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const currentPath = location.pathname;
    const [profile, setProfile] = React.useState<{ username: string; email: string } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem('booknest-token');
        if (token) {
            fetch('http://localhost:3000/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then(res => res.json())
                .then(data => {
                    setProfile({
                        username: data.user.username,
                        email: data.user.email,
                    });
                })
                .catch(console.error);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const navigation = [
        { label: 'Home', icon: Home, href: '/dashboard' },
        { label: 'Books', icon: Library, href: '/dashboard/books' },
        { label: 'Wishlist', icon: Heart, href: '/dashboard/wishlist' },
        { label: 'Lending', icon: Users, href: '/dashboard/lending' },
    ];

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-40"
                    onClick={closeSidebar}
                ></div>
            )}

            <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <span className="ml-3 text-xl font-bold text-gray-900">BookNest</span>
                        </div>
                        <button
                            onClick={closeSidebar}
                            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => (
                            <NavItem
                                key={item.href}
                                icon={item.icon}
                                label={item.label}
                                href={item.href}
                                active={currentPath === item.href}
                                onClick={closeSidebar}
                            />
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-50 w-full"
                        >
                            <LogOut className="h-5 w-5 text-gray-400 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:pl-64">
                {profile && <Header
                    username={profile.username}
                    email={profile.email}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />}
                <main className="p-4 sm:p-8">{children}</main>
            </div>
        </div>
    );
}