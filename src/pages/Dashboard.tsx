import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHome from './DashboardHome';
import Books from './Books';
import BookDetails from './BookDetails';
import AddBook from './AddBook';
import Wishlist from './Wishlist';
import WishlistDetails from './WishlistDetails';
import Lending from './Lending';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/add" element={<AddBook />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/wishlist/:id" element={<WishlistDetails />} />
        <Route path="/lending" element={<Lending />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </DashboardLayout>
  );
}