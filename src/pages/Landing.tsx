import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Library, List, Users, Star, BookMarked, BookCheck, Bookmark, Heart, Mail, MapPin, Phone } from 'lucide-react';

export default function Landing() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'how-it-works', 'benefits', 'testimonials', 'get-started'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const offset = 80;
    const elementPosition = element?.getBoundingClientRect().top ?? 0;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  const navItems = [
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'get-started', label: 'Get Started' }
  ];

  return (
    <div className="bg-white">
      <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BookNest</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${activeSection === item.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <section id="hero" className="relative pt-20 min-h-[90vh] bg-gradient-to-br from-indigo-50 via-white to-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div className="relative z-10 max-w-xl mx-auto lg:mx-0 text-center lg:text-left mt-5 sm:mt-0">
              <div className="relative">
                <span className="inline-block px-4 py-1 mb-6 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-full">
                  Organize Your Reading Journey
                </span>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="block text-gray-900">Your Books,</span>
                  <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Your Library
                  </span>
                </h1>
              </div>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                Transform your reading experience with BookNest. The smart way to organize, track, and discover your next great read.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative">Get started for free</span>
                </Link>
                <button
                  onClick={() => scrollToSection('features')}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-indigo-600 bg-white border-2 border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all duration-300 hover:scale-105"
                >
                  Learn more
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <img
                      src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
                      alt="Modern Library"
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-gray-400 flex justify-center items-start p-1">
              <div className="w-1 h-2 bg-gray-400 rounded-full animate-scroll"></div>
            </div>
          </div>
        </div>
      </section>

      <div id="features" className="py-24 bg-gradient-to-b from-white to-indigo-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-4xl font-bold text-gray-900 lg:text-5xl">
              Everything you need to manage your books
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              Discover a comprehensive suite of tools designed to make personal library management a breeze.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {[
                {
                  icon: Library,
                  title: "Personal Library",
                  description: "Organize and catalog your book collection with ease. Keep track of all your books in one place.",
                  gradient: "from-blue-500 to-indigo-500"
                },
                {
                  icon: List,
                  title: "Wishlist Management",
                  description: "Keep track of books you want to read or buy. Never forget a book recommendation again.",
                  gradient: "from-indigo-500 to-purple-500"
                },
                {
                  icon: Users,
                  title: "Loan Tracking",
                  description: "Monitor borrowed books and never lose track of who has your precious books.",
                  gradient: "from-purple-500 to-pink-500"
                }
              ].map((feature, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl transform group-hover:scale-105 transition-transform duration-300 -z-10"></div>
                  <div className="relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient}`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-4 text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="how-it-works" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-4xl font-bold text-gray-900 lg:text-5xl">
              Simple steps to organize your library
            </p>
          </div>

          <div className="relative mt-20">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
            <div className="relative grid grid-cols-1 gap-12 md:grid-cols-4">
              {[
                { icon: BookOpen, title: "Create Account", description: "Sign up and set up your personal library space" },
                { icon: BookMarked, title: "Add Books", description: "Start adding your books to your digital collection" },
                { icon: BookCheck, title: "Organize Collection", description: "Categorize and arrange your library" },
                { icon: Bookmark, title: "Track Loans", description: "Keep track of borrowed and lent books" }
              ].map((step, index) => (
                <div key={index} className="relative group">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-100 rounded-full transform group-hover:scale-110 transition-transform duration-300"></div>
                      <div className="relative z-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-4 shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-center text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="benefits" className="py-24 bg-gradient-to-b from-indigo-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Benefits</h2>
            <p className="mt-2 text-4xl font-bold text-gray-900 lg:text-5xl">
              Why choose BookNest?
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-3xl blur-3xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <img
                className="relative rounded-3xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-300"
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Library organization"
              />
            </div>
            <div className="relative space-y-10">
              {[
                {
                  title: "Easy Organization",
                  description: "Categorize your books by genre, author, or custom collections.",
                  gradient: "from-blue-500 to-indigo-500"
                },
                {
                  title: "Never Lose Track",
                  description: "Keep tabs on borrowed books and their return dates.",
                  gradient: "from-indigo-500 to-purple-500"
                },
                {
                  title: "Smart Recommendations",
                  description: "Get personalized book suggestions based on your collection.",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  title: "Cloud Backup",
                  description: "Your library data is safely stored and accessible anywhere.",
                  gradient: "from-pink-500 to-rose-500"
                }
              ].map((benefit, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                  <div className="relative p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${benefit.gradient}`}>
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="mt-2 text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-4xl font-bold text-gray-900 lg:text-5xl">
              Loved by book enthusiasts
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              {
                name: "Sarah Johnson",
                role: "Book Collector",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                quote: "BookNest has transformed how I manage my home library. I can finally keep track of all my books!"
              },
              {
                name: "Michael Chen",
                role: "Literature Professor",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                quote: "The loan tracking feature is invaluable for managing my academic library and student borrowings."
              },
              {
                name: "Emma Thompson",
                role: "Book Club Organizer",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                quote: "Perfect for managing our book club's shared library. The wishlist feature helps us plan future reads."
              }
            ].map((testimonial, index) => (
              <div key={index} className="group">
                <div className="relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl -z-10"></div>
                  <div className="flex items-center">
                    <img
                      className="h-14 w-14 rounded-full ring-4 ring-indigo-50 transform group-hover:scale-110 transition-transform duration-300"
                      src={testimonial.image}
                      alt={testimonial.name}
                    />
                    <div className="ml-4">
                      <div className="text-lg font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-indigo-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <blockquote className="mt-8">
                    <div className="relative">
                      <div className="absolute -top-4 -left-3 text-indigo-200 transform scale-150">"</div>
                      <p className="relative z-10 text-gray-600 italic">{testimonial.quote}</p>
                    </div>
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="get-started" className="py-24 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-300/20 via-purple-300/20 to-pink-300/20 blur-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 opacity-50"></div>
              <div className="relative">
                <div className="lg:text-center">
                  <h2 className="text-4xl font-bold text-gray-900 lg:text-5xl">
                    Ready to organize your library?
                  </h2>
                  <p className="mt-6 text-xl text-gray-600">
                    Join thousands of book lovers who have already transformed their personal library management with BookNest.
                  </p>
                  <div className="mt-10">
                    <Link
                      to="/register"
                      className="inline-flex items-center px-8 py-4 rounded-xl text-lg font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Get started for free
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-xl font-bold">BookNest</span>
              </div>
              <p className="text-gray-400">
                Your personal digital library management solution.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navItems.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <Mail className="h-5 w-5 mr-2" />
                  support@booknest.com
                </li>
                <li className="flex items-center text-gray-400">
                  <Phone className="h-5 w-5 mr-2" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center text-gray-400">
                  <MapPin className="h-5 w-5 mr-2" />
                  123 Library Street, NY
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} BookNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}